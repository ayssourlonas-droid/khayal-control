// The Vesper Moth's abdomen (World 16, Glass Cathedral; see moth.js): a weak part 130 x 96, a tapering tube seen from
// above, built of five bands of carved stone, dark and backlit, each ringed like a tube (its edges bow down at the
// middle), its top edge rim-lit by the dawn and its lower edge cut in pointed gothic cusps; between two bands the light
// of the dawn shines through a slit of white-hot glass (the weak colour: the abdomen glows between its bands). The
// tube ends in a tip of glass scales, and a ruff of fur hides its join with the thorax. The lights are the slits' light
// (three strokes in the weak colour) and a halo; SLITS (the slits' centres) and sag are shared with the live breathing of the slits (moth-light.js).
import { path, line, lin, rgba, shade, bloom } from './kit.js';
import { LEAD, STONE, STONE_M, WEAK, GOLD, AMBER, ROSE, VIOLET } from './moth-kit.js';
import { tuft, shard } from './moth-fur.js';

const HW = [[-48, 46], [-38, 51], [-22, 51], [-6, 46], [10, 38], [24, 28], [35, 19], [43, 10], [48, 4]]; // half width by y
export const BANDS = 5;
export const TOP = -47;
const PITCH = 18.6;
const H = 12; // a band's height; the rest of the pitch is the slit
export const SLITS = Array.from({ length: BANDS - 1 }, (_, k) => TOP + (k + 1) * PITCH - (PITCH - H) / 2 + 1);
const SAG = 6;

export function halfWidth(y) {
  const i = HW.findIndex(([yy]) => yy >= y);
  if (i < 0) return HW[HW.length - 1][1];
  if (i === 0) return HW[0][1];
  const [[y0, w0], [y1, w1]] = [HW[i - 1], HW[i]];
  return w0 + ((w1 - w0) * (y - y0)) / (y1 - y0);
}
export const sag = (x, hw) => SAG * (1 - (x / hw) ** 2);

// A ring edge at height y from left to right: its points.
export function ring(y, n = 16, scallop = 0) {
  const hw = halfWidth(y);
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = -hw + (2 * hw * i) / n;
    const u = ((i / n) * 7) % 1;
    return [x, y + sag(x, hw) + scallop * Math.max(0, 1 - Math.abs(2 * u - 1)) ** 0.7];
  });
}
const trace = (g, pts, first = true) => pts.forEach(([x, y], i) => g[i || !first ? 'lineTo' : 'moveTo'](x, y));

function silhouette(g, grow = 0) {
  g.beginPath();
  trace(g, ring(TOP, 16));
  for (let y = TOP; y <= 48; y += 4) g.lineTo(halfWidth(y) + grow, y);
  g.lineTo(0, 54 + grow);
  for (let y = 48; y >= TOP; y -= 4) g.lineTo(-halfWidth(y) - grow, y);
  g.closePath();
}

