export default function LoadingDots({ label = 'AI анализирует симптомы...' }) {
  return (
    <div className="loading-state" aria-live="polite">
      <span>{label}</span>
      <div className="loading-dots" aria-hidden="true">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  );
}
