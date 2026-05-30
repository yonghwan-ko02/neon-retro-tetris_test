// audio.js - Web Audio API Retro Sound Synth Manager

class RetroAudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('tetris_muted') === 'true';
  }

  // Initialize Audio Context on user interaction (browser policy)
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('tetris_muted', this.isMuted);
    return this.isMuted;
  }

  // Play a simple custom tone with controlled frequencies, duration, and wave type
  playTone(freqs, duration, type = 'square', volume = 0.1) {
    if (this.isMuted) return;
    this.init();

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      
      // Frequency sweeping for dynamic synth sound effects
      if (Array.isArray(freqs)) {
        if (freqs.length === 1) {
          osc.frequency.setValueAtTime(freqs[0], now);
        } else {
          osc.frequency.setValueAtTime(freqs[0], now);
          const step = duration / (freqs.length - 1);
          for (let i = 1; i < freqs.length; i++) {
            osc.frequency.setValueAtTime(freqs[i], now + i * step);
          }
        }
      } else {
        osc.frequency.setValueAtTime(freqs, now);
      }

      // Smooth volume envelope to prevent clicking sounds
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  // Play Sound Effects
  playMove() {
    // Short high beep
    this.playTone([200, 150], 0.05, 'triangle', 0.15);
  }

  playRotate() {
    // Medium pitch quick sweep
    this.playTone([300, 450], 0.08, 'triangle', 0.15);
  }

  playDrop() {
    // Low frequency thud
    this.playTone([100, 60], 0.12, 'sawtooth', 0.2);
  }

  playHardDrop() {
    // Heavy low frequency slide
    this.playTone([120, 80, 40], 0.2, 'sawtooth', 0.25);
  }

  playHold() {
    // Pleasant double beep
    this.playTone([400, 600], 0.12, 'square', 0.08);
  }

  playLineClear(linesCount) {
    const duration = 0.35;
    const now = this.ctx ? this.ctx.currentTime : 0;
    
    if (linesCount === 4) {
      // Epic Tetris Line Clear sound (4 lines)
      // Play a major 7th chord arpeggio
      const notes = [261.63, 329.63, 392.00, 493.88, 523.25]; // C4, E4, G4, B4, C5
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 0.25, 'square', 0.1);
        }, idx * 70);
      });
    } else {
      // Normal Line Clear (1-3 lines)
      const notes = [329.63, 392.00, 523.25]; // E4, G4, C5
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, 0.2, 'square', 0.08);
        }, idx * 80);
      });
    }
  }

  playLevelUp() {
    // Celebratory ascending synth
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 'triangle', 0.1);
      }, idx * 60);
    });
  }

  playGameOver() {
    // Sad descending arpeggio
    const notes = [392.00, 311.13, 261.63, 196.00, 155.56, 130.81]; // G4, Eb4, C4, G3, Eb3, C3
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.3, 'sawtooth', 0.12);
      }, idx * 120);
    });
  }
}

// Global instance to use throughout the game
const audioManager = new RetroAudioManager();
