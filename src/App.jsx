import { useRef, useState } from 'react';
import { askGroq } from './api.js';

const animals = [
  { label: 'Корова', value: 'корова' },
  { label: 'Лошадь', value: 'лошадь' },
  { label: 'Овца', value: 'овца' },
  { label: 'Коза', value: 'коза' },
];

const quickSymptoms = [
  'не ест',
  'высокая температура',
  'вздутие живота',
  'хромает',
  'кашель',
  'выделения из носа',
  'диарея',
  'слезятся глаза',
];

const diseases = [
  { name: 'Ящур', color: '#E24B4A' },
  { name: 'Тимпания', color: '#BA7517' },
  { name: 'Бруцеллёз', color: '#E24B4A' },
  { name: 'Пневмония', color: '#378ADD' },
  { name: 'Мастит', color: '#BA7517' },
  { name: 'Чесотка', color: '#639922' },
  { name: 'Конъюнктивит', color: '#378ADD' },
  { name: 'Сибирская язва', color: '#E24B4A' },
  { name: 'Колики', color: '#BA7517' },
  { name: 'Дерматит', color: '#639922' },
  { name: 'Диарея', color: '#378ADD' },
  { name: '+ ещё 20', color: '#639922' },
];

const steps = [
  {
    title: 'Выберите животное',
    text: 'Корова, лошадь, овца или другой скот',
  },
  {
    title: 'Опишите симптомы',
    text: 'Что заметили: не ест, хромает, вздутие, выделения',
  },
  {
    title: 'Получите диагноз',
    text: 'AI анализирует и даёт рекомендации что делать прямо сейчас',
  },
  {
    title: 'Свяжитесь с ветом',
    text: 'При серьёзных случаях — кнопка вызова ветеринара',
  },
];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function App() {
  const [selectedAnimal, setSelectedAnimal] = useState('корова');
  const [symptoms, setSymptoms] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Опишите симптомы животного или прикрепите фото. Я помогу оценить вероятный диагноз и подскажу, что сделать сразу.',
    },
  ]);
  const [apiMessages, setApiMessages] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const addSymptom = (text) => {
    setSymptoms((current) => {
      if (!current) return text;
      return `${current}${current.endsWith(' ') ? '' : ', '}${text}`;
    });
  };

  const selectPhoto = (file) => {
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Загрузите фото в формате JPEG или PNG.');
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim() && !photo) {
      alert('Опишите симптомы животного или прикрепите фото');
      return;
    }

    setIsLoading(true);

    const userText = symptoms.trim() || 'Проанализируй фото животного.';
    const currentPhoto = photo;
    const currentPreview = photoPreview;
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: userText,
      imagePreview: currentPreview,
    };

    setMessages((current) => [...current, userMessage]);
    setSymptoms('');
    setPhoto(null);
    setPhotoPreview('');

    try {
      const content = `Животное: ${selectedAnimal}
${userText}${
        currentPhoto
          ? '\n\nФермер прикрепил фото, но текущая Groq Llama 3 модель получает только текст. Если визуальных данных недостаточно, попроси описать кожу, шерсть, глаза, слизистые, позу и вздутие.'
          : ''
      }`;

      const nextApiMessages = [
        ...apiMessages,
        {
          role: 'user',
          content,
        },
      ];
      const answer = await askGroq(nextApiMessages);
      const assistantApiMessage = {
        role: 'assistant',
        content: answer,
      };

      setApiMessages([...nextApiMessages, assistantApiMessage]);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: answer,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: error.message || 'Ошибка соединения. Проверьте интернет.',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submitChat = (event) => {
    event.preventDefault();
    analyzeSymptoms();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectPhoto(event.dataTransfer.files?.[0]);
  };

  const renderMessage = (message) => {
    const isUser = message.role === 'user';

    return (
      <div className={`chat-row ${isUser ? 'user' : 'assistant'}`} key={message.id}>
        <div className={`chat-bubble ${isUser ? 'user' : 'assistant'} ${message.isError ? 'error' : ''}`}>
          {message.imagePreview && (
            <img className="chat-image" src={message.imagePreview} alt="Фото животного" />
          )}
          <div className="chat-text">{message.text}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="logo">
          МалАИ <span>ветеринар в телефоне</span>
        </div>
        <button className="nav-cta" onClick={() => scrollToSection('demo')}>
          Попробовать
        </button>
      </nav>

      <section className="hero">
        <div className="hero-badge">Хакатон 2025 — Bishkek</div>
        <h1>
          Ваш скот под защитой <em>искусственного интеллекта</em>
        </h1>
        <p>
          Опишите симптомы животного — AI определит болезнь и подскажет что делать.
          Без ветеринара, без поездок в город.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={() => scrollToSection('demo')}>
            Попробовать бесплатно
          </button>
          <button className="btn-secondary" onClick={() => scrollToSection('how')}>
            Как это работает
          </button>
        </div>
      </section>

      <section className="stats" aria-label="Статистика">
        <div className="stat">
          <div className="stat-num">5M+</div>
          <div className="stat-label">голов скота в КР</div>
        </div>
        <div className="stat">
          <div className="stat-num">30+</div>
          <div className="stat-label">болезней в базе</div>
        </div>
        <div className="stat">
          <div className="stat-num">&lt;30с</div>
          <div className="stat-label">время анализа</div>
        </div>
      </section>

      <section className="section" id="how">
        <h2 className="section-title">Как это работает</h2>
        <p className="section-sub">Три шага до диагноза</p>
        <div className="steps">
          {steps.map((step, index) => (
            <article className="step" key={step.title}>
              <div className="step-num">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section diseases-section">
        <h2 className="section-title">Болезни в базе</h2>
        <p className="section-sub">
          AI обучен распознавать наиболее распространённые заболевания скота в ЦА
        </p>
        <div className="diseases">
          {diseases.map((disease) => (
            <div className="disease-tag" key={disease.name}>
              <span className="disease-dot" style={{ background: disease.color }} />
              {disease.name}
            </div>
          ))}
        </div>
      </section>

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
          <div className="field-label">Животное:</div>
          <div className="animal-select">
            {animals.map((animal) => (
              <button
                type="button"
                className={`animal-btn ${selectedAnimal === animal.value ? 'active' : ''}`}
                key={animal.value}
                onClick={() => setSelectedAnimal(animal.value)}
              >
                {animal.label}
              </button>
            ))}
          </div>

          <div className="chat-history">
            {messages.map(renderMessage)}

            {isLoading && (
              <div className="chat-row assistant">
                <div className="chat-bubble assistant loading-bubble">
                  <div className="loading-dots" aria-label="AI думает">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="field-label">Быстрые симптомы:</div>
          <div className="quick-symptoms">
            {quickSymptoms.map((symptom) => (
              <button type="button" className="qs-btn" key={symptom} onClick={() => addSymptom(symptom)}>
                {symptom}
              </button>
            ))}
          </div>

          {photoPreview && (
            <div className="photo-preview">
              <img src={photoPreview} alt="Превью фото" />
              <div>
                <div className="photo-name">{photo?.name}</div>
                <div className="photo-help">Фото отправится вместе с сообщением</div>
              </div>
              <button type="button" className="photo-remove" onClick={clearPhoto}>
                Убрать
              </button>
            </div>
          )}

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
                  analyzeSymptoms();
                }
              }}
            />
            <button className="analyze-btn send-btn" disabled={isLoading} type="submit">
              {isLoading ? 'Ждём...' : 'Отправить'}
            </button>
          </div>

          <div className="drop-hint">Можно перетащить JPEG/PNG фото прямо в этот блок.</div>
        </form>
      </section>

      <footer className="footer">
        МалАИ — проект хакатона · Bishkek 2025 · Сделано с заботой о фермерах Кыргызстана
      </footer>
    </div>
  );
}
