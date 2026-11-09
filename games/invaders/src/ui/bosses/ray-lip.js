// The Squall Ray's cloud where a part meets it (World 18, Anvil Sky; ray-seat.js paints the rolled lips of the rift and of the mouth and the banks at the
// anvil's plinth with it). It is the body's own cloud (ray-mass.js, the same disc painter with the same colours and light), so what is painted over the
// hull melts into it instead of sitting on it. lip(g, shape, box, seed, o) paints the cloud of `shape` ((x, y) -> px inside, as paintCloud wants) over
// `box` [x, y, w, h] of the current coordinates; `o.top` is the HUD's line in those coordinates (images are cropped there), the rest overrides the style.
// ring(f, out, in) is the shape of a band round the edge of a shape f (f > 0 inside), out px outside it and in px inside; blob is an ellipse. Bake-time only.
import { paintCloud, unit } from '../parallax-storm-field.js';
import { rng } from './ray-kit.js';
import { capped } from './ray-mass.js';

const STYLE = { color: '#1c1a50', mid: '#3a3a9a', cold: '#9db4ff', glow: '#8a6cff', light: unit(-0.3, -0.95), n: 40, edge: 160, rMax: 13, rEdge: 10, lit: 0.45, pockets: 0, pocketA: 0 };

export function lip(g, shape, box, seed, o = {}) {
  const { top = -1e9, ...style } = o;
  paintCloud(capped(g, top), rng(seed), shape, box, { ...STYLE, ...style });
}

export const ring = (f, out, inn = out) => (x, y) => {
  const d = f(x, y);
  return d >= 0 ? inn - d : out + d;
};
export const blob = (cx, cy, rx, ry) => (x, y) => (1 - Math.hypot((x - cx) / rx, (y - cy) / ry)) * Math.min(rx, ry);
