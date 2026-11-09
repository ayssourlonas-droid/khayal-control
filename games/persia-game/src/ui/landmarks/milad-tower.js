// The Milad Tower (milad.js), the middle of the picture and the tallest thing on screen: the broad
// octagonal base seen from one face (its front lit, the two faces turning away in shade) with three
// bands of lit windows, the concrete shaft funnelling up from it, the pod whose underside flares out
// to five bands of lit windows (their mullions drawn as meridians, so the pod reads round), the
// open deck above it, the small dome, and the mast with its red lights. `up` counts blocks up from
// the street, and row(up) is that block's row.
import { PIXEL } from '../sprites.js';

const BASE = { half: 21, from: 2, tall: 17 }; // the base: its half-width, its first row and the row of its cap
const PLINTH = 24; // the plinth's half-width, the two rows under the base
const FUNNEL = { from: 18, rows: 16, half: 13 }; // the shaft's foot, widest where it leaves the base
const SHAFT = { top: 96, half: [7, 5] }; // the shaft's top row, and its half-width at the funnel's top and at the pod
const POD = { flare: 12, half: 26, windows: 104, cornice: 124 }; // flare rows, full half-width, first lit row, cornice row
const DECK = { floor: 125, half: 15, rows: 3 };
const DOME = { half: 9, rows: 6 };
const MAST = { from: 136, tip: 203, stages: [[149, 4], [171, 2]], decks: [[150, 8], [172, 6], [190, 4]] };
const RIBS = Array.from({ length: 13 }, (_, k) => Math.sin((k - 6) * 0.245)); // the pod's meridians, as fractions of its half-width

// The face a block at offset d across a body of this half-width belongs to: lit edge, left face,
// front, right face, shaded edge.
const face = (d, half) => (d === -half ? 'W' : d === half - 1 ? 'v' : d < -half * 0.4 ? 'w' : d < half * 0.4 ? 'f' : 'x');
// A lit window's tone: bright at the front of a round body, dimmer as it turns away.
const lit = (d, half) => (Math.abs(d + 0.5) < half * 0.55 ? 'G' : Math.abs(d + 0.5) < half * 0.82 ? 'g' : 'h');
const WINDOW = { W: 'W', w: 'g', f: 'G', x: 'h', v: 'v' }; // a face's tone -> the lit window set in it
const FLOOD = { W: 'W', w: 'f', f: 'W', x: 'w', v: 'x' }; // a face's tone -> the same face floodlit

export function tower(art) {
  const { mid, row, lights, L } = art;
  base(art);
  shaft(art);
  pod(art);
  deck(art);
  mast(art);
  for (const s of [-1, 1]) lights.push({ x: (mid + s * 14) * PIXEL, y: row(BASE.from + 3) * PIXEL, r: 90, color: L.glow, ph: s * 0.3, a: 0.35 });
  lights.push({ x: mid * PIXEL, y: row(POD.windows + 7) * PIXEL, r: 150, color: L.lamp, ph: 0.4, a: 0.16 });
}

// One row of a body centred on the middle: each block's tone from tone(d), d running -half..half-1.
function strip({ box, mid, row }, up, half, tone) {
  for (let d = -half; d < half; d++) box(mid + d, row(up), 1, 1, tone(d));
}

// The base: the plinth, the octagon's three visible faces (their corners drawn as lit and shaded
// lines) with a lit window every third block in three bands, each face's own tone, and the lit cap.
function base(art) {
  const { box, mid, row } = art;
  const { half, from, tall } = BASE;
  const corner = Math.round(half * 0.4);
  for (const up of [from, from + 1]) strip(art, up, PLINTH, (d) => (up === from + 1 && d < PLINTH - 1 ? 'W' : face(d, PLINTH)));
  for (let up = from + 2; up < tall; up++) {
    const band = (up - from - 3) % 4 < 2;
    strip(art, up, half, (d) => {
      if (d === -corner) return 'W';
      if (d === corner - 1) return 'v';
      const c = face(d, half);
      return band && d > -half && d < half - 1 && (d + half) % 3 !== 2 ? WINDOW[c] : c;
    });
  }
  box(mid - half - 1, row(tall), half * 2 + 2, 1, 'W');
}

