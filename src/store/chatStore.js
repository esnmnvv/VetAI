import { create } from 'zustand';
import { askGroq, imageFileToDataUrl } from '../api.js';

const CHAT_SESSIONS_KEY = 'vetai-chat-sessions';

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Опишите симптомы животного или прикрепите фото. Я помогу оценить вероятный диагноз и подскажу, что сделать сразу.',
};

const vetFinderPattern = /ветеринар|срочно|клиника/i;

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

const createTitle = (text, animal) => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  const shortText = normalized.length > 34 ? `${normalized.slice(0, 34)}...` : normalized;
  return `${animal}: ${shortText || 'новый анализ'}`;
};

export const useChatStore = create((set, get) => ({
  selectedAnimal: 'корова',
  symptoms: '',
  messages: [welcomeMessage],
  apiMessages: [],
  sessions: readStoredSessions(),
  activeSessionId: null,
  photo: null,
  photoPreview: '',
  isDragging: false,
  isLoading: false,

  setSelectedAnimal: (selectedAnimal) => {
    set({ selectedAnimal });
  },
  setSymptoms: (symptoms) => set({ symptoms }),
  setIsDragging: (isDragging) => set({ isDragging }),

  startNewChat: () => {
    const { photoPreview } = get();
    if (photoPreview) URL.revokeObjectURL(photoPreview);

    set({
      selectedAnimal: 'корова',
      symptoms: '',
      messages: [welcomeMessage],
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
      selectedAnimal: session.selectedAnimal || 'корова',
      symptoms: '',
      messages: session.messages?.length ? session.messages : [welcomeMessage],
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
      set({
        sessions: nextSessions,
        selectedAnimal: 'корова',
        symptoms: '',
        messages: [welcomeMessage],
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
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Загрузите фото в формате JPEG или PNG.');
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
    const { symptoms, photo, photoPreview, selectedAnimal, apiMessages } = get();

    if (!symptoms.trim() && !photo) {
      alert('Опишите симптомы животного или прикрепите фото');
      return false;
    }

    const userText = symptoms.trim() || 'Проанализируй фото животного.';
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
      const textContent = `Животное: ${selectedAnimal}
${userText}`;
      const imageDataUrl = photo ? await imageFileToDataUrl(photo) : null;
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
        ...apiMessages,
        {
          role: 'user',
          content,
        },
      ];
      const answer = await askGroq(nextApiMessages);
      const assistantApiMessage = {
        role: 'assistant',
        content: answer,
      };
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: answer,
        showVetFinder: vetFinderPattern.test(answer),
      };

      set((state) => ({
        apiMessages: [
          ...apiMessages,
          {
            role: 'user',
            content: textContent,
          },
          assistantApiMessage,
        ],
        messages: [...state.messages, assistantMessage],
      }));

      const current = get();
      const savedSession = {
        id: sessionId,
        title: createTitle(userText, selectedAnimal),
        selectedAnimal,
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
        text: error.message || 'Ошибка соединения. Проверьте интернет.',
        isError: true,
      };

      set((state) => ({
        messages: [...state.messages, errorMessage],
      }));

      const current = get();
      const savedSession = {
        id: sessionId,
        title: createTitle(userText, selectedAnimal),
        selectedAnimal,
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
