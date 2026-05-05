import { useChatStore } from '../../store/chatStore.js';
import ChatMessage from './ChatMessage.jsx';
import LoadingDots from './LoadingDots.jsx';

export default function ChatHistory({ onFindVet }) {
  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);

  return (
    <div className="chat-history">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} onFindVet={onFindVet} />
      ))}

      {isLoading && (
        <div className="chat-row assistant">
          <div className="chat-bubble assistant loading-bubble">
            <LoadingDots />
          </div>
        </div>
      )}
    </div>
  );
}
