// World 13, Sunset Armada, the balloon gun-pod's envelope (see w13-3.js): red canvas gores with two cream
// bands, stitched seams, patches, a net over the crown and a pennant on its brass cap. The burner lights
// the cloth from inside.
import { path, ink, rad, rgba, shade, bloom, gloss, line, ellipse, INK } from './kit.js';
import { BRASS, HOT, CANVAS, brass, stitches, patch, sunlit, sun } from './w13-kit.js';

// The envelope: a round crown narrowing to a throat.
function envelope(g) {
  g.beginPath();
  g.moveTo(0, -43);
  g.bezierCurveTo(16, -43, 28, -32, 28, -18);
  g.bezierCurveTo(28, -6, 14, 0, 6, 3);
  g.lineTo(-6, 3);
  g.bezierCurveTo(-14, 0, -28, -6, -28, -18);
  g.bezierCurveTo(-28, -32, -16, -43, 0, -43);
  g.closePath();
}

// Gore seam k (-3..3) from the crown to the throat: bezier control points for it, forward and back.
const seam = (g, k) => g.bezierCurveTo(k * 10.5, -38, k * 10.5, -6, k * 1.9, 3);
const seamBack = (g, k) => g.bezierCurveTo(k * 10.5, -6, k * 10.5, -38, 0, -43);

// The cloth: red gores, two cream bands, stitched seams, patches and the net over the crown.
export function cloth(b, l, f, c) {
  const k = f ? 1.015 : 0.985; // the envelope breathes with the beat, about its throat
  b.save();
  b.translate(0, 3);
  b.scale(k, 2 - k);
  b.translate(0, -3);
  envelope(b);
  ink(b, rad(b, 0, -18, 2, 38, [[0, shade(c, 0.4)], [0.45, c], [1, shade(c, -0.55)]], -9, -28), 3);
  b.save();
  envelope(b);
  b.clip();
  for (const j of [-3, -1, 1]) { // every other gore a little darker
    b.beginPath();
    b.moveTo(0, -43);
    seam(b, j);
    seamBack(b, j + 1);
    b.fillStyle = rgba('#3a0a10', 0.14);
    b.fill();
  }
  for (const [y0, y1] of [[-27, -21], [-10, -5]]) { // cream bands, curved like the cloth they lie on
    b.beginPath();
    b.moveTo(-30, y0);
    b.quadraticCurveTo(0, y0 + 6, 30, y0);
    b.lineTo(30, y1);
    b.quadraticCurveTo(0, y1 + 6, -30, y1);
    b.closePath();
    b.fillStyle = CANVAS;
    b.fill();
    b.strokeStyle = rgba('#5a2a10', 0.5);
    b.lineWidth = 0.9;
    b.stroke();
  }
  for (let j = -3; j <= 3; j++) { // the seams, with a light edge beside each
    b.beginPath();
    b.moveTo(0, -43);
    seam(b, j);
    line(b, rgba('#2a0810', 0.5), 1.2);
    b.translate(1, 0);
    b.beginPath();
    b.moveTo(0, -43);
    seam(b, j);
    line(b, rgba('#ffffff', 0.18), 0.8);
    b.translate(-1, 0);
  }
  b.save();
  b.beginPath();
  b.rect(-40, -46, 80, 22);
  b.clip();
  b.beginPath(); // the net that holds the crown
  for (let x = -60; x <= 60; x += 10) {
    b.moveTo(x, -46);
    b.lineTo(x + 24, -24);
    b.moveTo(x, -46);
    b.lineTo(x - 24, -24);
  }
  line(b, rgba('#ffe2a8', 0.55), 0.9);
  b.restore();
  patch(b, -14, -34, 10, 8, 0.3, shade(c, -0.28), '#f1d596'); // patches, and a tear sewn up
  patch(b, 15, -2.4, 8, 6.4, -0.2, shade(CANVAS, -0.12));
  stitches(b, 5, -33, 9, -25, '#f1d596', 2.6, 2);
  sun(b, 0, -15.5, 3.4, rgba('#6a2010', 0.85)); // the fleet's mark on the band
  sunlit(b, -14, 4, 0.5);
  b.restore();
  gloss(b, -12, -30, 7.6, 3.6, 0.5, -0.7);
  b.restore();
  ellipse(b, 0, -43, 5, 2); // the crown's brass cap and a pennant on its pole
  ink(b, brass(b, -5, 5), 1.5);
  path(b, [[0, -44], [0, -46]], true);
  line(b, INK, 2.2);
  line(b, BRASS, 0.9);
  b.beginPath();
  b.moveTo(0.4, -46.2);
  b.quadraticCurveTo(5, -46.6 + f * 1.2, f ? 8.6 : 9.6, f ? -43.6 : -45.4);
  b.quadraticCurveTo(5, -43.8, 0.4, -43.4);
  b.closePath();
  ink(b, '#ff7a4a', 1.4);
  bloom(l, 0, -4, 20, HOT, 0.16 + f * 0.06); // the burner lights the cloth from inside
}
