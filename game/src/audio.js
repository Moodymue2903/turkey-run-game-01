// Gobble Rush — every sound is synthesised here with WebAudio. No audio files.
export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
    this.master = null;
  }

  // The browser only lets audio start after a gesture, so the context is built
  // lazily on the first sound request and then reused.
  ensureContext() {
    if (this.context) return this.context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.context.destination);
    return this.context;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : 0.5;
  }

  tone(freq, duration, type, volume, slideTo) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    gain.gain.setValueAtTime(volume || 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  noiseBurst(duration, volume, filterFreq) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq || 1200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume || 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(now);
  }

  gobble() {
    // Two quick descending clucks: the turkey's signature sound.
    this.tone(520, 0.09, 'square', 0.16, 300);
    setTimeout(() => this.tone(430, 0.12, 'square', 0.16, 240), 90);
  }

  flap() {
    this.noiseBurst(0.14, 0.18, 900);
  }

  jump() {
    this.tone(300, 0.12, 'sine', 0.12, 620);
  }

  thud() {
    this.noiseBurst(0.12, 0.25, 500);
    this.tone(140, 0.12, 'sine', 0.22, 70);
  }

  corn() {
    this.tone(880, 0.07, 'triangle', 0.18);
    setTimeout(() => this.tone(1320, 0.09, 'triangle', 0.16), 60);
  }

  dash() {
    this.noiseBurst(0.22, 0.2, 2400);
    this.tone(220, 0.2, 'sawtooth', 0.1, 880);
  }

  farmerYell() {
    this.tone(180, 0.3, 'sawtooth', 0.22, 420);
    setTimeout(() => this.tone(240, 0.22, 'sawtooth', 0.18, 500), 120);
  }

  ovenWhoosh() {
    this.noiseBurst(0.4, 0.22, 700);
  }

  knifeSwoosh() {
    this.noiseBurst(0.16, 0.16, 3200);
  }

  alertSting() {
    this.tone(660, 0.1, 'square', 0.14);
    setTimeout(() => this.tone(660, 0.1, 'square', 0.14), 110);
    setTimeout(() => this.tone(880, 0.16, 'square', 0.14), 220);
  }

  caughtSting() {
    this.tone(392, 0.25, 'sawtooth', 0.2, 180);
    setTimeout(() => this.tone(311, 0.3, 'sawtooth', 0.2, 140), 200);
    setTimeout(() => this.tone(233, 0.45, 'sawtooth', 0.2, 90), 420);
  }

  escapeJingle() {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.tone(freq, 0.22, 'triangle', 0.2), i * 130);
    });
  }

  slide() {
    this.noiseBurst(0.18, 0.12, 1600);
  }
}
