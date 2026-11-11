// Web Audio API pure synthesized sound effects (zero external audio file dependencies)

type MuteListener = (isMuted: boolean) => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private listeners: Set<MuteListener> = new Set();
  private bossHurtAudio: HTMLAudioElement | null = null;
  private lastBossHurtTime: number = 0;
  private playerHurtAudio: HTMLAudioElement | null = null;
  private lastPlayerHurtTime: number = 0;
  private defeatAudio: HTMLAudioElement | null = null;
  private victoryAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('empire_sfx_muted');
        if (stored !== null) {
          this.isMuted = stored === 'true';
        }
      } catch {
        // Fallback if localStorage is inaccessible
      }
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.isMuted));
  }

  public subscribe(listener: MuteListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      if (this.bossHurtAudio) {
        try {
          this.bossHurtAudio.pause();
          this.bossHurtAudio.currentTime = 0;
        } catch {
          // Ignore
        }
      }
      if (this.playerHurtAudio) {
        try {
          this.playerHurtAudio.pause();
          this.playerHurtAudio.currentTime = 0;
        } catch {
          // Ignore
        }
      }
      if (this.defeatAudio) {
        try {
          this.defeatAudio.pause();
          this.defeatAudio.currentTime = 0;
        } catch {
          // Ignore
        }
      }
      if (this.victoryAudio) {
        try {
          this.victoryAudio.pause();
          this.victoryAudio.currentTime = 0;
        } catch {
          // Ignore
        }
      }
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('empire_sfx_muted', String(muted));
      } catch {
        // Ignore
      }
    }
    this.notify();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Slap sound effect with impact noise burst + punchy low transient
  public playSlap(pitchMultiplier: number = 1.0) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. White noise burst for initial flesh impact
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1100 * pitchMultiplier, now);
      bandpass.Q.setValueAtTime(1.8, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.08);

      // 2. Punchy body thud (sine decay)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      oscGain.gain.setValueAtTime(0.7, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Gentle pat sound
  public playPat() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Wheel tick sound
  public playTick() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Dodge / Teleport comical whoosh
  public playTeleport() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.09);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Victory fanfare for wheel or boss victory
  public playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Player victory / boss defeat sound effect (from uploaded user_win asset)
  public playVictory(volume: number = 0.95) {
    if (this.isMuted) return;

    if (typeof Audio !== 'undefined') {
      try {
        if (!this.victoryAudio) {
          this.victoryAudio = new Audio('/assets/aistudio/user_win_a7817b17.mp3');
        }
        this.victoryAudio.currentTime = 0;
        this.victoryAudio.volume = Math.max(0, Math.min(1, volume));
        const playPromise = this.victoryAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.playFanfare();
          });
        }
        return;
      } catch {
        // Fall through to fanfare synth
      }
    }

    this.playFanfare();
  }

  // Stop victory voice playback (e.g. when restarting battle)
  public stopVictory() {
    if (this.victoryAudio) {
      try {
        this.victoryAudio.pause();
        this.victoryAudio.currentTime = 0;
      } catch {
        // Ignore
      }
    }
  }

  /* -------------------------------------------------------------
     FIRST-PERSON SHOOTER & BOSS BATTLE SOUND EFFECTS
  ------------------------------------------------------------- */

  // Punchy gunshot firing blast
  public playGunshot() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Transient noise crack
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, now);
      filter.Q.setValueAtTime(1.5, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.9, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.12);

      // 2. Heavy sub barrel recoil thud
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

      oscGain.gain.setValueAtTime(0.85, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio playGunshot failed', e);
    }
  }

  // High-pitch critical headshot / core hit chime
  public playCritHit() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + 0.08);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {
      console.warn('Audio playCritHit failed', e);
    }
  }

  // Hit marker indicator sound
  public playHitMarker() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(950, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio playHitMarker failed', e);
    }
  }

  // Boss hurt voice reaction (from uploaded asset) with synthesized fallback
  public playBossHurt(volume: number = 0.95) {
    if (this.isMuted) return;

    const now = Date.now();
    // Allow rapid hits with a comfortable debounce (120ms gap) to retrigger punchily
    if (now - this.lastBossHurtTime > 120) {
      this.lastBossHurtTime = now;
      if (typeof Audio !== 'undefined') {
        try {
          if (!this.bossHurtAudio) {
            this.bossHurtAudio = new Audio('/assets/aistudio/damage_a0c559b9.mp3');
          }
          this.bossHurtAudio.currentTime = 0;
          this.bossHurtAudio.volume = Math.max(0, Math.min(1, volume));
          const playPromise = this.bossHurtAudio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              this.playSynthesizedBossHurt();
            });
          }
          return;
        } catch {
          // Fall through to synthesizer
        }
      }
    }

    this.playSynthesizedBossHurt();
  }

  // Synthesized fallback for boss damage grunt
  public playSynthesizedBossHurt() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio playSynthesizedBossHurt failed', e);
    }
  }

  // Boss roar / phase change alarm
  public playBossRoar() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio playBossRoar failed', e);
    }
  }

  // Player hurt voice reaction (from uploaded asset) with synthesized fallback
  public playPlayerHurt(volume: number = 0.95) {
    if (this.isMuted) return;

    const now = Date.now();
    // Allow rapid hits with a comfortable debounce (150ms gap) to retrigger punchily
    if (now - this.lastPlayerHurtTime > 150) {
      this.lastPlayerHurtTime = now;
      if (typeof Audio !== 'undefined') {
        try {
          if (!this.playerHurtAudio) {
            this.playerHurtAudio = new Audio('/assets/aistudio/user_damage_682f3b48.mp3');
          }
          this.playerHurtAudio.currentTime = 0;
          this.playerHurtAudio.volume = Math.max(0, Math.min(1, volume));
          const playPromise = this.playerHurtAudio.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              this.playSynthesizedPlayerHurt();
            });
          }
          return;
        } catch {
          // Fall through to synthesizer
        }
      }
    }

    this.playSynthesizedPlayerHurt();
  }

  // Synthesized fallback for player damage grunt
  public playSynthesizedPlayerHurt() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn('Audio playSynthesizedPlayerHurt failed', e);
    }
  }

  // Reload sound (mechanical slide + clip lock)
  public playReload() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Click 1 (slide eject)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(500, now);
      osc1.frequency.exponentialRampToValueAtTime(300, now + 0.08);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      // Click 2 (magazine lock in)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(350, now + 0.18);
      osc2.frequency.exponentialRampToValueAtTime(800, now + 0.26);
      gain2.gain.setValueAtTime(0.4, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.26);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.26);
    } catch (e) {
      console.warn('Audio playReload failed', e);
    }
  }

  // Empty clip dry fire
  public playEmptyClip() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.warn('Audio playEmptyClip failed', e);
    }
  }

  // Fiery explosion
  public playExplosion() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.4);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(400, now);
      lowpass.frequency.exponentialRampToValueAtTime(80, now + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.4);
    } catch (e) {
      console.warn('Audio playExplosion failed', e);
    }
  }

  // Defeat / Game Over sound effect (from uploaded boss_win asset) with synthesized fallback
  public playDefeat(volume: number = 0.95) {
    if (this.isMuted) return;

    if (typeof Audio !== 'undefined') {
      try {
        if (!this.defeatAudio) {
          this.defeatAudio = new Audio('/assets/aistudio/boss_win_4ae7645d.mp3');
        }
        this.defeatAudio.currentTime = 0;
        this.defeatAudio.volume = Math.max(0, Math.min(1, volume));
        const playPromise = this.defeatAudio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            this.playSynthesizedDefeat();
          });
        }
        return;
      } catch {
        // Fall through to synthesizer
      }
    }

    this.playSynthesizedDefeat();
  }

  // Stop defeat voice playback (e.g. when player restarts)
  public stopDefeat() {
    if (this.defeatAudio) {
      try {
        this.defeatAudio.pause();
        this.defeatAudio.currentTime = 0;
      } catch {
        // Ignore
      }
    }
  }

  // Synthesized fallback for defeat
  public playSynthesizedDefeat() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.7);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {
      console.warn('Audio playSynthesizedDefeat failed', e);
    }
  }
}

export const sound = new SoundEngine();
