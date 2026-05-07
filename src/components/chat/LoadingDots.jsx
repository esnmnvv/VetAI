import { useI18n } from '../../i18n/useI18n.js';

export default function LoadingDots({ label }) {
  const { t } = useI18n();

  return (
    <div className="loading-state" aria-live="polite">
      <span>{label || t.loading}</span>
      <div className="loading-dots" aria-hidden="true">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  );
}
