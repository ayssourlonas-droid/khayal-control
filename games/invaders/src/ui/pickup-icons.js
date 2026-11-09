// Pickup icons of worlds 1-4 (see pickup-skins.js): plain paths, drawn by the HUD every frame too.
import { INK, rgba } from './sprites.js';

// The spread's three prongs, in rad from straight up (every spread icon draws these).
export const FAN = [-0.55, 0, 0.55];

// A four-point throwing star at (x, y), radius r.
function shuriken(g, x, y, r, rot) {
  g.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = rot + (i * Math.PI) / 4;
    const d = i % 2 ? r * 0.32 : r;
    g.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  g.closePath();
  g.fill();
  g.stroke();
}

// Neon on a path already built: a soft wide pass, the colour, a white core.
function tube(g, color, w) {
  for (const [k, c] of [[3, rgba(color, 0.25)], [1, color], [0.35, '#ffffff']]) {
    g.lineWidth = w * k;
    g.strokeStyle = c;
    g.stroke();
  }
}

// 7 x 7 pixel icons for the arcade world, 4 px cells.
const PIX = {
  spread: ['x..x..x', '.x.x.x.', '..xxx..', '...x...', '...x...', '..xxx..', '.......'],
  laser: ['...x...', '..xxx..', '..xxx..', '..xxx..', '..xxx..', '..xxx..', '...x...'],
  rapid: ['...x...', '..x.x..', '.x...x.', '...x...', '..x.x..', '.x...x.', '.......'],
  shield: ['..xxx..', '.x...x.', 'x.....x', 'x.....x', 'x.....x', '.x...x.', '..xxx..'],
  homing: ['....x..', '...xxx.', '..xxxxx', '....x..', '....x..', '..xx...', 'xx.....'],
  slow: ['xxxxxxx', '.x...x.', '..x.x..', '...x...', '..xxx..', '.xxxxx.', 'xxxxxxx'],
  bomb: ['.....xx', '....x..', '..xxx..', '.xxxxx.', '.xxxxx.', '.xxxxx.', '..xxx..'],
  life: ['...x...', '...x...', '..xxx..', '.xxxxx.', 'xxxxxxx', 'xx.x.xx', 'x.....x'],
};
const pixel = (rows) => (g, color) => {
  g.fillStyle = color;
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch === 'x' && g.fillRect(x * 4 - 14, y * 4 - 14, 4, 4)));
};

export const ICONS1 = {
  1: Object.fromEntries(Object.entries(PIX).map(([k, rows]) => [k, pixel(rows)])),
  2: {
    laser(g, color) { // a pink neon beam
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(0, -15);
      g.lineTo(0, 15);
      tube(g, color, 5);
    },
    spread(g, color) {
      g.lineCap = 'round';
      g.beginPath();
      for (const a of FAN) {
        g.moveTo(0, 12);
        g.lineTo(Math.sin(a) * 24, 12 - Math.cos(a) * 24);
      }
      tube(g, color, 3);
    },
  },
  3: {
    laser(g, color) { // twin blaster bolts
      for (const x of [-5, 5]) {
        g.fillStyle = color;
        g.fillRect(x - 3, -14, 6, 28);
        g.fillStyle = '#ffffff';
        g.fillRect(x - 1, -12, 2, 24);
      }
    },
  },
  4: {
    spread(g, color) { // a fan of three throwing stars
      g.fillStyle = color;
      g.strokeStyle = INK;
      g.lineWidth = 1.2;
      for (const a of [-0.75, 0, 0.75]) shuriken(g, Math.sin(a) * 13, 7 - Math.cos(a) * 13, 9.5, a + 0.4);
    },
    laser(g, color) { // a drawn blade
      g.lineCap = 'round';
      g.strokeStyle = INK;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(-10, 12);
      g.lineTo(12, -14);
      g.stroke();
      g.strokeStyle = color;
      g.lineWidth = 3;
      g.stroke();
      g.fillStyle = '#e8dcc8';
      g.fillRect(-9, 5, 8, 3);
      g.strokeStyle = '#3a1a0a';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(-8, 10);
      g.lineTo(-14, 17);
      g.stroke();
    },
  },
};
