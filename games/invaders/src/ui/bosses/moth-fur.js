// The two small leaves the Vesper Moth is dressed in (World 16, Glass Cathedral; moth*.js): a tuft of carved stone fur
// (the thorax, the wing roots, the abdomen's ruff: a pointed leaf with a rib, lit along its top by the dawn) and a
// shard of glass (the fringe of scales along the wings' margins, and the sprite of the scales that fall in the last
// phase: a pointed leaf of jewel glass in lead, bright at its heart). Both lie from (0, 0) along +x, `len` long and `w`
// wide. Bake-time only.
import { path, line, lin, rgba, shade } from './kit.js';
import { LEAD, LEAD_L, STONE_M, STONE_L, mix } from './moth-kit.js';

// A leaf from the root (0, 0) to its tip (len, curl): narrow at the root, fullest at two fifths, pointed.
function leaf(g, len, w, full = 0.5, curl = 0) {
  g.beginPath();
  g.moveTo(0, -w * 0.16);
  g.bezierCurveTo(len * 0.18, -w * 0.62, len * 0.6, -w * 0.52 * full * 2 + curl * 0.3, len, curl * 1.2);
  g.bezierCurveTo(len * 0.58, w * 0.5 * full * 2 + curl * 0.5, len * 0.18, w * 0.6, 0, w * 0.16);
  g.closePath();
}

// A tuft rooted at (x, y), pointing along `ang`; `lit` 0..1 is how much of the dawn it catches.
export function tuft(g, x, y, ang, len, w, lit = 0.5, c = STONE_M, curl = 0) {
  g.save();
  g.translate(x, y);
  g.rotate(ang);
  leaf(g, len, w, 0.5, curl);
  g.fillStyle = lin(g, 0, 0, len, 0, [[0, shade(c, -0.5)], [0.55, shade(c, -0.1 + lit * 0.35)], [1, mix(c, STONE_L, 0.35 + lit * 0.5)]]);
  g.fill();
  line(g, LEAD, 1.5);
  path(g, [[len * 0.1, 0], [len * 0.82, 0]], true); // the rib
  line(g, rgba(shade(c, 0.55), 0.14 + lit * 0.3), 0.8);
  path(g, [[len * 0.12, -w * 0.16], [len * 0.7, -w * 0.12]], true); // and the lit edge above it
  line(g, rgba(STONE_L, 0.1 + lit * 0.4), 0.9);
  g.restore();
}

// A shard of glass: jewel `c`, a pale heart, a lead edge, a rib of lead down it, a glint.
export function shard(g, len, w, c, a = 1) {
  g.save();
  g.globalAlpha *= a;
  leaf(g, len, w, 0.5);
  g.fillStyle = lin(g, 0, 0, len, 0, [[0, shade(c, -0.35)], [0.45, shade(c, 0.4)], [1, shade(c, -0.1)]]);
  g.fill();
  line(g, rgba(LEAD, 0.9), Math.max(1, w * 0.13));
  path(g, [[len * 0.06, 0], [len * 0.86, 0]], true);
  line(g, rgba(LEAD_L, 0.55), Math.max(0.7, w * 0.07));
  path(g, [[len * 0.3, -w * 0.2], [len * 0.62, -w * 0.18]], true);
  line(g, 'rgba(255,255,255,0.65)', Math.max(0.8, w * 0.08));
  g.restore();
}

// A streamer of glass, a long curved pennant (a swallowtail of the hindwing): from (0, 0) out along +x, `len` long, `w`
// wide at its fullest, its spine bent `bend` px at the tip, jewel `c` pale at its heart, with a lead mullion down it.
export function streamer(g, len, w, c, bend = 0) {
  const spine = (u) => [len * u, bend * u * u];
  const edge = (side) => Array.from({ length: 13 }, (_, i) => {
    const u = i / 12;
    const [x, y] = spine(u);
    const half = (w / 2) * Math.sin(Math.PI * Math.min(1, u ** 0.7 * 0.95 + 0.04)) ** 0.8;
    return [x - side * bend * 2 * u * (half / len), y + side * half];
  });
  g.beginPath();
  edge(-1).forEach(([x, y], i) => g[i ? 'lineTo' : 'moveTo'](x, y));
  edge(1).toReversed().forEach(([x, y]) => g.lineTo(x, y));
  g.closePath();
  g.fillStyle = lin(g, 0, -w / 2, 0, w / 2, [[0, shade(c, -0.4)], [0.45, shade(c, 0.35)], [1, shade(c, -0.2)]]);
  g.fill();
  line(g, LEAD, 2);
  g.beginPath();
  for (let i = 1; i <= 11; i++) g[i > 1 ? 'lineTo' : 'moveTo'](...spine(i / 12));
  line(g, rgba(LEAD, 0.8), 1.2);
  g.beginPath();
  for (let i = 2; i <= 9; i++) g[i > 2 ? 'lineTo' : 'moveTo'](spine(i / 12)[0], spine(i / 12)[1] - w * 0.18);
  line(g, 'rgba(255,255,255,0.55)', 1);
}
