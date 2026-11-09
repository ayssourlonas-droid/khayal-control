// Lantern Deep's bunker skin (bunker-skins.js, 'reef'): a drowned wall. Courses of big ashlar blocks whose joints
// have been eaten wide and wander out of level, the faces salt-pitted and speckled, the corners chipped; barnacles
// crowd the stone in patches (a pale shell round a dark mouth), a few tiny teal polyps glow in it, and moss
// creeps up from the foot and along the joints. Along the top a crust of coral has grown, in colonies side by
// side: staghorn prongs, grooved brain coral, a sea fan's net, a cushion of beads; pink and violet, and thickest
// where it drapes over the two top corners. Pure per-pixel, like every skin: skin(x, y, w, h, P) -> [rgb, k].
import { hash2, noise2, rgb } from './sprites.js';

const grain = (x, y, a) => (hash2(x >> 1, y >> 1) - 0.5) * a;
const speck = (x, y) => grain(x, y, 0.18) + (hash2(x * 3 + 1, y) > 0.9 ? 0.24 : 0); // coral's grain, and the pale dots of its polyps
const VIOLET = rgb('#b27cff'); // coral that is not pink (the palette has one accent)
const MOSS = rgb('#2f8a60');
const COURSE = 14; // px: one course of blocks
const CRUST = [13, 12]; // colony width: [least, extra]
const DRAPE = [18, 0.9]; // the corners: coral reaches this far in from the stepped edge, and 0.9 px deeper for each px nearer

// The colonies across the top, built once, looked up by x: { x, w, j, type, violet, depth }. Types: 0 staghorn,
// 1 brain, 2 sea fan, 3 beads; neighbours alternate pink and violet (mostly).
const COLONIES = (() => {
  const at = [];
  for (let x = -Math.floor(hash2(2, 5) * 10), j = 0; x < 320; j++) {
    const w = CRUST[0] + Math.floor(hash2(j, 7) * CRUST[1]);
    const c = { x, w, j, type: j % 4 === 3 ? 1 : Math.floor(hash2(j, 9) * 4), violet: (j + (hash2(j, 3) > 0.75 ? 1 : 0)) % 2 === 0, depth: 10 + hash2(j, 11) * 7 };
    for (let i = Math.max(0, x); i < x + w && i < 320; i++) at[i] = c;
    x += w;
  }
  return at;
})();

function crust(x, y, w, h, P) {
  const c = COLONIES[x];
  const u = (x - c.x + 0.5) / c.w;
  const step = Math.round(h * 0.1); // the shoulders the core cuts from the top corners (bunkers.js), so the drape follows them
  const shoulder = y < step ? 2 * Math.round(w * 0.06) : y < 2 * step ? Math.round(w * 0.06) : 0;
  const D = c.depth * (0.55 + 0.45 * Math.sin(Math.PI * u)) + Math.max(0, DRAPE[0] - (Math.min(x, w - 1 - x) - shoulder)) * DRAPE[1];
  if (y >= D + 9 || (x === c.x && y > 3)) return null; // a tine can reach 9 px past D; a seam parts neighbours
  const hue = (k) => (c.violet ? [VIOLET, Math.max(-1, k - 0.12)] : [P.accent, Math.max(-1, k)]);
  const lit = 0.2 - 0.34 * (y / D);
  if (c.type === 0) { // staghorn: a solid base, and from it a row of little stems, each a trunk that forks into two tines
    const [stem, p] = [Math.floor((x + c.j * 3) / 9), ((x + c.j * 3) % 9) - 4];
    const fork = D * 0.5 + hash2(stem, c.j) * 3;
    const tines = 6 + hash2(c.j, stem) * 3;
    if (y < fork - 1) return hue(lit + (p < -1 ? 0.12 : 0) + speck(x, y) - (y >= fork - 3 ? 0.16 : 0));
    const reach = (y - fork) * 0.75 + 1.2;
    const [trunk, tine] = [Math.abs(p) <= 1 && y < fork + 2, y >= fork && y < fork + tines && Math.abs(Math.abs(p) - reach) < 1.3];
    if (!trunk && !tine) return null;
    return hue(lit + (p < 0 ? 0.12 : -0.14) + (y >= fork + tines - 2 ? 0.3 : 0) - (y % 4 === 0 ? 0.08 : 0));
  }
  if (c.type === 1) { // brain coral: a solid mound, its surface a maze of dark grooves
    const low = D + Math.sin(x * 0.85 + c.j) * 1.4;
    if (y >= low) return null;
    if (y >= low - 1.2) return hue(-0.38);
    if (Math.abs(noise2(x, y, 4.4, c.j + 3) - 0.5) < 0.075) return hue(lit - 0.5);
    return hue(lit + 0.06 + (noise2(x, y, 3, 2) - 0.5) * 0.3 + speck(x, y) * 0.6);
  }
  if (c.type === 2) { // a sea fan: a half ellipse of diagonal net with a solid rim, the stone showing through the holes
    const q = ((x + 0.5 - c.x - c.w / 2) / (c.w / 2)) ** 2 + (y / (D + 3)) ** 2;
    if (q > 1) return null;
    const rim = q > 0.62;
    if (rim || (x + y) % 4 === 0 || (x - y + 400) % 4 === 0) return hue(rim ? 0.2 : 0.1 - 0.24 * (y / D));
    return null;
  }
  const row = Math.floor(y / 4); // beads: staggered rows, a lit disc each, dark between
  const ox = (row % 2) * 2.5;
  const [cx, cy] = [c.x - ox + Math.floor((x - c.x + ox) / 5) * 5 + 2.5, row * 4 + 2];
  if (cy > D) return null;
  const [dx, dy] = [x + 0.5 - cx, y + 0.5 - cy];
  return Math.hypot(dx, dy * 1.15) < 2.3 ? hue(0.3 - (dx + dy) * 0.12) : [P.dark, 0];
}

