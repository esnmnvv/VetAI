import { useI18n } from '../../i18n/useI18n.js';
import { useChatStore } from '../../store/chatStore.js';

const formatSessionTime = (value, language) => {
  if (!value) return '';

  return new Intl.DateTimeFormat(language === 'ky' ? 'ky-KG' : 'ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

export default function ChatSessions() {
  const { language, t } = useI18n();
  const sessions = useChatStore((state) => state.sessions);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const isLoading = useChatStore((state) => state.isLoading);
  const startNewChat = useChatStore((state) => state.startNewChat);
  const loadSession = useChatStore((state) => state.loadSession);
  const deleteSession = useChatStore((state) => state.deleteSession);

  return (
    <div className="chat-sessions">
      <div className="chat-sessions-head">
        <div>
          <div className="field-label">{t.chatHistoryLabel}</div>
          <div className="chat-sessions-count">
            {sessions.length ? t.savedCount(sessions.length) : t.emptySessions}
          </div>
        </div>
        <button
          type="button"
          className="new-chat-btn"
          disabled={isLoading}
          onClick={startNewChat}
        >
          {t.newChat}
        </button>
      </div>

      {sessions.length > 0 && (
        <div className="chat-session-list">
          {sessions.map((session) => (
            <div
              className={`chat-session-item ${activeSessionId === session.id ? 'active' : ''}`}
              key={session.id}
            >
              <button
                type="button"
                className="chat-session-open"
                disabled={isLoading}
                onClick={() => loadSession(session.id)}
              >
                <span className="chat-session-title">{session.title}</span>
                <span className="chat-session-meta">{formatSessionTime(session.updatedAt, language)}</span>
              </button>
              <button
                type="button"
                className="chat-session-delete"
                aria-label={t.deleteChat}
                disabled={isLoading}
                onClick={() => deleteSession(session.id)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
