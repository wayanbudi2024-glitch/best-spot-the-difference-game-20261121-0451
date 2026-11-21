// Lantern Lane — every sound is synthesised with WebAudio. No audio
// files, no network: short oscillator notes with envelopes, one master
// gain so M can mute the whole game at once.

export class SoundBank {
  constructor() {
    this.context = null;
    this.master = null;
    this.muted = false;
  }

  // Browsers only allow sound after a gesture, so the context is built
  // lazily on the first sound request and stays silent until then.
  ensureContext() {
    if (this.context) {
      if (this.context.state === 'suspended') this.context.resume().catch(() => {});
      return true;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.context.destination);
      return true;
    } catch {
      return false;
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  tone({ frequency, at = 0, length = 0.15, type = 'sine', volume = 0.5, slideTo = null }) {
    if (this.muted || !this.ensureContext()) return;
    const now = this.context.currentTime + at;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, now + length);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + length + 0.05);
  }

  // A soft blip for an ordinary click.
  clickBlip() {
    this.tone({ frequency: 660, length: 0.07, type: 'triangle', volume: 0.25 });
  }

  // A two-note chime when a difference is found; the higher note climbs
  // with the combo so a streak sounds like it is rising.
  foundChime(comboStep) {
    const lift = Math.min(comboStep, 6) * 24;
    this.tone({ frequency: 523 + lift, length: 0.16, type: 'sine', volume: 0.5 });
    this.tone({ frequency: 784 + lift, at: 0.09, length: 0.28, type: 'sine', volume: 0.5 });
    this.tone({ frequency: 1047 + lift, at: 0.18, length: 0.2, type: 'triangle', volume: 0.22 });
  }

  // A low buzz for a wrong click.
  wrongBuzz() {
    this.tone({ frequency: 150, length: 0.28, type: 'sawtooth', volume: 0.28, slideTo: 90 });
    this.tone({ frequency: 110, length: 0.28, type: 'square', volume: 0.12, slideTo: 70 });
  }

  // Three rising notes when a hint is spent.
  hintNotes() {
    this.tone({ frequency: 392, length: 0.14, type: 'sine', volume: 0.4 });
    this.tone({ frequency: 494, at: 0.1, length: 0.14, type: 'sine', volume: 0.4 });
    this.tone({ frequency: 587, at: 0.2, length: 0.24, type: 'sine', volume: 0.4 });
  }

  // A short arpeggio when a round ends.
  roundArpeggio() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((frequency, i) => {
      this.tone({ frequency, at: i * 0.1, length: 0.22, type: 'triangle', volume: 0.4 });
    });
  }

  // A longer fanfare for finishing all five rounds.
  winFanfare() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((frequency, i) => {
      this.tone({ frequency, at: i * 0.13, length: 0.3, type: 'triangle', volume: 0.42 });
    });
    this.tone({ frequency: 262, length: 0.9, type: 'sine', volume: 0.2 });
  }

  // A quiet tick while the last ten seconds run out.
  lowTimeTick() {
    this.tone({ frequency: 880, length: 0.05, type: 'square', volume: 0.14 });
  }
}
