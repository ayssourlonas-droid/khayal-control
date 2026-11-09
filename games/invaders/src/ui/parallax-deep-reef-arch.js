// The old gate on Lantern Deep's near reef (parallax-deep-reef.js): a pointed arch of carved stone on two
// fluted piers, rosettes carved along its ring, barnacled and furred with weed, with lanterns hanging from its
// underside on chains, their glass still burning gold (the one warm thing on the reef, and in its upper half
// only), and a lone broken pier beside it with one more lantern on a bracket. The lanterns are lights among
// the layer's lights, steady or guttering. See parallax-shapes.js for the painter contract.
import { rgba, mix } from './sprites.js';
import { TAU } from '../core/math.js';
import { arcSteps, fur, crust, coralTree, tint, GOLD, STONE, VIOLET, ROSE } from './parallax-deep-kit-2.js';

export const LANTERN = { r: 36, a: 0.4 }; // a lantern's halo among the lights: radius px, alpha

// A lantern hanging at (x, y) from a chain `drop` px long: cap, glass, base. A halo goes to the lights.
function lantern(g, out, rng, L, x, y, drop, mode) {
  const ly = y + drop;
  g.save();
  g.strokeStyle = rgba(STONE, 0.45);
  g.lineWidth = 1;
  g.setLineDash([2, 1.6]);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x, ly - 9);
  g.stroke();
  g.setLineDash([]);
  g.fillStyle = L.color;
  g.beginPath();
  g.moveTo(x - 6, ly - 4);
  g.lineTo(x - 2.5, ly - 9);
  g.lineTo(x + 2.5, ly - 9);
  g.lineTo(x + 6, ly - 4);
  g.closePath();
  g.fill();
  g.fillRect(x - 5.4, ly + 8, 10.8, 3);
  g.fillStyle = mix(GOLD, '#2a1a00', 0.35); // the glass: gold, dimmer toward its frame
  g.fillRect(x - 4.6, ly - 4, 9.2, 12);
  g.fillStyle = rgba(GOLD, 0.92);
  g.fillRect(x - 2.6, ly - 2.5, 5.2, 9);
  g.fillStyle = L.color;
  g.fillRect(x - 0.5, ly - 4, 1, 12);
  g.restore();
  out.lights.push({ x, y: ly + 2, r: LANTERN.r, color: GOLD, mode, ph: rng(), a: LANTERN.a });
}

