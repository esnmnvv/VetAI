import { steps } from '../data/siteData.js';

export default function HowItWorks() {
  return (
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
  );
}
