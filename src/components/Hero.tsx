import React from 'react';
import { Sparkles, Disc, Flame, ShieldAlert, Users, Radio } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeroProps {
  onScrollTo: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollTo }) => {
  const handleCta = (id: string) => {
    sound.playTick();
    onScrollTo(id);
  };

  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center items-center pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-red-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[380px] h-[300px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">

        {/* Hero headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
          WELCOME TO THE <br />
          <span className="bg-gradient-to-r from-red-500 via-rose-500 to-red-600 bg-clip-text text-transparent text-glow-rose">
            EMPIRE OF SHADOWS
          </span>
        </h1>

        {/* Editorial description */}
        <p className="max-w-2xl mx-auto text-gray-400 text-base sm:text-xl font-normal leading-relaxed">
          Where chaotic legend meets midnight lore. Sovereign gaming domain ruled supreme by the almighty, unpredictable{' '}
          <strong className="text-white font-bold">ChuChu Gang</strong>.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button
            onClick={() => handleCta('slapzone')}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-extrabold text-white shadow-xl shadow-red-950/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span>Enter Boss Raid 💀</span>
          </button>

          <button
            onClick={() => handleCta('spinwheel')}
            className="px-8 py-4 rounded-xl glass-card font-bold text-gray-200 border border-gray-700 hover:border-red-500 hover:text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
          >
            <Disc className="w-5 h-5 text-red-500" />
            <span>Spin The Wheel</span>
          </button>
        </div>

        {/* Server Metrics / Status Strip */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-2xl text-left border border-gray-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Users className="w-3.5 h-3.5 text-red-400" />
              <span>Server Population</span>
            </div>
            <div className="text-2xl font-black text-white">420+</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Active Night Grinders</div>
          </div>

          <div className="glass-card p-4 rounded-2xl text-left border border-gray-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice Channel</span>
            </div>
            <div className="text-2xl font-black text-cyan-400">General 1</div>
            <div className="text-[11px] text-gray-500 mt-0.5">100% Unfiltered Chaos</div>
          </div>

          <div className="glass-card p-4 rounded-2xl text-left border border-gray-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Server Law</span>
            </div>
            <div className="text-2xl font-black text-white">ChuChu Rule</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Discretion of Ali & Gang</div>
          </div>

          <div className="glass-card p-4 rounded-2xl text-left border border-gray-800/80">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Target Dummy</span>
            </div>
            <div className="text-2xl font-black text-rose-400">Zoro Bhabhi</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Taking Daily Discipline</div>
          </div>
        </div>
      </div>
    </section>
  );
};
