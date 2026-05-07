import { useState } from 'react';
import { diseases } from '../data/siteData.js';

export default function DiseasesSection() {
  const [activeDisease, setActiveDisease] = useState(diseases[4] || diseases[0]);

  return (
    <section className="section diseases-section">
      <h2 className="section-title">Болезни в базе</h2>
      <p className="section-sub">
        AI обучен распознавать наиболее распространённые заболевания скота в ЦА
      </p>
      <div className="diseases">
        {diseases.map((disease) => (
          <button
            className={`disease-tag ${activeDisease.name === disease.name ? 'active' : ''}`}
            key={disease.name}
            type="button"
            onClick={() => setActiveDisease(disease)}
          >
            <span className="disease-dot" style={{ background: disease.color }} />
            {disease.name}
          </button>
        ))}
      </div>
      <article className="disease-details">
        <div className="disease-details-head">
          <span className="disease-dot" style={{ background: activeDisease.color }} />
          <h3>{activeDisease.name}</h3>
        </div>
        <p>{activeDisease.description}</p>
        <div className="disease-detail-grid">
          <div>
            <h4>Симптомы</h4>
            <ul>
              {activeDisease.symptoms.map((symptom) => (
                <li key={symptom}>{symptom}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Профилактика</h4>
            <p>{activeDisease.prevention}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
