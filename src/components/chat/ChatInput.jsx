import { useRef } from 'react';
import { useI18n } from '../../i18n/useI18n.js';
import { useChatStore } from '../../store/chatStore.js';

export default function ChatInput() {
  const fileInputRef = useRef(null);
  const { t } = useI18n();
  const symptoms = useChatStore((state) => state.symptoms);
  const isLoading = useChatStore((state) => state.isLoading);
  const setSymptoms = useChatStore((state) => state.setSymptoms);
  const selectPhoto = useChatStore((state) => state.selectPhoto);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const submit = async () => {
    const sent = await sendMessage();
    if (sent && fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="chat-input-row">
      <button
        type="button"
        className="upload-btn"
        onClick={() => fileInputRef.current?.click()}
      >
        {t.uploadPhoto}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        hidden
        onChange={(event) => selectPhoto(event.target.files?.[0])}
      />
      <textarea
        className="symptom-input chat-input"
        placeholder={t.inputPlaceholder}
        value={symptoms}
        onChange={(event) => setSymptoms(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <button
        className="analyze-btn send-btn"
        disabled={isLoading}
        type="button"
        onClick={submit}
      >
        {isLoading ? t.analyzing : t.send}
      </button>
    </div>
  );
}
