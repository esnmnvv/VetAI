import { create } from 'zustand';
import { askGroq } from '../api.js';

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Опишите симптомы животного или прикрепите фото. Я помогу оценить вероятный диагноз и подскажу, что сделать сразу.',
};

export const useChatStore = create((set, get) => ({
  selectedAnimal: 'корова',
  symptoms: '',
  messages: [welcomeMessage],
  apiMessages: [],
  photo: null,
  photoPreview: '',
  isDragging: false,
  isLoading: false,

  setSelectedAnimal: (selectedAnimal) => set({ selectedAnimal }),
  setSymptoms: (symptoms) => set({ symptoms }),
  setIsDragging: (isDragging) => set({ isDragging }),

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
      imagePreview: photoPreview,
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      symptoms: '',
      photo: null,
      photoPreview: '',
      isLoading: true,
    }));

    try {
      const content = `Животное: ${selectedAnimal}
${userText}${
        photo
          ? '\n\nФермер прикрепил фото, но текущая Groq Llama 3 модель получает только текст. Если визуальных данных недостаточно, попроси описать кожу, шерсть, глаза, слизистые, позу и вздутие.'
          : ''
      }`;

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

      set((state) => ({
        apiMessages: [...nextApiMessages, assistantApiMessage],
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: answer,
          },
        ],
      }));
    } catch (error) {
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: error.message || 'Ошибка соединения. Проверьте интернет.',
            isError: true,
          },
        ],
      }));
    } finally {
      set({ isLoading: false });
    }

    return true;
  },
}));
