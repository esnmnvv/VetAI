export default function ChatMessage({ message, onFindVet }) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`chat-bubble ${isUser ? 'user' : 'assistant'} ${message.isError ? 'error' : ''}`}>
        {message.imagePreview && (
          <img className="chat-image" src={message.imagePreview} alt="Фото животного" />
        )}
        <div className="chat-text">{message.text}</div>
        {message.showVetFinder && (
          <button className="find-vet-btn" type="button" onClick={() => onFindVet?.(message.text)}>
            📍 Найти ветеринара рядом
          </button>
        )}
      </div>
    </div>
  );
}
