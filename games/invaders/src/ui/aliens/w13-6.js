// World 13, Sunset Armada, the cargo zeppelin (see w13.js): a long cream canvas envelope seen from below, nose
// toward the ship, ribbed and stitched and strung with rigging, a gondola on its belly with crates slung
// beneath that swing with the beat, and at the prow a lantern: the glow that carries the power-up. Its fins
// and engine pods are in w13-7.js. The bonus saucer is this same airship, and it has no wreck.
import { path, ink, lin, rgba, shade, bloom, gloss, line, ellipse, both, INK } from './kit.js';
import { BRASS, GOLD, HOT, RED, brass, brassV, rope, rivet, stitches, patch, glint, halo, sun } from './w13-kit.js';
import { fin, engine } from './w13-7.js';

// The envelope's half-width at y: a spindle that tapers to a point at the tail and ends in a blunt nose.
const hw = (y) => {
  const t = (y + 47) / 77;
  if (t <= 0 || t >= 1) return 0;
  return t < 0.56 ? 17.5 * Math.sin((Math.PI / 2) * (t / 0.56)) ** 0.9 : 17.5 * Math.sqrt(1 - ((t - 0.56) / 0.44) ** 2) ** 0.95;
};
const OUTLINE = (() => {
  const right = [];
  for (let y = -47; y <= 30; y += 2) right.push([hw(y), y]);
  return [...right, [0, 30], ...right.toReversed().map(([x, y]) => [-x, y])];
})();

// A crate on a rope from (x, y), swung by rot: planks, an X brace, brass straps at the corners.
function crate(b, x, y, w, h, rot) {
  b.save();
  b.translate(x, y);
  b.rotate(rot);
  b.beginPath();
  b.rect(-w / 2, 0, w, h);
  ink(b, lin(b, -w / 2, 0, w / 2, h, [[0, '#d8a468'], [1, '#6a4220']]), 1.8);
  path(b, [[-w / 2, 0], [w / 2, h], [w / 2, 0], [-w / 2, h]], true);
  line(b, rgba('#2a1606', 0.55), 1);
  path(b, [[-w / 2, h / 2], [w / 2, h / 2]], true);
  line(b, rgba('#2a1606', 0.35), 0.8);
  for (const [px, py] of [[-w / 2 + 1, 1], [w / 2 - 1, 1], [-w / 2 + 1, h - 1], [w / 2 - 1, h - 1]]) rivet(b, px, py, 0.8, BRASS);
  b.restore();
}

// The lantern at the prow, hung from a bowsprit: a brass cap and cage round a globe with a live flame
// that leans with the beat, and a halo for the canvas around it. Everything is kept inside the sprite's edge.
function lantern(b, l, f) {
  path(b, [[0, 29], [0, 34.6]], true);
  line(b, INK, 2.6);
  line(b, BRASS, 1.1);
  path(b, [[-3.8, 37], [3.8, 37], [2.4, 34.4], [-2.4, 34.4]]); // the cap
  ink(b, brass(b, -3.8, 3.8), 1.4);
  ellipse(b, 0, 41.2, 4.7, 4.9);
  ink(b, lin(b, -4, 37, 4, 46, [[0, '#fff3b8'], [0.5, '#f4a83a'], [1, '#b8601c']]), 1.9);
  const flame = (k, col) => {
    b.beginPath();
    b.moveTo(-2.2 * k, 44);
    b.bezierCurveTo(-3.4 * k, 41, -1.4 * k, 38.6, (f ? 1.3 : -1.3) * k, 37.6 + (f ? 0 : 0.8));
    b.bezierCurveTo(2.2 * k, 39.6, 3.2 * k, 42, 2.2 * k, 44);
    b.closePath();
    b.fillStyle = col;
    b.fill();
  };
  flame(1, rgba('#ff8a2a', 0.95));
  flame(0.55, '#fff6d0');
  b.beginPath(); // the cage
  b.ellipse(0, 41.2, 2, 4.9, 0, 0, Math.PI * 2);
  b.moveTo(-4.7, 41.2);
  b.lineTo(4.7, 41.2);
  line(b, rgba(BRASS, 0.9), 0.9);
  ellipse(b, 0, 41.2, 4.7, 4.9);
  line(b, INK, 1.2);
  gloss(b, -1.8, 38.8, 1.7, 1, 0.8, -0.6);
  path(b, [[-2.8, 45.6], [2.8, 45.6], [1.6, 47.4], [-1.6, 47.4]]); // the cup
  ink(b, brassV(b, 45, 47.4), 1);
  bloom(l, 0, 41, 7, HOT, 0.95);
  halo(l, 0, 41, 2, 7, GOLD, 0.7);
  glint(l, 0, 41, 3.8 + f * 0.6, '#fff6d0', 1);
}

