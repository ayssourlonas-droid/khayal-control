// The Glass Cathedral's bunker skin (bunker-skins.js, 'glass'): a wall of stained glass in lead cames on stone sills.
// A carved cornice with a row of dentils along the top, a row of tall pointed (lancet) windows between slim stone
// mullions, a stone sill along the foot. Each window is leaded in diamond panes, one jewel colour to a window (rose,
// cobalt, amber, violet, gold, ruby) with a neighbouring colour here and there, each pane lit in its middle and
// dark toward the lead, the top of the window lighter where the dawn reaches it, the glass dark under the arch's
// shoulders; in the point of each arch a little round window (an oculus) ringed in lead. Where a shot carves the wall
// the stone and the glass go with it. Pure per-pixel, like every skin: skin(x, y, w, h, P) -> [rgb, k].
import { hash2, noise2, rgb } from './sprites.js';

const JEWELS = ['#e0457f', '#3a78e0', '#f0a030', '#8a5ae0', '#f4cc50', '#c02848'].map(rgb); // rose, cobalt, amber, violet, gold, ruby
const PANE = 7; // px: one diamond of glass, corner to corner along the lattice
const MULLION = 3;
const grain = (x, y, a) => (hash2(x >> 1, y >> 1) - 0.5) * a;

// The lancet's outline: 1 at the middle of the window (d = 0), 0 at its springing (d = 1), the two arcs of a pointed arch.
const lancet = (d) => Math.sqrt(Math.max(0, 4 - (d + 1) ** 2)) / 1.732;

// The window layout of a w x h wall: how many, how wide, and where the glass starts, springs and ends.
function layout(w, h) {
  const sill = Math.max(4, Math.round(h * 0.12));
  const cornice = Math.max(4, Math.round(h * 0.12));
  const n = Math.max(2, Math.round(w / 32));
  const [top, bottom] = [cornice + 2, h - sill - 2];
  const width = w / n - MULLION;
  return { sill, cornice, n, top, bottom, width, rise: Math.min(Math.round(width * 0.6), (bottom - top) * 0.45) };
}

// The window x falls in: its index and where in it (u from its left edge), or null on a mullion.
function windowAt(x, L) {
  const i = Math.min(L.n - 1, Math.floor(x / (L.width + MULLION)));
  const u = x - i * (L.width + MULLION) - MULLION / 2;
  return u >= 0 && u < L.width ? { i, u } : null;
}

const inGlass = (x, y, L) => {
  const win = windowAt(x, L);
  if (!win || y > L.bottom) return null;
  const half = L.width / 2;
  const spring = L.top + L.rise;
  return y >= spring - L.rise * lancet(Math.abs(win.u + 0.5 - half) / half) ? win : null;
};

// Stone: courses of ashlar with dark joints, a little pitting, lighter toward the top where the dawn lands.
function stone(x, y, w, h, P) {
  const row = Math.floor(y / 9);
  const rx = (x + Math.floor(hash2(row, 4) * 13)) % 26;
  if (y % 9 === 0 || rx === 0) return [P.dark, 0.11];
  const pit = noise2(x, y, 3.4, 9) > 0.82 ? -0.3 : 0;
  return [P.fill, Math.max(-0.9, (noise2(x, y, 9, 3) - 0.5) * 0.26 + grain(x, y, 0.14) + pit + 0.3 * (1 - y / h) + 0.14 - 0.14 * (y % 9 / 9))];
}

function glass(x, y, win, L, P) {
  const { i, u } = win;
  const [a, b] = [u + y, u - y + 400]; // the lattice runs on the diagonals
  const [ca, cb] = [Math.floor(a / PANE), Math.floor(b / PANE)];
  const lead = a % PANE < 1 || b % PANE < 1;
  if (lead) return [P.dark, 0.11];
  const [dx, dy] = [u + 0.5 - L.width / 2, y - (L.top + L.rise * 0.34)];
  const r = Math.hypot(dx, dy);
  if (L.width > 18 && r < 6.4) { // the oculus: a ring of lead round a jewel of another colour
    if (r > 5.2) return [P.dark, 0.11];
    return [JEWELS[(i * 5 + 4) % 6], 0.42 - r * 0.07];
  }
  const near = hash2(ca + i * 11, cb) > 0.72 ? 1 : 0; // here and there a neighbouring colour
  const jewel = JEWELS[(i * 5 + 1 + near) % 6];
  const centre = 1 - (Math.abs(a - (ca + 0.5) * PANE) + Math.abs(b - (cb + 0.5) * PANE)) / PANE; // 1 in the middle of a pane
  const down = (y - L.top) / (L.bottom - L.top);
  return [jewel, 0.5 * centre - 0.3 + 0.24 * (1 - down) - 0.2 * down * down + grain(x, y, 0.1)];
}

export function glassWall(x, y, w, h, P) {
  const L = layout(w, h);
  if (y < L.cornice) { // the cornice: a lit lip, a plain frieze and a row of dentils
    if (y < 2) return [P.light, 0.1];
    if (y >= L.cornice - 3) return x % 4 < 2 ? [P.fill, 0.18 + grain(x, y, 0.1)] : [P.dark, 0];
    return stone(x, y, w, h, P);
  }
  if (y >= h - L.sill) { // the sill: a slab with a pale top edge and the shadow the glass throws under it
    if (y === h - L.sill) return [P.light, 0.16];
    return y < h - L.sill + 3 ? [P.fill, -0.34 + grain(x, y, 0.1)] : stone(x, y, w, h, P);
  }
  const win = inGlass(x, y, L);
  if (!win) return stone(x, y, w, h, P);
  // a pixel of glass beside stone gets the lead's line round the window
  if (!inGlass(x - 1, y, L) || !inGlass(x + 1, y, L) || !inGlass(x, y - 1, L) || !inGlass(x, y + 1, L)) return [P.dark, 0.09];
  return glass(x, y, win, L, P);
}
