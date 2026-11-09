// The buildings of world 17's far skyline that are walls and windows (parallax-smog-far.js places them from its plan):
// glass slab towers, stepped art-deco towers with a spire, brick apartment blocks, and the rooftop water tank that stands on the
// blocks. Each is `kind(g, P, out, o)` with o = { x, w, top, s, tone, far }: x the left edge, w the width, top the highest point
// (spire and antennas included), s a seed, tone the wall colour, far 0..1 how far back the tower stands (a far one is flatter,
// with fewer lit windows). They stand on GROUND and run a little below it, where the terrace covers their feet. Plain fills
// in the palette's colours; the windows are batched (parallax-smog-far-kit.js).
import { rgba } from './sprites.js';
import { GROUND, poly, fade, wall, windows, seeded } from './parallax-smog-far-kit.js';

// A slanting sheen across a face: two pale bands clipped to the box, the sun's reflection in the glass.
function sheen(g, P, x, y, w, h, s) {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.fillStyle = rgba(P.glint, P.glintA * 0.5);
  for (const k of [0.18 + (s % 3) * 0.07, 0.62]) {
    poly(g, [[x + w * k, y], [x + w * (k + 0.1), y], [x + w * (k - 0.42), y + h], [x + w * (k - 0.52), y + h]]);
    g.fill();
  }
  g.restore();
}

// A glass slab: a crown with plant rooms and antennas, then a curtain wall of small windows with its sheen.
export function slab(g, P, out, o) {
  const { x, w, top, s, tone, far } = o;
  const [crown, h] = [16 + (s % 4) * 3, GROUND + 6 - top];
  wall(g, P, x + w * 0.14, top + 8, w * 0.72, crown, tone, far);
  wall(g, P, x, top + 8 + crown, w, h - 8 - crown, tone, far);
  g.fillStyle = tone; // plant rooms and antenna pins on the crown
  g.fillRect(x + w * 0.22, top + 3, w * 0.22, 6);
  g.fillRect(x + w * 0.62, top + 5, w * 0.12, 4);
  g.fillStyle = rgba(P.steel, 0.85);
  g.fillRect(x + w * 0.7, top, 1.2, 12);
  g.fillRect(x + w * 0.33, top - 1, 1, 9);
  windows(g, P, out, x + 3, top + 14 + crown, w - 6, h - 20 - crown, { cw: 4, ch: 6, gx: 3, gy: 4, seed: s, lit: far ? 0.025 : 0.06 });
  sheen(g, P, x, top + 8 + crown, w, h - 8 - crown, s);
}

// A stepped art-deco tower: four setbacks, each with pilasters and slit windows between them, corner fins on the last, and a
// needle of a spire with a ball.
export function deco(g, P, out, o) {
  const { x, w, top, s, tone, far } = o;
  const h = GROUND + 6 - top;
  const [cx, spire] = [x + w / 2, Math.min(40, w * 0.45)];
  const body = h - spire;
  const tiers = [[1, 0.46], [0.8, 0.26], [0.6, 0.17], [0.4, 0.11]];
  let y = GROUND + 6;
  tiers.forEach(([k, share], i) => {
    const [tw, th] = [w * k, body * share];
    y -= th;
    wall(g, P, cx - tw / 2, y, tw, th + 1, tone, far);
    g.fillStyle = rgba(P.edge, P.edgeA * 0.2); // pilasters
    for (let px = cx - tw / 2 + 5; px < cx + tw / 2 - 3; px += 7) g.fillRect(px, y + 2, 1.2, th - 2);
    if (th > 14) windows(g, P, out, cx - tw / 2 + 4, y + 5, tw - 8, th - 8, { cw: 2.4, ch: 6, gx: 4.6, gy: 5, seed: s + i, lit: far ? 0.02 : 0.07 });
    g.fillStyle = rgba(P.top, P.edgeA * 0.5); // the ledge of the setback catches the light
    g.fillRect(cx - tw / 2 - 1.5, y - 1, tw + 3, 2.2);
  });
  const tw = w * 0.4;
  g.fillStyle = tone;
  for (const side of [-1, 1]) g.fillRect(cx + side * (tw / 2 - 1.5) - 1.5, y - 9, 3, 10); // corner fins
  poly(g, [[cx - tw * 0.22, y], [cx - 1.4, y - spire], [cx + 1.4, y - spire], [cx + tw * 0.22, y]]);
  g.fill();
  g.beginPath();
  g.arc(cx, y - spire - 1.5, 2.4, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = rgba(P.top, P.edgeA * 0.8);
  g.fillRect(cx + 0.2, y - spire + 2, 1, spire - 4);
}

// A rooftop water tank on legs: a barrel with hoops under a conical roof, base at (x, y).
export function tank(g, P, x, y, s) {
  const [w, h] = [14 + (s % 3) * 3, 16 + (s % 2) * 4];
  g.fillStyle = P.steel;
  for (const lx of [0.08, 0.34, 0.62, 0.9]) g.fillRect(x + w * lx, y - 6, 1.2, 6);
  g.fillStyle = P.roofHi;
  g.fillRect(x, y - 6 - h, w, h);
  fade(g, x, y - 6 - h, w, h, [[0, rgba(P.shadeL, 0.5)], [0.5, rgba(P.shadeL, 0)], [1, rgba(P.edge, P.edgeA * 0.5)]], true);
  g.fillStyle = rgba(P.steel, 0.7);
  for (const k of [0.25, 0.6, 0.85]) g.fillRect(x, y - 6 - h * k, w, 1);
  g.fillStyle = P.steel;
  poly(g, [[x - 1.5, y - 6 - h], [x + w / 2, y - 12 - h - 6], [x + w + 1.5, y - 6 - h]]);
  g.fill();
}

// A brick apartment block: a cornice, rows of tiny windows, chimney stacks and a water tank on the roof, a drainpipe down one end.
export function block(g, P, out, o) {
  const { x, w, top, s, tone, far } = o;
  const [r, h] = [seeded(s), GROUND + 6 - top];
  const roofY = top + (s % 2 ? 12 : 0);
  wall(g, P, x, roofY, w, h - (roofY - top), tone, far);
  g.fillStyle = rgba(P.brick, 0.4); // the brick's warmth
  g.fillRect(x, roofY, w, h);
  g.fillStyle = tone;
  g.fillRect(x - 1.5, roofY - 2.5, w + 3, 4);
  g.fillStyle = rgba(P.top, P.edgeA * 0.6);
  g.fillRect(x - 1.5, roofY - 2.5, w + 3, 1.2);
  for (let k = 0; k < 1 + (r() < 0.5 ? 1 : 0); k++) { // chimney stacks
    const cx = x + 5 + r() * (w - 14);
    g.fillStyle = tone;
    g.fillRect(cx, roofY - 12, 5, 11);
    g.fillRect(cx - 1, roofY - 13.5, 7, 2.5);
    g.fillStyle = rgba(P.edge, P.edgeA * 0.5);
    g.fillRect(cx + 4, roofY - 12, 1, 11);
  }
  if (s % 3 === 0 && w > 60) tank(g, P, x + w * (0.3 + r() * 0.35), roofY - 2.5, s);
  windows(g, P, out, x + 4, roofY + 6, w - 8, h - (roofY - top) - 10, { cw: 3, ch: 5, gx: 5, gy: 6, seed: s + 40, lit: far ? 0.02 : 0.07 });
  g.fillStyle = rgba(P.steel, 0.6);
  g.fillRect(x + (s % 2 ? 2 : w - 3.5), roofY, 1.4, h - (roofY - top)); // drainpipe
}
