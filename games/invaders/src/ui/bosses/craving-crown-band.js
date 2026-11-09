// The ring-band of the Craving's crown (World 17, Ash to Air; see craving-crown.js): a belt of grey ash-clay cast round the brow, arched
// over the head (higher at the middle, running down at both ends), a brim along its top edge cut with a row of square notches like the
// teeth of a gear, two incised grooves and a rolled lower edge, grain and soot and a chip or two; in its top the sockets the cigarettes
// stand in (a dark oval, a lit lip in front of the foot). Crown coordinates (the part's centre is the origin). Bake-time only.
import { feather } from './craving-pkit-edge.js';
import { lin, line, path, rad, rgba, shade, ellipse, rng, grain, streaks, SOOT, ASH, IRON } from './craving-pkit.js';

export const BAND_W = 138;
export const topAt = (x) => 20 + 8 * (x / BAND_W) ** 2; // the brim's top edge
export const BAND_H = 19;

const edge = (f) => {
  const pts = [];
  for (let x = -BAND_W; x <= BAND_W; x += 6) pts.push([x, f(x)]);
  return pts;
};

export function band(b) {
  const top = edge(topAt);
  const bot = edge((x) => topAt(x) + BAND_H - 3 * (x / BAND_W) ** 2);
  const outline = () => {
    b.beginPath();
    top.forEach(([x, y], i) => (i ? b.lineTo(x, y) : b.moveTo(x, y)));
    for (const [x, y] of bot.toReversed()) b.lineTo(x, y);
    b.closePath();
  };
  outline();
  b.fillStyle = lin(b, 0, 20, 0, 48, [[0, ASH[2]], [0.2, ASH[1]], [0.6, IRON[3]], [1, IRON[1]]]);
  b.fill();
  b.save();
  outline();
  b.clip();
  b.fillStyle = lin(b, -BAND_W, 0, BAND_W, 0, [[0, 'rgba(8,6,5,0.6)'], [0.2, 'rgba(8,6,5,0)'], [0.8, 'rgba(8,6,5,0)'], [1, 'rgba(8,6,5,0.6)']]);
  b.fillRect(-BAND_W - 2, 16, BAND_W * 2 + 4, 36);
  grain(b, -BAND_W - 2, 16, BAND_W * 2 + 4, 36, 1.1);
  const r = rng(31);
  streaks(b, r, -BAND_W, BAND_W, 22, 48, 26, SOOT, 0.34, 0.9);
  for (const d of [5.5, 11]) { // grooves: dark line, lit lip below
    const pts = edge((x) => topAt(x) + d);
    path(b, pts, true);
    line(b, rgba(SOOT, 0.55), 1.4);
    path(b, pts.map(([x, y]) => [x, y + 1.3]), true);
    line(b, rgba('#ffffff', 0.12), 0.9);
  }
  for (let x = -BAND_W + 5; x < BAND_W - 4; x += 9) { // the notched brim
    const y = topAt(x);
    b.fillStyle = rgba(SOOT, 0.78);
    b.fillRect(x, y - 0.5, 4.4, 3.4);
    b.fillStyle = rgba('#ffffff', 0.16);
    b.fillRect(x, y + 2.9, 4.4, 0.8);
  }
  for (let i = 0; i < 3; i++) { // chips
    const x = (r() - 0.5) * BAND_W * 1.7;
    const y = topAt(x) + 2 + r() * 12;
    ellipse(b, x, y, 3 + r() * 3, 1.6 + r() * 1.4, r());
    b.fillStyle = rgba(ASH[4], 0.4);
    b.fill();
  }
  b.restore();
  path(b, top, true);
  line(b, rgba(ASH[4], 0.55), 1.4); // the lit top edge
  outline();
  line(b, SOOT, 2.2);
  feather(b, 0, 38, 0, 50, 0.6, -170, 30, 340, 40); // the underside and both ends of the band melt into the smoke of the head
  feather(b, -112, 0, -140, 0, 1, -170, 0, 70, 60);
  feather(b, 112, 0, 140, 0, 1, 100, 0, 70, 60);
}

// The socket a cigarette of width w stands in at x: the dark oval of the hole behind it.
export function socketBack(b, x, w) {
  const y = topAt(x) + 0.6;
  ellipse(b, x, y, w * 0.78 + 1.4, 4.4);
  b.fillStyle = rad(b, x, y, 1, w, [[0, '#050302'], [1, '#1a1411']]);
  b.fill();
  line(b, rgba(ASH[4], 0.32), 1);
}

// The front lip of the socket over the cigarette's foot: the band's top colour, a short rolled curve.
export function socketFront(b, x, w) {
  const y = topAt(x) + 0.6;
  b.beginPath();
  b.ellipse(x, y, w * 0.78 + 1.4, 4.4, 0, 0.12, Math.PI - 0.12);
  b.ellipse(x, y + 1.6, w * 0.78 + 0.4, 3.3, 0, Math.PI - 0.12, 0.12, true);
  b.closePath();
  b.fillStyle = shade(ASH[2], 0.04);
  b.fill();
  line(b, rgba(SOOT, 0.7), 1);
}
