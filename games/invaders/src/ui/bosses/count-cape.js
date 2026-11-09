// The Crimson Count's cape (World 10, Hollow Night; see count-parts.js and count.js): the two wings it
// spreads like a bat's, over a blood-red lining, and the tall collar behind his head. wing is drawn
// once, as the left one, in boss coordinates (the painter moves its origin to where the part sits) and
// mirrored for the right. Colours come from the look's boss palette.
import { path, ink, lin, line, eye, bloom, gloss, neon, rgba, shade, ellipse, both } from './kit.js';

// The left wing's outline in boss coordinates: where it hangs from the shoulder, the points along
// its scalloped edge from the tip down to the body, and its inner edge up the flank.
export const SHOULDER = [-108, -98];
export const TOP = [-240, -168];
export const EDGE = [[-348, -136], [-340, -78], [-326, -22], [-308, 34], [-300, 74], [-262, 98], [-214, 90], [-168, 108], [-126, 98], [-86, 112]];
const FLANK = [[-66, 70], [-62, 20], [-78, -40]];

// Scallops: each edge segment bows in toward the shoulder, leaving a point at every edge vertex.
const SCALLOP = EDGE.slice(1).map(([x, y], i) => {
  const [px, py] = EDGE[i];
  const [mx, my] = [(x + px) / 2, (y + py) / 2];
  const d = Math.hypot(SHOULDER[0] - mx, SHOULDER[1] - my);
  return [mx + ((SHOULDER[0] - mx) / d) * 15, my + ((SHOULDER[1] - my) / d) * 15, x, y];
});

// The point u of the way from the shoulder to p.
export const along = ([x, y], u) => [SHOULDER[0] + (x - SHOULDER[0]) * u, SHOULDER[1] + (y - SHOULDER[1]) * u];

// Add the wing's edge (top, tip, scallops) to the current path of g.
export function edge(g) {
  g.moveTo(...SHOULDER);
  g.quadraticCurveTo(...TOP, ...EDGE[0]);
  for (const s of SCALLOP) g.quadraticCurveTo(...s);
}

