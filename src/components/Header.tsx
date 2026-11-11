import React, { useState, useEffect } from 'react';
import { Menu, X, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderProps {
  onScrollTo: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onScrollTo }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  useEffect(() => {
    // Subscribe to sound engine state changes
    const unsubscribe = sound.subscribe((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sound.playTick();
    }
  };

  const handleNavClick = (id: string) => {
    onScrollTo(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card bg-opacity-80 border-b border-gray-800/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Zone */}
        <button
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-3 cursor-pointer text-left focus:outline-none group"
        >
          <img
            src="https://cdn.discordapp.com/icons/1151871825891041320/a_8a083d1bd076c0988d7f880958758ed7.gif?size=2048"
            onError={(e) => {
              e.currentTarget.src = '/icons/server-icon.gif';
            }}
            alt="Empire of Shadows"
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform border border-purple-500/30"
          />
          <span className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-white via-gray-200 to-[#8b5cf6] bg-clip-text text-transparent">
            EMPIRE OF SHADOWS
          </span>
        </button>

        {/* Nav Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-gray-300">
          <button
            onClick={() => handleNavClick('tiers')}
            className="hover:text-[#8b5cf6] transition-colors whitespace-nowrap cursor-pointer"
          >
            Tiers
          </button>
          <button
            onClick={() => handleNavClick('dashboard')}
            className="hover:text-[#06b6d4] transition-colors whitespace-nowrap cursor-pointer"
          >
            ChuChu Stats
          </button>
          <button
            onClick={() => handleNavClick('survey')}
            className="hover:text-[#f43f5e] transition-colors whitespace-nowrap cursor-pointer"
          >
            The Survey
          </button>
          <button
            onClick={() => handleNavClick('spinwheel')}
            className="hover:text-[#8b5cf6] transition-colors whitespace-nowrap cursor-pointer"
          >
            Lucky Wheel
          </button>
          <button
            onClick={() => handleNavClick('lore')}
            className="hover:text-[#f59e0b] transition-colors whitespace-nowrap cursor-pointer"
          >
            Gang Lore
          </button>
        </nav>

        {/* Action Zone */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Persistent Audio Mute/Unmute Toggle */}
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
            title={isMuted ? 'Sound Effects: Muted (Click to Unmute)' : 'Sound Effects: Active (Click to Mute)'}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              isMuted
                ? 'bg-rose-950/40 border-rose-800/80 text-rose-400 hover:bg-rose-900/50 hover:text-white'
                : 'glass-card border-gray-700/80 text-purple-300 hover:text-white hover:border-purple-500/60'
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-wider">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-[#8b5cf6] shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-wider">SFX On</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleNavClick('slapzone')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            Boss Raid 💀💥
          </button>
        </div>

        {/* Mobile menu trigger + Audio Toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute Audio SFX' : 'Mute Audio SFX'}
            title={isMuted ? 'Sound Effects Muted' : 'Sound Effects Active'}
            className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-950/50 border-rose-800 text-rose-400'
                : 'glass-card border-gray-700 text-[#8b5cf6]'
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-[#8b5cf6]" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg glass-card text-gray-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-card border-b border-gray-800 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 font-semibold text-gray-300">
            <button
              onClick={() => handleNavClick('tiers')}
              className="text-left py-2 hover:text-[#8b5cf6]"
            >
              Tiers
            </button>
            <button
              onClick={() => handleNavClick('dashboard')}
              className="text-left py-2 hover:text-[#06b6d4]"
            >
              ChuChu Stats
            </button>
            <button
              onClick={() => handleNavClick('survey')}
              className="text-left py-2 hover:text-[#f43f5e]"
            >
              The Survey
            </button>
            <button
              onClick={() => handleNavClick('spinwheel')}
              className="text-left py-2 hover:text-[#8b5cf6]"
            >
              Lucky Wheel
            </button>
            <button
              onClick={() => handleNavClick('lore')}
              className="text-left py-2 hover:text-[#f59e0b]"
            >
              Gang Lore
            </button>
            <button
              onClick={() => handleNavClick('slapzone')}
              className="w-full text-center py-3 mt-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold cursor-pointer"
            >
              Boss Raid 💀💥
            </button>

            {/* Mobile Drawer persistent audio toggle row */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800/80">
              <span className="text-xs text-gray-400 font-semibold">Sound Effects</span>
              <button
                onClick={handleToggleMute}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors ${
                  isMuted
                    ? 'bg-rose-950/60 border border-rose-800 text-rose-400'
                    : 'bg-purple-950/60 border border-purple-800 text-purple-300'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isMuted ? 'Muted' : 'SFX Active'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
