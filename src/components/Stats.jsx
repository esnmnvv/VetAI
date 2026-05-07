import { useI18n } from '../i18n/useI18n.js';

export default function Stats() {
  const { t } = useI18n();

  return (
    <section className="stats" aria-label={t.statsLabel}>
      <div className="stat">
        <div className="stat-num">5M+</div>
        <div className="stat-label">{t.livestockCount}</div>
      </div>
      <div className="stat">
        <div className="stat-num">30+</div>
        <div className="stat-label">{t.diseasesCount}</div>
      </div>
      <div className="stat">
        <div className="stat-num">&lt;30с</div>
        <div className="stat-label">{t.analysisTime}</div>
      </div>
    </section>
  );
}