// The shaft: first the funnel narrowing from the base's cap, floodlit so a shade paler, then the
// slim concrete body with a seam now and then, up to where the pod's underside begins.
function shaft(art) {
  const { from, rows, half } = FUNNEL;
  for (let up = from; up < SHAFT.top; up++) {
    const u = up - from;
    const w = u < rows ? SHAFT.half[0] + Math.round((half - SHAFT.half[0]) * (1 - u / rows) ** 2)
      : SHAFT.half[0] + Math.round((SHAFT.half[1] - SHAFT.half[0]) * ((up - from - rows) / (SHAFT.top - from - rows)));
    strip(art, up, w, (d) => (up % 22 === 0 && d > -w ? 'v' : u < rows ? FLOOD[face(d, w)] : face(d, w)));
  }
}

// The pod's half-width at row `up`: the underside's trumpet, then the full round.
const flare = (up) => SHAFT.half[1] + Math.round((POD.half - SHAFT.half[1]) * ((up - SHAFT.top) / POD.flare) ** 1.7);
const podHalf = (up) => (up < SHAFT.top + POD.flare ? flare(up) : POD.half);

// The pod: the flaring underside in shadow, then five bands of lit windows between meridian mullions
// (a window dark now and then) with a belt of concrete under each, and the cornice.
function pod(art) {
  const { box, mid, row, rng } = art;
  for (let up = SHAFT.top; up < POD.cornice; up++) {
    const half = podHalf(up);
    const band = up >= POD.windows && (up - POD.windows) % 4 < 3;
    const bars = new Set(RIBS.map((a) => Math.round(half * a)));
    strip(art, up, half, (d) => {
      if (band && d > -half && d < half - 1 && !bars.has(d)) return rng() < 0.06 ? 'h' : lit(d, half);
      return up < POD.windows - 4 ? (d < 0 ? 'x' : 'v') : face(d, half);
    });
  }
  box(mid - POD.half - 1, row(POD.cornice), POD.half * 2 + 2, 1, 'W');
}

// The open deck: a floor, posts every four blocks with the light between them, a roof slab, and the
// small dome rounded off above it.
function deck(art) {
  const { box, mid, row } = art;
  const { floor, half, rows } = DECK;
  strip(art, floor, half + 2, (d) => (d < 0 ? 'x' : 'v'));
  for (let up = floor + 1; up <= floor + rows; up++) strip(art, up, half, (d) => (d % 4 === 0 ? face(d, half) : lit(d, half)));
  const roof = floor + rows + 1;
  box(mid - half - 2, row(roof), (half + 2) * 2, 1, 'W');
  for (let j = 0; j < DOME.rows; j++) {
    const w = Math.round(DOME.half * Math.sqrt(1 - (j / (DOME.rows + 0.4)) ** 2));
    strip(art, roof + 1 + j, w, (d) => (d < -w * 0.3 || j === DOME.rows - 1 ? 'W' : d < w * 0.3 ? 'f' : 'w'));
  }
}

// The mast: thick at its foot, thinner in stages, with a platform at three heights, a red lamp at
// each end of each platform and one on the tip; the lamps blink out of step.
function mast(art) {
  const { box, mid, row, lights, L } = art;
  const widths = (up) => (MAST.stages.find(([top]) => up <= top) ?? [0, 1])[1];
  for (let up = MAST.from; up < MAST.tip; up++) {
    const w = widths(up);
    if (w === 1) box(mid, row(up), 1, 1, 'W');
    else strip(art, up, w / 2, (d) => face(d, w / 2));
  }
  MAST.decks.forEach(([up, w], i) => {
    box(mid - w / 2, row(up), w, 1, 'x');
    box(mid - w / 2, row(up + 1), 1, 1, 'R');
    box(mid + w / 2 - 1, row(up + 1), 1, 1, 'R');
    for (const x of [mid - w / 2, mid + w / 2 - 1]) lights.push({ x: (x + 0.5) * PIXEL, y: (row(up + 1) + 0.5) * PIXEL, r: 22, color: L.red, ph: i * 1.3 + x / 90, a: 0.6 });
  });
  box(mid, row(MAST.tip), 1, 1, 'R');
  lights.push({ x: (mid + 0.5) * PIXEL, y: (row(MAST.tip) + 0.5) * PIXEL, r: 30, color: L.red, ph: 0.9, a: 0.9 });
}
