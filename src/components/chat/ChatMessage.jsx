import { useI18n } from '../../i18n/useI18n.js';
import { detectUrgency } from '../../utils/urgency.js';

const urgencyIcon = {
  low: '🟢',
  specialist: '🟡',
  emergency: '🔴',
};

export default function ChatMessage({ message, onFindVet }) {
  const { t } = useI18n();
  const isUser = message.role === 'user';
  const urgency = !isUser && !message.isError ? message.urgency || detectUrgency(message.text) : '';

  return (
    <div className={`chat-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`chat-bubble ${isUser ? 'user' : 'assistant'} ${message.isError ? 'error' : ''}`}>
        {message.imagePreview && (
          <img className="chat-image" src={message.imagePreview} alt={t.imageAlt} />
        )}
        {!message.imagePreview && message.hasImage && (
          <div className="chat-image-note">{t.imageAttached}</div>
        )}
        {urgency && (
          <div className={`urgency-badge ${urgency}`}>
            <span aria-hidden="true">{urgencyIcon[urgency]}</span>
            <span>{t.urgencyLabel}: {t.urgency[urgency]}</span>
          </div>
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
