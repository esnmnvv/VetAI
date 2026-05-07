import { useI18n } from '../../i18n/useI18n.js';

export default function ChatMessage({ message, onFindVet }) {
  const { t } = useI18n();
  const isUser = message.role === 'user';

  return (
    <div className={`chat-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`chat-bubble ${isUser ? 'user' : 'assistant'} ${message.isError ? 'error' : ''}`}>
        {message.imagePreview && (
          <img className="chat-image" src={message.imagePreview} alt={t.imageAlt} />
        )}
        {!message.imagePreview && message.hasImage && (
          <div className="chat-image-note">{t.imageAttached}</div>
        )}
        <div className="chat-text">{message.text}</div>
        {message.showVetFinder && (
          <button className="find-vet-btn" type="button" onClick={() => onFindVet?.(message.text)}>
            {t.findVet}
          </button>
        )}
      </div>
    </div>
  );
}
