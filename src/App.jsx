import DemoChat from './components/chat/DemoChat.jsx';
import DiseasesSection from './components/DiseasesSection.jsx';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import HowItWorks from './components/HowItWorks.jsx';
import Stats from './components/Stats.jsx';

export default function App() {
  return (
    <div className="app">
      <Header />
      <Hero />
      <Stats />
      <HowItWorks />
      <DiseasesSection />
      <DemoChat />
      <Footer />
    </div>
  );
}
