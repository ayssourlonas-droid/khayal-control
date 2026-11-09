// The Thunder Galleon's rigging (World 13, Sunset Armada; see galleon.js): the two yards the mainmast carries
// out to either side, past the part's own 45 px, lashed and capped in brass, and the ropes that hold it
// all: lifts from the mast head, stays and shrouds down to the rail, rope ladders with their rungs. The
// sails hang from the yards (galleon-sails.js); what is drawn here is behind them. TIERS are the sails'
// places, the yards' heights and half lengths; HEAD is the mast head in boss coordinates.
import { path, ink, line, lin, rgba, shade } from './kit.js';
import { BRASS_L, BRASS_D, TEAK_L, ROPE, ROPE_D, sheer, rope, stud } from './galleon-kit.js';

export const TIERS = [
  { yard: -142, half: 150, top: 150, foot: 178, h: 44, th: 7, bolt: false },
  { yard: -92, half: 196, top: 196, foot: 208, h: 44, th: 8, bolt: true },
];
export const IN = 36; // where a sail's inner edge stands, either side of the mast
export const HEAD = [0, -152];
const NEST = [24, -125]; // the lip of the crow's nest, the right side

// A yard for one side: the spar tapering to the yardarm, a brass cap on its end, the lashings.
function yard(b, s, t) {
  const [y, th] = [t.yard, t.th];
  b.save();
  b.scale(s, 1);
  path(b, [[44, y - th / 2], [t.half - 6, y - th * 0.3], [t.half, y - th * 0.2], [t.half, y + th * 0.2], [t.half - 6, y + th * 0.3], [44, y + th / 2]]);
  ink(b, lin(b, 0, y - th / 2, 0, y + th / 2, [[0, shade(TEAK_L, 0.4)], [0.5, TEAK_L], [1, shade(TEAK_L, -0.6)]]), 2);
  path(b, [[48, y - th * 0.18], [t.half - 8, y - th * 0.1]], true);
  line(b, rgba('#ffffff', 0.22), 0.9);
  b.beginPath();
  b.roundRect(t.half - 3, y - th * 0.5, 7, th, 2);
  ink(b, lin(b, 0, y - th / 2, 0, y + th / 2, [[0, BRASS_L], [1, BRASS_D]]), 1.6);
  for (const x of [t.half - 16, t.half - 30, 62]) { // lashings
    b.beginPath();
    b.roundRect(x - 2.2, y - th * 0.55, 4.4, th * 1.1, 1.4);
    ink(b, ROPE, 1);
    path(b, [[x - 2, y - th * 0.3], [x + 2, y + th * 0.3]], true);
    line(b, ROPE_D, 0.8);
  }
  b.restore();
}

// A rope ladder between two points: two ropes and the rungs across them, every 9 px.
function ladder(b, [x0, y0], [x1, y1], w = 5) {
  const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 9);
  for (let i = 1; i < n; i++) {
    const [x, y] = [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n];
    path(b, [[x - w, y], [x + w, y]], true);
    line(b, rgba('#0a0604', 0.7), 2.4);
    line(b, ROPE, 1.3);
  }
  rope(b, [[x0 - w, y0], [x1 - w, y1]], 1.3);
  rope(b, [[x0 + w, y0], [x1 + w, y1]], 1.3);
}

// The ropes: lifts to the yards, the leeches down the sails' outer edges to the rail, stays from the mast
// head to the yardarms and out to the pods, shrouds from the nest to the rail.
function lines(b, s) {
  b.save();
  b.scale(s, 1);
  const [t1, t2] = TIERS;
  rope(b, [HEAD, [t1.half, t1.yard]], 1.8, 7);
  rope(b, [HEAD, [t2.half, t2.yard]], 1.6, -6);
  rope(b, [[t1.half, t1.yard], [t2.half, t2.yard]], 1.8);
  rope(b, [[t2.half, t2.yard], [220, sheer(220) - 2]], 1.8);
  rope(b, [[t1.half, t1.yard], [258, -98]], 1.5, 4);
  rope(b, [[t2.half, t2.yard], [262, -64]], 1.3, 3);
  ladder(b, [NEST[0] - 4, NEST[1] + 6], [124, sheer(124) - 2], 4);
  ladder(b, [NEST[0], NEST[1] + 4], [176, sheer(176) - 2], 4);
  rope(b, [[NEST[0], NEST[1]], [t2.half - 28, t2.yard]], 1.2, 2);
  b.restore();
}

// The bolted brace that holds a pod to the hull below it.
function braces(b, s) {
  b.save();
  b.scale(s, 1);
  path(b, [[220, 14], [262, 5], [264, 17], [222, 30]]);
  ink(b, lin(b, 0, 5, 0, 30, [[0, BRASS_L], [0.5, '#a8741c'], [1, BRASS_D]]), 2.2);
  stud(b, 232, 20, 2, BRASS_L);
  stud(b, 252, 14, 2, BRASS_L);
  b.restore();
}

export function rig(b) {
  for (const s of [-1, 1]) {
    lines(b, s);
    braces(b, s);
  }
}

export function yards(b) {
  for (const s of [-1, 1]) for (const t of TIERS) yard(b, s, t);
}
