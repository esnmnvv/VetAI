import { diseases } from '../data/siteData.js';

export default function DiseasesSection() {
  return (
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
  );
}
