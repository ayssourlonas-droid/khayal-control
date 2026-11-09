// The sunken ship of Lantern Deep's mid layer (parallax-deep-mid.js): a big wooden sailing hull listing on the
// slope, bow down in the silt. The stern castle and the bow stand in planks, the middle has rotted to its ribs
// above a band of bottom planking, three masts are snapped off short with a yard and rags of sail on the main
// one, rigging trails to the rail. Barnacles crust the wood, weed furs the castle, a few portholes still burn
// teal and the captain's window gold (the layer's lights). Drawn flat in the layer colour, the wood a little
// warmer than the rock. See parallax-shapes.js for the painter contract.
import { rgba } from './sprites.js';
import { poly, fur, lump, lit, crust, pane, tint, GOLD, TEAL, STONE } from './parallax-deep-kit-2.js';

// The hull's outline in the ship's own space (x along the keel, the stern at the left, y up is negative, the
// keel at about 22): a stern castle, the open waist, a forecastle and the bow's stem.
function outline(g) {
  g.beginPath();
  g.moveTo(-214, -100);
  g.lineTo(-212, -136);
  g.lineTo(-140, -137);
  g.lineTo(-138, -98);
  g.lineTo(148, -94);
  g.lineTo(152, -114);
  g.lineTo(214, -124);
  g.lineTo(264, -156);
  g.quadraticCurveTo(280, -112, 236, -44);
  g.quadraticCurveTo(190, 18, 90, 22);
  g.lineTo(-90, 22);
  g.quadraticCurveTo(-196, 18, -212, -30);
  g.quadraticCurveTo(-220, -62, -214, -100);
  g.closePath();
}

// What still stands of the planking inside that outline: the stern's side, the bow's and a band along the
// bottom, their broken edges ragged. Everything else is open water seen through ribs.
const PLANKING = [
  [[-240, -170], [-98, -170], [-92, -128], [-106, -104], [-94, -80], [-108, -58], [-96, -42], [-100, 40], [-240, 40]],
  [[300, -190], [300, 50], [110, 50], [104, -26], [120, -50], [106, -72], [124, -96], [116, -130], [130, -190]],
  [[-110, 40], [-110, -40], [-76, -48], [-40, -38], [0, -46], [40, -36], [80, -44], [116, -38], [116, 40]],
];

// A mast's stump standing from y0 up to y1, nine wide, snapped off in splinters.
function stump(g, mx, y0, y1) {
  poly(g, [[mx - 4.6, y0], [mx - 3.6, y1], [mx - 1, y1 - 9], [mx + 1, y1 + 2], [mx + 3.4, y1 - 6], [mx + 4.6, y0]]);
  g.fill();
}

// The hull: planking inside the outline, planks' courses along it, then the ribs and beams of the open waist.
function hull(g, rng, wood) {
  g.save();
  outline(g);
  g.clip();
  g.fillStyle = wood;
  for (const p of PLANKING) {
    poly(g, p);
    g.fill();
  }
  g.strokeStyle = rgba(STONE, 0.14);
  g.lineWidth = 1;
  g.beginPath();
  for (let y = -140; y < 30; y += 11) {
    g.moveTo(-250, y - 4);
    g.quadraticCurveTo(0, y + 18, 300, y - 22);
  }
  g.stroke();
  g.restore();
  g.strokeStyle = wood;
  g.lineCap = 'round';
  g.lineWidth = 5.2; // the ribs, a few snapped short or gone
  g.beginPath();
  for (let rx = -84; rx <= 100; rx += 22) {
    const r = rng();
    if (r < 0.14) continue;
    g.moveTo(rx, -38);
    g.quadraticCurveTo(rx + (rx > 0 ? 4 : -4), -66, rx + (rx > 0 ? 2 : -2), r < 0.4 ? -60 - rng() * 14 : -95);
  }
  g.stroke();
  g.lineWidth = 3.4; // deck beams across the waist and pieces of the rail
  g.beginPath();
  for (const [a, b, y] of [[-96, -42, -74], [-8, 62, -80], [70, 112, -70], [-136, -96, -97], [20, 80, -95]]) {
    g.moveTo(a, y);
    g.lineTo(b, y + (b - a) * 0.02);
  }
  g.stroke();
  poly(g, [[-214, -70], [-238, -62], [-244, 0], [-206, 10]]); // the rudder
  g.fillStyle = wood;
  g.fill();
}

