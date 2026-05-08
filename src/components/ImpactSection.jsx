import { useI18n } from '../i18n/useI18n.js';

export default function ImpactSection() {
  const { t } = useI18n();

  return (
    <section className="section impact-section">
      <article className="impact-panel">
        <div>
          <span className="impact-kicker">01</span>
          <h2>{t.impactTitle}</h2>
          <p>{t.impactText}</p>
        </div>
        <div className="responsibility-note">
          <span className="impact-kicker">02</span>
          <h3>{t.responsibilityTitle}</h3>
          <p>{t.responsibilityText}</p>
        </div>
      </article>
    </section>
  );
}
