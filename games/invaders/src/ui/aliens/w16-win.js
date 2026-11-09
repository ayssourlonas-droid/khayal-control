// World 16, Glass Cathedral, a gargoyle's wing (see w16-4.js): a lancet window, a pointed arch of carved stone
// framing a tracery of leaded jewel panes (four lights, a tall one at the top and a round oculus in it), lit from behind. It is
// drawn in its own space with the hinge at (0, 0) and the apex at (0, -41), so the caller can swing it
// about the shoulder (the same translate and rotate on both contexts); the window's colours run from the
// body's violet to rose, cobalt and gold. Lights: every pane shining through.
import { pane, came, stoneFill, grain, ink, rgba, mix, streak, star4, LEAD, SAPPHIRE, RUBY, AMBER, GOLD, DAWN } from './w16-kit.js';

// A pointed (lancet) arch: sides up from y0 to ys, then curving to the apex ya.
function lancet(g, hw, y0, ys, ya) {
  g.beginPath();
  g.moveTo(-hw, y0);
  g.lineTo(-hw, ys);
  g.bezierCurveTo(-hw, ys + (ya - ys) * 0.55, -hw * 0.3, ya + (ys - ya) * 0.16, 0, ya);
  g.bezierCurveTo(hw * 0.3, ya + (ys - ya) * 0.16, hw, ys + (ya - ys) * 0.55, hw, ys);
  g.lineTo(hw, y0);
  g.closePath();
}

const rect = (x0, y0, x1, y1) => (g) => {
  g.beginPath();
  g.rect(x0, y0, x1 - x0, y1 - y0);
};

// The window: frame, then panes (clipped to the opening), the oculus, the specular streaks and rim light.
export function lancetWindow(b, l, c, f) {
  const outer = (g) => lancet(g, 9.4, 1, -25, -41.5);
  const inner = (g) => lancet(g, 6.4, -1.4, -25.5, -37.4);
  outer(b);
  ink(b, stoneFill(b, -10, -40, 10, 0, mix('#b4acc4', c, 0.4)), 2.4);
  b.save();
  outer(b);
  b.clip();
  grain(b, 26, 5, 0, -20, 9, 22, 0.24);
  b.restore();
  inner(b);
  b.fillStyle = LEAD;
  b.fill();
  for (const g of [b, l]) {
    g.save();
    inner(g);
    g.clip();
  }
  const lit = 0.18 + f * 0.06;
  const v = mix(c, '#2c0e72', 0.42); // a deep violet, so the jewels stay rich under the light
  const cols = [[mix(RUBY, v, 0.25), v], [mix(SAPPHIRE, v, 0.15), mix(c, v, 0.55)]]; // the two bottom rows, left and right
  [[-1.4, -12.6], [-12.6, -24]].forEach(([y0, y1], j) => {
    const k = lit * (j ? 1 : 0.3); // the bottom row sits behind the shoulder: its light must not spill over the stone
    pane(b, l, rect(-7, y0, -0.7, y1), cols[j][0], [-3.8, (y0 + y1) / 2, 6], k, 1.5);
    pane(b, l, rect(0.7, y0, 7, y1), cols[j][1], [3.8, (y0 + y1) / 2, 6], k, 1.5);
  });
  pane(b, l, rect(-7, -41, 7, -24.6), mix(AMBER, v, 0.18), [0, -31, 8], lit, 1.5);
  pane(b, l, (g) => { g.beginPath(); g.arc(0, -31.4, 3.3, 0, 6.2832); }, mix(RUBY, GOLD, 0.15), [0, -31.4, 3.3], lit + 0.1, 1.4);
  b.restore();
  l.restore();
  inner(b);
  came(b, 2);
  streak(b, -4.6, -20, -4.6, -9, 1, 0.5);
  streak(b, -4, -34, -5.4, -28, 0.9, 0.45);
  star4(b, -4.8, -17.4, 3, '#ffffff', 0.8);
  b.beginPath();
  b.moveTo(-9.4, -22);
  b.lineTo(-9.4, -25);
  b.bezierCurveTo(-9.2, -32, -3, -38, -0.6, -41);
  b.lineWidth = 0.9;
  b.strokeStyle = rgba(DAWN, 0.75);
  b.stroke();
}
