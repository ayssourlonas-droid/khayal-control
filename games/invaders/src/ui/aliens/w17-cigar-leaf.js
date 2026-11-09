// World 17, Ash to Air, the armored's armour (w17-cigar.js): the cigar's wrapper leaf as overlapping scales, like the
// plates of a pangolin, each a pointed leaf with its midrib and side veins, shingled toward the fire so every upper
// row lies over the next one down. They are laid round a cylinder: the scales at the edge are narrow, the ones facing
// us wide, and each has its own brown. The shading of the whole barrel goes over them afterwards (w17-cigar.js).
import { lin, rgba, mix, shade, hash, lerp } from './w17-kit.js';

const LEAF = '#744522';
const STEP = 0.86; // the angle one scale takes round the barrel, radians

// One pointed leaf at (x, y): half-width w, from its covered top (y - 6.6) to its tip (y + 6.4).
function leaf(b, x, y, w, tone, side) {
  b.beginPath();
  b.moveTo(x, y - 6.6);
  b.bezierCurveTo(x + w * 1.15, y - 5.2, x + w * 1.05, y + 0.6, x + side * 0.3, y + 6.4);
  b.bezierCurveTo(x - w * 1.05, y + 0.6, x - w * 1.15, y - 5.2, x, y - 6.6);
  b.closePath();
  b.fillStyle = lin(b, 0, y - 6.6, 0, y + 6.4, [[0, shade(tone, -0.55)], [0.3, shade(tone, -0.08)], [0.62, shade(tone, 0.1)], [1, shade(tone, -0.4)]]);
  b.fill();
  b.save();
  b.clip();
  b.beginPath(); // the midrib and its side veins
  b.moveTo(x, y - 2);
  b.lineTo(x + side * 0.3, y + 5.6);
  for (const m of [-1, 1]) {
    for (let v = 0; v < 2; v++) {
      b.moveTo(x, y + 0.4 + v * 2.2);
      b.lineTo(x + m * w * 0.85, y + 2.2 + v * 2.2);
    }
  }
  b.strokeStyle = rgba(shade(tone, -0.62), 0.45);
  b.lineWidth = 0.7;
  b.stroke();
  b.beginPath();
  b.moveTo(x - 0.5, y - 1);
  b.lineTo(x - 0.5 + side * 0.3, y + 5);
  b.strokeStyle = rgba(shade(tone, 0.5), 0.35);
  b.stroke();
  b.fillStyle = rgba('#ffe2b0', 0.2); // the sheen on the lit side of each leaf
  b.beginPath();
  b.ellipse(x - w * 0.42, y + 1.4, w * 0.22, 2.6, 0.2, 0, Math.PI * 2);
  b.fill();
  b.restore();
  b.beginPath();
  b.moveTo(x, y - 6.6);
  b.bezierCurveTo(x + w * 1.15, y - 5.2, x + w * 1.05, y + 0.6, x + side * 0.3, y + 6.4);
  b.bezierCurveTo(x - w * 1.05, y + 0.6, x - w * 1.15, y - 5.2, x, y - 6.6);
  b.strokeStyle = rgba('#120803', 0.85);
  b.lineWidth = 1;
  b.stroke();
  b.beginPath(); // a lit lip along the upper-left edge, just inside the outline
  b.moveTo(x - w * 0.95, y - 1.6);
  b.quadraticCurveTo(x - w * 0.8, y + 3.2, x + side * 0.3 - 0.4, y + 5.4);
  b.strokeStyle = rgba('#ffd9a0', 0.4);
  b.lineWidth = 0.8;
  b.stroke();
}

// Rows from y0 to y1 (n of them), the lowest laid first; hw(y) is the barrel's half-width there.
export function scales(b, hw, y0, y1, n) {
  for (let r = n - 1; r >= 0; r--) {
    const y = lerp(y0, y1, r / (n - 1));
    const R = hw(y);
    for (let j = -3; j <= 3; j++) {
      const th = (j + (r % 2) * 0.5) * STEP;
      if (Math.abs(th) > 1.42) continue;
      const w = Math.max(1.8, R * STEP * 0.64 * Math.cos(th));
      const k = hash(r * 13 + j + 40);
      const tone = mix(LEAF, k > 0.5 ? '#b27a3a' : '#4a2a12', 0.12 + hash(r * 7 + j + 90) * 0.4);
      leaf(b, R * Math.sin(th), y, w, tone, Math.sin(th));
    }
  }
}
