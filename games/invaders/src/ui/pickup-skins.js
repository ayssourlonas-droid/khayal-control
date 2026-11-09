// Per-world pickup skins (look.world 1..18). A pickup must still read as "catch me" in every world, so the falling capsule
// keeps its dark middle, coloured rim, pulse and turning dashes (pickups-view.js); a world changes the rim's shape and redraws some icons.
//   FRAMES[world](g, color)        the capsule's rim, centred, inside a 60 x 60 sprite (baked)
//   ICONS[world][kind](g, color)   replaces drawIcon's default for that kind (centred, ~30 px); also drawn by the HUD every frame, so
//                                  plain paths only (pickup-icons.js 1-4, pickup-icons-2.js 5-8, pickup-wheel.js 13, pickup-deep.js 15,
//                                  pickup-glass.js 16 with the mirror's icon; pickup-leaf.js is world 17's wreath of leaves, a frame only; pickup-storm.js is world 18's Tesla ring and its side guns' icon)
import { INK, rgba, shade, lin } from './sprites.js';
import { TAU } from '../core/math.js';
import { ICONS1 } from './pickup-icons.js';
import { ICONS2 } from './pickup-icons-2.js';
import { frost } from './pickup-frost.js';
import { gilt } from './pickup-gilt.js';
import { wheel, ICONS13 } from './pickup-wheel.js';
import { bulbs } from './pickup-bulbs.js';
import { shells, ICONS15 } from './pickup-deep.js';
import { quatrefoil, ICONS16 } from './pickup-glass.js';
import { leaves } from './pickup-leaf.js';
import { tesla, ICONS18 } from './pickup-storm.js';
export const disc = (g, r) => {
  g.fillStyle = 'rgba(8,10,20,0.88)';
  g.beginPath();
  g.arc(0, 0, r, 0, TAU);
  g.fill();
};
export const ring = (g, r, color, w) => {
  g.lineWidth = w;
  g.strokeStyle = color;
  g.beginPath();
  g.arc(0, 0, r, 0, TAU);
  g.stroke();
};
const poly = (g, n, r, rot = 0) => {
  g.beginPath();
  for (let i = 0; i < n; i++) g.lineTo(Math.cos(rot + (i * TAU) / n) * r, Math.sin(rot + (i * TAU) / n) * r);
  g.closePath();
};

