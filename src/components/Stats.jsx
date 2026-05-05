export default function Stats() {
  return (
    <section className="stats" aria-label="Статистика">
      <div className="stat">
        <div className="stat-num">5M+</div>
        <div className="stat-label">голов скота в КР</div>
      </div>
      <div className="stat">
        <div className="stat-num">30+</div>
        <div className="stat-label">болезней в базе</div>
      </div>
      <div className="stat">
        <div className="stat-num">&lt;30с</div>
        <div className="stat-label">время анализа</div>
      </div>
    </section>
  );
}
