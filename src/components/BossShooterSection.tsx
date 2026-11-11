import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import {
  Crosshair,
  ShieldAlert,
  Flame,
  RotateCcw,
  Sparkles,
  Volume2,
  Trophy,
  Zap,
  Play,
  Skull,
  ExternalLink,
  Gamepad2,
  Maximize2,
  Minimize2,
  X,
  ArrowLeft,
} from 'lucide-react';

interface Projectile {
  id: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  size: number; // visual scale as it approaches screen
  vx: number;
  vy: number;
  speed: number;
  health: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  isCrit?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

interface PlayerBullet {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  rotation: number;
  progress: number;
}

const MAX_BOSS_HP = 3500;
const MAX_PLAYER_HP = 100;
const CLIP_SIZE = 12;

interface BossShooterSectionProps {
  isStandaloneMode?: boolean;
}

export const BossShooterSection: React.FC<BossShooterSectionProps> = ({ isStandaloneMode = false }) => {
  // Game active toggle (on first tab, show thumbnail by default)
  const [isGameActive, setIsGameActive] = useState(isStandaloneMode);
  const [isFullscreenOverlay, setIsFullscreenOverlay] = useState(false);

  // Game state
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'VICTORY' | 'GAME_OVER'>(
    isStandaloneMode ? 'PLAYING' : 'IDLE'
  );
  const [bossHp, setBossHp] = useState(MAX_BOSS_HP);
  const [playerHp, setPlayerHp] = useState(MAX_PLAYER_HP);
  const [ammo, setAmmo] = useState(CLIP_SIZE);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadProgress, setReloadProgress] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [superCharge, setSuperCharge] = useState(0); // 0 to 100
  const [bossPhase, setBossPhase] = useState<1 | 2 | 3>(1);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isPlayerHurtFlash, setIsPlayerHurtFlash] = useState(false);
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);

  // Custom audio override links provided by user
  const [customAudio, setCustomAudio] = useState({
    shoot: '',
    crit: '',
    bossHurt: '/assets/aistudio/damage_a0c559b9.mp3',
    playerHurt: '/assets/aistudio/user_damage_682f3b48.mp3',
    defeat: '/assets/aistudio/boss_win_4ae7645d.mp3',
    reload: '',
    victory: '/assets/aistudio/user_win_a7817b17.mp3',
  });

  // Crosshair & gun position
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [gunRecoil, setGunRecoil] = useState(false);
  const [muzzleFlash, setMuzzleFlash] = useState(false);

  // Floating texts & particles
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Player banana bullets
  const playerBulletsRef = useRef<PlayerBullet[]>([]);
  const [playerBullets, setPlayerBullets] = useState<PlayerBullet[]>([]);

  // Boss position (percent)
  const bossPosRef = useRef({ x: 50, y: 35 });
  const [bossDisplayPos, setBossDisplayPos] = useState({ x: 50, y: 35 });
  const bossVelocityRef = useRef({ vx: 0.35, vy: 0.2 });
  const bossHitFlashRef = useRef(false);
  const [bossHitFlash, setBossHitFlash] = useState(false);

  // Core exposure state (for Phase 2 & 3 critical strikes)
  const [isCoreExposed, setIsCoreExposed] = useState(true);

  // Active boss projectiles (moving towards player camera)
  const projectilesRef = useRef<Projectile[]>([]);
  const [activeProjectiles, setActiveProjectiles] = useState<Projectile[]>([]);

  const arenaRef = useRef<HTMLDivElement>(null);
  const lastShootTimeRef = useRef(0);
  const lastBossAttackTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  // Sound dispatcher supporting user custom audio files with instant Web Audio synthesis fallback
  const playSfx = useCallback((type: 'shoot' | 'crit' | 'hit' | 'bossHurt' | 'bossRoar' | 'playerHurt' | 'reload' | 'empty' | 'explode' | 'victory' | 'defeat') => {
    if (sound.getMuted()) return;

    // Check if custom audio URL is provided
    const customUrl = (customAudio as Record<string, string>)[type];
    if (customUrl && typeof Audio !== 'undefined') {
      if (type === 'bossHurt' && customUrl === '/assets/aistudio/damage_a0c559b9.mp3') {
        sound.playBossHurt();
        return;
      }
      if (type === 'playerHurt' && customUrl === '/assets/aistudio/user_damage_682f3b48.mp3') {
        sound.playPlayerHurt();
        return;
      }
      if (type === 'defeat' && customUrl === '/assets/aistudio/boss_win_4ae7645d.mp3') {
        sound.playDefeat();
        return;
      }
      if (type === 'victory' && customUrl === '/assets/aistudio/user_win_a7817b17.mp3') {
        sound.playVictory();
        return;
      }
      try {
        const audioObj = new Audio(customUrl);
        audioObj.volume = 0.85;
        audioObj.play().catch(() => {});
        return;
      } catch {
        // Fallback to internal synth
      }
    }

    // Default synthesized sound effects
    switch (type) {
      case 'shoot':
        sound.playGunshot();
        break;
      case 'crit':
        sound.playCritHit();
        break;
      case 'hit':
        sound.playHitMarker();
        break;
      case 'bossHurt':
        sound.playBossHurt();
        break;
      case 'bossRoar':
        sound.playBossRoar();
        break;
      case 'playerHurt':
        sound.playPlayerHurt();
        break;
      case 'reload':
        sound.playReload();
        break;
      case 'empty':
        sound.playEmptyClip();
        break;
      case 'explode':
        sound.playExplosion();
        break;
      case 'victory':
        sound.playVictory();
        break;
      case 'defeat':
        sound.playDefeat();
        break;
    }
  }, [customAudio]);

  // Start game handler
  const startGame = () => {
    sound.stopDefeat();
    sound.stopVictory();
    setBossHp(MAX_BOSS_HP);
    setPlayerHp(MAX_PLAYER_HP);
    setAmmo(CLIP_SIZE);
    setIsReloading(false);
    setReloadProgress(0);
    setScore(0);
    setCombo(0);
    setSuperCharge(0);
    setBossPhase(1);
    projectilesRef.current = [];
    setActiveProjectiles([]);
    playerBulletsRef.current = [];
    setPlayerBullets([]);
    setFloatingTexts([]);
    setParticles([]);
    bossPosRef.current = { x: 50, y: 35 };
    setGameState('PLAYING');
    playSfx('bossRoar');
  };

  useEffect(() => {
    if (isStandaloneMode) {
      startGame();
    }
  }, [isStandaloneMode]);

  // Reload action
  const handleReload = useCallback(() => {
    if (isReloading || ammo === CLIP_SIZE) return;
    setIsReloading(true);
    playSfx('reload');

    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setReloadProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        setAmmo(CLIP_SIZE);
        setIsReloading(false);
        setReloadProgress(0);
      }
    }, 110);
  }, [isReloading, ammo, playSfx]);

  // Keyboard shortcut listener for reload [R] or Super [Space]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleReload();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleReload]);

  // Mouse movement tracking within arena
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const spawnFloatingText = (text: string, x: number, y: number, color: string, isCrit = false) => {
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      color,
      isCrit,
    };
    setFloatingTexts((prev) => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== newText.id));
    }, 700);
  };

  const spawnImpactParticles = (x: number, y: number, color: string, count = 8) => {
    const newParticles: Particle[] = Array.from({ length: count }).map(() => ({
      id: Date.now() + Math.random(),
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      color,
      life: 1,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Primary shoot handler
  const handleShoot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING') return;

    const now = performance.now();
    if (now - lastShootTimeRef.current < 120) return; // rate of fire cap
    lastShootTimeRef.current = now;

    if (isReloading) {
      playSfx('empty');
      return;
    }

    if (ammo <= 0) {
      playSfx('empty');
      handleReload();
      return;
    }

    // Fire weapon
    setAmmo((a) => a - 1);
    setGunRecoil(true);
    setMuzzleFlash(true);
    playSfx('shoot');
    setTimeout(() => setGunRecoil(false), 80);
    setTimeout(() => setMuzzleFlash(false), 50);

    if (!arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Spawn flying banana bullet
    const newBullet: PlayerBullet = {
      id: Date.now() + Math.random(),
      startX: 50,
      startY: 90,
      targetX: clickX,
      targetY: clickY,
      currentX: 50,
      currentY: 90,
      rotation: Math.random() * 360,
      progress: 0,
    };
    playerBulletsRef.current.push(newBullet);

    // 1. Check if shot destroyed an incoming projectile
    let hitProjectileIndex = -1;
    for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
      const p = projectilesRef.current[i];
      const dist = Math.hypot(p.x - clickX, p.y - clickY);
      if (dist < 6 * p.size) {
        hitProjectileIndex = i;
        break;
      }
    }

    if (hitProjectileIndex >= 0) {
      const p = projectilesRef.current[hitProjectileIndex];
      projectilesRef.current.splice(hitProjectileIndex, 1);
      setActiveProjectiles([...projectilesRef.current]);
      playSfx('explode');
      spawnImpactParticles(p.x, p.y, '#f59e0b', 12);
      spawnFloatingText('DEFLECTED! +100', p.x, p.y, '#f59e0b');
      setScore((s) => s + 100);
      setSuperCharge((sc) => Math.min(100, sc + 8));
      return;
    }

    // 2. Check boss hit detection
    const bossX = bossPosRef.current.x;
    const bossY = bossPosRef.current.y;
    const distToBoss = Math.hypot(bossX - clickX, bossY - clickY);

    // Critical Core Hit (the booty target zone at x: bossX - 2.5, y: bossY + 4)
    const coreX = bossX - 2.5;
    const coreY = bossY + 4;
    const distToCore = Math.hypot(coreX - clickX, coreY - clickY);
    if (distToCore < 7.5) {
      // Critical hit!
      const critDamage = Math.floor(190 + Math.random() * 80);
      setBossHp((hp) => {
        const next = Math.max(0, hp - critDamage);
        if (next === 0) triggerVictory();
        return next;
      });
      playSfx('crit');
      playSfx('bossHurt');
      spawnImpactParticles(clickX, clickY, '#f43f5e', 16);
      spawnFloatingText(`🍑 BOOTY CRIT! -${critDamage}`, clickX, clickY, '#f43f5e', true);
      setScore((s) => s + critDamage * 2);
      setCombo((c) => c + 1);
      setSuperCharge((sc) => Math.min(100, sc + 15));

      bossHitFlashRef.current = true;
      setBossHitFlash(true);
      setTimeout(() => setBossHitFlash(false), 90);
      return;
    }

    // Standard Body Hit
    if (distToBoss < 18) {
      // Phase 2 shield check
      if (bossPhase === 2 && !isCoreExposed && distToBoss > 8) {
        playSfx('hit');
        playSfx('bossHurt');
        spawnFloatingText('SHIELDED! -20', clickX, clickY, '#94a3b8');
        setBossHp((hp) => Math.max(0, hp - 20));
        return;
      }

      const damage = Math.floor(65 + Math.random() * 35);
      setBossHp((hp) => {
        const next = Math.max(0, hp - damage);
        if (next === 0) triggerVictory();
        return next;
      });
      playSfx('hit');
      playSfx('bossHurt');
      spawnImpactParticles(clickX, clickY, '#ef4444', 8);
      spawnFloatingText(`-${damage}`, clickX, clickY, '#ffffff');
      setScore((s) => s + damage);
      setCombo((c) => c + 1);
      setSuperCharge((sc) => Math.min(100, sc + 6));

      bossHitFlashRef.current = true;
      setBossHitFlash(true);
      setTimeout(() => setBossHitFlash(false), 70);
      return;
    }

    // Missed shot resets combo
    setCombo(0);
  };

  // Super Laser Beam Blast (charges to 100%)
  const handleSuperBlast = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (superCharge < 100 || gameState !== 'PLAYING') return;

    setSuperCharge(0);
    playSfx('explode');
    playSfx('crit');
    playSfx('bossHurt');
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 500);

    // Destroy all incoming projectiles
    projectilesRef.current = [];
    setActiveProjectiles([]);

    // Deal massive 650 damage to boss
    const superDamage = 650;
    setBossHp((hp) => {
      const next = Math.max(0, hp - superDamage);
      if (next === 0) triggerVictory();
      return next;
    });

    spawnImpactParticles(bossPosRef.current.x, bossPosRef.current.y, '#8b5cf6', 24);
    spawnFloatingText(`OVERDRIVE BLAST! -${superDamage}`, bossPosRef.current.x, bossPosRef.current.y - 10, '#c084fc', true);
    setScore((s) => s + 1500);
  };

  const triggerVictory = () => {
    setGameState('VICTORY');
    playSfx('victory');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
    });
  };

  const triggerDefeat = () => {
    setGameState('GAME_OVER');
    playSfx('defeat');
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // 1. Move Boss smoothly across arena
      const boss = bossPosRef.current;
      const vel = bossVelocityRef.current;

      boss.x += vel.vx * (bossPhase === 3 ? 1.8 : bossPhase === 2 ? 1.4 : 1.0);
      boss.y += vel.vy * (bossPhase === 3 ? 1.5 : 1.0);

      // Bounce boss within bounds
      if (boss.x < 22) {
        boss.x = 22;
        vel.vx = Math.abs(vel.vx);
      } else if (boss.x > 78) {
        boss.x = 78;
        vel.vx = -Math.abs(vel.vx);
      }

      if (boss.y < 18) {
        boss.y = 18;
        vel.vy = Math.abs(vel.vy);
      } else if (boss.y > 48) {
        boss.y = 48;
        vel.vy = -Math.abs(vel.vy);
      }

      setBossDisplayPos({ x: boss.x, y: boss.y });

      // Core exposure rhythm
      if (Math.floor(currentTime / 1800) % 2 === 0) {
        setIsCoreExposed(true);
      } else {
        setIsCoreExposed(bossPhase === 1);
      }

      // 2. Boss Attack AI (fires projectiles towards screen)
      const attackCooldown = bossPhase === 3 ? 1100 : bossPhase === 2 ? 1600 : 2200;
      if (currentTime - lastBossAttackTimeRef.current > attackCooldown) {
        lastBossAttackTimeRef.current = currentTime;

        // Spawn 1 to 3 dark orbs
        const count = bossPhase === 3 ? 3 : bossPhase === 2 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const spreadAngle = (i - (count - 1) / 2) * 14;
          const newProj: Projectile = {
            id: Date.now() + Math.random() + i,
            x: boss.x + spreadAngle,
            y: boss.y + 6,
            size: 0.3, // starts small far away
            vx: (Math.random() - 0.5) * 4,
            vy: 8 + Math.random() * 4,
            speed: bossPhase === 3 ? 1.6 : 1.2,
            health: 1,
          };
          projectilesRef.current.push(newProj);
        }
      }

      // 3. Update incoming projectiles (grow as they approach the player)
      const remaining: Projectile[] = [];
      let playerHit = false;

      for (let i = 0; i < projectilesRef.current.length; i++) {
        const p = projectilesRef.current[i];
        p.size += dt * 0.9 * p.speed; // grows as it gets closer
        p.y += dt * 14 * p.speed;
        p.x += dt * p.vx;

        // If projectile reaches camera / bottom
        if (p.size >= 1.9 || p.y >= 92) {
          // Hits player!
          playerHit = true;
          spawnImpactParticles(p.x, 90, '#f43f5e', 10);
        } else {
          remaining.push(p);
        }
      }

      projectilesRef.current = remaining;
      setActiveProjectiles([...remaining]);

      // 4. Update player banana bullets
      const activeBullets: PlayerBullet[] = [];
      for (let i = 0; i < playerBulletsRef.current.length; i++) {
        const b = playerBulletsRef.current[i];
        b.progress += dt * 5.2; // flies to target in ~0.2s
        b.rotation += dt * 850; // spinning banana
        b.currentX = b.startX + (b.targetX - b.startX) * b.progress;
        b.currentY = b.startY + (b.targetY - b.startY) * b.progress;

        if (b.progress < 1) {
          activeBullets.push(b);
        }
      }
      playerBulletsRef.current = activeBullets;
      setPlayerBullets([...activeBullets]);

      if (playerHit) {
        playSfx('playerHurt');
        setIsScreenShaking(true);
        setIsPlayerHurtFlash(true);
        setTimeout(() => setIsScreenShaking(false), 250);
        setTimeout(() => setIsPlayerHurtFlash(false), 200);

        setPlayerHp((prev) => {
          const next = Math.max(0, prev - 18);
          if (next <= 0) {
            triggerDefeat();
          }
          return next;
        });
      }

      // 4. Update phase transitions
      if (bossHp < MAX_BOSS_HP * 0.3) {
        if (bossPhase !== 3) {
          setBossPhase(3);
          playSfx('bossRoar');
        }
      } else if (bossHp < MAX_BOSS_HP * 0.66) {
        if (bossPhase !== 2) {
          setBossPhase(2);
          playSfx('bossRoar');
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, bossHp, bossPhase, playSfx]);

  const bossHealthPercent = Math.max(0, (bossHp / MAX_BOSS_HP) * 100);
  const playerHealthPercent = Math.max(0, (playerHp / MAX_PLAYER_HP) * 100);

  return (
    <section id="slapzone" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto select-none">
      {/* Section Header */}
      <div className="text-center mb-8">
        <span className="px-4 py-1.5 rounded-full bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-black uppercase tracking-widest inline-block animate-pulse">
          NIGHTMARE DIFFICULTY • FIRST-PERSON BOSS SHOOTER
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-3 bg-gradient-to-r from-red-500 via-rose-400 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(244,63,94,0.45)]">
          BEAT THE ACHI RANDI CHALLENGE, THE FALLEN MEER 🥰☠️☠️
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Aim and shoot with your crosshair. Destroy incoming void orbs or suffer lethal damage!
        </p>
      </div>

      {/* Main Shooter Game Card (Replaces #slapMainCard) */}
      <div
        id="slapMainCard"
        className={`glass-card rounded-3xl p-4 sm:p-6 relative overflow-hidden border-2 border-red-600/50 shadow-2xl shadow-red-950/50 ${
          isScreenShaking ? 'screen-shake' : ''
        }`}
      >
        {/* Top HUD: Boss Health Meter & Combat Stats */}
        <div className="bg-gray-950/90 rounded-2xl p-4 border border-gray-800 space-y-3 mb-4">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <span className="text-xs sm:text-sm font-black text-white tracking-wide block">
                  THE FALLEN MEER • ACHI RANDI CHALLENGE ☠️
                </span>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                  Phase {bossPhase} of 3 • {bossPhase === 3 ? '🍑 CLAP OF DOOM' : bossPhase === 2 ? 'SHIELDED DUMPY' : 'THICC BARRAGE'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Score</span>
                <span className="text-lg font-black text-amber-400 tabular-nums">{score.toLocaleString()}</span>
              </div>
              {combo > 1 && (
                <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-2.5 py-1 rounded-xl text-xs font-black animate-bounce">
                  {combo}x COMBO
                </div>
              )}
              <button
                onClick={() => setAudioSettingsOpen(!audioSettingsOpen)}
                title="Custom Sound Effects Settings"
                className="p-2 rounded-xl glass-card border border-gray-700 text-gray-300 hover:text-white hover:border-red-500 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Boss HP Bar */}
          <div className="relative w-full h-4 sm:h-5 bg-gray-900 rounded-full overflow-hidden border border-red-900/50 shadow-inner">
            <div
              style={{ width: `${bossHealthPercent}%` }}
              className={`h-full transition-all duration-150 ease-out ${
                bossPhase === 3
                  ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                  : bossPhase === 2
                  ? 'bg-gradient-to-r from-purple-600 to-red-600'
                  : 'bg-gradient-to-r from-red-600 to-rose-600'
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-mono font-black text-white drop-shadow">
              {bossHp} / {MAX_BOSS_HP} HP ({Math.round(bossHealthPercent)}%)
            </div>
          </div>
        </div>

        {/* First-Person 3D-Look Shooting Arena Viewport */}
        <div
          ref={arenaRef}
          onMouseMove={handleMouseMove}
          onClick={handleShoot}
          className="relative w-full h-[400px] sm:h-[480px] bg-gradient-to-b from-gray-950 via-[#130b14] to-[#1e0d16] rounded-2xl border-2 border-red-900/60 overflow-hidden cursor-crosshair select-none"
        >
          {/* Hurt red vignette flash overlay */}
          {isPlayerHurtFlash && (
            <div className="absolute inset-0 bg-red-600/35 pointer-events-none z-40 transition-opacity animate-pulse" />
          )}

          {/* Background arena grid & ambient void fog */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          {/* Idle Start Overlay */}
          {gameState === 'IDLE' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center text-3xl border border-red-500/40">
                💀
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">ARE YOU READY FOR THE RAID?</h3>
              <p className="text-sm text-gray-300 max-w-md leading-relaxed">
                Aim with your mouse/finger. Shoot the glowing <strong className="text-red-400">Core</strong> for Critical Damage.
                Shoot incoming void orbs before they crash into your screen!
              </p>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={startGame}
                  className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-red-950/60 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" /> Start Battle
                </button>
              </div>
            </div>
          )}

          {/* Victory Overlay */}
          {gameState === 'VICTORY' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <Trophy className="w-16 h-16 text-amber-400 animate-bounce" />
              <h3 className="text-3xl sm:text-4xl font-black text-white">BOSS DEFEATED! 👑</h3>
              <p className="text-sm text-amber-300 font-bold">
                You slayed the Shadow Overlord! Final Score: {score.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-600/70 text-xs text-amber-300 font-bold shadow-inner">
                <span>🗣️ "JEET GAYE! 🔥" Victory Celebration! 👑</span>
              </div>
              <button
                onClick={startGame}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Play Again
              </button>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <Skull className="w-16 h-16 text-red-500 animate-pulse" />
              <h3 className="text-3xl sm:text-4xl font-black text-red-500">YOU DIED ☠️</h3>
              <p className="text-sm text-gray-400 max-w-sm">
                The Shadow Overlord's void barrage wiped your shields. Better reflexes next time!
              </p>
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/70 border border-red-800 text-xs text-red-300 font-bold shadow-inner">
                <span>🗣️ "Wah apni boondi ka badla liya maine!" 😈</span>
              </div>
              <button
                onClick={startGame}
                className="px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Retry Battle
              </button>
            </div>
          )}

          {/* Floating Damage & Event Texts */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
              className={`absolute -translate-x-1/2 pointer-events-none font-black text-sm sm:text-lg animate-floatUp z-30 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
                ft.isCrit ? 'text-red-400 scale-125' : 'text-white'
              }`}
            >
              {ft.text}
            </div>
          ))}

          {/* Particle Effects */}
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                backgroundColor: p.color,
              }}
              className="absolute w-2 h-2 rounded-full pointer-events-none z-20 animate-ping opacity-75"
            />
          ))}

          {/* BOSS SPRITE (Scales and animates in 2D perspective) */}
          <div
            style={{
              left: `${bossDisplayPos.x}%`,
              top: `${bossDisplayPos.y}%`,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 pointer-events-none ${
              bossHitFlash ? 'brightness-150 scale-95' : ''
            }`}
          >
            {/* Phase 2 Shield Ring */}
            {bossPhase === 2 && !isCoreExposed && (
              <div className="absolute -inset-8 rounded-full border-4 border-cyan-400/60 border-dashed animate-spin pointer-events-none shadow-[0_0_25px_rgba(6,182,212,0.6)]" />
            )}

            {/* Phase 3 Doom Aura */}
            {bossPhase === 3 && (
              <div className="absolute -inset-10 rounded-full bg-red-600/20 blur-xl animate-pulse pointer-events-none" />
            )}

            {/* Boss Outer Crown & Character Sprite */}
            <div className="relative flex flex-col items-center">
              <div className="text-3xl sm:text-4xl -mb-2 z-20 animate-bounce">👑</div>

              {/* Boss Character Image */}
              <div className="relative w-44 sm:w-56 h-52 sm:h-64 flex items-center justify-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]">
                <img
                  src="/assets/aistudio/Screenshot_20261111-151924-removebg-preview_b91d8d03.png"
                  alt="Ass Boss"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] select-none pointer-events-none"
                  draggable={false}
                />

                {/* CRITICAL CORE / WEAK SPOT (Target this for high crit damage) */}
                <div
                  style={{ top: '65%', left: '42%' }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCoreExposed
                      ? 'bg-gradient-to-tr from-yellow-400 via-rose-500 to-red-600 shadow-[0_0_24px_#ef4444] scale-110 animate-pulse border-2 border-white'
                      : 'bg-black/60 border border-gray-600 opacity-60'
                  }`}
                >
                  <span className="text-sm">🎯</span>
                </div>

                <div
                  style={{ top: '88%', left: '42%' }}
                  className="absolute -translate-x-1/2 pointer-events-none"
                >
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider shadow whitespace-nowrap ${
                      isCoreExposed
                        ? 'bg-red-600 text-white animate-bounce ring-2 ring-red-400'
                        : 'bg-gray-900/90 text-gray-400 border border-gray-700'
                    }`}
                  >
                    {isCoreExposed ? '🍑 CRIT ZONE!' : 'ARMORED'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INCOMING BOSS PROJECTILES (grow as they travel towards camera) */}
          {activeProjectiles.map((p) => (
            <div
              key={p.id}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translate(-50%, -50%) scale(${p.size})`,
              }}
              className="absolute pointer-events-none z-20"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 via-rose-600 to-red-700 shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-spin border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
          ))}

          {/* FLYING BANANA BULLETS (Fired by player towards crosshair) */}
          {playerBullets.map((b) => (
            <div
              key={b.id}
              style={{
                left: `${b.currentX}%`,
                top: `${b.currentY}%`,
                transform: `translate(-50%, -50%) rotate(${b.rotation}deg) scale(${0.7 + (1 - b.progress) * 0.5})`,
              }}
              className="absolute pointer-events-none z-25 drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]"
            >
              <img
                src="/assets/aistudio/17d351ccb62494b2238b18c58c112cea-removebg-preview_4d541499.png"
                alt="Banana Bullet"
                className="w-8 h-8 object-contain"
              />
            </div>
          ))}

          {/* FIRST-PERSON CROSSHAIR (Follows mouse cursor) */}
          <div
            style={{
              left: `${mousePos.x}%`,
              top: `${mousePos.y}%`,
            }}
            className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Crosshair className="w-8 h-8 text-red-400 drop-shadow-[0_0_8px_#ef4444]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          {/* FIRST-PERSON WEAPON / BANANA GUN (Rendered with aim lean and firing recoil) */}
          <div
            style={{
              transform: `translate(${gunRecoil ? '0px, 20px' : '0px, 0px'}) rotate(${((mousePos.x - 50) * 0.18) + (gunRecoil ? -8 : 0)}deg)`,
            }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center transition-transform duration-75 origin-bottom"
          >
            {/* Muzzle Flash at banana tip */}
            {muzzleFlash && (
              <div className="w-24 h-24 -mb-12 rounded-full bg-gradient-to-t from-yellow-300 via-amber-500 to-transparent blur-sm animate-ping z-30 pointer-events-none" />
            )}

            {/* Banana Gun Image Sprite */}
            <div className="relative w-44 sm:w-56 h-44 sm:h-56 flex items-center justify-center drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] select-none">
              <img
                src="/assets/aistudio/17d351ccb62494b2238b18c58c112cea-removebg-preview_4d541499.png"
                alt="Banana Gun"
                className="w-full h-full object-contain transform -rotate-6 select-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom HUD: Player Health, Ammo Counter & Weapon Controls */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-gray-950/80 p-4 rounded-2xl border border-gray-800">
          {/* Player HP */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold mb-1">
              <span className="text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                Player Shield
              </span>
              <span className="text-white font-mono">{playerHp} / {MAX_PLAYER_HP} HP</span>
            </div>
            <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div
                style={{ width: `${playerHealthPercent}%` }}
                className={`h-full transition-all duration-200 ${
                  playerHp < 30 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
              />
            </div>
          </div>

          {/* Ammo & Reload Button */}
          <div className="flex items-center justify-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                <img
                  src="/assets/aistudio/17d351ccb62494b2238b18c58c112cea-removebg-preview_4d541499.png"
                  alt="Banana bullet"
                  className="w-3.5 h-3.5 object-contain"
                />
                <span>Banana Bullets</span>
              </div>

              {/* Visual magazine of banana bullets */}
              <div className="flex items-center justify-center gap-0.5 my-1 max-w-[190px] flex-wrap">
                {Array.from({ length: CLIP_SIZE }).map((_, i) => (
                  <img
                    key={i}
                    src="/assets/aistudio/17d351ccb62494b2238b18c58c112cea-removebg-preview_4d541499.png"
                    alt="Bullet"
                    className={`w-3.5 h-4.5 object-contain transition-all duration-150 ${
                      i < ammo
                        ? 'opacity-100 scale-100 drop-shadow-[0_0_4px_rgba(250,204,21,0.85)]'
                        : 'opacity-20 grayscale scale-75'
                    }`}
                  />
                ))}
              </div>

              <div className="text-xl font-black text-amber-400 font-mono text-center">
                {ammo} <span className="text-xs text-gray-500">/ {CLIP_SIZE}</span>
              </div>
            </div>

            <button
              onClick={handleReload}
              disabled={isReloading || ammo === CLIP_SIZE}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isReloading
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-600'
                  : ammo === 0
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'glass-card border-gray-700 text-gray-300 hover:text-white hover:border-red-500'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
              <span>{isReloading ? `Reloading (${reloadProgress}%)` : 'Reload [R]'}</span>
            </button>
          </div>

          {/* Overcharge Super Cannon */}
          <div className="flex justify-end">
            <button
              onClick={handleSuperBlast}
              disabled={superCharge < 100 || gameState !== 'PLAYING'}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                superCharge >= 100
                  ? 'bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-purple-900/50 hover:scale-105 active:scale-95 animate-pulse'
                  : 'bg-gray-900 text-gray-500 border border-gray-800 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {superCharge >= 100 ? 'FIRE OVERDRIVE! [100%]' : `SUPER BEAM (${Math.floor(superCharge)}%)`}
              </span>
            </button>
          </div>
        </div>

        {/* CUSTOM SOUND EFFECTS OVERRIDE DRAWER (for user's custom audio files) */}
        {audioSettingsOpen && (
          <div className="mt-4 p-4 rounded-2xl bg-gray-900/95 border border-red-900/60 space-y-3 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-800 pb-2">
              <span className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-red-400" />
                Custom Sound Effects Configuration
              </span>
              <button
                onClick={() => setAudioSettingsOpen(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <p className="text-[11px] text-gray-400">
              High-definition Web Audio synthesizer sound effects are active by default. You can also paste your own custom audio URLs or MP3 files below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Gunshot Firing Sound URL</label>
                <input
                  type="text"
                  placeholder="https://.../gunshot.mp3"
                  value={customAudio.shoot}
                  onChange={(e) => setCustomAudio({ ...customAudio, shoot: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Critical Core Hit Sound URL</label>
                <input
                  type="text"
                  placeholder="https://.../crit.mp3"
                  value={customAudio.crit}
                  onChange={(e) => setCustomAudio({ ...customAudio, crit: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Boss Damage Voice SFX URL</label>
                <input
                  type="text"
                  placeholder="/assets/aistudio/damage_a0c559b9.mp3"
                  value={customAudio.bossHurt}
                  onChange={(e) => setCustomAudio({ ...customAudio, bossHurt: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Player Damage Voice SFX URL</label>
                <input
                  type="text"
                  placeholder="/assets/aistudio/user_damage_682f3b48.mp3"
                  value={customAudio.playerHurt}
                  onChange={(e) => setCustomAudio({ ...customAudio, playerHurt: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Player Defeat / Boss Win SFX URL</label>
                <input
                  type="text"
                  placeholder="/assets/aistudio/boss_win_4ae7645d.mp3"
                  value={customAudio.defeat}
                  onChange={(e) => setCustomAudio({ ...customAudio, defeat: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Player Victory / Boss Defeated SFX URL</label>
                <input
                  type="text"
                  placeholder="/assets/aistudio/user_win_a7817b17.mp3"
                  value={customAudio.victory}
                  onChange={(e) => setCustomAudio({ ...customAudio, victory: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-bold block mb-1">Reload Slide Sound URL</label>
                <input
                  type="text"
                  placeholder="https://.../reload.mp3"
                  value={customAudio.reload}
                  onChange={(e) => setCustomAudio({ ...customAudio, reload: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => playSfx('shoot')}
                className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-white"
              >
                Test Gunshot
              </button>
              <button
                onClick={() => playSfx('crit')}
                className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-white"
              >
                Test Crit
              </button>
              <button
                onClick={() => playSfx('bossHurt')}
                className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-white"
              >
                Test Boss Hurt
              </button>
              <button
                onClick={() => playSfx('playerHurt')}
                className="px-3 py-1 rounded bg-rose-900/60 hover:bg-rose-800 border border-rose-700 text-xs text-rose-200"
              >
                Test Player Hurt 🗣️
              </button>
              <button
                onClick={() => playSfx('defeat')}
                className="px-3 py-1 rounded bg-red-950 hover:bg-red-900 border border-red-700 text-xs text-red-300 font-bold"
              >
                Test Defeat Voice 💀
              </button>
              <button
                onClick={() => playSfx('victory')}
                className="px-3 py-1 rounded bg-amber-950 hover:bg-amber-900 border border-amber-600 text-xs text-amber-300 font-bold"
              >
                Test Victory Voice 🏆
              </button>
              <button
                onClick={() => playSfx('explode')}
                className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-xs text-white"
              >
                Test Explosion
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
