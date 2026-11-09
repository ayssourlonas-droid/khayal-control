// World 16, Glass Cathedral, the gunner (see w16.js): a candle wisp in a gothic glass lantern. A ring to hang
// it by, a pointed cap of pewter with leaf crockets, a body of three lancet panes of amber glass lit from
// within and held in a cage of lead ribs and bands, a base plate and a pendant drop with an amber bead. The
// wisp inside (w16-flame.js) flares on beat 1; the glass is shaded round it, brightest nearest the flame, and
// carries bright streaks and a star of light. Lights: the glass shining, the flame, the bead.
import { path, pane, poly, came, ink, lin, rad, rgba, shade, mix, line, circle, star4, streak, spark, bloom, grain, LEAD, SHEEN, AMBER } from './w16-kit.js';
import { flame } from './w16-flame.js';

const PEWTER = '#6a5c82';
const metal = (g, x0, x1) => lin(g, x0, 0, x1, 0, [[0, shade(PEWTER, 0.55)], [0.3, shade(PEWTER, 0.2)], [0.7, PEWTER], [1, mix(PEWTER, LEAD, 0.6)]]);

// The glass: three lancet panes (the middle one tall with a pointed arch, the sides skewed), shaded by the flame.
function glass(b, l, f, c) {
  const shapes = [
    [[-19.4, -19], [-9.4, -19], [-9.4, 22], [-17.6, 22]],
    [[9.4, -19], [19.4, -19], [17.6, 22], [9.4, 22]],
  ];
  path(b, [[-19.4, -19], [19.4, -19], [17.6, 22], [-17.6, 22]]); // the back of the case, dark, behind the lancets
  b.fillStyle = mix(c, '#2a0c04', 0.72);
  b.fill();
  const lit = f ? 0.26 : 0.2;
  for (const pts of shapes) pane(b, l, poly(pts), mix(c, '#c4500a', 0.18), [pts[0][0] / 1.6, 0, 18], lit, 1.6);
  const arch = (g) => {
    g.beginPath();
    g.moveTo(-9.4, 22);
    g.lineTo(-9.4, -6);
    g.quadraticCurveTo(-9.4, -14, 0, -18.4);
    g.quadraticCurveTo(9.4, -14, 9.4, -6);
    g.lineTo(9.4, 22);
    g.closePath();
  };
  arch(b);
  b.fillStyle = rad(b, 0, 8, 0, 30, [[0, '#fff2bc'], [0.25, mix(c, '#ffe27a', 0.5)], [0.65, c], [1, mix(c, '#7a2a06', 0.62)]]);
  b.fill();
  b.save();
  path(b, [[-19.4, -19], [19.4, -19], [17.6, 22], [-17.6, 22]]);
  b.clip();
  b.fillStyle = rad(b, 0, 6, 0, 26, [[0, rgba('#fff2c0', 0.5)], [1, rgba(c, 0)]]);
  b.fillRect(-20, -20, 40, 44);
  b.restore();
  arch(l);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = rgba(c, lit);
  l.fill();
  l.restore();
}

// What lies in front of the glass: its sheen, the cage's ribs and bands, the arch's trefoil, streaks and the star.
function cage(b, l, f) {
  b.save();
  path(b, [[-19.4, -19], [19.4, -19], [17.6, 22], [-17.6, 22]]);
  b.clip();
  b.fillStyle = lin(b, -19, -19, 8, 22, [[0, rgba('#ffffff', 0.3)], [0.4, rgba('#ffffff', 0)], [1, rgba('#2a0a40', 0.22)]]);
  b.fillRect(-20, -20, 40, 44);
  b.restore();
  for (const x of [-9.4, 9.4]) { // the ribs
    path(b, [[x, -20], [x, 23]], true);
    came(b, 2.6);
  }
  for (const m of [-1, 1]) {
    path(b, [[m * 19.4, -19], [m * 17.6, 22]], true);
    came(b, 3);
  }
  b.beginPath(); // the arch
  b.moveTo(-9.4, -6);
  b.quadraticCurveTo(-9.4, -14, 0, -18.4);
  b.quadraticCurveTo(9.4, -14, 9.4, -6);
  came(b, 2.6);
  circle(b, 0, -10.6, 2.2); // a small round in the arch
  ink(b, rgba(PEWTER, 0.8), 1.2);
  for (const [y, w] of [[-19, 3.4], [22.5, 3.6]]) { // the bands
    path(b, [[-20.6, y], [20.6, y]], true);
    came(b, w);
  }
  for (const y of [-19, 22.5]) { // rivets along the bands
    for (let x = -16; x <= 16; x += 8) {
      circle(b, x, y, 0.9);
      b.fillStyle = rgba(SHEEN, 0.85);
      b.fill();
    }
  }
  streak(b, -16, -12, -16, 12, 1.2, 0.5);
  streak(b, -5.6, -9, -5.6, -2, 1, 0.45);
  star4(b, -14.2, -12.4, 4.6, '#ffffff', 0.9);
  spark(l, -14.2, -12.4, 1.2, '#fff4d0', 0.6);
}

