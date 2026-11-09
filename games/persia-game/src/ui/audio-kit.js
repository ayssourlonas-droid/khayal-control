// Synth building blocks for the sound patches (adapted and extended from Barrage's audio-sfx.js).
// A patch gets a voice `a` = { ctx, t, out, noise, kit }: `out` is the sound's own input node
// (already panned and sent to the reverb by audio.js), `t` the start time, `kit` its world's
// flavour (sound-data.js kitFor). Every node made here is short-lived: oscillators and sources stop by
// themselves a few ms after their envelope ends, so a patch leaves nothing running.
//   env     gain that rises to `peak` in `attack` and falls to silence over `decay`
//   tone    an oscillator gliding f0 -> f1 (exponential, or in steps for chiptune)
//   hiss    filtered noise, the filter sweeping f0 -> f1
//   fm      a metallic / bell tone: a sine modulator on the carrier's frequency (ratio, index)
//   wobble  an LFO on any AudioParam (tremolo, vibrato, sizzle)
//   crush   a soft-clip waveshaper (one shared curve per amount)
//   semis   frequency ratio of n semitones; noteHz a note of the world's scale
import { degreeMidi, midiHz } from './sound-data.js';
import { clamp } from '../core/math.js';
import { WIDTH as W } from '../core/kinds.js';

const FLOOR = 0.0001;
export const semis = (n) => 2 ** (n / 12);

// Where a sound at world x sits in the stereo field, -0.8 (left) .. 0.8.
export const panOf = (x) => clamp((x / W - 0.5) * 1.5, -0.8, 0.8);

function env(a, t, peak, attack, decay, dest = a.out) {
  const g = a.ctx.createGain();
  g.gain.setValueAtTime(FLOOR, t);
  g.gain.exponentialRampToValueAtTime(Math.max(FLOOR * 2, peak), t + Math.max(0.001, attack));
  g.gain.exponentialRampToValueAtTime(FLOOR, t + attack + decay);
  g.connect(dest);
  return g;
}

function glide(param, f0, f1, t, dur, steps) {
  param.setValueAtTime(f0, t);
  if (!steps) {
    param.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    return;
  }
  for (let i = 1; i <= steps; i++) param.setValueAtTime(f0 * (f1 / f0) ** (i / steps), t + (dur * i) / (steps + 1));
}

// o: { type, f0, f1, t, dur, peak, attack, dest, steps, detune, cut (lowpass Hz), q }
export function tone(a, o) {
  const t = o.t ?? a.t;
  const attack = o.attack ?? 0.004;
  const osc = a.ctx.createOscillator();
  osc.type = o.type ?? 'sine';
  if (o.detune) osc.detune.value = o.detune;
  glide(osc.frequency, o.f0, o.f1 ?? o.f0, t, attack + o.dur, o.steps);
  let head = env(a, t, o.peak, attack, o.dur, o.dest ?? a.out);
  if (o.cut) {
    const f = a.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.Q.value = o.q ?? 0.7;
    f.frequency.setValueAtTime(o.cut, t);
    if (o.cut1) f.frequency.exponentialRampToValueAtTime(o.cut1, t + attack + o.dur);
    f.connect(head);
    head = f;
  }
  osc.connect(head);
  osc.start(t);
  osc.stop(t + attack + o.dur + 0.05);
  return osc;
}

// o: { t, dur, peak, type (filter), f0, f1, q, attack, dest, rate (playback) }
export function hiss(a, o) {
  const t = o.t ?? a.t;
  const attack = o.attack ?? 0.003;
  const s = a.ctx.createBufferSource();
  s.buffer = a.noise;
  s.loop = true;
  if (o.rate) s.playbackRate.value = o.rate;
  const f = a.ctx.createBiquadFilter();
  f.type = o.type ?? 'lowpass';
  f.Q.value = o.q ?? 0.8;
  glide(f.frequency, o.f0, o.f1 ?? o.f0, t, attack + o.dur, 0);
  const g = env(a, t, o.peak, attack, o.dur, o.dest ?? a.out);
  s.connect(f).connect(g);
  s.start(t, (t * 7.31) % 0.9);
  s.stop(t + attack + o.dur + 0.05);
  return g;
}

// o: { f0, f1, ratio, index, t, dur, peak, attack, type, dest, cut }
export function fm(a, o) {
  const t = o.t ?? a.t;
  const mod = a.ctx.createOscillator();
  const depth = a.ctx.createGain();
  glide(mod.frequency, o.f0 * o.ratio, (o.f1 ?? o.f0) * o.ratio, t, (o.attack ?? 0.004) + o.dur, 0);
  depth.gain.setValueAtTime(o.f0 * o.index, t);
  depth.gain.exponentialRampToValueAtTime(Math.max(1, o.f0 * o.index * (o.fade ?? 0.1)), t + o.dur);
  const car = tone(a, { ...o, type: o.type ?? 'sine' });
  mod.connect(depth).connect(car.frequency);
  mod.start(t);
  mod.stop(t + (o.attack ?? 0.004) + o.dur + 0.05);
  return car;
}

// An LFO on `param` from t for dur: rate Hz, depth in the param's units.
export function wobble(a, param, rate, depth, t, dur, type = 'sine') {
  const lfo = a.ctx.createOscillator();
  const g = a.ctx.createGain();
  lfo.type = type;
  lfo.frequency.value = rate;
  g.gain.value = depth;
  lfo.connect(g).connect(param);
  lfo.start(t);
  lfo.stop(t + dur + 0.05);
  return lfo;
}

const curves = new Map();
export function crush(a, amount, dest = a.out) {
  let curve = curves.get(amount);
  if (!curve) {
    curve = new Float32Array(1024);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * amount) / Math.tanh(amount);
    }
    curves.set(amount, curve);
  }
  const ws = a.ctx.createWaveShaper();
  ws.curve = curve;
  ws.connect(dest);
  return ws;
}

// A note of the world's scale: degree 0 is its root, a scale's length of degrees is an octave.
export const noteHz = (kit, degree, octave = 5) => midiHz(degreeMidi(kit, degree, octave));
