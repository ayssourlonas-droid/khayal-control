import { WIDTH } from './kinds.js';

// Destructible cover: a pixel mask per bunker, carved by shots of both sides (Barrage's carve
// technique). bunker = { x, y, w, h, mask, solid }: (x, y) is the top-left corner in world px and mask
// is a Uint8Array of w * h bytes, one per world pixel, row by row from the top, 1 = solid; solid
// counts the 1s (kept by hitBunker and carveRect, the only writers). Pixel (ix, iy) sits at the point
// (ix + 0.5, iy + 0.5). Plain data, so it survives structuredClone.

export const BUNKER = { w: 160, h: 60, y: 560, count: 4 }; // h 60 puts the floor on the player zone

const PAD = 4; // a hit carves a disc this much wider than the projectile, so a second one fits the hole
const STEP = 4; // px between the samples taken along a projectile's path; under the smallest radius (5)

// Is the pixel (x, y) of a w * h bunker solid? Two stepped shoulders cut from the top corners, and
// a stepped arch cut from the bottom centre (narrower at its top than at its foot).
function solidAt(x, y, w, h) {
  const step = Math.round(h * 0.1);
  const inset = Math.round(w * 0.06);
  const shoulder = y < step ? 2 * inset : y < 2 * step ? inset : 0;
  if (x < shoulder || x >= w - shoulder) return 0;
  const archTop = h - Math.round(h * 0.4);
  if (y < archTop) return 1;
  const half = Math.round(w * 0.14) - (y < archTop + step ? Math.round(inset / 2) : 0);
  return Math.abs(x + 0.5 - w / 2) < half ? 0 : 1;
}

export function createBunker(x, y, w, h) {
  const mask = new Uint8Array(w * h);
  let solid = 0;
  for (let iy = 0; iy < h; iy++) {
    for (let ix = 0; ix < w; ix++) {
      const v = solidAt(ix, iy, w, h);
      mask[iy * w + ix] = v;
      solid += v;
    }
  }
  return { x, y, w, h, mask, solid };
}

// The level's bunkers: evenly spread across the width.
export function layoutBunkers() {
  const { w, h, y, count } = BUNKER;
  return Array.from({ length: count }, (_, i) => createBunker(Math.round((WIDTH * (i + 0.5)) / count - w / 2), y, w, h));
}

// Visit the solid pixels whose centre lies within r of (lx, ly) (the bunker's own coordinates);
// stop at the first one `visit` answers true for. Returns whether it stopped.
function eachSolid(b, lx, ly, r, visit) {
  const r2 = r * r;
  const y1 = Math.min(b.h - 1, Math.floor(ly + r));
  const x1 = Math.min(b.w - 1, Math.floor(lx + r));
  for (let iy = Math.max(0, Math.floor(ly - r)); iy <= y1; iy++) {
    const dy = iy + 0.5 - ly;
    for (let ix = Math.max(0, Math.floor(lx - r)); ix <= x1; ix++) {
      const dx = ix + 0.5 - lx;
      if (b.mask[iy * b.w + ix] && dx * dx + dy * dy <= r2 && visit(iy * b.w + ix)) return true;
    }
  }
  return false;
}

// A circle of radius r at world (x, y) touching solid pixels is a hit: the bunker loses a disc of
// radius r + 4 around it (so the same projectile fits the hole and gets through) and the
// projectile is spent. Misses change nothing.
export function hitBunker(b, x, y, r) {
  const lx = x - b.x;
  const ly = y - b.y;
  if (lx + r < 0 || lx - r >= b.w || ly + r < 0 || ly - r >= b.h) return false;
  if (!eachSolid(b, lx, ly, r, () => true)) return false;
  eachSolid(b, lx, ly, r + PAD, (i) => {
    b.mask[i] = 0;
    b.solid -= 1;
  });
  return true;
}

// Clear every pixel whose centre lies in the world rectangle [x0, x1] x [y0, y1]; how many went.
export function carveRect(b, x0, x1, y0, y1) {
  let removed = 0;
  const ix0 = Math.max(0, Math.ceil(x0 - b.x - 0.5));
  const ix1 = Math.min(b.w - 1, Math.floor(x1 - b.x - 0.5));
  for (let iy = Math.max(0, Math.ceil(y0 - b.y - 0.5)); iy <= Math.min(b.h - 1, Math.floor(y1 - b.y - 0.5)); iy++) {
    for (let ix = ix0; ix <= ix1; ix++) {
      if (b.mask[iy * b.w + ix]) {
        b.mask[iy * b.w + ix] = 0;
        removed++;
      }
    }
  }
  b.solid -= removed;
  return removed;
}

// Walk a projectile (x, y, vx, vy, r) back along the path it flew in this tick and hit the first
// bunker it touches, in flight order. Sampled every STEP px so a fast shot cannot tunnel. Returns
// where it hit, or null. Never for lasers: the caller skips those.
export function sweepBunkers(bunkers, p, dt) {
  const px = p.x - p.vx * dt;
  const py = p.y - p.vy * dt;
  const n = Math.max(1, Math.ceil(Math.hypot(p.x - px, p.y - py) / STEP));
  for (let i = 0; i <= n; i++) {
    const x = px + ((p.x - px) * i) / n;
    const y = py + ((p.y - py) * i) / n;
    for (const b of bunkers) if (hitBunker(b, x, y, p.r)) return { x, y };
  }
  return null;
}
