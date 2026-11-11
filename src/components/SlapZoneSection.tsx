import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { RotateCcw, Flame, Sparkles } from 'lucide-react';

interface Particle {
  id: number;
  text: string;
  colorClass: string;
  x: number;
  y: number;
}

interface LogEntry {
  id: number;
  time: string;
  message: string;
  isPositive?: boolean;
}

export const SlapZoneSection: React.FC = () => {
  const [totalSlapDamage, setTotalSlapDamage] = useState(0);
  const [dummyStatus, setDummyStatus] = useState('Ready for Discipline');
  const [dummyAnim, setDummyAnim] = useState<'' | 'animate-pat' | 'animate-slap' | 'animate-hip'>('');
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [showLeftMark, setShowLeftMark] = useState(false);
  const [showRightMark, setShowRightMark] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [combo, setCombo] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 0,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: 'Zoro Bhabhi is standing still, waiting for your move...',
    },
  ]);

  const comboTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (message: string, isPositive = false) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [{ id: Date.now() + Math.random(), time, message, isPositive }, ...prev.slice(0, 19)]);
  };

  const spawnParticle = (text: string, colorClass: string) => {
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      text,
      colorClass,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 25,
    };
    setParticles((prev) => [...prev, newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 850);
  };

  const registerCombo = () => {
    setCombo((c) => c + 1);
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 2500);
  };

  const triggerPat = () => {
    sound.playPat();
    setDummyAnim('');
    setTimeout(() => setDummyAnim('animate-pat'), 10);
    setTotalSlapDamage((prev) => prev + 5);
    setDummyStatus('Feeling Loved 🥰');
    spawnParticle('❤️ PAT PAT', 'text-emerald-400');
    addLog("You gently patted Zoro Bhabhi's head. (+5 Love Points)", true);
    registerCombo();
  };

  const triggerSlap = () => {
    sound.playSlap(1.2);
    sound.playBossHurt();
    setDummyAnim('');
    setIsScreenShaking(false);
    setShowLeftMark(true);
    setShowRightMark(Math.random() > 0.5);

    setTimeout(() => {
      setDummyAnim('animate-slap');
      setIsScreenShaking(true);
    }, 10);

    setTimeout(() => {
      setIsScreenShaking(false);
      setShowLeftMark(false);
      setShowRightMark(false);
    }, 600);

    setTotalSlapDamage((prev) => prev + 50);
    setDummyStatus('REELING FROM SLAP 💥');
    spawnParticle('💥 SLAP! -50HP', 'text-rose-500');
    addLog('CRITICAL SLAP! You slapped Zoro Bhabhi across the face! (-50 HP)');

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
    });
    registerCombo();
  };

  const triggerHipSlap = () => {
    sound.playSlap(0.75);
    sound.playBossHurt();
    setDummyAnim('');
    setTimeout(() => setDummyAnim('animate-hip'), 10);

    setTotalSlapDamage((prev) => prev + 100);
    setDummyStatus('CLAPPED HARD 🍑💥');
    spawnParticle('🍑 CLAP! -100HP', 'text-purple-400');
    addLog('HIP SPANK! You delivered a heavy hip slap to Zoro Bhabhi! (-100 HP)');

    confetti({
      particleCount: 45,
      spread: 70,
      origin: { y: 0.8 },
    });
    registerCombo();
  };

  const handleReset = () => {
    sound.playTick();
    setTotalSlapDamage(0);
    setCombo(0);
    setDummyStatus('Ready for Discipline');
    addLog('Zoro Bhabhi has taken a breath and reset his damage counter.');
  };

  return (
    <section id="slapzone" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <span className="px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-extrabold uppercase tracking-wider inline-block animate-pulse">
          Interactive Stress Relief
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
          ZORO BHABHI DUMMY SLAP ZONE 💥
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Choose your strike method and discipline Zoro Bhabhi in real-time!
        </p>
      </div>

      <div
        id="slapMainCard"
        className={`glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden border-2 border-rose-500/40 ${
          isScreenShaking ? 'screen-shake' : ''
        }`}
      >
        {/* Slap Counter Display */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8 bg-gray-900/80 p-4 rounded-2xl border border-gray-800">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
              Total Slap Damage
            </span>
            <span className="text-3xl sm:text-4xl font-black text-rose-500 text-glow-rose tabular-nums">
              {totalSlapDamage.toLocaleString()}
            </span>
          </div>

          {combo > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-300 font-extrabold text-sm animate-bounce">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{combo}x COMBO!</span>
            </div>
          )}

          <div className="text-right flex items-center gap-4">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">
                Status
              </span>
              <span
                className={`text-xs sm:text-sm font-bold ${
                  dummyStatus.includes('Loved')
                    ? 'text-emerald-400'
                    : dummyStatus.includes('CLAPPED')
                    ? 'text-purple-400'
                    : dummyStatus.includes('SLAP')
                    ? 'text-rose-400'
                    : 'text-gray-300'
                }`}
              >
                {dummyStatus}
              </span>
            </div>
            <button
              onClick={handleReset}
              title="Reset Damage"
              className="p-2 rounded-xl glass-card border border-gray-800 hover:border-gray-600 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Dummy Render Container */}
        <div className="relative w-full h-80 sm:h-96 flex items-center justify-center bg-gradient-to-b from-gray-950/70 to-gray-900/50 rounded-2xl border border-gray-800/80 my-6 overflow-hidden select-none">
          {/* Floating Slap FX Overlay */}
          <div className="absolute inset-0 pointer-events-none z-30">
            {particles.map((p) => (
              <div
                key={p.id}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className={`particle-float font-black text-2xl sm:text-3xl drop-shadow-lg ${p.colorClass}`}
              >
                {p.text}
              </div>
            ))}
          </div>

          {/* Dummy Avatar Graphic */}
          <div
            onClick={triggerSlap}
            className={`relative cursor-pointer transition-transform duration-100 flex flex-col items-center group ${dummyAnim}`}
          >
            {/* Crown */}
            <div className="text-2xl -mb-3 z-10 animate-bounce select-none">👑</div>

            {/* Dummy Head */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-rose-400 via-purple-500 to-indigo-600 p-1 shadow-2xl shadow-rose-500/30 flex items-center justify-center relative">
              {/* Inner Face */}
              <div className="w-full h-full rounded-full bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Eyes */}
                <div className="flex gap-6 mb-2">
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-110">
                    <div className="w-2 h-2 rounded-full bg-black" />
                  </div>
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-110">
                    <div className="w-2 h-2 rounded-full bg-black" />
                  </div>
                </div>

                {/* Blush / Slap Marks */}
                <div
                  className={`absolute left-3 top-16 w-5 h-5 rounded-full bg-rose-600 transition-opacity duration-300 pointer-events-none ${
                    showLeftMark ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <div
                  className={`absolute right-3 top-16 w-6 h-6 rounded-full bg-rose-600 transition-opacity duration-300 pointer-events-none ${
                    showRightMark ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Tongue / Mouth */}
                <div className="w-8 h-3 rounded-full bg-rose-500 transition-all duration-200 mt-1" />

                <span className="text-[10px] text-gray-400 mt-2 font-mono font-bold tracking-wider">
                  ZORO BHABHI
                </span>
              </div>
            </div>

            {/* Dummy Body & Hip */}
            <div className="w-24 h-28 sm:w-28 sm:h-32 bg-gradient-to-b from-purple-900 to-indigo-950 rounded-b-3xl mt-1 border-t-2 border-purple-500 relative flex justify-center">
              <span className="text-xs text-purple-300 font-bold mt-4 tracking-wider">
                CHU CHU
              </span>

              {/* Hip target zone */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHipSlap();
                }}
                className="absolute -bottom-2 w-28 h-12 bg-rose-900/70 hover:bg-rose-800 rounded-full border border-rose-500/50 flex items-center justify-center shadow-lg shadow-rose-950/60 cursor-pointer group-hover:border-rose-400"
              >
                <span className="text-[10px] text-rose-300 font-extrabold uppercase tracking-wider">
                  TARGET HIP 🍑
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <button
            onClick={triggerPat}
            className="py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-extrabold text-white text-sm sm:text-base shadow-lg shadow-emerald-950/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Pat Zoro Bhabhi 👋</span>
          </button>

          <button
            onClick={triggerSlap}
            className="py-4 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-extrabold text-white text-sm sm:text-base shadow-lg shadow-rose-950/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Slap Zoro Bhabhi 💥</span>
          </button>

          <button
            onClick={triggerHipSlap}
            className="py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-extrabold text-white text-sm sm:text-base shadow-lg shadow-purple-950/40 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Slap Zoro Bhabhi's Hip 🍑</span>
          </button>
        </div>

        {/* Slap Log Feed */}
        <div className="mt-6 bg-gray-950/70 rounded-xl p-4 border border-gray-800">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">
            Live Reaction Feed
          </span>
          <div className="text-xs sm:text-sm text-gray-300 font-mono h-20 overflow-y-auto space-y-1.5 scrollbar-thin">
            {logs.map((log) => (
              <p
                key={log.id}
                className={log.isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}
              >
                &gt; [{log.time}] {log.message}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