// One side of the cap's edge, from the apex (0, -35) down to the eaves (22, -20) in a concave sweep.
const slope = (m, t) => {
  const u = 1 - t;
  return [m * (u * u * 0 + 2 * u * t * 4.4 + t * t * 22), u * u * -35 + 2 * u * t * -27 + t * t * -20];
};

// The cap: a tall pointed pewter roof with crockets up its edges, a collar and a ruby; then a ring to hang by.
function cap(b, l) {
  const edge = [...Array.from({ length: 9 }, (_, i) => slope(1, i / 8)), ...Array.from({ length: 9 }, (_, i) => slope(-1, 1 - i / 8))];
  path(b, edge);
  ink(b, metal(b, -22, 22), 2.6);
  b.save();
  b.clip();
  grain(b, 24, 9, 0, -26, 20, 8, 0.2);
  for (const k of [-1, 0, 1]) streak(b, k * 9, -21, k * 2.4, -33, 0.8, 0.25);
  b.restore();
  for (const t of [0.34, 0.62, 0.9]) { // crockets up both slopes
    for (const m of [-1, 1]) {
      const [x, y] = slope(m, t);
      circle(b, x + m * 0.6, y - 0.4, 1.6);
      ink(b, shade(PEWTER, 0.25), 1.2);
    }
  }
  path(b, [[-23.6, -22.6], [23.6, -22.6], [22.8, -18.8], [-22.8, -18.8]]); // the eaves lip
  ink(b, metal(b, -23, 23), 1.8);
  circle(b, 0, -26.4, 2.3); // a ruby in the collar
  ink(b, rad(b, 0, -26.4, 0.2, 2.5, [[0, '#ffd8e4'], [0.4, '#f0386a'], [1, '#6a0a28']], -0.6, -27.2), 1.2);
  circle(b, 0, -39.4, 3.3); // the ring to hang it by
  line(b, LEAD, 4);
  line(b, SHEEN, 1.8);
  star4(b, -1.4, -41.4, 1.6, '#ffffff', 0.9);
  spark(l, 0, -26.4, 0.9, '#ff6a8a', 0.6);
}

// The base plate, the little feet and the pendant drop with its amber bead.
function base(b, l) {
  path(b, [[-17, 22], [17, 22], [13.6, 29.4], [-13.6, 29.4]]);
  ink(b, metal(b, -17, 17), 2.4);
  for (const m of [-1, 1]) {
    path(b, [[m * 15, 28], [m * 19.4, 34], [m * 11, 30.4]]);
    ink(b, shade(PEWTER, 0.1), 1.6);
  }
  path(b, [[-4.4, 29], [4.4, 29], [0, 43]]);
  ink(b, metal(b, -4, 4), 2);
  circle(b, 0, 37.4, 2.7);
  ink(b, rad(b, 0, 37.4, 0.2, 2.9, [[0, '#ffffff'], [0.4, AMBER], [1, mix(AMBER, '#5a1a00', 0.6)]], -0.7, 36.6), 1.2);
  spark(l, 0, 37.4, 1.5, AMBER, 0.8);
}

export function gunner(b, l, f, c) {
  base(b, l);
  glass(b, l, f, c);
  flame(b, l, f, c);
  cage(b, l, f);
  cap(b, l);
  bloom(l, 0, 0, 40, c, 0.1 + f * 0.12);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.fillStyle = lin(l, 0, 14, 0, 24, [[0, rgba('#fff0b0', 0)], [1, rgba('#fff0b0', 0.3 + f * 0.2)]]); // the flame's light pooled on the base plate
  l.fillRect(-16, 14, 32, 10);
  l.restore();
}
