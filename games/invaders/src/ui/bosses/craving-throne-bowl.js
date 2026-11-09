// The bowl of the Craving's throne (World 17, Ash to Air; assembled by craving-hull.js): the inside of the ashtray, behind its front rim
// and under the smoke figure, which rises out of it. A dark floor warmed from the middle by the coals, and on it a heap of grey ash with
// snubbed butts poking out of it at every angle, cream and grey, bent, burnt black at one end, a few still holding a dull coal (the
// lights carry them, dimly: the tray is the hot part). Mostly hidden by the smoke body; it shows at the two ends of the bowl, between
// the arms and the rim. Boss coordinates. Bake-time only.
import { grain, heat, line, lin, path, rad, rgba, rng, ellipse, SOOT, ASH, COAL } from './craving-pkit.js';
import { MOUTH } from './craving-throne-geo.js';

export function stub(b, l, x, y, a, len, r) { // one butt lying in the ash: grimy paper, a filter or a crumpled burnt end
  b.save();
  b.translate(x, y);
  b.rotate(a);
  const w = 6 + r() * 3.5;
  const pale = r() < 0.45;
  b.beginPath();
  b.moveTo(0, -w / 2 + r() * 1.5);
  b.lineTo(len * 0.5, -w / 2);
  b.lineTo(len, -w / 2 + 0.4);
  b.lineTo(len + 0.6, w / 2 - 0.4);
  b.lineTo(len * 0.5, w / 2);
  b.lineTo(0, w / 2 - r() * 1.5);
  b.lineTo(-1.2, r() * 2 - 1);
  b.closePath();
  b.fillStyle = lin(b, 0, -w / 2, 0, w / 2, [[0, pale ? '#a49a86' : '#7a705e'], [0.5, pale ? '#7e7565' : '#5c5345'], [1, '#26201c']]);
  b.fill();
  if (r() < 0.35) { // the filter, tan and stained
    b.fillStyle = rgba('#8c6a3c', 0.85);
    b.fillRect(len - 5, -w / 2 + 0.6, 5, w - 1.2);
  }
  b.fillStyle = lin(b, 0, 0, len * 0.5, 0, [[0, rgba(SOOT, 0.9)], [1, rgba(SOOT, 0)]]); // the burnt end and its soot
  b.fillRect(-1, -w / 2, len * 0.5, w);
  b.fillStyle = rgba(ASH[2], 0.8);
  b.fillRect(-2.2, -w * 0.3, 2.4, w * 0.6); // ash on the tip
  path(b, [[len * 0.35, -w / 2], [len * 0.4, w / 2]], true);
  line(b, rgba(SOOT, 0.5), 0.8);
  b.beginPath();
  b.moveTo(0, -w / 2);
  b.lineTo(len, -w / 2);
  line(b, rgba('#ffffff', 0.18), 0.8);
  b.restore();
  if (r() < 0.3) heat(l, x, y, 8, COAL[2], 0.24);
}

export function bowl(b, l) {
  const r = rng(101);
  b.save();
  b.beginPath();
  b.ellipse(MOUTH.cx, MOUTH.cy, MOUTH.rx, MOUTH.ry, 0, 0, Math.PI * 2);
  b.clip();
  b.fillStyle = rad(b, 0, 48, 20, 310, [[0, '#4a2214'], [0.4, '#1d1210'], [1, '#080504']]);
  b.fillRect(-MOUTH.rx, MOUTH.cy - MOUTH.ry, MOUTH.rx * 2, MOUTH.ry * 2);
  for (let i = 0; i < 46; i++) { // the heap: mounds of ash, pale on top
    const x = (r() - 0.5) * 2 * MOUTH.rx * 0.92;
    const y = MOUTH.cy + (r() - 0.35) * MOUTH.ry * 0.9;
    const [rx, ry] = [16 + r() * 22, 8 + r() * 9];
    ellipse(b, x, y, rx, ry, 0);
    b.fillStyle = rad(b, x, y, 1, rx, [[0, ASH[2]], [0.6, ASH[1]], [1, ASH[0]]], x - rx * 0.3, y - ry * 0.5);
    b.fill();
  }
  for (let i = 0; i < 26; i++) stub(b, l, (r() - 0.5) * 2 * MOUTH.rx * 0.88, MOUTH.cy + (r() - 0.4) * MOUTH.ry * 0.9, (r() - 0.5) * 3, 16 + r() * 14, r);
  b.fillStyle = lin(b, 0, MOUTH.cy - MOUTH.ry, 0, MOUTH.cy + MOUTH.ry, [[0, 'rgba(0,0,0,0.6)'], [0.5, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.1)']]);
  b.fillRect(-MOUTH.rx, MOUTH.cy - MOUTH.ry, MOUTH.rx * 2, MOUTH.ry * 2);
  grain(b, -MOUTH.rx, MOUTH.cy - MOUTH.ry, MOUTH.rx * 2, MOUTH.ry * 2, 1.3);
  b.restore();
  for (const s of [-1, 1]) heat(l, s * 200, 40, 70, COAL[1], 0.22);
}
