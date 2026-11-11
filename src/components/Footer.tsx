import React from 'react';
import { Crown, ArrowUp } from 'lucide-react';
import { sound } from '../utils/audio';

interface FooterProps {
  onScrollToTop: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToTop }) => {
  const handleScrollTop = () => {
    sound.playTick();
    onScrollToTop();
  };

  return (
    <footer className="mt-20 border-t border-gray-800/80 py-12 px-4 sm:px-6 lg:px-8 text-center text-sm glass-card bg-opacity-40">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-center items-center gap-2 text-purple-400">
          <Crown className="w-5 h-5" />
          <span className="font-extrabold tracking-widest text-xs uppercase text-white">
            ChuChu Gang Council Sovereign Domain
          </span>
        </div>

        <p className="text-gray-400 font-semibold text-sm">
          EMPIRE OF SHADOWS © 2026 • Ruled by ChuChu Gang
        </p>

        <p className="text-gray-500 text-xs tracking-wider">
          Ali • Meer • Akira • Abdullah • Zoro • Kevi
        </p>

        <div className="pt-4 flex justify-center">
          <button
            onClick={handleScrollTop}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card border border-gray-800 text-xs font-bold text-gray-400 hover:text-white hover:border-purple-500 transition-all cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Back to Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
