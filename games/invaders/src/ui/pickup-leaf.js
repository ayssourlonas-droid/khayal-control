// The pickup capsule's rim in Ash to Air (pickup-skins.js FRAMES[17]): a wreath of fourteen fresh green leaves round the
// dark middle, over a thin ring of deep green. The leaves come in two layers, seven long dark ones underneath and seven
// shorter bright ones laid over the gaps between them (two greens up top, one below), every one leaning a little the same
// way like a wreath wound round. Each leaf is a pointed blade lit from the top left whatever way it points (its gradient is
// turned into the leaf's own frame), darkest at the stem, with a light rim just inside the ink outline, a midrib and three
// pairs of side veins in the power's colour, so the power still reads at a glance, and a dew glint. A thin ring of the
// power's colour runs round the dark middle. Everything is baked once into the 60 x 60 sprite (pickups-view.js).
import { INK, rgba, shade, mix, lin, hash2 } from './sprites.js';
import { TAU } from '../core/math.js';

const N = 14;
const LEAN = 0.38; // radians each leaf leans toward the next
const BASE = 14.6; // radius the stems sit at, under the dark middle
const LIGHT = [-0.62, -0.78]; // toward the light, in the sprite's own frame
const LOWER = { len: 14.2, wid: 4.9, tones: ['#2f9a55'] };
const UPPER = { len: 13, wid: 4.5, tones: ['#58c862', '#8ddf7c'] };

// The blade, pointing along +x from its stem at the origin: two cubic sides meeting in a point.
function blade(g, len, wid) {
  g.beginPath();
  g.moveTo(0, 0);
  g.bezierCurveTo(len * 0.14, -wid * 1.3, len * 0.6, -wid * 1.18, len, 0);
  g.bezierCurveTo(len * 0.6, wid * 1.18, len * 0.14, wid * 1.3, 0, 0);
  g.closePath();
}

// One leaf at angle `a` round the wreath: `spec` its size and greens, `i` its place in the round, `color` the power's.
function leaf(g, a, spec, i, color) {
  const { len, wid } = spec;
  const base = shade(spec.tones[i % spec.tones.length], (hash2(i, spec.len) - 0.5) * 0.16); // each leaf a shade of its own
  const th = a + LEAN;
  const [lx, ly] = [LIGHT[0] * Math.cos(th) + LIGHT[1] * Math.sin(th), -LIGHT[0] * Math.sin(th) + LIGHT[1] * Math.cos(th)];
  const mid = len * 0.45;
  g.save();
  g.rotate(a);
  g.translate(BASE, 0);
  g.rotate(LEAN);
  blade(g, len, wid);
  g.fillStyle = lin(g, mid + lx * wid, ly * wid, mid - lx * wid, -ly * wid, [[0, shade(base, 0.4)], [0.5, base], [1, shade(base, -0.5)]]);
  g.fill();
  g.fillStyle = lin(g, 0, 0, len * 0.5, 0, [[0, rgba(INK, 0.5)], [1, rgba(INK, 0)]]); // darkest at the stem
  g.fill();
  g.lineWidth = 1.5;
  g.lineJoin = 'round';
  g.strokeStyle = INK;
  g.stroke();
  g.save();
  g.clip();
  g.lineWidth = 2;
  g.strokeStyle = rgba('#e4ffd0', 0.55);
  g.stroke();
  g.restore();
  const vein = mix(color, '#ffffff', 0.3);
  g.beginPath();
  g.moveTo(len * 0.04, 0);
  g.lineTo(len * 0.9, 0);
  g.lineWidth = 1.1;
  g.strokeStyle = rgba(vein, 0.95);
  g.stroke();
  g.beginPath();
  for (const f of [0.26, 0.45, 0.64]) {
    for (const s of [-1, 1]) {
      g.moveTo(len * f, 0);
      g.lineTo(len * (f + 0.17), s * wid * 0.62);
    }
  }
  g.lineWidth = 0.7;
  g.strokeStyle = rgba(vein, 0.5);
  g.stroke();
  g.fillStyle = rgba('#ffffff', 0.85); // a bead of dew
  g.beginPath();
  g.ellipse(len * 0.62, ly * wid * 0.4, 0.9, 0.6, 0, 0, TAU);
  g.fill();
  g.restore();
}

export function leaves(g, color) {
  g.save();
  g.lineWidth = 10.6; // the deep ring the leaves lie on
  g.strokeStyle = INK;
  g.beginPath();
  g.arc(0, 0, 21.4, 0, TAU);
  g.stroke();
  g.lineWidth = 8;
  g.strokeStyle = '#15402a';
  g.stroke();
  for (let k = 0; k < N / 2; k++) leaf(g, (k * 2 * TAU) / N - Math.PI / 2, LOWER, k, color);
  for (let k = 0; k < N / 2; k++) leaf(g, ((k * 2 + 1) * TAU) / N - Math.PI / 2, UPPER, k, color);
  g.fillStyle = 'rgba(8,10,20,0.94)'; // the dark middle, over the stems
  g.beginPath();
  g.arc(0, 0, 17.4, 0, TAU);
  g.fill();
  g.lineWidth = 2.6;
  g.strokeStyle = INK;
  g.stroke();
  g.lineWidth = 1.5;
  g.strokeStyle = rgba(color, 0.9); // the thread of the power's colour
  g.beginPath();
  g.arc(0, 0, 16.2, 0, TAU);
  g.stroke();
  g.restore();
}
