import { scrollToSection } from '../utils/scroll.js';
import { useI18n } from '../i18n/useI18n.js';

export default function Hero() {
  const { t } = useI18n();

  return (
    <section className="hero">
      <div className="hero-badge">{t.heroBadge}</div>
      <h1>
        {t.heroTitle} <em>{t.heroTitleAccent}</em>
      </h1>
      <p>{t.heroText}</p>
      <div className="hero-warning">
        {t.heroWarning}
      </div>
      <div className="hero-btns">
        <button className="btn-primary" onClick={() => scrollToSection('demo')}>
          {t.tryFree}
        </button>
        <button className="btn-secondary" onClick={() => scrollToSection('how')}>
          {t.howItWorks}
        </button>
      </div>
    </section>
  );
}