// A tiny polyp: bright heart, a fan of teal tentacles, a stalk.
const POLYP = ['x.o.x', '.xox.', '..x..'];
const [PW, PH] = [22, 18];
function polyp(x, y, w, h, P) {
  const [gx, gy] = [Math.floor(x / PW), Math.floor(y / PH)];
  if (gy < 1 || hash2(gx + 3, gy + 8) < 0.45) return null;
  const [px, py] = [gx * PW + 4 + Math.floor(hash2(gx, gy + 2) * (PW - 9)), gy * PH + 2 + Math.floor(hash2(gy, gx + 6) * (PH - 6))];
  if (py > h - 9) return null;
  const ch = POLYP[y - py]?.[x - px];
  return ch === 'o' ? [P.light, 0.55] : ch === 'x' ? [P.edge, -0.15] : null;
}

// Barnacles, only in patches: one to a small cell, a pale shell lit from above round a dark mouth, shadowed below.
const [CW, CH] = [8, 7];
function barnacle(x, y, P) {
  if (noise2(x, y, 28, 11) < 0.56) return null;
  const [gx, gy] = [Math.floor(x / CW), Math.floor(y / CH)];
  const [sx, sy] = [x % CW < CW / 2 ? -1 : 1, y % CH < CH / 2 ? -1 : 1];
  for (const [i, j] of [[0, 0], [sx, 0], [0, sy], [sx, sy]]) { // its own cell and the three it touches
    const [cx, cy] = [gx + i, gy + j];
    if (hash2(cx, cy + 40) < 0.35) continue;
    const r = 1.5 + hash2(cx + 9, cy) * 1.2;
    const [dx, dy] = [x + 0.5 - (cx + 0.3 + hash2(cx, cy) * 0.4) * CW, y + 0.5 - (cy + 0.3 + hash2(cy, cx + 5) * 0.4) * CH];
    const d = Math.hypot(dx, dy);
    if (d < r * 0.5) return [P.dark, 0.1];
    if (d < r) return [P.light, -0.04 - 0.3 * (dy / r) + grain(x, y, 0.1)];
    if (d < r + 1 && dy > 0) return [P.dark, 0];
  }
  return null;
}

function stone(x, y, w, h, P) {
  const yy = y + Math.round((noise2(x, 0, 20, 3) - 0.5) * 5); // the courses wander out of level
  const row = Math.floor(yy / COURSE);
  const ry = yy - row * COURSE;
  const bw = 38 + Math.floor(hash2(row, 8) * 3) * 8;
  const rx = (x + Math.floor(hash2(row, 4) * bw)) % bw;
  const wide = noise2(x, y, 7, 5) > 0.66; // the joint eaten wider here
  const joint = ry === 0 || rx === 0 || (wide && (ry === 1 || rx === 1));
  const moss = noise2(x, y, 10, 7) + 0.3 * (y / h) + (joint ? 0.14 : 0);
  if (moss > 0.95) return [MOSS, (noise2(x, y, 3, 2) - 0.5) * 0.4 - 0.15 + grain(x, y, 0.25)];
  if (joint) return [P.dark, 0];
  if ((rx < 2 || rx > bw - 3) && (ry < 2 || ry > COURSE - 3)) return [P.dark, 0.05]; // a chipped corner
  if (hash2(x, y) > 0.986) return [P.light, -0.2]; // a speck of salt
  const col = Math.floor((x + Math.floor(hash2(row, 4) * bw)) / bw);
  const pit = noise2(x, y, 3.2, 9) > 0.8 ? -0.36 : 0;
  const edge = ry === 1 ? 0.14 : ry === COURSE - 1 ? -0.16 : rx === 1 ? 0.07 : 0;
  const tone = (hash2(col + row * 13, 6) - 0.5) * 0.24 + (noise2(x, y, 10, 3) - 0.5) * 0.3 + grain(x, y, 0.14);
  return [P.fill, Math.max(-0.9, tone + pit + edge + 0.2 * (1 - y / h) - 0.12 * (ry / COURSE) - 0.38 * (y / h) ** 2)];
}

export function reef(x, y, w, h, P) {
  return crust(x, y, w, h, P) ?? polyp(x, y, w, h, P) ?? barnacle(x, y, P) ?? stone(x, y, w, h, P);
}
