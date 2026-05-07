import { useState } from 'react';
import { diseases, localize } from '../data/siteData.js';
import { useI18n } from '../i18n/useI18n.js';

export default function DiseasesSection() {
  const [activeDisease, setActiveDisease] = useState(diseases[4] || diseases[0]);
  const { language, t } = useI18n();

  return (
    <section className="section diseases-section">
      <h2 className="section-title">{t.diseasesTitle}</h2>
      <p className="section-sub">{t.diseasesSubtitle}</p>
      <div className="diseases">
        {diseases.map((disease) => (
          <button
            className={`disease-tag ${localize(activeDisease.name, 'ru') === localize(disease.name, 'ru') ? 'active' : ''}`}
            key={localize(disease.name, 'ru')}
            type="button"
            onClick={() => setActiveDisease(disease)}
          >
            <span className="disease-dot" style={{ background: disease.color }} />
            {localize(disease.name, language)}
          </button>
        ))}
      </div>
      <article className="disease-details">
        <div className="disease-details-head">
          <span className="disease-dot" style={{ background: activeDisease.color }} />
          <h3>{localize(activeDisease.name, language)}</h3>
        </div>
        <p>{localize(activeDisease.description, language)}</p>
        <div className="disease-detail-grid">
          <div>
            <h4>{t.symptoms}</h4>
            <ul>
              {localize(activeDisease.symptoms, language).map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{t.prevention}</h4>
            <p>{localize(activeDisease.prevention, language)}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
