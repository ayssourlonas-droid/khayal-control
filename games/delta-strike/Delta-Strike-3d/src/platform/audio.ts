import type { GameEvent } from '../core/simulation';

const OUTPUT_GAIN = 1;
export class AudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private engine: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  muted = false;
  async unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : OUTPUT_GAIN;
        // Preserve audible effects on small speakers while taming overlapping peaks.
        const compressor = this.context.createDynamicsCompressor();
        compressor.threshold.value = -10;
        compressor.knee.value = 8;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.002;
        compressor.release.value = 0.18;
        this.master.connect(compressor);
        compressor.connect(this.context.destination);
        this.engine = this.context.createOscillator();
        this.engine.type = 'sawtooth';
        this.engineGain = this.context.createGain();
        this.engineGain.gain.value = 0;
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        this.engine.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.master);
        this.engine.start();
        this.noise = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      if (this.context.state === 'suspended') await this.context.resume();
    } catch {
      /* Play remains available if the browser cannot provide audio. */
    }
  }
  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(muted ? 0 : OUTPUT_GAIN, this.context.currentTime, 0.03);
  }
  update(speed: number, playing: boolean) {
    if (!this.context || !this.engine || !this.engineGain) return;
    this.engine.frequency.setTargetAtTime(38 + speed * 0.8, this.context.currentTime, 0.12);
    this.engineGain.gain.setTargetAtTime(playing ? 0.17 : 0, this.context.currentTime, 0.1);
  }
  private tone(frequency: number, duration: number, volume: number, end: number) {
    if (!this.context || !this.master || this.muted) return;
    const now = this.context.currentTime,
      osc = this.context.createOscillator(),
      gain = this.context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(frequency, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, end), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + duration);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
  events(events: GameEvent[]) {
    for (const e of events) {
      if (e.kind === 'shot') this.tone(320, 0.065, 0.18, 90);
      else if (e.kind === 'missile') this.tone(120, 0.35, 0.25, 700);
      else if (e.kind === 'refuel') this.tone(680, 0.1, 0.1, 1000);
      else if (e.kind === 'checkpoint') this.tone(420, 0.7, 0.3, 840);
      else if (e.kind === 'explosion' && this.context && this.master && this.noise && !this.muted) {
        const source = this.context.createBufferSource(),
          gain = this.context.createGain(),
          filter = this.context.createBiquadFilter(),
          now = this.context.currentTime;
        source.buffer = this.noise;
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        gain.gain.setValueAtTime(Math.min(0.6, e.size * 0.04), now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        source.start();
        source.stop(now + 0.6);
        source.onended = () => {
          source.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
      }
    }
  }
}
