import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TiersSection } from './components/TiersSection';
import { DashboardSection } from './components/DashboardSection';
import { SurveySection } from './components/SurveySection';
import { SpinWheelSection } from './components/SpinWheelSection';
import { LoreSection } from './components/LoreSection';
import { BossShooterSection } from './components/BossShooterSection';
import { Footer } from './components/Footer';
import { WheelModal } from './components/WheelModal';
import { ArrowLeft, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { sound } from './utils/audio';

export default function App() {
  const [activePrize, setActivePrize] = useState<string | null>(null);
  const [isGameTab, setIsGameTab] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('game') === 'fullscreen' || params.get('game') === '1' || window.location.hash === '#game';
  });
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsGameTab(params.get('game') === 'fullscreen' || params.get('game') === '1' || window.location.hash === '#game');
    };
    window.addEventListener('popstate', handlePopState);
    const unsub = sound.subscribe((m) => setIsMuted(m));
    return () => {
      window.removeEventListener('popstate', handlePopState);
      unsub();
    };
  }, []);

  const handleToggleMute = () => {
    const next = sound.toggleMute();
    setIsMuted(next);
  };

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Dedicated Full-Screen Tab Mode for the Game
  if (isGameTab) {
    return (
      <div className="fixed inset-0 bg-[#07080c] text-white flex flex-col z-[100] overflow-hidden select-none">
        {/* Top Minimal Gaming Bar */}
        <div className="h-14 bg-gray-950/95 border-b border-gray-800/90 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-lg">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              const url = new URL(window.location.href);
              url.searchParams.delete('game');
              url.hash = '';
              window.history.pushState({}, '', url.pathname);
              setIsGameTab(false);
            }}
            className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded-xl glass-card border border-gray-700 hover:border-emerald-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back to Empire of Shadows</span>
          </a>

          <div className="flex items-center gap-2 text-center">
            <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-400">
              ⚔️ BEAT THE ACHI RANDI CHALLENGE
            </span>
            <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-red-950 border border-red-700 text-red-300 font-mono font-bold">
              ☠️ THE FALLEN MEER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-2 rounded-xl glass-card border border-gray-700 text-gray-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={toggleBrowserFullscreen}
              className="p-2 rounded-xl glass-card border border-gray-700 text-gray-300 hover:text-white transition-colors"
              title="Toggle Browser Fullscreen"
            >
              <Maximize2 className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Full Viewport Standalone Game Arena */}
        <div className="flex-1 overflow-hidden relative p-2 sm:p-4 md:p-6 flex flex-col justify-center max-w-7xl mx-auto w-full">
          <BossShooterSection isStandaloneMode={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#8b5cf6] selection:text-white relative bg-[#0a0b10] text-[#f3f4f6]">
      {/* Fixed top navigation */}
      <Header onScrollTo={scrollToSection} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <Hero onScrollTo={scrollToSection} />
        <TiersSection />
        <DashboardSection />
        <SurveySection />
        <SpinWheelSection onWinPrize={(prize) => setActivePrize(prize)} />
        <LoreSection />
        <BossShooterSection />
      </main>

      {/* Footer */}
      <Footer onScrollToTop={() => scrollToSection('hero')} />

      {/* Spin Wheel Reward Modal */}
      <WheelModal
        prize={activePrize}
        onClose={() => setActivePrize(null)}
      />
    </div>
  );
}
