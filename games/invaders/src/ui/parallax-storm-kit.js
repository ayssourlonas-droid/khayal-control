// What the storm's three parallax layers share (parallax-storm.js, -anvil, -mid, -near): the sun's place in a layer, a canvas of its own to
// paint a cloud on, and slanted veils of rain. The clouds themselves are painted by parallax-storm-field.js.
import { makeCanvas, rgba } from './sprites.js';
import { SUN } from './sky-bodies-10-kit.js';

const MARGIN = 160; // parallax.js's: a layer is this much wider than the frame on each side (not imported: parallax.js imports the painters)
export const SUN_X = SUN.x + MARGIN; // the sun's x in a layer

export function offscreen(w, h) {
  const c = makeCanvas(w, h);
  return [c, c.getContext('2d')];
}

// Slanted veils of rain from (x, y) down `len` px, `n` of them `w` px wide spread over `span`, translucent and gone at both ends, blurred so
// none has an edge (drawn on a canvas of their own, then laid on g with a blur).
export function veils(target, rng, x, y, span, len, n, w, color, a, lean = 0.14) {
  const [c, g] = offscreen(target.canvas.width, target.canvas.height);
  for (let i = 0; i < n; i++) {
    const vx = x + (i + rng() * 0.6) * (span / n);
    const vw = w * (0.6 + 0.8 * rng());
    const vl = len * (0.7 + 0.3 * rng());
    const gr = g.createLinearGradient(vx, y, vx - lean * vl, y + vl);
    gr.addColorStop(0, rgba(color, 0));
    gr.addColorStop(0.25, rgba(color, a * (0.5 + 0.5 * rng())));
    gr.addColorStop(1, rgba(color, 0));
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(vx - vw / 2, y);
    g.lineTo(vx + vw / 2, y);
    g.lineTo(vx + vw / 2 - lean * vl, y + vl);
    g.lineTo(vx - vw / 2 - lean * vl, y + vl);
    g.fill();
  }
  target.filter = 'blur(5px)';
  target.drawImage(c, 0, 0);
  target.filter = 'none';
}
