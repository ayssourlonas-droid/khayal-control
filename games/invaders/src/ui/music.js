// A light synthesized loop per world: a drone on the root (two detuned oscillators breathing through
// a slow filter) and a lead stepping through the world's scale over a short drum line (its hits are in
// music-drums.js), all from the look's music entry (sound-data.js STYLES[style].music). Every 2 passes
// of the sequence the lead moves to the next chord of a four-step progression, so the loop does not
// drone on one phrase.
//   setMusic(look)   the world to play (cross-fades from the last); null for silence; musicLook()
//   updateMusic(nodes?)  once per frame: schedules the next 0.3 s of notes ahead of the clock
//   startLoop(nodes, look) / fillLoop(loop, until) / stopLoop(loop)   the same loop on any context
// A world change fades the old loop out, stops its sources and then disconnects every node it
// made (the echo's feedback loop included), so a kiosk that cycles worlds for days stays flat.
import { audioNodes, setWorldSound } from './audio.js';
import { tone, fm } from './audio-kit.js';
import { DRUM } from './music-drums.js';
import { STYLES, kitFor, degreeMidi, midiHz } from './sound-data.js';

const AHEAD = 0.3; // s scheduled ahead of the audio clock
const FADE = 1.2; // s cross-fade between worlds
const PROGRESSION = [0, 0, 5, 3]; // scale-degree shift of the lead, per two passes

let want = null;
let cur = null;

export function setMusic(look) {
  want = look ?? null;
}

// A world's sound effects and its music loop (null: the default kit, silence).
export function setWorld(look) {
  setWorldSound(look);
  setMusic(look);
}

export const musicLook = () => want; // what plays now: a Cinema trailer hands the menu's music back

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
  let input = bus;
  if (kit.wet > 0.3) { // a tape echo for the wide, wet worlds
    const echo = make(ctx.createDelay(1));
    const fb = make(ctx.createGain());
    echo.delayTime.value = (60 / kit.bpm) * 0.75;
    fb.gain.value = 0.32;
    input = make(ctx.createGain());
    input.connect(bus);
    input.connect(echo).connect(fb).connect(echo);
    fb.connect(bus);
  }
  // out: through the echo when there is one; dry: past it, for a beat that must stay tight (music-breath.js)
  const a = { ctx, t: ctx.currentTime, out: input, dry: bus, noise: nodes.noise, kit };
  const sources = droneVoice(a, m.drone, make);
  return { look, kit, m, a, bus, made, sources, next: ctx.currentTime + 0.1, step: 0 };
}

// The drone: detuned oscillators on the root (and fifth) through a lowpass a slow LFO opens and closes.
function droneVoice(a, d, make) {
  const { ctx, kit } = a;
  const g = make(ctx.createGain());
  g.gain.value = d.gain ?? 0.05;
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

// The scale degree of the tune's next note after `step` (the same note when it is the only one).
function nextNote(seq, step) {
  for (let k = 1; k <= seq.length; k++) {
    const d = seq[(step + k) % seq.length];
    if (d != null) return d;
  }
  return seq[step % seq.length];
}

function stepAt(c, t) {
  const { m, kit, a } = c;
  const len = 60 / kit.bpm / m.div;
  const deg = m.seq[c.step % m.seq.length];
  const shift = PROGRESSION[Math.floor(c.step / (m.seq.length * 2)) % PROGRESSION.length];
  if (deg != null) {
    const L = m.lead;
    const pad = L.len > 1 && !L.fm; // a bell rings long but strikes at once
    const o = {
      type: L.wave, t, f0: midiHz(degreeMidi(kit, deg + shift, L.oct)), attack: L.attack != null ? len * L.attack : pad ? len * 0.25 : 0.006,
      dur: len * L.len, hold: len * (L.hold ?? 0), peak: L.gain, cut: L.cut, cut1: L.cut1, q: 1.5,
    };
    if (L.glide) o.f1 = midiHz(degreeMidi(kit, nextNote(m.seq, c.step) + shift, L.oct)); // a call sliding on to the next note
    if (L.fm) fm(a, { ...o, ...L.fm });
    else tone(a, o);
    if (L.bow) { // bowed glass: a twin a few cents off the note beats against it, and a thin octave sounds over both
      tone(a, { ...o, detune: L.bow, peak: o.peak * 0.8 });
      tone(a, { ...o, f0: o.f0 * 2, peak: o.peak * 0.12 });
    }
  }
  const hit = m.drum[c.step % m.drum.length];
  DRUM[hit]?.(a, t, { deg: deg == null ? null : deg + shift, shift, step: c.step });
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
