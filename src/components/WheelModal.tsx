import React from 'react';
import { sound } from '../utils/audio';

interface WheelModalProps {
  prize: string | null;
  onClose: () => void;
}

export const WheelModal: React.FC<WheelModalProps> = ({ prize, onClose }) => {
  if (!prize) return null;

  const handleClaim = () => {
    sound.playTick();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-card max-w-sm w-full rounded-3xl p-6 sm:p-8 text-center border-2 border-[#8b5cf6] space-y-5 shadow-2xl shadow-purple-950/60 transform scale-100 transition-all">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/20 text-[#8b5cf6] flex items-center justify-center text-3xl border border-purple-500/40">
          🎁
        </div>

        <h3 className="text-2xl font-black text-white tracking-tight">CONGRATULATIONS!</h3>

        <div className="py-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
            Prize Unlocked
          </span>
          <p className="text-xl font-black text-[#f43f5e] text-glow-rose">
            {prize}
          </p>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Your fortune has been registered with the Empire of Shadows council.
        </p>

        <button
          onClick={handleClaim}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-purple-500 hover:to-purple-600 text-white font-extrabold shadow-lg shadow-purple-900/40 hover:scale-102 active:scale-98 transition-all cursor-pointer"
        >
          CLAIM REWARD 👑
        </button>
      </div>
    </div>
  );
};