// A cargo zeppelin.
export function carrier(b, l, f, c) {
  const s = f ? 1 : -1;
  for (const g of [b, l]) {
    g.save();
    g.scale(0.95, 0.95); // a touch smaller, so the fins and the lantern stay inside the sprite
  }
  both((m) => fin(b, l, f, m, c));
  both((m) => engine(b, l, f, m, c));
  path(b, OUTLINE); // the envelope
  ink(b, lin(b, -18, 0, 18, 0, [[0, shade(c, 0.7)], [0.3, shade(c, 0.25)], [0.68, c], [1, shade(c, -0.38)]]), 3);
  b.save();
  path(b, OUTLINE);
  b.clip();
  for (const y of [-36, -25, -14, -3, 8, 19]) { // the ribs: hoops that bow toward us
    b.beginPath();
    b.moveTo(-hw(y), y);
    b.quadraticCurveTo(0, y - 5.2, hw(y), y);
    line(b, rgba('#6a4a24', 0.42), 1.1);
    b.beginPath();
    b.moveTo(-hw(y), y + 1);
    b.quadraticCurveTo(0, y - 4.2, hw(y), y + 1);
    line(b, rgba('#ffffff', 0.35), 0.8);
  }
  for (const k of [-2, -1, 1, 2]) { // seams down its length
    b.beginPath();
    for (let y = -45; y <= 28; y += 2) b[y === -45 ? 'moveTo' : 'lineTo']((k * hw(y)) / 2.6, y);
    line(b, rgba('#6a4a24', 0.22), 0.9);
  }
  patch(b, -8, -11, 7.4, 6, 0.25, rgba(RED, 0.95), '#f1d596');
  patch(b, 7.4, -34, 5.4, 4.6, -0.3, shade(c, -0.14));
  stitches(b, -6, -39, -4, -30, '#5a3418', 2.6, 1.6);
  sun(b, 0, -21, 5.6, RED); // the fleet's mark
  b.fillStyle = lin(b, 0, 10, 0, 31, [[0, rgba('#ff9a3a', 0)], [1, rgba('#ff9a3a', 0.45)]]);
  b.fillRect(-24, 10, 48, 21);
  b.restore();
  gloss(b, -8.6, -18, 3.4, 15, 0.5, 0.08);
  ellipse(b, 0, 29.4, 5.6, 2.4); // the nose cap, brass
  ink(b, brass(b, -5.6, 5.6), 1.6);
  ellipse(b, 0, -46, 3, 1.5); // the tail ring
  ink(b, brass(b, -3, 3), 1.3);
  both((m) => { // the rigging down to the gondola, and a rope band round the belly
    rope(b, m * 16.8, -8, m * 9, -2, m * 1, 0, 0.7);
    rope(b, m * 14.4, -17, m * 8.4, -3, m * 0.8, 0, 0.7);
  });
  rope(b, -17.4, -3, 17.4, -3, 0, 4.4, 1);
  both((m) => { // the cargo's ropes, from the gondola's hooks
    rope(b, m * 5, 12.6, m * (8.4 + s * 0.6), 18.6, 0, 0, 0.8);
  });
  crate(b, -8.4 - s * 0.6, 18.6, 8.6, 7.6, s * 0.1);
  crate(b, 8.4 + s * 0.6, 18.4, 7.6, 6.8, -s * 0.1);
  path(b, [[-9.4, -3.4], [9.4, -3.4], [8.2, 13], [-8.2, 13]]); // the gondola
  ink(b, lin(b, -9, 0, 9, 0, [[0, '#d8a468'], [0.5, '#a8743a'], [1, '#5a3a1a']]), 2.2);
  for (const y of [5.6, 9.4]) {
    path(b, [[-8.6, y], [8.6, y]], true);
    line(b, rgba('#2a1606', 0.4), 0.8);
  }
  path(b, [[-10.4, -4.6], [10.4, -4.6], [9.8, -1.4], [-9.8, -1.4]]); // the roof rail, brass
  ink(b, brassV(b, -5, -1), 1.4);
  for (const x of [-4.6, 0, 4.6]) { // portholes, lit from inside
    ellipse(b, x, 2.6, 1.9, 1.9);
    ink(b, '#fff0c0', 1.3);
    halo(l, x, 2.6, 1, 5.4, GOLD, 0.6);
    glint(l, x, 2.6, 1.5, '#fff6d0', 0.8);
  }
  path(b, [[-8.4, 13], [8.4, 13], [7.4, 15.2], [-7.4, 15.2]]);
  ink(b, brassV(b, 13, 15.2), 1.2);
  lantern(b, l, f);
  bloom(l, 0, -12, 34, GOLD, 0.1 + f * 0.03); // the sun through the canvas
  for (const g of [b, l]) g.restore();
}
