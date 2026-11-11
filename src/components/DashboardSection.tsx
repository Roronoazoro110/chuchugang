import React, { useState } from 'react';
import { GANG_MEMBERS } from '../data/empireData';
import { sound } from '../utils/audio';
import { Zap, Flame, Brain, Heart } from 'lucide-react';

export const DashboardSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const activeMember = GANG_MEMBERS[activeIdx];

  const handleSelectMember = (idx: number) => {
    sound.playTick();
    setActiveIdx(idx);
  };

  // Radar chart mathematical geometry
  const radarMetrics = [
    { label: 'Power', key: 'power', val: activeMember.stats.power, icon: Zap, color: '#f59e0b' },
    { label: 'Chaos', key: 'chaos', val: activeMember.stats.chaos, icon: Flame, color: '#f43f5e' },
    { label: 'Braincells', key: 'braincells', val: activeMember.stats.braincells, icon: Brain, color: '#06b6d4' },
    { label: 'Simp Score', key: 'simpScore', val: activeMember.stats.simpScore, icon: Heart, color: '#8b5cf6' },
  ];

  const center = 160;
  const radius = 110;
  const numAxes = radarMetrics.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = radarMetrics
    .map((m, idx) => {
      const { x, y } = getCoordinates(m.val, idx);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section id="dashboard" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          CHUCHU GANG METRICS
        </h2>
        <p className="text-gray-400 mt-2 text-base">
          Interactive performance & chaos statistics for each gang legend.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-gray-800">
        {/* Member Selector Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mb-8 border-b border-gray-800/80 pb-6">
          {GANG_MEMBERS.map((member, idx) => (
            <button
              key={member.id}
              onClick={() => handleSelectMember(idx)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                idx === activeIdx
                  ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'glass-card text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <span className="text-base">{member.icon}</span>
              <span>{member.name}</span>
            </button>
          ))}
        </div>

        {/* Active Member Stats View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left: Member Identity Card */}
          <div className="glass-card p-6 rounded-2xl text-center space-y-5 border border-gray-800">
            <div
              className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-tr ${activeMember.color} flex items-center justify-center text-4xl shadow-xl shadow-purple-900/30`}
            >
              {activeMember.icon}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-wide">{activeMember.name}</h3>
              <span className="text-xs font-bold text-[#8b5cf6] uppercase tracking-widest block mt-1">
                {activeMember.role}
              </span>
            </div>
            <p className="text-xs text-gray-400 italic px-4 bg-gray-950/40 py-2.5 rounded-xl border border-gray-900">
              "{activeMember.quote}"
            </p>

            {/* Quick stats mini cards */}
            <div className="grid grid-cols-2 gap-2 text-left pt-2">
              {radarMetrics.map((stat) => (
                <div key={stat.label} className="bg-gray-900/60 p-2.5 rounded-xl border border-gray-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold">
                    <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                    <span>{stat.label}</span>
                  </div>
                  <div className="text-lg font-black text-white tabular-nums mt-0.5">
                    {stat.val}<span className="text-xs text-gray-500 font-normal">/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Radar Chart View */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 min-h-[320px] relative">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Chaos Matrix Assessment
            </div>

            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 320 320" className="w-full h-full overflow-visible">
                <defs>
                  {/* Glowing gradient for radar fill */}
                  <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
                  </linearGradient>
                  <filter id="radarGlow" x1="-20%" y1="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Concentric radar rings (25, 50, 75, 100) */}
                {[0.25, 0.5, 0.75, 1.0].map((scale) => {
                  const ringRadius = radius * scale;
                  const ringPoints = Array.from({ length: numAxes })
                    .map((_, i) => {
                      const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                      const x = center + ringRadius * Math.cos(angle);
                      const y = center + ringRadius * Math.sin(angle);
                      return `${x},${y}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={scale}
                      points={ringPoints}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Radar axes */}
                {Array.from({ length: numAxes }).map((_, i) => {
                  const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeDasharray="3 3"
                    />
                  );
                })}

                {/* Value Polygon */}
                <polygon
                  points={polygonPoints}
                  fill="url(#radarGrad)"
                  stroke="#8b5cf6"
                  strokeWidth="2.5"
                  filter="url(#radarGlow)"
                  className="transition-all duration-500 ease-out"
                />

                {/* Vertices & labels */}
                {radarMetrics.map((m, idx) => {
                  const { x, y } = getCoordinates(m.val, idx);
                  const angle = (Math.PI * 2 / numAxes) * idx - Math.PI / 2;
                  const labelDistance = radius + 24;
                  const labelX = center + labelDistance * Math.cos(angle);
                  const labelY = center + labelDistance * Math.sin(angle);

                  return (
                    <g key={m.label} className="transition-all duration-500 ease-out">
                      {/* Vertex marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r="5"
                        fill="#f43f5e"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="transition-all duration-500"
                      />
                      {/* Label Text */}
                      <text
                        x={labelX}
                        y={labelY}
                        fill="#e5e7eb"
                        fontSize="12"
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontFamily="inherit"
                      >
                        {m.label} ({m.val})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="text-[11px] text-gray-500 mt-4 text-center">
              Evaluated under strict ChuChu Gang council supervision. High simp scores cannot be appealed.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
