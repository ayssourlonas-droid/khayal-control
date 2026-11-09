// The pickup capsule's rim in Aurora Kingdom (pickup-skins.js FRAMES[11]): a ring of frost crystals round
// the dark middle, eight long ones pointing out and eight short between, each a faceted prism lit from
// above, with a thin band of ice joining their roots.
import { INK, rgba, shade, lin } from './sprites.js';
import { TAU } from '../core/math.js';

// One crystal pointing along +x from radius 17 to `tip`, w wide: a lit upper facet over a shaded lower.
function crystal(g, tip, w, color) {
  const pts = [[17, -w], [tip - 5, -w * 0.78], [tip, 0], [tip - 5, w * 0.78], [17, w]];
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fillStyle = lin(g, 0, -w, 0, w, [[0, shade(color, 0.6)], [0.5, color], [1, shade(color, -0.5)]]);
  g.fill();
  g.lineWidth = 1.5;
  g.strokeStyle = INK;
  g.stroke();
  g.strokeStyle = rgba('#ffffff', 0.75);
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(19, 0);
  g.lineTo(tip - 3, 0);
  g.stroke();
}

export function frost(g, color) {
  g.fillStyle = 'rgba(8,10,20,0.88)';
  g.beginPath();
  g.arc(0, 0, 21, 0, TAU);
  g.fill();
  for (let i = 0; i < 16; i++) {
    g.save();
    g.rotate((i * TAU) / 16);
    if (i % 2) crystal(g, 24.5, 3.1, shade(color, 0.15));
    else crystal(g, 30, 4.3, color);
    g.restore();
  }
  g.lineWidth = 3;
  g.strokeStyle = INK;
  g.beginPath();
  g.arc(0, 0, 19.4, 0, TAU);
  g.stroke();
  g.lineWidth = 1.6;
  g.strokeStyle = rgba(shade(color, 0.5), 0.9);
  g.stroke();
}
