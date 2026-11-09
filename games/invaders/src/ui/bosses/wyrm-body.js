// The Crystal Wyrm's body (World 11, Aurora Kingdom; see wyrm.js): the frill of translucent ice fanned out
// behind its head, the two great loops of its coils, a bridge of body from each to the neck, and the
// glacier all of it rises from. The head, crest, jaws, gems and coils are the parts (wyrm-head.js,
// -crest.js, -maw.js, -coil.js). The later phases light what is here: the frill, then the veins.
import { path, ink, line, lin, rad, rgba, shade, neon, bloom, both } from './kit.js';
import { tube, vein, glacier, ringPts, curvePts, GREEN, VIOLET } from './wyrm-ice.js';

export const LOOP = { x: -250, y: 40, rx: 65, ry: 60 }; // the left loop's centre and radii, which coilL and gemL are set on
const FINS = [[-78, 95], [-58, 130], [-38, 150], [-18, 152], [2, 138], [22, 105]]; // angle in degrees (up is negative), length
export const HEAD = [0, -50]; // where the frill springs from

const tip = ([deg, len]) => [HEAD[0] + Math.cos((deg * Math.PI) / 180) * len, HEAD[1] + Math.sin((deg * Math.PI) / 180) * len];
export const FIN_TIPS = FINS.map(tip);

// The frill's outline on the right, from the head along the top fin and over the scallops between the tips.
function edge(g) {
  const tips = FINS.map(tip);
  g.beginPath();
  g.moveTo(...HEAD);
  g.lineTo(...tips[0]);
  for (let i = 1; i < tips.length; i++) {
    const [ax, ay] = tips[i - 1];
    const [bx, by] = tips[i];
    g.quadraticCurveTo((ax + bx) / 2 * 0.78 + HEAD[0] * 0.22, (ay + by) / 2 * 0.78 + HEAD[1] * 0.22, bx, by);
  }
  g.closePath();
}

// A frill: membrane from blue near the head through indigo to violet at its rim, fin rays over it.
function frill(b, S) {
  const { plate } = S.pal;
  both((s) => {
    b.save();
    b.scale(s, 1);
    edge(b);
    ink(b, rad(b, HEAD[0], HEAD[1], 8, 160, [[0, rgba('#3a78c8', 0.96)], [0.55, rgba('#4a62d0', 0.78)], [1, rgba('#8a5af0', 0.5)]]), 3);
    for (const [deg, len] of FINS) {
      const [tx, ty] = tip([deg, len]);
      const a = (deg * Math.PI) / 180;
      const [nx, ny] = [-Math.sin(a), Math.cos(a)];
      path(b, [[HEAD[0] + 24 * Math.cos(a) + nx * 4, HEAD[1] + 24 * Math.sin(a) + ny * 4], [tx, ty], [HEAD[0] + 24 * Math.cos(a) - nx * 4, HEAD[1] + 24 * Math.sin(a) - ny * 4]]);
      ink(b, lin(b, 0, HEAD[1], tx, ty, [[0, shade(plate, 0.2)], [1, shade(plate, 0.6)]]), 1.8);
      path(b, [[HEAD[0] + 30 * Math.cos(a), HEAD[1] + 30 * Math.sin(a)], [tx, ty]], true);
      line(b, rgba('#ffffff', 0.5), 1);
    }
    b.restore();
  });
}

// The frill's rim and rays in the aurora's colours, a (0 to 1) bright.
function frillLights(l, a) {
  both((s) => {
    l.save();
    l.scale(s, 1);
    edge(l);
    l.fillStyle = rgba(VIOLET, 0.08 * a);
    l.fill();
    neon(l, GREEN, 1.4, 0.7 * a);
    for (const f of FINS) {
      l.beginPath();
      l.moveTo(HEAD[0] + 30 * Math.cos((f[0] * Math.PI) / 180), HEAD[1] + 30 * Math.sin((f[0] * Math.PI) / 180));
      l.lineTo(...tip(f));
      neon(l, VIOLET, 0.8, 0.4 * a);
    }
    l.restore();
  });
}

const ring = (s) => ringPts(s * -LOOP.x, LOOP.y, LOOP.rx, LOOP.ry);
const bridge = (s) => curvePts([s * 190, 64], [s * 120, 82], [s * 40, 70]);

function veins(l, a) {
  both((s) => {
    vein(l, ring(s), GREEN, 1.2, 0.7 * a);
    vein(l, bridge(s), GREEN, 1, 0.5 * a);
  });
}

export function hull(b, l, S) {
  frill(b, S);
  both((s) => tube(b, bridge(s), 30, -60, 120));
  both((s) => tube(b, ring(s), 38, -40, 110));
  glacier(b, l);
  bloom(l, 0, -20, 220, S.pal.weak, 0.06);
}

// The phases' lights over the hull: the frill, then the veins and a glow behind the head.
export const rage = [null, (l) => {
  frillLights(l, 0.6);
  veins(l, 0.5);
}, (l, S) => {
  frillLights(l, 1);
  veins(l, 1);
  bloom(l, 0, -50, 300, S.pal.weak, 0.12);
}];