// The wing: blood-red lining pleated on its ribs, a black fold along the top and the scalloped edge,
// ribs with a spur at every point; thin crimson light along the edge and the ribs.
function wing(b, l, p, S) {
  const { hull, plate, weak } = S.pal;
  for (const g of [b, l]) g.translate(215, 20);
  const outline = (g) => {
    g.beginPath();
    edge(g);
    for (const [x, y] of FLANK) g.lineTo(x, y);
    g.closePath();
  };
  outline(b);
  ink(b, lin(b, -350, 0, -80, 0, [[0, shade(plate, -0.55)], [0.3, plate], [0.75, shade(plate, 0.06)], [1, shade(plate, -0.6)]]), 3.6);
  b.save();
  b.clip();
  EDGE.slice(0, -1).forEach(([x, y], i) => { // a pleat between each pair of ribs, drawn soft: dark at the ribs, a sheen between
    const [nx, ny] = EDGE[i + 1];
    path(b, [SHOULDER, [x, y], [nx, ny]]);
    b.fillStyle = lin(b, x, y, nx, ny, [[0, rgba('#000000', 0.34)], [0.5, rgba('#ff9aaa', i % 2 ? 0.05 : 0.13)], [1, rgba('#000000', 0.34)]]);
    b.fill();
  });
  for (let i = 0; i < 9; i++) { // veins in the cloth, faint
    const p = EDGE[i % 8];
    const [cx, cy] = along(p, 0.6);
    const [ex, ey] = along(p, 0.86);
    b.beginPath();
    b.moveTo(...along(p, 0.34));
    b.quadraticCurveTo(cx + (i % 3 - 1) * 14, cy, ex, ey + 6);
    line(b, rgba('#000000', 0.16), 1.2);
  }
  b.fillStyle = lin(b, 0, -150, 0, 120, [[0, rgba('#000000', 0.35)], [0.3, rgba('#000000', 0)], [0.8, rgba('#000000', 0)], [1, rgba('#000000', 0.3)]]);
  b.fillRect(-360, -170, 300, 300);
  b.beginPath();
  edge(b);
  line(b, hull, 24); // the black outer face folded over the lining's rim
  b.save(); // gold stitching just inside the black fold
  b.translate(...SHOULDER);
  b.scale(0.953, 0.953);
  b.translate(-SHOULDER[0], -SHOULDER[1]);
  b.beginPath();
  edge(b);
  b.setLineDash([6, 4]);
  line(b, rgba('#d8b25a', 0.5), 1.3);
  b.restore();
  b.restore();
  for (const [x, y] of EDGE) { // ribs, a spur past the edge at each point
    path(b, [SHOULDER, [x, y]], true);
    line(b, '#05020a', 4.4);
    line(b, shade(hull, 0.36), 1.5);
  }
  EDGE.slice(0, 7).forEach(([x, y], i) => {
    const out = i === 0 ? [-3, -30] : [-7, i % 2 ? 6 : 10];
    path(b, [[x, y - 6], [x + out[0], y + out[1]], [x + 6, y + 4]]);
    ink(b, hull, 2.2);
  });
  ellipse(b, SHOULDER[0], SHOULDER[1], 10, 10); // a brass clasp where the ribs meet
  ink(b, lin(b, SHOULDER[0] - 8, SHOULDER[1] - 8, SHOULDER[0] + 8, SHOULDER[1] + 8, [[0, '#f4dc8a'], [0.5, '#c8a24a'], [1, '#6a4a1a']]), 2.4);
  ellipse(b, SHOULDER[0], SHOULDER[1], 4, 4);
  b.fillStyle = weak;
  b.fill();
  path(b, [[-340, -128], [-352, -160], [-330, -134]]); // the tip, stiffened
  ink(b, hull, 2.2);
  l.beginPath();
  edge(l);
  neon(l, weak, 1.2, 0.42);
  for (const [x, y] of EDGE.slice(0, 8)) {
    path(l, [SHOULDER, [x, y]], true);
    neon(l, weak, 0.8, 0.1);
  }
  EDGE.slice(0, 7).forEach(([x, y]) => eye(l, x, y, 1.6, weak, 3.4));
  bloom(l, -230, -20, 120, weak, 0.1);
}

// The collar: two tall flaps rising either side of his head, their insides lined in crimson, joined
// behind the neck.
function collar(b, l, p, S) {
  const { hull, plate, weak } = S.pal;
  path(b, [[-54, 30], [-46, 4], [46, 4], [54, 30]]);
  ink(b, shade(hull, 0.05), 2.6);
  const flap = (g, s) => {
    g.beginPath();
    g.moveTo(s * 36, 30);
    g.quadraticCurveTo(s * 66, 0, s * 96, -28);
    g.quadraticCurveTo(s * 116, -4, s * 120, 30);
    g.closePath();
  };
  both((s) => {
    flap(b, s);
    ink(b, lin(b, s * 36, 0, s * 120, 0, [[0, shade(plate, -0.45)], [0.5, plate], [1, shade(plate, -0.3)]]), 3.4);
    b.save();
    b.clip();
    for (let i = 0; i < 4; i++) { // pleats climbing the flap
      path(b, [[s * (44 + i * 15), 30], [s * (68 + i * 8), 4 - i * 4]], true);
      line(b, rgba('#000000', 0.3), 1.6);
    }
    b.beginPath();
    b.moveTo(s * 120, 30);
    b.quadraticCurveTo(s * 116, -4, s * 96, -28);
    line(b, hull, 14);
    b.restore();
    path(b, [[s * 98, -26], [s * 109, -2]], true);
    line(b, rgba('#ffffff', 0.18), 1.2);
    l.beginPath();
    l.moveTo(s * 36, 30);
    l.quadraticCurveTo(s * 66, 0, s * 96, -28);
    neon(l, weak, 1, 0.45);
    eye(l, s * 96, -28, 1.7, weak, 3.6);
  });
  gloss(b, 0, -2, 40, 3, 0.2);
}

export const CAPE = { wing, collar };