function band(b, k) {
  const [y0, y1] = [TOP + k * PITCH, TOP + k * PITCH + H];
  const hw = halfWidth((y0 + y1) / 2);
  const shape = () => {
    b.beginPath();
    trace(b, ring(y0, 16));
    trace(b, ring(y1, 28, 3.4).toReversed(), false);
    b.closePath();
  };
  shape();
  b.fillStyle = LEAD;
  b.fill();
  b.save();
  b.beginPath();
  trace(b, ring(y0 + 1.4, 16));
  trace(b, ring(y1 - 0.6, 28, 2.8).toReversed(), false);
  b.closePath();
  b.clip();
  b.fillStyle = lin(b, -hw, 0, hw, 0, [[0, shade(STONE, -0.3)], [0.2, STONE], [0.46, shade(STONE_M, 0.04)], [0.8, STONE], [1, shade(STONE, -0.35)]]);
  b.fillRect(-hw - 3, y0, hw * 2 + 6, H + 12);
  b.fillStyle = lin(b, 0, y0, 0, y1 + SAG, [[0, 'rgba(255,200,240,0.2)'], [0.3, 'rgba(255,255,255,0)'], [1, 'rgba(0,0,20,0.4)']]);
  b.fillRect(-hw - 3, y0, hw * 2 + 6, H + 12);
  b.beginPath(); // the carved lines of fur across the band
  for (let x = -hw + 5; x < hw - 3; x += 4.6) {
    const yy = y0 + sag(x, hw) + 2.4;
    b.moveTo(x, yy);
    b.quadraticCurveTo(x + 1.4, yy + H * 0.45, x - 1.4, yy + H - 1.5);
  }
  line(b, rgba('#0f0a26', 0.34), 0.8);
  b.beginPath();
  for (let x = -hw + 7; x < hw - 5; x += 9.2) {
    const yy = y0 + sag(x, hw) + 3.4;
    b.moveTo(x, yy);
    b.quadraticCurveTo(x + 1.4, yy + H * 0.4, x - 1.4, yy + H - 3);
  }
  line(b, rgba('#e8d8ff', 0.1), 0.8);
  path(b, [[-hw * 0.62, y0 + sag(-hw * 0.62, hw) + 4.6], [-hw * 0.2, y0 + sag(-hw * 0.2, hw) + 3.6]], true); // a streak of the dawn on the stone
  line(b, rgba('#ffffff', 0.24), 2);
  b.restore();
  b.beginPath();
  trace(b, ring(y0 + 1.1, 16));
  line(b, rgba('#f6d890', 0.85), 1.4); // the gilt ridge along its top, lit by the dawn
  b.beginPath();
  trace(b, ring(y1, 28, 3.4));
  line(b, rgba(LEAD, 0.9), 1.4);
}

export function tail(b, l) {
  silhouette(b, 1.8);
  b.fillStyle = LEAD;
  b.fill();
  silhouette(b);
  b.fillStyle = lin(b, 0, TOP, 0, 54, [[0, '#fff6d8'], [0.5, WEAK], [1, GOLD]]); // the dawn's glass behind the bands
  b.fill();
  for (let k = 0; k < BANDS; k++) band(b, k);
  const tip = [[-9, 0.55, ROSE], [9, -0.55, VIOLET], [0, 0, AMBER]]; // the tip: scales of glass
  tip.forEach(([x, a, c], i) => {
    b.save();
    b.translate(x * 0.6, 43 + i * 0.5);
    b.rotate(Math.PI / 2 + a * 0.6);
    shard(b, i === 2 ? 20 : 15, i === 2 ? 9 : 7, c);
    b.restore();
  });
  for (const s of [-1, 1]) { // fur along the flanks, a lock at each band
    for (let k = 0; k < BANDS; k++) {
      const y = TOP + k * PITCH + 7;
      tuft(b, s * (halfWidth(y) - 3), y + 2, Math.PI / 2 - s * (1.1 - k * 0.12), 21 - k * 1.5, 12, 0.7 - k * 0.1, k % 2 ? STONE_M : STONE, s * 2);
    }
  }
  [-48, -38, -28, -18, -9, 0, 9, 18, 28, 38, 48].forEach((x, i) => tuft(b, x, TOP - 2 + Math.abs(x) * 0.1, Math.PI / 2 + (x / 50) * 0.8, 17 + (i % 2) * 4, 11, 0.85, i % 2 ? STONE_M : STONE, -x * 0.03));
  for (const y of SLITS) {
    path(l, ring(y, 16), true);
    line(l, rgba(GOLD, 0.24), 12);
    line(l, rgba(WEAK, 0.5), 6);
    line(l, rgba('#fff6d8', 0.9), 2.4);
    bloom(l, 0, y + SAG, 38, GOLD, 0.16);
  }
  bloom(l, 0, 6, 84, WEAK, 0.14);
}
