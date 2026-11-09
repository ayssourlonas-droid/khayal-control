// Sound, synthesized with WebAudio: no files (Barrage's approach, grown up). The context is made on
// the first user gesture (browsers refuse audio before one); until then every sound is skipped.
//   master -> compressor -> speakers;  sfx, music and voice buses -> master;  a shared reverb (a
//   generated impulse response) fed by a per-sound send, so big sounds bloom and small ones stay dry.
// The voice bus carries the pack's spoken clips (voice.js), dry.
// Each play() builds the sound's own input node: panned by its world x, with the look's flavour
// (setWorldSound(look) -> sound-data.js kitFor). Bursts are thinned per sound (GAP) and a voice
// budget drops the small stuff when too much is ringing (cheap on a Pi 4).
//   unlockAudio()  call from a keydown / pointerdown; toggleMute() (M; saved)
//   play(name, { x, gain, wet, delay, ... })   names: sfx-*.js
//   audioNodes() -> { ctx, music, noise, voice } | null (muted)
//   setBeam(on, x)  the laser power's sustained hum
//   duck(level)  music under menus;  duckSpeech(level)  music and effects under a spoken line. The
//   two multiply, so a line ending under the pause menu leaves the music at the menu's level.
import { store } from './storage.js';
import { kitFor } from './sound-data.js';
import { SFX } from './sfx.js';
import { panOf } from './audio-kit.js';
import { MID_X } from '../core/kinds.js';

let ctx = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let voiceBus = null;
let reverb = null;
let noise = null;
let muted = store.muted();
let kit = kitFor();
let voices = []; // end times of the sounds ringing
const last = {};
const MAX_VOICES = 36;
const GAP = {
  shot: 0.045, enemyShot: 0.07, laserWarn: 0.25, hit: 0.05, bossHit: 0.055, kill: 0.035, boom: 0.06, nearMiss: 0.2,
  shield: 0.12, move: 0.03, count: 0.05, warn: 0.12,
};
const MUST = new Set(['blast', 'bossDeath', 'phase', 'cleared', 'failed', 'bomb', 'shipHit', 'select', 'star',
  'braam', 'impact', 'riser']);
const MASTER = 0.85;
const MUSIC = 0.32; // the loops sit about 10 dB under the effects (offline RMS check)
const VOICE = 1.2; // the spoken clips, over the fire

function impulse(c, secs, decay) {
  const n = Math.floor(c.sampleRate * secs);
  const buf = c.createBuffer(2, n, c.sampleRate);
  let s = 22222;
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < n; i++) {
      s = (s * 16807) % 2147483647;
      d[i] = ((s / 2147483647) * 2 - 1) * (1 - i / n) ** decay;
    }
  }
  return buf;
}

function build(c) {
  master = c.createGain();
  master.gain.value = muted ? 0 : MASTER;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 12;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.22;
  master.connect(comp).connect(c.destination);
  sfxBus = c.createGain();
  sfxBus.connect(master);
  musicBus = c.createGain();
  musicBus.gain.value = MUSIC;
  musicBus.connect(master);
  voiceBus = c.createGain();
  voiceBus.gain.value = VOICE;
  voiceBus.connect(master);
  reverb = c.createConvolver();
  reverb.buffer = impulse(c, 2.2, 3.2);
  const ret = c.createGain();
  ret.gain.value = 0.55;
  reverb.connect(ret).connect(master);
  noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = noise.getChannelData(0);
  let s = 1;
  for (let i = 0; i < d.length; i++) {
    s = (s * 16807) % 2147483647; // deterministic white noise
    d[i] = (s / 2147483647) * 2 - 1;
  }
}

export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return;
      ctx = new AC({ latencyHint: 'interactive' });
      build(ctx);
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    ctx = null; // no audio on this machine: the game plays on in silence
  }
}

// A hidden tab goes quiet (the drone would hum on with no frames to schedule the music).
globalThis.document?.addEventListener('visibilitychange', () => {
  if (!ctx) return;
  if (document.hidden) ctx.suspend();
  else ctx.resume();
});

const running = () => ctx && ctx.state === 'running';
export const audioNodes = () => (running() && !muted ? { ctx, music: musicBus, noise, voice: voiceBus } : null); // muted: none
export const setWorldSound = (look) => { kit = kitFor(look?.music); };

export function toggleMute() {
  muted = !muted;
  store.setMuted(muted);
  if (master) master.gain.setTargetAtTime(muted ? 0 : MASTER, ctx.currentTime, 0.03);
  if (muted) setBeam(false);
  return muted;
}

// Down fast so a line lands clear, back up slowly.
const ducks = { menu: 1, speech: 1 };
function setDuck(which, level) {
  const k = level < ducks[which] ? 0.06 : 0.25;
  ducks[which] = level;
  if (!ctx) return;
  musicBus.gain.setTargetAtTime(MUSIC * ducks.menu * ducks.speech, ctx.currentTime, k);
  sfxBus.gain.setTargetAtTime(ducks.speech, ctx.currentTime, k);
}
export const duck = (level) => setDuck('menu', level);
export const duckSpeech = (level) => setDuck('speech', level);

// The voice a patch plays into: { ctx, t, out, noise, kit }; t is o.delay s from now (a run of chimes).
function voice(o) {
  const out = ctx.createGain();
  out.gain.value = o.gain ?? 1;
  let tail = out;
  if (o.x != null) {
    const pan = ctx.createStereoPanner();
    pan.pan.value = panOf(o.x);
    out.connect(pan);
    tail = pan;
  }
  tail.connect(sfxBus);
  const wet = o.wet ?? kit.wet;
  if (wet > 0) {
    const send = ctx.createGain();
    send.gain.value = wet;
    tail.connect(send).connect(reverb);
  }
  return { ctx, t: ctx.currentTime + 0.005 + (o.delay ?? 0), out, tail, noise, kit };
}

export function play(name, o = {}) {
  if (!running() || muted || !SFX[name]) return;
  const now = ctx.currentTime;
  if (GAP[name] && now - (last[name] ?? -1) < GAP[name]) return;
  voices = voices.filter((end) => end > now);
  if (voices.length >= MAX_VOICES && !MUST.has(name)) return;
  last[name] = now;
  try {
    const a = voice(o);
    const secs = a.t - now + (SFX[name](a, o) ?? 1); // from now to its end, a delayed start included
    voices.push(now + secs);
    setTimeout(() => a.tail.disconnect(), (secs + 2.5) * 1000); // after the reverb has the tail
  } catch {
    // a sound that fails to build is not worth a crash
  }
}

// The laser power burns as long as fire is held: one sustained voice, panned with the ship.
let beam = null;
export function setBeam(on, x = MID_X) {
  if (!running() || muted) on = false;
  if (on && !beam) beam = SFX.beamHum(voice({ x, wet: kit.wet * 0.6 }), {});
  if (beam) beam.pan(x);
  if (!on && beam) {
    beam.stop();
    beam = null;
  }
}
