// The Shah Mosque's great dome (naqsh-mosque.js), centred on column cx and standing behind the portal:
// a tiled drum ringed with lit windows, the turquoise bulb above it in bands of patterned tile,
// floodlit from below and down its left, and a finial with a lamp at its tip. `up` counts blocks up
// from the street. Tones: V turquoise, X lit, Y shade, Z deep shade, T U u tile, q gold, g h window.
import { PIXEL } from '../sprites.js';

const R = 20; // the bulb's greatest half-width
const DRUM = { half: 17, up: 56, tall: 16 }; // its half-width, the row its foot is on, its height
const BULB = 36;
const BAND = { every: 8, from: 6 }; // a band of patterned tile every 8 rows, from the 6th, two rows deep
const WINDOWS = 7; // across the drum's front, 5 blocks apart

// How wide the bulb is at height t (0 at its foot to 1 at its tip), as a share of R: it swells,
// then draws in to a point like an onion.
const swell = (t) => (t < 0.3 ? 0.8 + 0.2 * Math.sin((t / 0.3) * (Math.PI / 2)) : (1 - ((t - 0.3) / 0.7) ** 2.3) ** 0.85);

export function dome(art, cx) {
  drum(art, cx);
  bulb(art, cx);
}

function drum({ box, row }, cx) {
  const { half, up, tall } = DRUM;
  box(cx - half, row(up + tall - 1), half * 2 + 1, tall, 'T');
  box(cx - half, row(up + tall - 1), half * 2 + 1, 1, 'U'); // the lit cornice
  box(cx - half, row(up + tall - 2), half * 2 + 1, 1, 'u');
  box(cx - half, row(up + 1), half * 2 + 1, 2, 'u');
  for (let k = 0; k < WINDOWS; k++) {
    const x = cx + (k - (WINDOWS >> 1)) * 5 - 1;
    box(x, row(up + tall - 4), 3, 9, 'g');
    box(x, row(up + tall - 4), 3, 1, 'h');
    box(x + 1, row(up + 4), 1, 2, 'G');
  }
}

function bulb({ box, row, lights, L }, cx) {
  const base = DRUM.up + DRUM.tall;
  for (let j = 0; j < BULB; j++) {
    const t = j / (BULB - 1);
    const hw = Math.round(R * swell(t));
    const band = j % BAND.every >= BAND.from;
    for (let c = cx - hw; c <= cx + hw; c++) {
      const u = hw ? (c - cx) / hw : 0; // -1 at its left edge to 1 at its right
      const lit = 0.95 - 0.5 * Math.abs(u + 0.35) ** 1.5 - 0.4 * t ** 0.9; // brightest low down, a little left of the middle
      let tone = lit > 0.7 ? 'X' : lit > 0.45 ? 'V' : lit > 0.22 ? 'Y' : 'Z';
      if (band) tone = (c + j) % 4 === 0 ? 'q' : lit > 0.3 ? 'T' : 'u';
      box(c, row(base + j), 1, 1, tone);
    }
  }
  const tip = base + BULB;
  box(cx - 1, row(tip), 3, 1, 'q'); // a collar, the spike, and its lamp
  box(cx, row(tip + 4), 1, 4, 'q');
  box(cx, row(tip + 5), 1, 1, 'G');
  lights.push({ x: (cx + 0.5) * PIXEL, y: row(tip + 5) * PIXEL, r: 30, color: L.lamp, ph: 2.2, a: 0.5 });
  lights.push({ x: (cx + 0.5) * PIXEL, y: row(base + 14) * PIXEL, r: 150, color: L.turq, ph: 0.3, a: 0.3 });
  lights.push({ x: (cx + 0.5) * PIXEL, y: row(DRUM.up + 8) * PIXEL, r: 90, color: L.lamp, ph: 1.4, a: 0.3 });
}
