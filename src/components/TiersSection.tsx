import React from 'react';
import { TIERS_DATA } from '../data/empireData';
import { Check } from 'lucide-react';
import { sound } from '../utils/audio';

export const TiersSection: React.FC = () => {
  return (
    <section id="tiers" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16 space-y-3">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          REALM HIERARCHY
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto text-base">
          Explore the four dominant tiers of our server hierarchy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TIERS_DATA.map((tier) => (
          <div
            key={tier.title}
            onMouseEnter={() => sound.playTick()}
            className={`glass-card rounded-2xl p-6 relative overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ${tier.borderColor} flex flex-col justify-between`}
          >
            {/* Ambient glow accent */}
            {tier.tierNumber === 'Tier 1' && (
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-500/20 rounded-full blur-xl pointer-events-none" />
            )}

            <div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase inline-block border ${tier.badgeColor}`}
              >
                {tier.badge}
              </span>

              <h3 className="text-2xl font-black text-white mt-4 mb-2 flex items-center gap-2">
                <span>{tier.title}</span>
                <span className="text-xl">{tier.icon}</span>
              </h3>

              <p className="text-xs text-gray-400 mb-6 leading-relaxed min-h-[48px]">
                {tier.description}
              </p>
            </div>

            <ul className="text-xs text-gray-300 space-y-2 border-t border-gray-800 pt-4">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
