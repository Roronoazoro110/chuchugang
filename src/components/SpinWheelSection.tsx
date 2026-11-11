import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { WHEEL_ITEMS } from '../data/empireData';
import { sound } from '../utils/audio';
import { Disc, Gift } from 'lucide-react';

interface SpinWheelSectionProps {
  onWinPrize: (prize: string) => void;
}

export const SpinWheelSection: React.FC<SpinWheelSectionProps> = ({ onWinPrize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const arc = (Math.PI * 2) / WHEEL_ITEMS.length;

  const drawWheel = useCallback((angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outsideRadius = 165;
    const textRadius = 105;
    const insideRadius = 38;

    ctx.clearRect(0, 0, width, height);

    // Draw wheel segments
    for (let i = 0; i < WHEEL_ITEMS.length; i++) {
      const segAngle = angle + i * arc;
      ctx.fillStyle = WHEEL_ITEMS[i].color;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outsideRadius, segAngle, segAngle + arc, false);
      ctx.arc(centerX, centerY, insideRadius, segAngle + arc, segAngle, true);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = 'rgba(10, 11, 16, 0.85)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw label
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;

      ctx.translate(
        centerX + Math.cos(segAngle + arc / 2) * textRadius,
        centerY + Math.sin(segAngle + arc / 2) * textRadius
      );
      ctx.rotate(segAngle + arc / 2 + Math.PI / 2);
      const text = WHEEL_ITEMS[i].label;
      ctx.fillText(text, -ctx.measureText(text).width / 2, 4);
      ctx.restore();
    }

    // Outer metallic rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, outsideRadius, 0, Math.PI * 2, false);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Center circular hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, insideRadius, 0, Math.PI * 2, false);
    ctx.fillStyle = '#0a0b10';
    ctx.fill();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Center golden icon / dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, Math.PI * 2, false);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
  }, [arc]);

  useEffect(() => {
    drawWheel(currentAngleRef.current);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawWheel]);

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // Determine weighted prize
    const rand = Math.random() * 100;
    let winningIndex = 0;
    if (rand < 60) {
      winningIndex = 0; // Zoro bhabhi's ace
    } else if (rand < 90) {
      winningIndex = 1; // Sleepy Maseeha's Ashirvaad
    } else {
      winningIndex = 2; // Akira bhabhi's Chummi
    }

    // Pointer is at the very top = 270 deg / (3 * Math.PI / 2)
    const totalRounds = 5 + Math.floor(Math.random() * 3);
    const targetSegmentAngle = 3 * Math.PI / 2 - (winningIndex * arc + arc / 2);
    const startAngle = currentAngleRef.current;
    const finalAngle = (totalRounds * Math.PI * 2) + targetSegmentAngle;

    const duration = 4000;
    const startTime = performance.now();
    let lastTickTime = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        // Cubic ease-out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentAngle = startAngle + easeOut * (finalAngle - startAngle);
        currentAngleRef.current = currentAngle;

        // Sound tick pacing
        if (currentTime - lastTickTime > 70 + progress * 200) {
          sound.playTick();
          lastTickTime = currentTime;
        }

        drawWheel(currentAngle);
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        const normalizedAngle = finalAngle % (Math.PI * 2);
        currentAngleRef.current = normalizedAngle;
        drawWheel(normalizedAngle);
        setIsSpinning(false);

        // Winner celebration
        sound.playFanfare();
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
        });

        onWinPrize(WHEEL_ITEMS[winningIndex].label);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  return (
    <section id="spinwheel" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <span className="px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[#8b5cf6] text-xs font-extrabold uppercase tracking-wider inline-block">
          Wheel of Fate
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-3">
          LUCKY SPIN WHEEL
        </h2>
        <p className="text-gray-400 text-sm mt-1">Spin to win exclusive ChuChu blessings & items!</p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 flex flex-col items-center relative overflow-hidden border border-gray-800">
        {/* Top needle pointer */}
        <div className="relative z-20 -mb-5 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[28px] border-t-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]" />
        </div>

        {/* Canvas container */}
        <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] flex items-center justify-center p-2 rounded-full shadow-2xl shadow-purple-950/40">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            className="w-full h-full max-w-full drop-shadow-[0_0_24px_rgba(139,92,246,0.3)]"
          />
        </div>

        {/* Spin trigger button */}
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`mt-8 px-10 py-4 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wider shadow-xl transition-all flex items-center gap-3 cursor-pointer ${
            isSpinning
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed scale-95'
              : 'bg-gradient-to-r from-[#8b5cf6] via-[#f43f5e] to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-purple-900/40 hover:scale-105 active:scale-95'
          }`}
        >
          <Disc className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'SPINNING OF FATE...' : 'SPIN THE WHEEL 🎰'}</span>
        </button>

        {/* Probability legend */}
        <div className="mt-8 pt-6 border-t border-gray-800/80 w-full flex flex-wrap justify-center gap-4 text-xs font-semibold text-gray-400">
          {WHEEL_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-gray-300">{item.label}</span>
              <span className="text-gray-500 font-mono">({item.weight}%)</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
