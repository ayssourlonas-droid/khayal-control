// The Squall Ray's silhouette (World 18, Anvil Sky; bosses/ray*.js): a manta seen from above, head down, in pieces of cloud painted one over the
// next (ray-mass.js): the two WINGS, each a swept blade with its trailing (top) edge sagging in an S from the shoulder to a tip that points back (up
// the screen) and its leading (bottom) edge a convex arc bulging toward the player from the head to that tip, the TORSO, a lens from the back to the
// broad brow of the head, laid over the wings' roots, the two cephalic lobes (HORN: rolled paddles that project forward either side of the mouth), the
// sharpened tips (TIP), and a TAIL arching over the right shoulder. The numbers follow the parts' rects (ray-kit.js PART): the wing armour lies in the wing's inner half, the
// heart in the back of the torso, the maw under the brow between the lobes, a coil hangs under each wing. Nothing is above TOP.
//   WING, TORSO   closed polygons [[x, y], ...] (WING the right wing; the left is its mirror)
//   TRAIL, LEAD   the right wing's trailing (top) and leading (bottom) edges from the root to the tip, as polylines; edgeY(poly, x) the y of one at x
//   TAIL          the tail's centre line, a polyline
//   WING_TIP      [x, y] of the right wing's tip; TIP_BALL where the lit point of it is (the live arcs end on it)
//   RIFT, MOUTH   the outline of the heart's rift (part coordinates) and the mouth's opening: UP and DN, its upper and lower lips, from -72 to 72
//   polyDepth(poly, x, y)  how far inside a polygon a point is, negative outside (px)
//   ribbonDepth(rib, x, y) the same for a tapered ribbon { pts, r0, r1 }
const rnd = (v) => Math.round(v * 10) / 10;
const cubic = (p0, c1, c2, p1, n = 16) => Array.from({ length: n + 1 }, (_, i) => {
  const [t, u] = [i / n, 1 - i / n];
  return [0, 1].map((k) => rnd(u ** 3 * p0[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t ** 3 * p1[k]));
});
const quad = (p0, q, p1, n = 16) => Array.from({ length: n + 1 }, (_, i) => {
  const [t, u] = [i / n, 1 - i / n];
  return [0, 1].map((k) => rnd(u * u * p0[k] + 2 * u * t * q[k] + t * t * p1[k]));
});

export const WING_TIP = [486, -50];
export const TIP_BALL = [488, -52]; // the lit point at the end of the sharpened tip (ray-tip.js); the live arcs end on it
const TRAILING = cubic([70, -124], [170, -124], [335, -28], WING_TIP);
const LEADING = quad([96, 108], [346, 128], WING_TIP);

export const TRAIL = TRAILING;
export const LEAD = LEADING;
export const WING = [[40, -122], ...TRAILING, ...LEADING.toReversed().slice(1), [100, 134], [60, 110], [40, 0]];
const HALF = [[0, -134], [26, -133], [46, -128], [64, -118], [84, -88], [98, -36], [102, 14], [98, 64], [90, 102], [74, 126], [46, 139]];
export const TORSO = [...HALF, [0, 144], ...HALF.slice(1).reverse().map(([x, y]) => [-x, y])];

// The pouches hanging from the right wing's belly (mammatus, the lumps that hang under an anvil cloud): [x, y, r] circles along its leading edge.
export const POUCHES = [[176, 12], [216, 13], [256, 12], [296, 11], [330, 9]].map(([x, r]) => [x, edgeY(LEAD, x) + r * 0.3, r]);

// The cephalic lobes (HORN) and the sharpened wing tip (TIP), each a tapered ribbon along a curve and the half-widths at its two ends. A lobe leaves the
// head's flank and sweeps forward past the mouth to a rounded end that ray-mass.js rolls; the left is the mirror. The tip carries the wing's sweep on past
// its edges to a point.
export const HORN = { pts: [[90, 102], [116, 128], [140, 156], [156, 184], [162, 204]], r0: 10, r1: 15 };
export const TIP = { pts: [[446, -34], [470, -44], [496, -66]], r0: 12, r1: 1.2 };

// The tail, a polyline from behind the anvil arching over the right shoulder to a point above the wing's trailing edge (ray-tail.js: a spine of iron plates and a
// barb), kept under the HUD's line: its highest point is about y -146.
export const TAIL = cubic([44, -104], [78, -158], [172, -160], [214, -112], 40);

// The heart's rift, a torn opening about 130 x 62 with a ragged edge of long points and short (part coordinates of the heart: its centre is the origin), thrown about by a hash of its index.
const RX = 64;
const RY = 31;
export const RIFT = Array.from({ length: 28 }, (_, i) => {
  const a = (i / 28) * Math.PI * 2;
  const tip = Math.abs(Math.cos(a)) ** 8; // the ends of the tear are drawn out
  const k = (0.84 + 0.2 * (((i * 7919) % 13) / 13)) * (i % 2 ? 1.07 : 0.93) * (1 + 0.12 * tip); // a torn edge: long points and short, no smooth eyelid
  return [rnd(Math.cos(a) * RX * k * (1 + 0.08 * tip)), rnd(Math.sin(a) * RY * k * (1 - 0.3 * tip))];
});

// The mouth's opening, a flat slot (part coordinates of the maw): its two lips, left to right, and the outline.
export const UP = (x) => -9 * (1 - (x / 72) ** 2) ** 0.7 - 1;
export const DN = (x) => 11 * (1 - (x / 72) ** 2) ** 0.7 + 1;
export const MOUTH_X = Array.from({ length: 17 }, (_, i) => -72 + i * 9);
export const MOUTH = [...MOUTH_X.map((x) => [x, UP(x)]), ...MOUTH_X.toReversed().map((x) => [x, DN(x)])];

export function edgeY(poly, x) {
  for (let i = 1; i < poly.length; i++) {
    if (x <= poly[i][0]) return poly[i - 1][1] + ((poly[i][1] - poly[i - 1][1]) * (x - poly[i - 1][0])) / (poly[i][0] - poly[i - 1][0]);
  }
  return poly[poly.length - 1][1];
}

export function polyDepth(poly, x, y) {
  let hit = false;
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, ay] = poly[j];
    const [bx, by] = poly[i];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) hit = !hit;
    const [dx, dy] = [bx - ax, by - ay];
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    best = Math.min(best, Math.hypot(x - (ax + dx * u), y - (ay + dy * u)));
  }
  return hit ? best : -best;
}

export function ribbonDepth({ pts, r0, r1 }, x, y) {
  let best = -Infinity;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [dx, dy] = [pts[i][0] - ax, pts[i][1] - ay];
    const u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    const w = r0 + (r1 - r0) * ((i - 1 + u) / (pts.length - 1));
    best = Math.max(best, w - Math.hypot(x - (ax + dx * u), y - (ay + dy * u)));
  }
  return best;
}
