import { useI18n } from '../../i18n/useI18n.js';
import { detectUrgency } from '../../utils/urgency.js';

const urgencyIcon = {
  low: '🟢',
  specialist: '🟡',
  emergency: '🔴',
};

const getDiagnosisPreview = (text) => text.split('\n').find(Boolean)?.replace(/^[-*]\s*/, '') || text;

export default function ChatMessage({ message, onFindVet }) {
  const { t } = useI18n();
  const isUser = message.role === 'user';
  const urgency = !isUser && !message.isError ? message.urgency || detectUrgency(message.text) : '';
  const diagnosisPreview = !isUser && !message.isError ? getDiagnosisPreview(message.text) : '';

  return (
    <div className={`chat-row ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && <div className="chat-avatar" aria-hidden="true">AI</div>}
      <div className={`chat-bubble ${isUser ? 'user' : 'assistant'} ${message.isError ? 'error' : ''}`}>
        {!isUser && <div className="chat-author">{t.aiName}</div>}
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
        {diagnosisPreview && (
          <div className={`analysis-card ${urgency || 'low'}`}>
            <div className="analysis-card-title">{t.resultCardTitle}</div>
            <dl>
              <div>
                <dt>{t.resultDiagnosis}</dt>
                <dd>{diagnosisPreview}</dd>
              </div>
              <div>
                <dt>{t.resultRisk}</dt>
                <dd>{t.urgency[urgency || 'low']}</dd>
              </div>
              <div>
                <dt>{t.resultNextStep}</dt>
                <dd>{t.resultNextStepText}</dd>
              </div>
            </dl>
          </div>
        )}
        {message.showVetFinder && (
          <button className="find-vet-btn" type="button" onClick={() => onFindVet?.(message.text)}>
            {t.findVet}
          </button>
        )}
      </div>
    </div>
  );
}
