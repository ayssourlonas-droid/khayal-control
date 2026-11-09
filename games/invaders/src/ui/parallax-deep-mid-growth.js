// What grows on the mid layer's sea bed besides kelp (parallax-deep-mid.js): stacks of rock furred with
// growth, glowing sea fans, brain-coral mounds and the scattered sparks of small living things. Quiet, cool
// and low: a fan's light is a dim halo, a spark a pinprick. See parallax-shapes.js for the painter contract.
import { rgba, mix } from './sprites.js';
import { TAU } from '../core/math.js';
import { lump, fur, lit, spark, seaFan, TEAL, VIOLET, ORCHID, ROSE } from './parallax-deep-kit-2.js';

// A stack of three rocks on the bed at x (w wide at the foot, h tall), furred with growth, the lit side
// toward the surface's light, a spark of something alive in a crevice.
export function stack(g, out, rng, L, x, floor, w, h) {
  const fy = floor(x);
  const parts = [
    [x, fy - h * 0.2, w * 0.5, h * 0.3],
    [x + (rng() - 0.5) * w * 0.12, fy - h * 0.52, w * 0.34, h * 0.3],
    [x + (rng() - 0.5) * w * 0.14, fy - h * 0.8, w * 0.21, h * 0.22],
  ];
  for (const p of parts) {
    g.fillStyle = L.color;
    lump(g, rng, ...p, 0.22, 8);
    g.fill();
    lit(g, ...p, L.rim, 0.2);
    fur(g, rng, ...p, 16, 11, mix(L.kelp, '#38d6b8', 0.2), 0.7);
  }
  const [cx, cy] = [x + w * 0.1, fy - h * 0.46];
  g.fillStyle = rgba('#000000', 0.6);
  g.beginPath();
  g.ellipse(cx, cy, 6, 3, 0.3, 0, TAU);
  g.fill();
  spark(g, out, rng, cx, cy, rng() < 0.5 ? TEAL : VIOLET, 11, 0.28);
}

// A brain-coral mound: a dome, its surface grooved in winding lines, dusky rose or violet.
export function brain(g, rng, L, x, fy, r, color = ROSE) {
  g.save();
  g.fillStyle = mix(L.color, color, 0.2);
  g.beginPath();
  g.ellipse(x, fy, r, r * 0.72, 0, Math.PI, TAU);
  g.closePath();
  g.fill();
  g.clip();
  g.strokeStyle = rgba(color, 0.2);
  g.lineWidth = 1.1;
  g.lineCap = 'round';
  g.beginPath();
  for (let k = 0; k < 7; k++) {
    const [y0, ph] = [fy - r * 0.68 + k * (r * 0.1), rng() * TAU];
    g.moveTo(x - r, y0);
    for (let u = 0; u <= 1; u += 0.05) g.lineTo(x - r + 2 * r * u, y0 + Math.sin(u * 15 + ph) * 2.2 + Math.sin(u * 5 + ph) * 1.5);
  }
  g.stroke();
  g.restore();
  lit(g, x, fy, r, r * 0.72, color, 0.24, Math.PI * 1.08, Math.PI * 1.55);
}

// A school of small things on the bed: sea fans standing here and there (each with its glow), a brain mound or
// two, and sparks scattered over the ground. `spots` are x positions; the fans take the cooler colours.
export function bedlife(g, out, rng, L, floor, spots) {
  const fans = [TEAL, VIOLET, ORCHID, ROSE];
  spots.forEach((x, i) => {
    seaFan(g, out, rng, x, floor(x) + 2, 34 + rng() * 26, fans[i % fans.length]);
    if (i % 2) brain(g, rng, L, x + 34 + rng() * 20, floor(x) + 4, 16 + rng() * 10, i % 4 === 1 ? ROSE : VIOLET);
  });
  for (let i = 0; i < 16; i++) {
    const x = rng() * 2200 + 20;
    spark(g, out, rng, x, floor(x) - 4 - rng() * 38, rng() < 0.7 ? TEAL : VIOLET, 8 + rng() * 5, 0.22 + rng() * 0.14, rng() < 0.25 ? 'blink' : 'pulse');
  }
}
