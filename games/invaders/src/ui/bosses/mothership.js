// World 1, Arcade Origin: the Mothership. The formation's own pixel art at boss scale (10 px phosphor
// cells, twice the aliens'), so it reads as the same machine grown huge: a violet saucer with a
// window band, a glass dome on top, wing pods, two pink gun turrets and a great pink eye underneath
// (the weak points). Its lights change with the fight: calm cyan, then amber, then red alert.
import { pixelArt, phosphor, bloom } from './kit.js';
import { glow } from '../sprites.js';

const PX = 10;
const CYAN = '#3affc8';
const YELLOW = '#ffd23a';
const PINK = '#ff5ad8';
const RED = '#ff3a4a';
const GREEN = '#5dff8a';

const inside = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
// A lens, thick in the middle and thin at the rims, a raised deck under the dome, a keel below.
const lens = (x, y) => Math.abs(x) < 300 && Math.abs(y - 8) <= 46 * (1 - (x / 300) ** 2) ** 0.6;
const hullAt = (x, y) => lens(x, y) || (y < 8 && inside(x, y, 0, -22, 180, 30)) || inside(x, y, 0, 40, 200, 28);
const cx = (i, cols) => (i - cols / 2 + 0.5) * PX;

// A row of lamps on the lights layer at cell centres (rage overlays).
function lamps(l, y, every, color, from = -300, to = 300) {
  for (let x = from; x <= to; x += PX * every) {
    if (!hullAt(x, y)) continue;
    l.fillStyle = color;
    l.fillRect(x - PX / 2, y - PX / 2, PX, PX);
    bloom(l, x, y, PX * 2.2, color, 0.45);
  }
}

function hull(b, l) {
  const cols = 64;
  const rows = 22;
  const win = [CYAN, YELLOW, PINK];
  pixelArt(b, l, cols, rows, PX, (i, j) => {
    const x = cx(i, cols);
    const y = cx(j, rows);
    if (!hullAt(x, y)) return null;
    if (!hullAt(x, y - PX)) return '#6a58d8';
    if (Math.abs(y - 5) < 1 && i % 3 === 1) return [win[((i / 3) | 0) % 3], true];
    if (Math.abs(y - 5) < 1) return '#0c0a26';
    if (Math.abs(y - 25) < 1) return i % 2 ? '#0c0a26' : '#2a2270';
    if (Math.abs(y - 45) < 1 && i % 4 === 2) return [GREEN, true];
    if (!hullAt(x, y + PX)) return '#0e0b2c';
    if (y < -10) return '#2c2478';
    if (y < 8) return '#221c62';
    return y < 30 ? '#18144c' : '#110e38';
  });
  phosphor(b, l, 0.16, 5);
}

// The glass dome: cyan glass with a reflection, a pilot's two eyes glowing inside, a plated base
// with yellow lamps.
function dome(b, l) {
  const half = [5, 8, 10, 11, 12, 12, 12, 12];
  pixelArt(b, l, 24, 8, PX, (i, j) => {
    const d = Math.abs(i - 11.5);
    if (d >= half[j]) return null;
    if (j >= 5) {
      if (j === 6 && i % 3 === 1) return [YELLOW, true];
      return j === 5 ? '#b0a4ff' : '#6a5ae0';
    }
    if ((i === 9 || i === 14) && j === 3) return [GREEN, true];
    if (i - 4 === j * 1 && j < 4) return '#e8fff8';
    return j < 2 ? '#3ac8ff' : j < 4 ? '#1a7aff' : '#1a3a9a';
  });
  phosphor(b, l, 0.25, 4);
}

// A wing pod (drawn as the left one): an engine nacelle pointing outward, plated in bands, its
// exhaust burning cyan at the tip and a row of running lights.
function wing(b, l) {
  pixelArt(b, l, 15, 7, PX, (i, j) => {
    const top = i < 2 ? 2 : i < 4 ? 1 : 0;
    if (j < top || j > 6 - top) return null;
    if (i === 0) return [j === 3 ? '#ffffff' : CYAN, true];
    if (j === 3 && i % 3 === 2) return [i < 8 ? CYAN : YELLOW, true];
    if (j === top) return '#b0a4ff';
    if (j === 6 - top) return '#2a2270';
    if (i % 4 === 1) return '#3a2e98';
    return j > 3 ? '#5a4ad0' : '#7a6aee';
  });
  bloom(l, -78, 0, 40, CYAN, 0.5);
  phosphor(b, l, 0.18, 4);
}

// A gun turret: a pink housing with a burning core, twin barrels down, muzzles lit.
function gun(b, l) {
  pixelArt(b, l, 8, 6, PX, (i, j) => {
    if (j < 3) {
      if (j === 0 && (i === 0 || i === 7)) return null;
      if (j === 1 && (i === 3 || i === 4)) return ['#ffd0f4', true];
      if (j === 1 && (i === 2 || i === 5)) return ['#b81a8e', true];
      return j === 0 ? '#e070c8' : '#8a1a78';
    }
    if (i !== 2 && i !== 5) return null;
    return j === 5 ? ['#b81a8e', true] : '#4a3a6a';
  });
  phosphor(b, l, 0.35, 4);
}

// The great eye: plated lids, a pale eyeball, a wide pink iris round a black pupil, a glint.
const EYE = ['..LLLLL..', '.LWWIWWL.', 'LWIIIIIWL', 'LWIIPIIWL', 'LWIIIIIWL', '.LWWIWWL.', '..LLLLL..'];
function eye(b, l) {
  pixelArt(b, l, 9, 7, PX, (i, j) => {
    const ch = EYE[j][i];
    if (ch === '.') return null;
    if (ch === 'L') return j === 0 ? '#9a8aff' : '#5a4ad0';
    if (ch === 'P') return '#0a0612';
    if (ch === 'I') return i === 3 && j === 2 ? ['#ffffff', true] : [j < 3 ? '#d83aae' : '#b81a8e', true];
    return '#d8d0f0';
  });
  bloom(l, 0, 0, 46, PINK, 0.4);
  phosphor(b, l, 0.25, 4);
}

export default {
  pad: 50,
  margin: 40,
  hull,
  parts: { dome, wing, gun, eye },
  rage: [
    null,
    (l) => lamps(l, -15, 2, YELLOW, -160, 160),
    (l) => {
      lamps(l, 5, 1, RED);
      lamps(l, 45, 2, RED);
    },
  ],
  // A light sweeping along the window band, quicker as the fight goes on.
  live(ctx, b, t, k) {
    const span = 600;
    const x = ((t * (300 + b.phase * 160)) % span) - span / 2;
    ctx.globalAlpha = 0.5 * k;
    ctx.drawImage(glow(b.phase === 2 ? RED : '#ffffff'), x - 36, 5 - 22, 72, 44);
    ctx.globalAlpha = 1;
  },
};
