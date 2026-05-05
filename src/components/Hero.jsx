import { scrollToSection } from '../utils/scroll.js';

export default function Hero() {
  return (
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
  );
}
