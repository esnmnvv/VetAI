export default function LoadingDots({ label = 'AI думает' }) {
  return (
    <div className="loading-dots" aria-label={label}>
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  );
}
