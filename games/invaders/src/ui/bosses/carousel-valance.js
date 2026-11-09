// What hangs from the Grand Carousel's eave (World 14, Ember Carnival; see carousel.js): a gilt moulding round
// the rim studded with marquee bulbs (they chase, live: carousel-fx.js), under it a valance of scalloped
// panels in cream and magenta with a gilt fringe and a tassel at every joint. Baked into the hull. The panels
// are spaced by angle round the rim, so they narrow toward the ends the way a drum seen from the side does.
import { line, lin, rgba, shade } from './kit.js';
import { R, eaveY } from './carousel-canopy.js';
import { GILT, GILT_D, GILT_L, STRIPE, STRIPE_D, CREAM, CREAM_D, INK, giltV, bulb, stud, tassel } from './carousel-kit.js';

const PANELS = 20;
const DROP = 17; // px a panel hangs below the moulding at its sides
const BELLY = 7; // and how far its scalloped lower edge swells below that
const MOULD = 6;

// Where the rim's bulbs sit: M of them across the front of the eave, evenly in angle.
const M = 21;
export const BULBS = Array.from({ length: M }, (_, i) => {
  const a = -1.42 + (2.84 * i) / (M - 1);
  const x = R * Math.sin(a);
  return { x, y: eaveY(x) + MOULD / 2, i };
});

const angle = (i) => -Math.PI / 2 + (Math.PI * i) / PANELS;
const ax = (i) => R * Math.sin(angle(i));

function moulding(b) {
  const top = [];
  for (let i = 0; i <= 40; i++) {
    const x = -R + (2 * R * i) / 40;
    top.push([x, eaveY(x)]);
  }
  b.beginPath();
  top.forEach(([x, y], k) => b[k ? 'lineTo' : 'moveTo'](x, y));
  top.toReversed().forEach(([x, y]) => b.lineTo(x, y + MOULD));
  b.closePath();
  b.fillStyle = giltV(b, -70, -56);
  b.fill();
  line(b, INK, 2.8);
  b.beginPath(); // a bright lip along the top
  top.forEach(([x, y], k) => b[k ? 'lineTo' : 'moveTo'](x, y + 0.9));
  line(b, rgba(GILT_L, 0.75), 1);
}

function panel(b, i) {
  const [x0, x1] = [ax(i), ax(i + 1)];
  const [y0, y1] = [eaveY(x0) + MOULD - 1, eaveY(x1) + MOULD - 1];
  const [d0, d1] = [y0 + DROP, y1 + DROP];
  const rose = i % 2;
  const c = rose ? STRIPE : CREAM;
  b.beginPath();
  b.moveTo(x0, y0);
  b.lineTo(x1, y1);
  b.lineTo(x1, d1);
  b.quadraticCurveTo((x0 + x1) / 2, (d0 + d1) / 2 + BELLY * 2, x0, d0);
  b.closePath();
  b.fillStyle = lin(b, 0, y0, 0, d0 + BELLY, [[0, shade(c, -0.4)], [0.4, c], [1, shade(c, rose ? -0.2 : -0.08)]]);
  b.fill();
  line(b, INK, 2.2);
  const [mx, my] = [(x0 + x1) / 2, (d0 + d1) / 2 + BELLY * 0.55];
  b.beginPath(); // the gilt fringe along the scalloped edge, and a pin of the same colour in the panel's middle
  b.moveTo(x1, d1);
  b.quadraticCurveTo(mx, my + BELLY * 0.9, x0, d0);
  line(b, INK, 3.6);
  line(b, GILT, 2.4);
  line(b, rgba(GILT_L, 0.8), 0.8);
  if (Math.abs(x1 - x0) > 9) {
    b.beginPath();
    b.moveTo(mx, y0 + 4);
    b.lineTo(mx, my - 3);
    line(b, rgba(rose ? STRIPE_D : CREAM_D, 0.85), 1);
    stud(b, mx, my - 5, Math.min(2, Math.abs(x1 - x0) / 7), GILT_L);
  }
}

// The moulding, its bulbs (their resting glow goes on `l`), the valance and its tassels.
export function valance(b, l) {
  for (let i = 0; i < PANELS; i++) panel(b, i);
  moulding(b);
  for (const p of BULBS) bulb(b, l, p.x, p.y, 3.1, '#ffe9a0', 0.8);
  for (let i = 1; i < PANELS; i++) {
    const x = ax(i);
    if (Math.abs(x) < R * 0.97) tassel(b, x, eaveY(x) + MOULD + DROP + BELLY * 0.45, 13 - Math.abs(x) / 120, GILT);
  }
  b.beginPath(); // the canopy's lower edge, dark where the moulding meets the cloth
  for (let i = 0; i <= 40; i++) {
    const x = -R + (2 * R * i) / 40;
    b[i ? 'lineTo' : 'moveTo'](x, eaveY(x) - 0.5);
  }
  line(b, rgba(GILT_D, 0.9), 1.1);
}
