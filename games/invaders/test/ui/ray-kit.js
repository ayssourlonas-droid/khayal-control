import { installCanvas, sink } from './dom-kit.js';
import { tracker } from './galleon-track.js';

// What The Squall Ray's art tests share (ray-parts.test.js: the hull, the parts, the rage layers and the shape; ray-live.test.js: what is drawn live;
// line-cap-ray.test.js: the context state): stand-in canvases that keep a tracker for every canvas made (so that a baked sprite's extent can be read
// back, and that "nothing is baked mid-fight" can be counted), the boss's definition and look, its module, a boss to draw for, and the stage a painter
// is measured on. Part painters are measured the way the boss cache calls them: on a body and a lights context, centred on the part's rect.
installCanvas(64);
export const canvases = [];
document.createElement = () => {
  const T = tracker();
  canvases.push({ width: 64, height: 64, getContext: () => T.ctx, T });
  return canvases.at(-1);
};
const { BOSS_DEFS } = await import('../../src/core/bosses-data.js');
const { BOSS_ART, stageOf } = await import('../../src/ui/bosses/bake.js');
const { LOOKS } = await import('../../src/ui/looks/index.js');
const { fx } = await import('../../src/ui/bosses/ray-fx.js');

export const look = LOOKS[17];
export const def = BOSS_DEFS.find((d) => d.kind === 'ray');
export const art = BOSS_ART.ray;
export const S = stageOf(look, 'ray'); // as bake.js sizes it
export const HUD = -158; // the highest anything may reach, in boss coordinates (the HUD is above)
export const PAD = S.W / 2; // the hull's half width plus ray.js's pad: how far either side the baked canvas reaches
export const f = (n) => Math.round(n);
export const part = (id) => def.parts.find((p) => p.id === id);
export const margin = (id) => art.margins?.[id] ?? art.margin ?? 34;
export const lit = (calls) => calls.filter(([k]) => ['fill', 'fillRect', 'stroke', 'drawImage'].includes(k)).length;
export const painter = (id) => art.parts[id] ?? art.parts[id.replace(/[LR]$/, '')];

// One part painted on a tracker pair; the bounds are in the part's own coordinates.
export function paint(id) {
  const b = tracker();
  const l = tracker();
  painter(id)(b.ctx, l.ctx, part(id), S);
  return { b: b.bounds, l: l.bounds };
}

// Every colour a painter's lights set or put in a gradient, as 'rgba(r,g,b,a)' or '#rrggbb' strings.
export function colours(id) {
  const seen = [];
  const take = (c) => {
    if (typeof c === 'string') seen.push(c);
    else if (c?.stops) seen.push(...c.stops);
  };
  const grad = () => ({ stops: [], addColorStop(at, c) { this.stops.push(c); } });
  const state = {};
  const ctx = new Proxy(state, {
    get: (o, k) => (k === 'createRadialGradient' || k === 'createLinearGradient' ? grad : k === 'save' || k === 'restore' ? () => {} : k in o ? o[k] : () => ctx),
    set: (o, k, v) => { if (k === 'fillStyle' || k === 'strokeStyle') take(v); o[k] = v; return true; },
  });
  painter(id)(sink, ctx, part(id), S);
  return seen;
}

// How bright a painter's lights are at their hottest: every colour it sets or puts in a gradient, as alpha x its brightest channel (0..1).
export function peak(id) {
  let max = 0;
  for (const c of colours(id)) {
    const m = /^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(c);
    const [r, g, b, a] = m ? [+m[1], +m[2], +m[3], +m[4]] : /^#[0-9a-f]{6}$/i.test(c) ? [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16), 1] : [0, 0, 0, 0];
    max = Math.max(max, (a * Math.max(r, g, b)) / 255);
  }
  return max;
}

export const boss = (phase) => ({ x: 0, y: 0, phase, parts: def.parts.map((p) => ({ ...p, x: p.dx, y: p.dy, max: p.hp })) });
export const without = (b, ...ids) => ({ ...b, parts: b.parts.map((p) => (ids.includes(p.id) ? { ...p, hp: 0 } : p)) });

// One pass of the live extras read back through a tracker, standing, as the game does, in 'lighter'.
export function pass(b, t, own = true, since = 0, k = 1) {
  const T = tracker();
  T.ctx.globalCompositeOperation = 'lighter';
  fx(T.ctx, b, t, k, own, since);
  return { ...T, after: T.ctx.globalCompositeOperation };
}
export const sweepT = (b, own, fn, since = 0) => { for (let t = 3; t < 40; t += 0.29) fn(pass(b, t, own, since), t); };
export const near = (calls, p, r) => calls.filter((c) => Math.hypot((c.box[0] + c.box[2]) / 2 - p.x, (c.box[1] + c.box[3]) / 2 - p.y) < r);
