import { scrollToSection } from '../utils/scroll.js';

export default function Header() {
  return (
    <nav className="nav">
      <div className="logo">
        МалАИ <span>ветеринар в телефоне</span>
      </div>
      <button className="nav-cta" onClick={() => scrollToSection('demo')}>
        Попробовать
      </button>
    </nav>
  );
}