// Masts, yard, rags of sail and rigging, in the wood's colour.
function rig(g, wood) {
  g.fillStyle = wood;
  stump(g, -28, -34, -194);
  stump(g, 172, -114, -168);
  poly(g, [[-176, -137], [-175, -196], [-172, -204], [-170, -192], [-166, -137]]); // the mizzen on the castle roof
  g.fill();
  g.strokeStyle = wood;
  g.lineCap = 'round';
  g.lineWidth = 3.6; // the yard, hanging crooked from the main stump, and the bowsprit
  g.beginPath();
  g.moveTo(-78, -164);
  g.lineTo(22, -182);
  g.moveTo(262, -154);
  g.lineTo(340, -184);
  g.stroke();
  g.fillStyle = rgba(wood, 0.8);
  g.beginPath();
  g.moveTo(-74, -163);
  g.quadraticCurveTo(-62, -138, -68, -116);
  g.lineTo(-54, -124);
  g.lineTo(-50, -148);
  g.lineTo(-32, -124);
  g.quadraticCurveTo(-26, -148, -22, -176);
  g.fill();
  g.lineWidth = 0.9;
  g.strokeStyle = rgba(wood, 0.6);
  g.beginPath();
  for (const [ax, ay, bx, by, sag] of [[-30, -190, -92, -96, 8], [-28, -188, 40, -94, 10], [-30, -186, 172, -164, 26], [172, -162, 250, -152, 16], [-172, -200, -32, -190, 22]]) {
    g.moveTo(ax, ay);
    g.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 + sag, bx, by);
  }
  g.stroke();
}

// A listing wreck on the bed at (x, fy), scale s, listing `list` rad (bow down), with its lights.
export function wreck(g, out, rng, L, x, fy, s = 1, list = 0.15) {
  const wood = tint(L, '#4a3a2a', 0.22);
  const [c, sn] = [Math.cos(list), Math.sin(list)];
  const at = (lx, ly) => [x + (lx * c - ly * sn) * s, fy - 14 + (lx * sn + ly * c) * s]; // ship space -> layer space
  g.save();
  g.translate(x, fy - 14);
  g.rotate(list);
  g.scale(s, s);
  hull(g, rng, wood);
  rig(g, wood);
  g.strokeStyle = rgba(STONE, 0.22); // the gunwale of the stern's and the bow's tops
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(-212, -136);
  g.lineTo(-140, -137);
  g.moveTo(214, -124);
  g.lineTo(264, -156);
  g.stroke();
  crust(g, rng, -200, -30, -100, 14, 26, 0.26);
  crust(g, rng, 80, 14, 220, -50, 22, 0.26);
  crust(g, rng, -80, 10, 60, 14, 10, 0.22);
  fur(g, rng, -176, -128, 36, 9, 18, 11, '#0a3a3a', 0.8);
  fur(g, rng, 236, -132, 28, 9, 12, 10, '#0a3a3a', 0.8);
  g.restore();
  pane(g, out, rng, ...at(-176, -118), 3.6 * s, GOLD, 'flicker', 0.3); // the captain's window, gold, and the portholes, teal
  for (const [lx, ly, mode] of [[-176, -66, 'pulse'], [-146, -60, 'steady'], [148, -66, 'pulse'], [188, -78, 'flicker']]) {
    pane(g, out, rng, ...at(lx, ly), 3 * s, L.lamp, mode, 0.4);
  }
  const [ex, ey] = at(-28, -198); // a spark where the main mast broke
  out.lights.push({ x: ex, y: ey, r: 12, color: TEAL, mode: 'pulse', ph: rng(), a: 0.24 });
}

// The silt heaped round the wreck's keel: a mound under the high stern, a bank in the waist and over the bow.
export function silt(g, rng, L, x, fy, s = 1) {
  g.fillStyle = L.color;
  for (const [dx, rx, ry] of [[-190, 110, 48], [-40, 120, 24], [210, 120, 34]]) {
    lump(g, rng, x + dx * s, fy + 4, rx * s, ry * s, 0.12, 8);
    g.fill();
    lit(g, x + dx * s, fy + 4, rx * s, ry * s, L.rim, 0.14, Math.PI * 1.15, Math.PI * 1.5);
  }
  fur(g, rng, x + 210 * s, fy, 100 * s, 28 * s, 10, 10, L.kelp, 0.7);
}
