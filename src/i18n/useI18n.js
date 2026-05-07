import { useChatStore } from '../store/chatStore.js';
import { getTranslation } from './translations.js';

export function useI18n() {
  const language = useChatStore((state) => state.language);
  const setLanguage = useChatStore((state) => state.setLanguage);

  return {
    language,
    setLanguage,
    t: getTranslation(language),
  };
}
