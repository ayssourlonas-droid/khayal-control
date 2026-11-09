// World 18, Anvil Sky, the carrier (see w18.js): THE CARGO BALLOON, a barrage balloon carrying a prize. A fat envelope of
// cream canvas, shaded toward the dusk's violet in its lower right, with stitched gores, a rope net over it, three stitched
// patches, a rust-orange band round its middle, a pennant at the nose and two inflated tail fins; four ropes hold a crate
// beneath it (w18-balloon-pod.js) with a golden prize and a lantern. On beat 1 the crate swings the other way, the pennant
// and the fins flutter and the lantern gutters. It is the friendly one of the storm's creatures, and obviously a prize.
import { path, ink, lin, rad, rgba, shade, mix, line, both, INK, IRON_D, STEEL, scuff, gloss } from './w18-kit.js';
import { ropes, pod } from './w18-balloon-pod.js';

const [CY, RX, RY] = [-14, 31, 27]; // the envelope's centre and radii
const NET = '#5e4126';

const ring = (g) => {
  g.beginPath();
  g.ellipse(0, CY, RX, RY, 0, 0, Math.PI * 2);
};

// The point on the envelope at meridian k (-1..1, across) and angle v (0 the nose .. pi the tail).
const at = (k, v) => [k * RX * Math.sin(v), CY - RY * Math.cos(v)];

function fins(b, c, f) {
  both((s) => {
    const flap = f ? 2.4 : 0; // the tips flutter
    path(b, [[s * 20, 2], [s * 33, 6 + flap], [s * 40, 17 + flap * 1.4], [s * 32, 21 + flap], [s * 17, 11]]);
    ink(b, lin(b, s * 20, 2, s * 40, 21, [[0, shade(c, -0.1)], [1, mix(c, '#4a4a80', 0.55)]]), 2.6);
    for (const [x, y] of [[26, 9], [31, 12]]) {
      b.beginPath();
      b.moveTo(s * 20, 5);
      b.quadraticCurveTo(s * x, y + flap * 0.5, s * (x + 8), y + 9 + flap);
      line(b, rgba(INK, 0.35), 0.9);
    }
  });
}

function envelope(b, c) {
  ring(b);
  b.fillStyle = rad(b, -10, CY - 12, 2, 46, [[0, shade(c, 0.5)], [0.4, c], [0.78, mix(c, '#7a6a9a', 0.55)], [1, mix(c, '#2a2a5a', 0.7)]]);
  b.fill();
  b.save();
  ring(b);
  b.clip();
  b.fillStyle = rgba('#b0552f', 0.82); // the rust band, a little below the middle
  b.beginPath();
  b.moveTo(...at(-1, 1.5));
  b.quadraticCurveTo(0, CY + 12, ...at(1, 1.5));
  b.lineTo(...at(1, 1.82));
  b.quadraticCurveTo(0, CY + 16.4, ...at(-1, 1.82));
  b.closePath();
  b.fill();
  b.fillStyle = lin(b, -RX, 0, RX, 0, [[0, rgba('#ffffff', 0.18)], [0.5, rgba('#ffffff', 0)], [1, rgba('#000020', 0.34)]]);
  b.fillRect(-RX, CY - RY, RX * 2, RY * 2);
  for (const k of [-0.75, -0.375, 0, 0.375, 0.75]) { // gores, nose to tail
    b.beginPath();
    for (let v = 0.12; v <= Math.PI - 0.1; v += 0.2) b.lineTo(...at(k, v));
    line(b, rgba('#5a4a38', 0.32), 1);
  }
  for (const v of [0.7, 1.1, 1.5, 1.9, 2.3, 2.7]) { // the rope net's rings
    const [x, y] = at(1, v);
    b.beginPath();
    b.moveTo(-x, y);
    b.quadraticCurveTo(0, y + 4.4 * Math.sin(v), x, y);
    line(b, rgba(NET, 0.6), 1);
  }
  for (const [x, y, w, h, rot, t] of [[-14, -29, 11, 8, -0.4, '#d9c48c'], [11, -10, 9, 10, 0.3, '#c8ad7a'], [-12, 0, 8, 6, 0.2, '#e8dcb4']]) { // stitched patches
    b.save();
    b.translate(x, y);
    b.rotate(rot);
    b.beginPath();
    b.rect(-w / 2, -h / 2, w, h);
    b.fillStyle = t;
    b.fill();
    b.setLineDash([2, 1.6]);
    line(b, rgba('#4a3a28', 0.75), 0.8);
    b.setLineDash([]);
    b.restore();
  }
  scuff(b, 14, 17, 0, CY, 26, 22, 0.14);
  b.restore();
  ring(b);
  line(b, INK, 3);
  gloss(b, -12, CY - 14, 11, 7, 0.55, -0.6);
}

// The nose: an iron cap with a pennant streaming from it, rippling the other way on the other beat.
function nose(b, f) {
  b.beginPath();
  b.moveTo(0, -39);
  b.lineTo(0, -48);
  line(b, INK, 2.6);
  line(b, STEEL, 1.1);
  path(b, [[-3.4, -38], [3.4, -38], [2.4, -41.4], [-2.4, -41.4]]);
  ink(b, lin(b, -3, -41, 3, -38, [[0, STEEL], [1, IRON_D]]), 1.6);
  const w = f ? 3 : -2; // the pennant's ripple
  path(b, [[0.6, -47.4], [9 + w, -46.4], [15, -45 + w], [9 - w, -43.6], [0.6, -43]]);
  ink(b, '#e6a53a', 1.6);
}

export function carrier(b, l, f, c) {
  b.translate(0, 2); // the pennant needs the room above
  l.translate(0, 2);
  const sway = f ? 2.2 : -2.2;
  fins(b, c, f);
  ropes(b, sway);
  pod(b, l, f, sway);
  envelope(b, c);
  nose(b, f);
}
