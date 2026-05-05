import { useState } from 'react';
import { useChatStore } from '../../store/chatStore.js';
import VetMap from '../VetMap.jsx';
import AnimalSelector from './AnimalSelector.jsx';
import ChatHistory from './ChatHistory.jsx';
import ChatSessions from './ChatSessions.jsx';
import ChatInput from './ChatInput.jsx';
import PhotoPreview from './PhotoPreview.jsx';
import QuickSymptoms from './QuickSymptoms.jsx';

export default function DemoChat() {
  const [vetModalDiagnosis, setVetModalDiagnosis] = useState('');
  const isDragging = useChatStore((state) => state.isDragging);
  const setIsDragging = useChatStore((state) => state.setIsDragging);
  const selectPhoto = useChatStore((state) => state.selectPhoto);
  const sendMessage = useChatStore((state) => state.sendMessage);

  const submitChat = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectPhoto(event.dataTransfer.files?.[0]);
  };

  return (
    <section className="demo-section" id="demo">
      <div className="demo-heading">
        <h2 className="section-title">Попробуйте прямо сейчас</h2>
        <p className="section-sub">Живое демо — реальный AI анализирует симптомы</p>
      </div>

      <form
        className={`demo-box chat-demo ${isDragging ? 'dragging' : ''}`}
        onSubmit={submitChat}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <ChatSessions />
        <AnimalSelector />
        <ChatHistory onFindVet={setVetModalDiagnosis} />
        <QuickSymptoms />
        <PhotoPreview />
        <ChatInput />
        <div className="drop-hint">Можно перетащить JPEG/PNG фото прямо в этот блок.</div>
      </form>

      <VetMap
        isOpen={Boolean(vetModalDiagnosis)}
        onClose={() => setVetModalDiagnosis('')}
        diagnosis={vetModalDiagnosis}
      />
    </section>
  );
}
