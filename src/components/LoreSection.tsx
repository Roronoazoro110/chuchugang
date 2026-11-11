import React from 'react';
import { LORE_ENTRIES } from '../data/empireData';
import { sound } from '../utils/audio';

export const LoreSection: React.FC = () => {
  return (
    <section id="lore" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          GANG LORE & CRINGE HALL OF FAME
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-base">
          Unfiltered legendary archives of the Empire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {LORE_ENTRIES.map((entry) => (
          <div
            key={entry.title}
            onMouseEnter={() => sound.playTick()}
            className={`glass-card rounded-2xl p-6 relative group transition-all duration-300 border border-gray-800 ${entry.borderColor} hover:-translate-y-1.5 flex flex-col justify-between`}
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-gray-900/80 flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform border border-gray-800">
                {entry.icon}
              </div>

              <span
                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-block ${entry.accentColor}`}
              >
                {entry.badge}
              </span>

              <h3 className="text-xl font-bold text-white mt-2 mb-3">
                {entry.title}
              </h3>

              <p className="text-sm text-gray-400 leading-relaxed">
                {entry.story}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-800/80 flex justify-between items-center text-[11px] text-gray-500 font-mono">
              <span>ARCHIVED DECREE</span>
              <span className="text-gray-400">#ChuChuLore</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
