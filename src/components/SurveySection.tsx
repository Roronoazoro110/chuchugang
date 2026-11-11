import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

export const SurveySection: React.FC = () => {
  const [q1Result, setQ1Result] = useState<string | null>(null);
  const [q2Result, setQ2Result] = useState<string | null>(null);
  const [q3Result, setQ3Result] = useState<string | null>(null);

  // Teleport button positions
  const [q1NoPos, setQ1NoPos] = useState<{ x: number; y: number } | null>(null);
  const [q2NoPos, setQ2NoPos] = useState<{ x: number; y: number } | null>(null);

  const q1ContainerRef = useRef<HTMLDivElement>(null);
  const q2ContainerRef = useRef<HTMLDivElement>(null);

  const dodge = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    setPos: (pos: { x: number; y: number }) => void
  ) => {
    sound.playTeleport();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const maxX = Math.max(20, rect.width - 130);
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * 80) - 40;
    setPos({ x: randomX, y: randomY });
  };

  const handleAnswerQ1 = () => {
    sound.playTick();
    setQ1Result('✅ Confirmed: You selected YES! Truth has been spoken.');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleAnswerQ2 = () => {
    sound.playTick();
    setQ2Result('✅ Unanimous Vote: You selected YES! Truth has been spoken.');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const handleAnswerQ3 = (val: string) => {
    sound.playTick();
    setQ3Result(`👑 Empire Praise: "${val}" — You are a true warrior of the ChuChu Gang!`);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.8 } });
  };

  return (
    <section id="survey" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-extrabold uppercase tracking-wider inline-block">
          Mandatory Loyalty Check
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
          EMPIRE SURVEY
        </h2>
        <p className="text-gray-400 text-sm mt-1">Answer accurately. There is zero room for treason.</p>
      </div>

      <div className="space-y-8">
        {/* Question 1 */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-gray-800">
          <div className="text-xs font-bold text-[#8b5cf6] mb-1 tracking-widest">QUESTION 01</div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
            "kya ap ne sleepy or freaki ki chuchi chati hai"
          </h3>

          <div
            ref={q1ContainerRef}
            className="flex flex-wrap items-center gap-4 relative min-h-[64px]"
          >
            <button
              onClick={handleAnswerQ1}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              YES 👅
            </button>

            <button
              onMouseEnter={() => dodge(q1ContainerRef, setQ1NoPos)}
              onTouchStart={(e) => {
                e.preventDefault();
                dodge(q1ContainerRef, setQ1NoPos);
              }}
              style={
                q1NoPos
                  ? { position: 'absolute', left: `${q1NoPos.x}px`, top: `${q1NoPos.y}px` }
                  : undefined
              }
              className="teleport-btn px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-extrabold text-white shadow-lg shadow-rose-950/40 z-20 cursor-pointer select-none"
            >
              NO ❌
            </button>
          </div>

          {q1Result && (
            <div className="mt-4 text-emerald-400 font-bold text-sm bg-emerald-950/50 p-3.5 rounded-xl border border-emerald-800 animate-fadeIn">
              {q1Result}
            </div>
          )}
        </div>

        {/* Question 2 */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-gray-800">
          <div className="text-xs font-bold text-rose-400 mb-1 tracking-widest">QUESTION 02</div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
            "Is MEER GAY?"
          </h3>

          <div
            ref={q2ContainerRef}
            className="flex flex-wrap items-center gap-4 relative min-h-[64px]"
          >
            <button
              onClick={handleAnswerQ2}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-extrabold text-white shadow-lg shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              YES 💯
            </button>

            <button
              onMouseEnter={() => dodge(q2ContainerRef, setQ2NoPos)}
              onTouchStart={(e) => {
                e.preventDefault();
                dodge(q2ContainerRef, setQ2NoPos);
              }}
              style={
                q2NoPos
                  ? { position: 'absolute', left: `${q2NoPos.x}px`, top: `${q2NoPos.y}px` }
                  : undefined
              }
              className="teleport-btn px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-extrabold text-white shadow-lg shadow-rose-950/40 z-20 cursor-pointer select-none"
            >
              NO 🛑
            </button>
          </div>

          {q2Result && (
            <div className="mt-4 text-emerald-400 font-bold text-sm bg-emerald-950/50 p-3.5 rounded-xl border border-emerald-800 animate-fadeIn">
              {q2Result}
            </div>
          )}
        </div>

        {/* Question 3 */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-gray-800">
          <div className="text-xs font-bold text-cyan-400 mb-1 tracking-widest">QUESTION 03</div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-6">
            "Do u like Empire of Shadows?"
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleAnswerQ3('Hell Yes 🔥')}
              className="p-4 rounded-xl glass-card border border-gray-700 hover:border-[#8b5cf6] hover:bg-purple-900/20 font-bold text-white text-center hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              Hell Yes 🔥
            </button>
            <button
              onClick={() => handleAnswerQ3('Obviously 👑')}
              className="p-4 rounded-xl glass-card border border-gray-700 hover:border-rose-500 hover:bg-rose-900/20 font-bold text-white text-center hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              Obviously 👑
            </button>
            <button
              onClick={() => handleAnswerQ3('I am a slave to ChuChu Gang 🛐')}
              className="p-4 rounded-xl glass-card border border-gray-700 hover:border-cyan-400 hover:bg-cyan-900/20 font-bold text-white text-center hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              I am a slave to ChuChu Gang 🛐
            </button>
          </div>

          {q3Result && (
            <div className="mt-4 text-cyan-400 font-bold text-sm bg-cyan-950/50 p-3.5 rounded-xl border border-cyan-800 text-center animate-fadeIn">
              {q3Result}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
