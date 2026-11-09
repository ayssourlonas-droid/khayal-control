import { installCanvas } from './dom-kit.js';
import { tracker } from './galleon-track.js';

// What the Vesper Moth's tests share (moth.test.js: the art; moth-live.test.js: the live extras; moth-wing.test.js: the
// wingbeat's frames; moth-parts.test.js: the parts): the stand-in canvases, which keep a tracker for every canvas made so
// a baked sprite's extent can be read back, the boss's definition and look, a boss to draw live extras for, and one live
// pass read back through a tracker.
installCanvas(64);
export const canvases = [];
document.createElement = () => {
  const T = tracker();
  canvases.push({ width: 64, height: 64, getContext: () => T.ctx, T });
  return canvases.at(-1);
};
const { BOSS_DEFS } = await import('../../src/core/bosses-data.js');
const { BOSS_ART } = await import('../../src/ui/bosses/bake.js');
const { LOOKS } = await import('../../src/ui/looks/index.js');

const { wingFrame, POSES } = await import('../../src/ui/bosses/moth-frames.js');

export const look = LOOKS[15];
export const def = BOSS_DEFS.find((d) => d.kind === 'moth');
export const art = BOSS_ART.moth;
export const S = { def, pal: look.palette.boss, look, W: def.size.w + 120, H: def.size.h + 120, pad: 60 };
export const lit = (calls) => calls.filter(([k]) => ['fill', 'fillRect', 'stroke', 'drawImage'].includes(k)).length;
export const HUD = -158; // the boss rests at 260 and the HUD ends at 96: this is the highest anything may reach, in boss coordinates
export const PAD = def.size.w / 2 + 60;
export const f = (n) => Math.round(n);

export const boss = (phase) => ({ x: 0, y: 0, phase, parts: def.parts.map((p) => ({ ...p, x: p.dx, y: p.dy, max: p.hp })) });
export const without = (b, ...ids) => ({ ...b, parts: b.parts.map((p) => (ids.includes(p.id) ? { ...p, hp: 0 } : p)) });
// One live pass: every drawImage, from a context standing, as the game's does, in 'lighter'.
export function pass(b, t, own = false, since = 0) {
  const T = tracker();
  T.ctx.globalCompositeOperation = 'lighter';
  art.live(T.ctx, b, t, 1, own, since);
  return { ...T, after: T.ctx.globalCompositeOperation };
}
export const count = (calls, img) => calls.filter((c) => c.img === img).length;
export const sweepT = (b, own, fn) => { for (let t = 3; t < 40; t += 0.29) fn(pass(b, t, own, 0), t); };

// The wing frames' canvases (bodies, lights), the calls that drew any of a list of sprites, and a boss run to a steady state.
export const bodies = () => Array.from({ length: POSES - 1 }, (_, i) => wingFrame(i + 1).body);
export const lightFrames = () => Array.from({ length: POSES - 1 }, (_, i) => wingFrame(i + 1).lights);
export const drawn = (calls, imgs) => calls.filter((c) => imgs.includes(c.img));
export const settle = (b, phase, from = 3, to = 8) => { for (let t = from; t < to; t += 1 / 30) { b.phase = phase; pass(b, t, true); } return to; };