export const FRAMES = {
  1(g, color) { // a ring of phosphor pixels
    for (let i = -7; i <= 7; i++) {
      for (let j = -7; j <= 7; j++) {
        const d = Math.hypot(i, j);
        if (d >= 6.7) continue;
        g.fillStyle = d >= 5.6 ? color : 'rgba(8,10,20,0.9)';
        g.fillRect(i * 4 - 2, j * 4 - 2, 4, 4);
      }
    }
  },
  2(g, color) { // a neon tube
    disc(g, 24);
    for (const [w, a] of [[11, 0.12], [7, 0.25]]) ring(g, 25, rgba(color, a), w);
    ring(g, 25, color, 3);
    ring(g, 25, rgba('#ffffff', 0.85), 1);
  },
  3(g, color) { // a brass collar with rivets
    disc(g, 24);
    ring(g, 26, INK, 7);
    ring(g, 26, color, 4);
    g.fillStyle = '#fff3d8';
    for (let i = 0; i < 6; i++) g.fillRect(Math.cos((i * TAU) / 6) * 26 - 1.5, Math.sin((i * TAU) / 6) * 26 - 1.5, 3, 3);
  },
  4(g, color) { // one brush stroke, thick to thin, left open
    disc(g, 23);
    g.strokeStyle = color;
    g.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const a = -1.2 + (i / 24) * 5.6;
      g.lineWidth = 7 - i * 0.24;
      g.beginPath();
      g.arc(0, 0, 25, a, a + 0.26);
      g.stroke();
    }
    g.lineCap = 'butt';
  },
  5(g, color) { // a living membrane
    g.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * TAU;
      const r = 25 + Math.sin(a * 6) * 1.6;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.fillStyle = 'rgba(6,14,8,0.9)';
    g.fill();
    g.lineWidth = 6;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 3;
    g.strokeStyle = color;
    g.stroke();
  },
  6(g, color) { // a code block in brackets
    g.fillStyle = 'rgba(2,10,4,0.9)';
    g.fillRect(-23, -23, 46, 46);
    g.lineWidth = 4;
    g.strokeStyle = color;
    for (const s of [-1, 1]) {
      g.beginPath();
      g.moveTo(s * 18, -26);
      g.lineTo(s * 26, -26);
      g.lineTo(s * 26, 26);
      g.lineTo(s * 18, 26);
      g.stroke();
    }
  },
  7(g, color) { // a steel nut
    poly(g, 6, 27, Math.PI / 6);
    g.fillStyle = 'rgba(10,10,14,0.92)';
    g.fill();
    g.lineWidth = 6;
    g.strokeStyle = INK;
    g.stroke();
    g.lineWidth = 3.4;
    g.strokeStyle = color;
    g.stroke();
  },
  8(g, color) { // a ring with an orbit passing behind it and a bead riding the orbit
    g.save();
    g.rotate(-0.4);
    g.scale(1, 0.32);
    ring(g, 28, rgba(color, 0.8), 3.5);
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(28, 0, 7, 0, TAU);
    g.fill();
    g.restore();
    disc(g, 23);
    ring(g, 24, color, 2.5);
  },
  9(g, color) { // a life-buoy: a ring banded in the power's colour and its shadow
    disc(g, 22);
    ring(g, 25, INK, 9);
    g.lineWidth = 6;
    for (let i = 0; i < 8; i++) {
      g.strokeStyle = i % 2 ? shade(color, -0.6) : color;
      g.beginPath();
      g.arc(0, 0, 25, (i * TAU) / 8, ((i + 1) * TAU) / 8 + 0.02);
      g.stroke();
    }
    ring(g, 22.2, rgba('#ffffff', 0.4), 1);
  },
  10(g, color) { // a pumpkin rind: eight ribs bulging round a dark middle, a stem, four notches carved through it
    disc(g, 21);
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8;
      g.save();
      g.rotate(a);
      g.translate(23.6, 0);
      g.beginPath();
      g.ellipse(0, 0, 6.4, 10, 0, 0, TAU);
      g.fillStyle = lin(g, -6, -9, 6, 9, [[0, shade(color, 0.35)], [0.55, color], [1, shade(color, -0.55)]]);
      g.fill();
      g.lineWidth = 1.7;
      g.strokeStyle = INK;
      g.stroke();
      g.restore();
    }
    ring(g, 19.2, INK, 1.8);
    g.fillStyle = 'rgba(8,10,20,0.96)';
    for (let i = 0; i < 4; i++) { // the cuts, each with the candle's light on its lower lip
      g.save();
      g.rotate(Math.PI / 4 + (i * TAU) / 4);
      g.translate(23.6, 0);
      g.rotate(Math.PI / 2);
      g.beginPath();
      g.moveTo(-3.4, -3.2);
      g.lineTo(3.4, -3.2);
      g.lineTo(0, 3.8);
      g.closePath();
      g.fill();
      g.strokeStyle = rgba('#fff0b0', 0.8);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-2, 1.4);
      g.lineTo(0, 3.8);
      g.lineTo(2, 1.4);
      g.stroke();
      g.restore();
    }
    g.fillStyle = '#4e5a22'; // the stem, curling
    g.fillRect(-2.6, -31, 5.2, 6);
    g.strokeStyle = '#7a9a38';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(2, -29.6);
    g.quadraticCurveTo(7, -32.6, 6, -27.6);
    g.stroke();
  },
  11: frost, // a ring of frost crystals (pickup-frost.js)
  12: gilt, // a wreath of gold leaf (pickup-gilt.js)
  13: wheel, // a ship's wheel (pickup-wheel.js)
  14: bulbs, // a marquee's ring of bulbs (pickup-bulbs.js)
  15: shells, // a ring of scallop shells and pearls (pickup-deep.js)
  16: quatrefoil, // a gothic quatrefoil of gold tracery set with glass jewels (pickup-glass.js)
  17: leaves, // a wreath of fresh green leaves, their veins in the power's colour (pickup-leaf.js)
  18: tesla, // a Tesla ring: copper coil wire, steel electrodes and arcs of the power's colour between them (pickup-storm.js)
};

export const ICONS = { ...ICONS1, ...ICONS2, 13: ICONS13, 15: ICONS15, 16: ICONS16, 18: ICONS18 };
