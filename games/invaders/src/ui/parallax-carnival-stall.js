// One game booth of Ember Carnival's near layer, standing on the ground at (x, NEAR): a striped awning with a
// scalloped valance, a marquee sign over it ringed with chasing bulbs and a star burning in it, the stall
// inside lit warm with its prizes in silhouette on shelves (ducks, bottles, tins, balloons by `kind`), a
// counter of striped boards. Balloons are tied to its awning's corners (the sign they leave is drawn live in
// flourish-11.js). See parallax-shapes.js for the painter contract.
import { rgba, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { PARTY, GOLD, poly, uplight, bulbRow } from './parallax-carnival-kit.js';

export const NEAR = 300; // layer y of the near layer's ground

// The prizes on the shelves, row by row: [x within the stall, y] one silhouette each.
function prizes(g, L, kind, x, wd) {
  g.fillStyle = L.color;
  for (let row = 0; row < 2; row++) {
    const y = NEAR - 78 + row * 26;
    g.fillRect(x - wd / 2 + 10, y + 12, wd - 20, 2.4); // the shelf
    for (let i = 0; i < Math.floor(wd / 26); i++) {
      const px = x - wd / 2 + 18 + i * 26;
      g.beginPath();
      if (kind === 0) { g.ellipse(px, y + 6, 7, 4.6, 0, 0, TAU); g.moveTo(px + 9, y - 1); g.arc(px + 6, y - 1, 3.2, 0, TAU); g.rect(px + 8, y - 1.6, 4, 1.8); } // a duck: body, head and bill
      else if (kind === 1) { g.rect(px - 3, y - 6, 6, 18); g.rect(px - 1.4, y - 12, 2.8, 6); } // a bottle
      else if (kind === 2) { g.rect(px - 9, y + 4, 8, 8); g.rect(px + 1, y + 4, 8, 8); g.rect(px - 4, y - 5, 8, 8); } // a pyramid of tins
      else { g.ellipse(px, y - 1, 6, 8, 0, 0, TAU); } // a balloon
      g.fill();
    }
  }
}

export function stall(g, out, rng, L, x, wd, kind) {
  const [top, eave] = [NEAR - 150, NEAR - 112];
  const body = (c, ox = 0, oy = 0) => poly(c, [[x - wd / 2 + ox, NEAR + oy], [x - wd / 2 + ox, eave + oy], [x + wd / 2 + ox, eave + oy], [x + wd / 2 + ox, NEAR + oy]]);
  g.fillStyle = rad(g, x, NEAR - 55, 4, wd * 0.62, [[0, '#ffc070'], [0.45, '#6e2456'], [1, '#1c0a30']]); // the stall inside, lit
  body(g);
  g.fill();
  prizes(g, L, kind, x, wd);
  g.fillStyle = L.color;
  g.fillRect(x - wd / 2 - 3, eave, 5, NEAR - eave); // the posts
  g.fillRect(x + wd / 2 - 2, eave, 5, NEAR - eave);
  g.fillRect(x - wd / 2, NEAR - 30, wd, 30); // the counter
  const n = Math.round(wd / 22);
  for (let i = 0; i < n; i++) { // striped boards on its front
    g.fillStyle = rgba(PARTY[i % 2 ? 0 : 1], 0.5);
    g.fillRect(x - wd / 2 + (wd * i) / n + 1, NEAR - 28, wd / n - 2, 22);
  }
  g.fillStyle = lin(g, 0, NEAR - 30, 0, NEAR - 22, [[0, rgba(GOLD, 0.8)], [1, rgba(GOLD, 0)]]);
  g.fillRect(x - wd / 2, NEAR - 30, wd, 8);
  poly(g, [[x - wd / 2 - 12, eave + 4], [x - wd / 2 + 6, top + 14], [x + wd / 2 - 6, top + 14], [x + wd / 2 + 12, eave + 4]]); // the awning
  g.fillStyle = L.color;
  g.fill();
  for (let i = 0; i < n; i++) { // stripes down the awning, a scallop under each
    const [x0, x1] = [x - wd / 2 - 12 + ((wd + 24) * i) / n, x - wd / 2 - 12 + ((wd + 24) * (i + 1)) / n];
    g.fillStyle = rgba(PARTY[i % 2 ? 0 : 3], 0.4);
    g.fillRect(x0, top + 14, x1 - x0, eave - top - 10);
    g.beginPath();
    g.arc((x0 + x1) / 2, eave + 4, (x1 - x0) / 2, 0, Math.PI);
    g.fillStyle = rgba(PARTY[i % 2 ? 0 : 3], 0.55);
    g.fill();
  }
  uplight(g, (c, ox, oy) => c.rect(x - wd / 2 - 12, top + 14, wd + 24, eave - top - 6), top + 14, eave, GOLD, 0.3);
  const [sw, sh] = [wd * 0.64, 36]; // the marquee sign
  g.fillStyle = L.color;
  g.fillRect(x - sw / 2, top - sh, sw, sh);
  g.fillStyle = lin(g, 0, top - sh, 0, top, [[0, rgba(PARTY[(kind + 1) % 5], 0.6)], [1, rgba(PARTY[(kind + 1) % 5], 0.2)]]);
  g.fillRect(x - sw / 2 + 4, top - sh + 4, sw - 8, sh - 8);
  g.fillStyle = rgba('#fff4d0', 0.95); // a star in it
  g.beginPath();
  for (let i = 0; i < 10; i++) g.lineTo(x + Math.sin((i * TAU) / 10) * (i % 2 ? 5 : 12), top - sh / 2 - Math.cos((i * TAU) / 10) * (i % 2 ? 5 : 12));
  g.fill();
  out.lights.push({ x, y: top - sh / 2, r: 70, color: PARTY[(kind + 1) % 5], mode: 'pulse', ph: rng(), a: 0.5 });
  bulbRow(g, out, x - sw / 2 + 4, top - sh + 2, x + sw / 2 - 4, top - sh + 2, Math.round(sw / 14), 1.9, PARTY, { mode: 'blink', every: 3 });
  bulbRow(g, out, x - sw / 2 + 4, top - 2, x + sw / 2 - 4, top - 2, Math.round(sw / 14), 1.9, PARTY, { mode: 'blink', every: 3, ph: 0.5 });
  out.lights.push({ x, y: NEAR - 60, r: wd * 0.75, color: '#ffb868', mode: 'steady', ph: 0, a: 0.26 });
  if (kind !== 1) out.signs.push({ balloon: true, x: x + (kind % 2 ? 1 : -1) * (wd / 2 + 8), y: eave + 2, h: 56 + rng() * 30, r: 13 + rng() * 4, k: out.signs.length });
  g.fillStyle = L.color;
}
