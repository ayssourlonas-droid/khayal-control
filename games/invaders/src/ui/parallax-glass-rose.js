// The great rose window of Glass Cathedral, set in the west front's broken wall (far layer, see parallax-glass.js).
// From the outside in: a ring of stone with a bead moulding, sixteen lobed cells of ruby, violet and cobalt glass,
// twelve long petals of sapphire and rose each with a gilt heart, a ring of lead, and a hot gilt sun at the centre;
// twelve spokes of stone and lead run between them. The glass is lit from behind, brightest at the middle. The
// window is a sign ({ rose, x, y, r }) for the live art (the turning fan of light, flourish-glass-2.js), and
// carries two lights: a warm core and a violet halo.
import { rgba, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { JEWEL, LEAD, lamp, arcSteps, tint } from './parallax-glass-kit.js';

const LOBES = 16;
const PETALS = 12;
const RING = [0.2, 0.68, 0.94]; // radii (of R): the heart, the petals' outer ends, the lobes' outer edge

// An annular sector between radii r0 and r1 and angles a0 and a1, as a closed path.
function cell(g, x, y, r0, r1, a0, a1) {
  g.beginPath();
  g.moveTo(x + Math.cos(a0) * r0, y + Math.sin(a0) * r0);
  arcSteps(g, x, y, r1, a0, a1, 0.1);
  arcSteps(g, x, y, r0, a1, a0, 0.1);
  g.closePath();
}

// A pointed petal along angle a from r0 to r1, hw its half-width at the belly.
function petal(g, x, y, r0, r1, a, hw) {
  const [c, s] = [Math.cos(a), Math.sin(a)];
  const at = (u, v) => [x + c * u - s * v, y + s * u + c * v];
  g.beginPath();
  g.moveTo(...at(r0, 0));
  g.quadraticCurveTo(...at(r0 + (r1 - r0) * 0.3, hw * 1.7), ...at(r1, 0));
  g.quadraticCurveTo(...at(r0 + (r1 - r0) * 0.3, -hw * 1.7), ...at(r0, 0));
  g.closePath();
}

export function rose(g, out, rng, L, x, y, R) {
  g.save();
  g.beginPath(); // the stone ring, a shade paler than the wall, with a bead moulding
  g.arc(x, y, R + 9, 0, TAU);
  g.fillStyle = tint(L, '#c8a8d8', 0.22);
  g.fill();
  g.beginPath();
  g.arc(x, y, R + 1.5, 0, TAU);
  g.fillStyle = LEAD;
  g.fill();
  g.fillStyle = rgba(L.color, 0.9);
  for (let i = 0; i < 36; i++) {
    g.beginPath();
    g.arc(x + Math.cos((i * TAU) / 36) * (R + 5.2), y + Math.sin((i * TAU) / 36) * (R + 5.2), 1.3, 0, TAU);
    g.fill();
  }
  const [lobeA, lobeB, lobeC] = [JEWEL.ruby, JEWEL.violet, JEWEL.cobalt];
  for (let i = 0; i < LOBES; i++) { // the outer lobes
    const [a0, a1] = [((i + 0.06) * TAU) / LOBES, ((i + 0.94) * TAU) / LOBES];
    cell(g, x, y, R * RING[1] + 2, R * RING[2], a0, a1);
    g.fillStyle = rgba([lobeA, lobeC, lobeB, lobeC][i % 4], 0.92);
    g.fill();
    g.beginPath();
    g.arc(x + Math.cos((a0 + a1) / 2) * R * 0.82, y + Math.sin((a0 + a1) / 2) * R * 0.82, R * 0.045, 0, TAU);
    g.fillStyle = rgba(JEWEL.gilt, 0.9);
    g.fill();
  }
  for (let i = 0; i < PETALS; i++) { // the long petals, each with a smaller petal of gilt inside it
    const a = (i * TAU) / PETALS + TAU / PETALS / 2;
    petal(g, x, y, R * RING[0], R * RING[1], a, R * 0.1);
    g.fillStyle = rgba(i % 2 ? JEWEL.rose : JEWEL.sapphire, 0.94);
    g.fill();
    petal(g, x, y, R * 0.3, R * 0.58, a, R * 0.045);
    g.fillStyle = rgba(i % 2 ? JEWEL.gilt : JEWEL.amber, 0.9);
    g.fill();
  }
  g.beginPath();
  g.arc(x, y, R * RING[0], 0, TAU);
  g.fillStyle = rad(g, x, y, 0, R * RING[0], [[0, '#fff6d8'], [0.5, JEWEL.gilt], [1, JEWEL.amber]]);
  g.fill();
  g.strokeStyle = rgba(LEAD, 0.92); // the cames and mullions
  g.lineCap = 'round';
  g.lineWidth = 1.6;
  g.beginPath();
  for (let i = 0; i < PETALS; i++) {
    const a = (i * TAU) / PETALS;
    g.moveTo(x + Math.cos(a) * R * RING[0], y + Math.sin(a) * R * RING[0]);
    g.lineTo(x + Math.cos(a) * R * RING[2], y + Math.sin(a) * R * RING[2]);
  }
  for (const k of RING) {
    g.moveTo(x + R * k, y);
    g.arc(x, y, R * k, 0, TAU);
  }
  g.stroke();
  g.globalCompositeOperation = 'lighter'; // lit from behind, brightest in the middle
  g.beginPath();
  g.arc(x, y, R, 0, TAU);
  g.fillStyle = rad(g, x, y, 0, R, [[0, 'rgba(255,230,190,0.5)'], [0.5, 'rgba(255,190,200,0.12)'], [1, 'rgba(255,190,200,0)']]);
  g.fill();
  g.restore();
  lamp(out, x, y, R * 1.9, '#ffb88a', 'steady', 0, 0.3);
  lamp(out, x, y, R * 3, JEWEL.amethyst, 'pulse', rng(), 0.1);
  out.signs.push({ rose: true, x, y, r: R });
}
