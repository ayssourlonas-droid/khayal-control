// The landmarks of world 17's far skyline that are structures and not walls (parallax-smog-far.js places them from its plan): a
// TV mast with a blinking red lamp and a tower crane over the concrete frame of an unfinished block (the domed hall, the gasometer
// and the cooling towers are in parallax-smog-far-works-2.js). Each is `kind(g, P, out, o)` like the towers in
// parallax-smog-far-towers.js (o = { x, w, top, s, tone, far }); x is the left edge. Lattices are strokes of one or two px in
// the palette's steel, with a lit strand along the sun's side; the lamp of the mast is a light on `out` ('blink', dim).
import { rgba } from './sprites.js';
import { GROUND, lamp } from './parallax-smog-far-kit.js';

// The lattice of a tapered leg pair: from the feet (xl0, xr0 at yb) to the tops (xl1, xr1 at yt), n panels, braced in zigzag.
function lattice(g, P, xl0, xr0, xl1, xr1, yb, yt, n, lw) {
  const at = (t) => [xl0 + (xl1 - xl0) * t, xr0 + (xr1 - xr0) * t, yb + (yt - yb) * t];
  g.strokeStyle = P.steel;
  g.lineWidth = lw;
  g.beginPath();
  g.moveTo(xl0, yb);
  g.lineTo(xl1, yt);
  g.moveTo(xr0, yb);
  g.lineTo(xr1, yt);
  for (let k = 0; k < n; k++) {
    const [[a0, b0, y0], [a1, b1, y1]] = [at(k / n), at((k + 1) / n)];
    g.moveTo(a0, y0);
    g.lineTo(b0, y0);
    g.moveTo(k % 2 ? b0 : a0, y0);
    g.lineTo(k % 2 ? a1 : b1, y1);
  }
  g.stroke();
  g.strokeStyle = rgba(P.steelHi, 0.5); // the lit strand
  g.lineWidth = lw * 0.6;
  g.beginPath();
  g.moveTo(xr0 + lw * 0.4, yb);
  g.lineTo(xr1 + lw * 0.4, yt);
  g.stroke();
}

// A TV mast: a tapered lattice, two platforms with dishes, a pole, a dim steady lamp on the lower platform and the red lamp on the
// tip blinking.
export function mast(g, P, out, o) {
  const { x, w, top, s } = o;
  const [cx, yb] = [x + w / 2, GROUND + 6];
  g.save();
  const neck = top + 46;
  lattice(g, P, cx - w * 0.42, cx + w * 0.42, cx - 2.5, cx + 2.5, yb, neck, 16, 1.4);
  g.strokeStyle = P.steel;
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(cx, neck);
  g.lineTo(cx, top + 2);
  g.stroke();
  g.fillStyle = P.steel;
  for (const [t, pw] of [[0.52, 15], [0.74, 11], [0.9, 7]]) { // platforms
    const y = yb + (neck - yb) * t;
    g.fillRect(cx - pw, y - 1.4, pw * 2, 2.8);
    if (pw > 8) {
      g.beginPath();
      g.arc(cx + pw * 0.7, y - 6, 4.6, Math.PI * 0.9, Math.PI * 1.9);
      g.lineTo(cx + pw * 0.7, y - 1);
      g.fill();
    }
  }
  g.fillRect(cx - 3, top + 2 + 8, 6, 3);
  g.fillStyle = rgba('#c04030', 0.7); // the lamp's lens, dim by day and by smog
  g.fillRect(cx - 1.5, top, 3, 3);
  lamp(out, cx, top + 1.5, 16, '#ff4a36', 'blink', (s % 7) / 7, 0.55);
  lamp(out, cx, yb + (neck - yb) * 0.52, 9, '#ffb060', 'pulse', 0.3, 0.3);
  g.restore();
}

// A tower crane over the concrete frame of a block nobody finished: floors and columns, a lattice mast, a jib with a counter-jib and
// weights, tie lines from the apex, and a hook on a cable.
export function crane(g, P, out, o) {
  const { x, w, top, tone } = o;
  const [cx, yb] = [x + w * 0.3, GROUND + 6];
  const fh = 80; // the frame's height
  g.save();
  for (let k = 0; k < 4; k++) { // floor slabs
    g.fillStyle = tone;
    g.fillRect(x, yb - fh + k * (fh / 3.6), w * 0.62, 3.2);
    g.fillStyle = rgba(P.top, P.edgeA * 0.5);
    g.fillRect(x, yb - fh + k * (fh / 3.6), w * 0.62, 1);
  }
  g.fillStyle = tone;
  for (let k = 0; k < 6; k++) g.fillRect(x + 2 + k * (w * 0.62 - 6) / 5, yb - fh, 3, fh);
  lattice(g, P, cx - 6, cx + 6, cx - 5, cx + 5, yb, top + 14, 22, 1.2);
  const jy = top + 14;
  g.strokeStyle = P.steel; // jib and counter-jib: a truss of two chords and zigzag
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(cx - 44, jy);
  g.lineTo(cx + w * 1.05, jy);
  g.moveTo(cx - 44, jy + 7);
  g.lineTo(cx + w * 1.05, jy + 7);
  for (let k = cx - 44, i = 0; k < cx + w * 1.05 - 8; k += 8, i++) {
    g.moveTo(k, i % 2 ? jy : jy + 7);
    g.lineTo(k + 8, i % 2 ? jy + 7 : jy);
  }
  g.moveTo(cx - 5, jy - 12); // the A-frame apex and the ties
  g.lineTo(cx + 5, jy - 12);
  g.moveTo(cx, jy - 22);
  g.lineTo(cx, jy);
  g.moveTo(cx, jy - 22);
  g.lineTo(cx + w * 1.05, jy);
  g.moveTo(cx, jy - 22);
  g.lineTo(cx - 44, jy);
  g.stroke();
  g.fillStyle = P.steel;
  g.fillRect(cx - 44, jy + 7, 12, 9); // counterweights
  g.fillRect(cx - 30, jy + 7, 9, 7);
  g.fillRect(cx - 4, jy + 8, 8, 8); // the cab
  const hx = cx + w * 0.72;
  g.fillRect(hx - 2, jy + 7, 4, 3);
  g.strokeStyle = rgba(P.steel, 0.8);
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(hx, jy + 10);
  g.lineTo(hx, jy + 54);
  g.stroke();
  g.fillRect(hx - 2.5, jy + 54, 5, 5);
  g.fillStyle = rgba(P.steelHi, 0.5);
  g.fillRect(cx + 4, jy - 12, 1, 12);
  g.restore();
}

