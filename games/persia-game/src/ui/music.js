// A light synthesized loop: a drone on the root (two detuned oscillators breathing through a slow
// filter) and a lead stepping through the look's scale over a short drum line, all from the look's
// music entry (sound-data.js STYLES[style].music). Every 2 passes of the sequence the lead moves to
// the next chord of a four-step progression, so the loop does not drone on one phrase.
//   setMusic(look)   the look to play (cross-fades from the last); null for silence
//   updateMusic(nodes?)  once per frame: schedules the next 0.3 s of notes ahead of the clock
//   startLoop(nodes, look) / fillLoop(loop, until) / stopLoop(loop)   the same loop on any context
// A change fades the old loop out, stops its sources and then disconnects every node it made, so a
// kiosk that plays for days stays flat.
import { audioNodes, setWorldSound } from './audio.js';
import { tone, hiss } from './audio-kit.js';
import { STYLES, kitFor, degreeMidi, midiHz } from './sound-data.js';

const AHEAD = 0.3; // s scheduled ahead of the audio clock
const FADE = 1.2; // s cross-fade between loops
const PROGRESSION = [0, 0, 5, 3]; // scale-degree shift of the lead, per two passes

let want = null;
let cur = null;

export function setMusic(look) {
  want = look ?? null;
}

// The look's sound effects and its music loop (null: the default kit, silence).
export function setWorld(look) {
  setWorldSound(look);
  setMusic(look);
}

const DRUM = {
  t: (a, t) => {
    tone(a, { t, f0: 115, f1: 48, dur: 0.42, peak: 0.3 });
    hiss(a, { t, type: 'lowpass', f0: 500, dur: 0.08, peak: 0.08 });
  },
};

export function startLoop(nodes, look) {
  const { ctx } = nodes;
  const kit = kitFor(look.music);
  const m = STYLES[kit.style].music;
  const made = []; // every node this loop owns, to disconnect when it ends
  const make = (node) => (made.push(node), node);
  const bus = make(ctx.createGain());
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.exponentialRampToValueAtTime(m.vol ?? 1, ctx.currentTime + FADE);
  bus.connect(nodes.music);
  const a = { ctx, t: ctx.currentTime, out: bus, noise: nodes.noise, kit };
  const sources = droneVoice(a, m.drone, make);
  return { look, kit, m, a, bus, made, sources, next: ctx.currentTime + 0.1, step: 0 };
}

// The drone: detuned oscillators on the root (and fifth) through a lowpass a slow LFO opens and closes.
function droneVoice(a, d, make) {
  const { ctx, kit } = a;
  const g = make(ctx.createGain());
  g.gain.value = 0.05;
  const f = make(ctx.createBiquadFilter());
  f.type = 'lowpass';
  f.frequency.value = d.cut;
  f.connect(g).connect(a.out);
  const root = midiHz(degreeMidi(kit, 0, d.oct));
  const hz = d.fifth ? [root, root * 1.5, root * 1.003] : [root, root * 1.004];
  const osc = (type, freq) => {
    const o = make(ctx.createOscillator());
    o.type = type;
    o.frequency.value = freq;
    o.start();
    return o;
  };
  const oscs = hz.map((h, i) => {
    const o = osc(d.wave, h);
    o.detune.value = i * 4;
    o.connect(f);
    return o;
  });
  const lfo = osc('sine', 0.09);
  const depth = make(ctx.createGain());
  depth.gain.value = d.cut * 0.45;
  lfo.connect(depth).connect(f.frequency);
  return [...oscs, lfo];
}

export function stopLoop(c) {
  const { ctx } = c.a;
  c.bus.gain.cancelScheduledValues(ctx.currentTime);
  c.bus.gain.setTargetAtTime(0.0001, ctx.currentTime, FADE / 4);
  for (const o of c.sources) o.stop(ctx.currentTime + FADE + 0.2);
  setTimeout(() => { for (const n of c.made) n.disconnect(); }, (FADE + 1) * 1000);
}

function stepAt(c, t) {
  const { m, kit, a } = c;
  const len = 60 / kit.bpm / m.div;
  const deg = m.seq[c.step % m.seq.length];
  const shift = PROGRESSION[Math.floor(c.step / (m.seq.length * 2)) % PROGRESSION.length];
  if (deg != null) {
    const L = m.lead;
    tone(a, {
      type: L.wave, t, f0: midiHz(degreeMidi(kit, deg + shift, L.oct)), attack: 0.006,
      dur: len * L.len, peak: L.gain, cut: L.cut, q: 1.5,
    });
  }
  const hit = m.drum[c.step % m.drum.length];
  DRUM[hit]?.(a, t);
  c.step += 1;
  return len;
}

export function updateMusic(nodes = audioNodes()) {
  if (!nodes) return;
  if ((cur?.look ?? null) !== want) {
    if (cur) stopLoop(cur);
    cur = want ? startLoop(nodes, want) : null;
  }
  if (!cur) return;
  const horizon = nodes.ctx.currentTime + AHEAD;
  if (cur.next < nodes.ctx.currentTime) cur.next = nodes.ctx.currentTime + 0.02; // after a stall, never a burst
  fillLoop(cur, horizon);
}

// Schedule the loop's notes up to `until` (audio clock seconds).
export function fillLoop(c, until) {
  while (c.next < until) c.next += stepAt(c, c.next);
}
