import { create } from 'zustand';
import { askGroq, imageFileToDataUrl } from '../api.js';
import { animals, localize } from '../data/siteData.js';
import { DEFAULT_LANGUAGE, getTranslation } from '../i18n/translations.js';
import { detectUrgency } from '../utils/urgency.js';

const CHAT_SESSIONS_KEY = 'vetai-chat-sessions';
const LANGUAGE_KEY = 'vetai-language';
const MAX_CONTEXT_MESSAGES = 6;

const createWelcomeMessage = (language) => ({
  id: 'welcome',
  role: 'assistant',
  text: getTranslation(language).welcome,
});

const readStoredLanguage = () => {
  try {
    const language = localStorage.getItem(LANGUAGE_KEY);
    return language === 'ky' || language === 'ru' ? language : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const createSessionId = () => crypto.randomUUID();

const stripMessageForStorage = (message) => {
  const { imagePreview, ...storedMessage } = message;
  return storedMessage;
};

const readStoredSessions = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_SESSIONS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeStoredSessions = (sessions) => {
  localStorage.setItem(
    CHAT_SESSIONS_KEY,
    JSON.stringify(
      sessions.map((session) => ({
        ...session,
        messages: session.messages.map(stripMessageForStorage),
      })),
    ),
  );
};

const createTitle = (text, animal, language) => {
  const t = getTranslation(language);
  const normalized = text.replace(/\s+/g, ' ').trim();
  const shortText = normalized.length > 34 ? `${normalized.slice(0, 34)}...` : normalized;
  return `${animal}: ${shortText || t.newAnalysis}`;
};

const getAnimalLabel = (value, language) =>
  localize(animals.find((animal) => animal.value === value)?.label, language) || value;

const initialLanguage = readStoredLanguage();

const trimContextMessages = (messages) => messages.slice(-MAX_CONTEXT_MESSAGES);

export const useChatStore = create((set, get) => ({
  language: initialLanguage,
  selectedAnimal: getTranslation(initialLanguage).defaultAnimal,
  symptoms: '',
  messages: [createWelcomeMessage(initialLanguage)],
  apiMessages: [],
  sessions: readStoredSessions(),
  activeSessionId: null,
  photo: null,
  photoPreview: '',
  isDragging: false,
  isLoading: false,

  setLanguage: (language) => {
    const nextLanguage = language === 'ky' ? 'ky' : 'ru';
    localStorage.setItem(LANGUAGE_KEY, nextLanguage);

    set((state) => {
      const hasOnlyWelcome = state.messages.length === 1 && state.messages[0]?.id === 'welcome';

      return {
        language: nextLanguage,
        messages: hasOnlyWelcome ? [createWelcomeMessage(nextLanguage)] : state.messages,
      };
    });
  },

  setSelectedAnimal: (selectedAnimal) => {
    set({ selectedAnimal });
  },
  setSymptoms: (symptoms) => set({ symptoms }),
  setIsDragging: (isDragging) => set({ isDragging }),

  startNewChat: () => {
    const { photoPreview, language } = get();
    if (photoPreview) URL.revokeObjectURL(photoPreview);

    set({
      selectedAnimal: getTranslation(language).defaultAnimal,
      symptoms: '',
      messages: [createWelcomeMessage(language)],
      apiMessages: [],
      activeSessionId: null,
      photo: null,
      photoPreview: '',
      isDragging: false,
    });
  },

  loadSession: (sessionId) => {
    const session = get().sessions.find((item) => item.id === sessionId);
    if (!session) return;

    const { photoPreview } = get();
    if (photoPreview) URL.revokeObjectURL(photoPreview);

    set({
      selectedAnimal: session.selectedAnimal || getTranslation(get().language).defaultAnimal,
      symptoms: '',
      messages: session.messages?.length ? session.messages : [createWelcomeMessage(get().language)],
      apiMessages: session.apiMessages || [],
      activeSessionId: session.id,
      photo: null,
      photoPreview: '',
      isDragging: false,
    });
  },

  deleteSession: (sessionId) => {
    const nextSessions = get().sessions.filter((session) => session.id !== sessionId);
    writeStoredSessions(nextSessions);

    if (get().activeSessionId === sessionId) {
      const { language } = get();
      set({
        sessions: nextSessions,
        selectedAnimal: getTranslation(language).defaultAnimal,
        symptoms: '',
        messages: [createWelcomeMessage(language)],
        apiMessages: [],
        activeSessionId: null,
        photo: null,
        photoPreview: '',
      });
      return;
    }

    set({ sessions: nextSessions });
  },

  addSymptom: (text) =>
    set((state) => ({
      symptoms: state.symptoms
        ? `${state.symptoms}${state.symptoms.endsWith(' ') ? '' : ', '}${text}`
        : text,
    })),

  selectPhoto: (file) => {
    const t = getTranslation(get().language);
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert(t.photoFormatAlert);
      return;
    }

    const { photoPreview } = get();
    if (photoPreview) URL.revokeObjectURL(photoPreview);

    set({
      photo: file,
      photoPreview: URL.createObjectURL(file),
    });
  },

  clearPhoto: () => {
    const { photoPreview } = get();
    if (photoPreview) URL.revokeObjectURL(photoPreview);

    set({
      photo: null,
      photoPreview: '',
    });
  },

  sendMessage: async () => {
    const { symptoms, photo, photoPreview, selectedAnimal, apiMessages, language } = get();
    const t = getTranslation(language);

    if (!symptoms.trim() && !photo) {
      alert(t.emptyMessageAlert);
      return false;
    }

    const userText = symptoms.trim() || t.photoOnlyMessage;
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userText,
      hasImage: Boolean(photo),
      imagePreview: photoPreview,
    };

    const sessionId = get().activeSessionId || createSessionId();

    set((state) => ({
      messages: [...state.messages, userMessage],
      activeSessionId: sessionId,
      symptoms: '',
      photo: null,
      photoPreview: '',
      isLoading: true,
    }));

    try {
      const animalLabel = getAnimalLabel(selectedAnimal, language);
      const textContent = `${t.animalPromptLabel}: ${animalLabel}
${userText}`;
      const imageDataUrl = photo ? await imageFileToDataUrl(photo, language) : null;
      const content = imageDataUrl
        ? [
            {
              type: 'text',
              text: textContent,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
              },
            },
          ]
        : textContent;

      const nextApiMessages = [
        ...trimContextMessages(apiMessages),
        {
          role: 'user',
          content,
        },
      ];
      const answer = await askGroq(nextApiMessages, language);
      const assistantApiMessage = {
        role: 'assistant',
        content: answer,
      };
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: answer,
        urgency: detectUrgency(answer),
        showVetFinder: t.vetPattern.test(answer),
      };

      set((state) => ({
        apiMessages: trimContextMessages([
          ...apiMessages,
          {
            role: 'user',
            content: textContent,
          },
          assistantApiMessage,
        ]),
        messages: [...state.messages, assistantMessage],
      }));

      const current = get();
      const savedSession = {
        id: sessionId,
        title: createTitle(userText, animalLabel, language),
        selectedAnimal,
        language,
        messages: current.messages,
        apiMessages: current.apiMessages,
        updatedAt: new Date().toISOString(),
      };
      const nextSessions = [
        savedSession,
        ...current.sessions.filter((session) => session.id !== sessionId),
      ].slice(0, 12);
      writeStoredSessions(nextSessions);
      set({ sessions: nextSessions });
    } catch (error) {
      const errorMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: error.message || t.connectionError,
        isError: true,
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
      }));

      const current = get();
      const savedSession = {
        id: sessionId,
        title: createTitle(userText, getAnimalLabel(selectedAnimal, language), language),
        selectedAnimal,
        language,
        messages: current.messages,
        apiMessages: current.apiMessages,
        updatedAt: new Date().toISOString(),
      };
      const nextSessions = [
        savedSession,
        ...current.sessions.filter((session) => session.id !== sessionId),
      ].slice(0, 12);
      writeStoredSessions(nextSessions);
      set({ sessions: nextSessions });
    } finally {
      set({ isLoading: false });
    }

    return true;
  },
}));
