import { localize, steps } from '../data/siteData.js';
import { useI18n } from '../i18n/useI18n.js';

export default function HowItWorks() {
  const { language, t } = useI18n();

  return (
    <section className="section" id="how">
      <h2 className="section-title">{t.howItWorks}</h2>
      <p className="section-sub">{t.howSubtitle}</p>
      <div className="steps">
        {steps.map((step, index) => (
          <article className="step" key={localize(step.title, 'ru')}>
            <div className="step-num">{index + 1}</div>
            <h3>{localize(step.title, language)}</h3>
            <p>{localize(step.text, language)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
