import { useRef } from 'react';
import { useChatStore } from '../../store/chatStore.js';

export default function ChatInput() {
  const fileInputRef = useRef(null);
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
        Фото
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
        placeholder="Опишите симптомы... Например: корова не ест 2 дня, нос сухой и горячий"
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
        {isLoading ? 'Ждём...' : 'Отправить'}
      </button>
    </div>
  );
}
