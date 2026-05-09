import { scrollToSection } from '../utils/scroll.js';
import { languageOptions } from '../i18n/translations.js';
import { useI18n } from '../i18n/useI18n.js';

export default function Header() {
  const { language, setLanguage, t } = useI18n();

  return (
    <nav className="nav">
      <div className="logo">
        VetAI <span>{t.brandTagline}</span>
      </div>
      <div className="nav-actions">
        <div className="language-switch" aria-label="Language">
          {languageOptions.map((option) => (
            <button
              type="button"
              className={language === option.value ? 'active' : ''}
              key={option.value}
              onClick={() => setLanguage(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <button className="nav-cta" onClick={() => scrollToSection('demo')}>
          {t.try}
        </button>
      </div>
    </nav>
  );
}