// The gate: a pointed arch of outer half-span `ro` on piers a third of that wide, `h` tall, on the bed at (x, fy).
export function gate(g, out, rng, L, x, fy, ro, h) {
  const [ri, k3] = [ro * 0.66, Math.sqrt(3)];
  const cy = fy - (h - k3 * ro); // the springing line
  const pt = (r, u, s) => { // the ring's point at u along side s, and the outward direction there
    const a = Math.PI + (u * Math.PI) / 3;
    const lx = x + r + 2 * r * Math.cos(a); // the left side; the right mirrors it about x
    return [s < 0 ? lx : 2 * x - lx, cy + 2 * r * Math.sin(a), s < 0 ? Math.cos(a) : -Math.cos(a), Math.sin(a)];
  };
  g.fillStyle = L.color;
  g.beginPath();
  g.moveTo(x - ro, cy);
  arcSteps(g, x + ro, cy, 2 * ro, Math.PI, (Math.PI * 4) / 3);
  arcSteps(g, x - ro, cy, 2 * ro, (Math.PI * 5) / 3, TAU);
  g.lineTo(x + ri, cy);
  arcSteps(g, x - ri, cy, 2 * ri, TAU, (Math.PI * 5) / 3);
  arcSteps(g, x + ri, cy, 2 * ri, (Math.PI * 4) / 3, Math.PI);
  g.closePath();
  g.fill();
  const pw = ro - ri;
  for (const px of [x - ro, x + ri]) {
    g.fillRect(px, cy, pw, fy - cy);
    g.fillRect(px - 7, fy - 15, pw + 14, 15); // plinth
    g.fillRect(px - 5, cy - 6, pw + 10, 10); // capital
  }
  g.beginPath(); // a finial on the crown
  g.moveTo(x - 7, cy - k3 * ro + 5);
  g.lineTo(x, cy - k3 * ro - 22);
  g.lineTo(x + 7, cy - k3 * ro + 5);
  g.closePath();
  g.fill();
  g.save(); // carving: voussoir joints and rosettes along the ring, flutes down the piers, a band beneath the capitals
  g.strokeStyle = rgba(STONE, 0.17);
  g.lineWidth = 1;
  g.beginPath();
  for (const s of [-1, 1]) {
    for (let u = 0.07; u < 0.99; u += 0.14) {
      const [ox, oy] = pt(ro, u, s);
      const [ix, iy] = pt(ri, u, s);
      g.moveTo(ox, oy);
      g.lineTo(ix, iy);
      const [mx, my] = [(ox + ix) / 2 + (ix - ox) * 0.07, (oy + iy) / 2];
      g.moveTo(mx + 3.2, my);
      g.arc(mx, my, 3.2, 0, TAU);
    }
    for (const f of [0.3, 0.62]) {
      g.moveTo(x + s * (ro - pw * f), cy + 8);
      g.lineTo(x + s * (ro - pw * f), fy - 17);
    }
  }
  g.moveTo(x - ro, cy + 12);
  g.lineTo(x - ri, cy + 12);
  g.moveTo(x + ri, cy + 12);
  g.lineTo(x + ro, cy + 12);
  g.stroke();
  g.restore();
  const a0 = cy - k3 * ro;
  g.strokeStyle = rgba(STONE, 0.2); // the keystone's ring
  g.lineWidth = 1;
  g.beginPath();
  g.arc(x, a0 + 24, 6, 0, TAU);
  g.stroke();
  for (let i = 0; i < 26; i++) { // weed along the ring's top, standing out of it
    const [px, py, nx, ny] = pt(ro, 0.04 + rng() * 0.94, rng() < 0.5 ? -1 : 1);
    const l = 6 + rng() * 9;
    g.beginPath();
    g.moveTo(px, py);
    g.quadraticCurveTo(px + nx * l * 0.5 + (rng() - 0.5) * 4, py + ny * l * 0.5, px + nx * l + (rng() - 0.5) * 6, py + ny * l);
    g.strokeStyle = rgba(mix('#0a3a3a', '#38d6b8', 0.15), 0.7);
    g.stroke();
  }
  for (const [u, s, col] of [[0.32, -1, VIOLET], [0.6, 1, ROSE], [0.85, -1, VIOLET]]) { // dusky coral on the ring
    const [px, py, nx, ny] = pt(ro, u, s);
    coralTree(g, rng, px, py + 2, Math.atan2(ny, nx) + (rng() - 0.5) * 0.4, 10 + rng() * 5, tint(L, col, 0.5), 0.8, 3);
  }
  crust(g, rng, x - ro, cy + 30, x - ri, cy + 30, 10, 0.2);
  crust(g, rng, x + ri, cy + 60, x + ro, cy + 60, 8, 0.2);
  fur(g, rng, x - ro + pw / 2, fy - 12, pw, 8, 8, 8, '#0a3a3a', 0.7, Math.PI * 1.05, Math.PI * 1.95);
  const hook = (u, s, drop, mode) => { // hang a lantern from the ring's underside
    const [hx, hy] = pt(ri, u, s);
    lantern(g, out, rng, L, hx, hy, drop, mode);
  };
  hook(0.62, -1, 28, 'flicker');
  hook(0.62, 1, 26, 'flicker');
  hook(0.98, 1, 44, 'steady');
  const [bx, by] = pt(ro, 0.45, -1); // and one on a bracket on the ring's outer face
  g.strokeStyle = L.color;
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(bx, by);
  g.lineTo(bx - 9, by - 3);
  g.stroke();
  lantern(g, out, rng, L, bx - 9, by - 3, 22, 'flicker');
  out.lights.push({ x, y: cy - 70, r: 120, color: GOLD, mode: 'steady', ph: 0, a: 0.07 }); // the glow they cast, filling the gateway
}

// A lone pier of the gate's twin: a fluted shaft, broken at the top, a capital, and an iron bracket on its face
// with a lantern on a chain.
export function pier(g, out, rng, L, x, fy, w, h) {
  g.fillStyle = L.color;
  g.beginPath();
  g.moveTo(x - w / 2, fy);
  g.lineTo(x - w / 2, fy - h);
  [[0.1, 8], [0.25, -6], [0.45, 10], [0.7, -4], [1, 6]].forEach(([u, d]) => g.lineTo(x - w / 2 + u * w, fy - h + d));
  g.lineTo(x + w / 2, fy);
  g.closePath();
  g.fill();
  g.fillRect(x - w / 2 - 7, fy - 15, w + 14, 15);
  g.fillRect(x - w / 2 - 5, fy - h * 0.7, w + 10, 9);
  g.strokeStyle = rgba(STONE, 0.17);
  g.lineWidth = 1;
  g.beginPath();
  for (const f of [0.3, 0.62]) {
    g.moveTo(x - w / 2 + w * f, fy - h * 0.7 + 9);
    g.lineTo(x - w / 2 + w * f, fy - 17);
  }
  for (let y = fy - h * 0.7 - 14; y > fy - h + 12; y -= 14) { // courses of the broken upper shaft
    g.moveTo(x - w / 2, y);
    g.lineTo(x + w / 2, y);
  }
  g.moveTo(x + 5, fy - h * 0.38);
  g.arc(x, fy - h * 0.38, 5, 0, TAU); // a carved ring on the shaft
  g.stroke();
  coralTree(g, rng, x - w * 0.2, fy - h + 6, -Math.PI / 2 - 0.3, 12, tint(L, VIOLET, 0.5), 0.8, 3);
  fur(g, rng, x, fy - h + 4, w * 0.5, 6, 10, 10, '#0a3a3a', 0.7);
  g.strokeStyle = L.color;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x - w / 2, fy - h * 0.6);
  g.quadraticCurveTo(x - w / 2 - 24, fy - h * 0.6, x - w / 2 - 30, fy - h * 0.6 - 12);
  g.stroke();
  crust(g, rng, x - w / 2, fy - 40, x + w / 2, fy - 40, 8, 0.2);
  lantern(g, out, rng, L, x - w / 2 - 30, fy - h * 0.6 - 12, 24, 'steady');
}
