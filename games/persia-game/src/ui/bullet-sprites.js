// Cached bullet sprites. Every enemy bullet has a dark rim and a bright core so it reads on any sky
// (spec); the colour between is the world's enemy colour. Glow is a separate additive sprite.
import { cached, rgba, lin } from './sprites.js';

// The cabinet's zigzag shot in 4 px blocks, two frames; outlined in the rim colour.
const ZIG = [
  ['.x.', 'x..', '.x.', '..x', '.x.', 'x..', '.x.'],
  ['.x.', '..x', '.x.', 'x..', '.x.', '..x', '.x.'],
];
const zigzag = (color, rim, frame) => cached(`zig${color}${rim}${frame}`, 20, 36, (g) => {
  const rows = ZIG[frame];
  for (const [pad, fill] of [[2, rim], [0, color]]) {
    g.fillStyle = fill;
    rows.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === 'x') g.fillRect(4 + x * 4 - pad, 4 + y * 4 - pad, 4 + pad * 2, 4 + pad * 2);
    }));
  }
  g.fillStyle = '#ffffff';
  rows.forEach((row, y) => { const x = row.indexOf('x'); g.fillRect(5 + x * 4, 5 + y * 4, 2, 2); });
});

// Every enemy bullet sprite of a look, baked on its first frame and then plain property reads:
// drawBullets asks once per bullet per frame. Lasers (strip) are drawn by lasers-view.js.
const kits = new WeakMap();
export function bulletKit(look) {
  let k = kits.get(look);
  if (!k) {
    const { enemy: c, enemyRim: rim } = look.palette;
    k = { zig: [zigzag(c, rim, 0), zigzag(c, rim, 1)] };
    kits.set(look, k);
  }
  return k;
}

// A horizontal cross-section of a beam (transparent edges, colour, white centre): stretch it.
export const strip = (color) => cached('strip' + color, 64, 4, (g, w, h) => {
  g.fillStyle = lin(g, 0, 0, w, 0, [
    [0, rgba(color, 0)], [0.25, rgba(color, 0.35)], [0.4, rgba(color, 0.95)], [0.5, '#ffffff'],
    [0.6, rgba(color, 0.95)], [0.75, rgba(color, 0.35)], [1, rgba(color, 0)],
  ]);
  g.fillRect(0, 0, w, h);
});
