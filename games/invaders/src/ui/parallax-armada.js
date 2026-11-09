// The far layer of Sunset Armada: the cloud islands. Against the glare of the sun, dark crags float with
// waterfalls pouring off their lips into the cloud sea below, turf and trees and cottages on top, a
// watchtower with its beacon on the greatest; between them a far fleet of airships sails hull-down, little
// more than shapes edged in gold. The sea of cloud tops fills the foot of the layer, in two ranks, the
// falls ending in mist inside it. The mid layer (parallax-armada-mid.js) and the near one
// (parallax-armada-clouds.js) are registered with this one. See parallax-shapes.js for the painter
// contract. L.lamp is the windows' colour, L.fleet the far ships'.
import { rgba, lin } from './sprites.js';
import { TONES, hazed, bank, lobes } from './cloud-kit.js';
import { GOLD, EMBER, SUN_X, toward, rimLight, pane, flag } from './parallax-armada-kit.js';
import { isle } from './parallax-armada-isle.js';
import { ghost } from './parallax-armada-ships-2.js';
import { MID } from './parallax-armada-mid.js';
import { CLOUDS } from './parallax-armada-clouds.js';

const SEA = 480; // layer y of the cloud sea's foot of the first rank

// A slender watchtower on the island at (x, y = its turf): a stone shaft in stages with a gallery, a lantern
// room with a lit window and a conical roof, a flag, a beacon burning on the roof.
function watchtower(g, out, rng, L, x, y) {
  const dir = toward(x);
  const build = (c, ox = 0, oy = 0) => { // the shaft and gallery, the lantern room, its roof and the flagpole, as one outline
    const poly = (pts) => {
      pts.forEach(([px, py], i) => (i ? c.lineTo(px + ox, py + oy) : c.moveTo(px + ox, py + oy)));
      c.closePath();
    };
    poly([[x - 15, y], [x - 10, y - 92], [x - 19, y - 92], [x - 19, y - 106], [x + 19, y - 106], [x + 19, y - 92], [x + 10, y - 92], [x + 15, y]]);
    poly([[x - 11, y - 106], [x - 11, y - 138], [x - 15, y - 138], [x, y - 172], [x + 15, y - 138], [x + 11, y - 138], [x + 11, y - 106]]);
    poly([[x - 1, y - 172], [x - 1, y - 196], [x + 1, y - 196], [x + 1, y - 172]]);
  };
  g.fillStyle = L.color;
  g.beginPath();
  build(g);
  g.fill();
  for (let i = 0; i < 5; i++) g.fillRect(x - 19 + i * 8.5, y - 112, 5, 7); // crenels
  rimLight(g, build, dir, 3.6, GOLD, 0.95);
  rimLight(g, build, -dir, 1.6, '#ff9ab0', 0.55);
  pane(g, out, rng, x, y - 122, 6, L.lamp, 'pulse'); // the lantern room's window
  for (const wy of [-30, -58, -80]) pane(g, out, rng, x + (wy % 2) * 2 - 1, y + wy, 2.6, L.lamp, wy === -58 ? 'flicker' : null);
  flag(out, x + 1, y - 193, 26, 12, -dir, '#e8788c');
  out.lights.push({ x, y: y - 176, r: 60, color: EMBER, mode: 'pulse', ph: 0.3, a: 0.85 }); // the beacon
  out.lights.push({ x, y: y - 176, r: 150, color: GOLD, mode: 'steady', ph: 0, a: 0.18 });
  g.fillStyle = L.color;
}

function cloudisles(g, w, h, rng, L, out) {
  for (let i = 0; i < 6; i++) ghost(g, out, rng, L, 140 + i * 360 + rng() * 160, 130 + rng() * 170, 80 + rng() * 40, rng() < 0.5 ? 1 : -1);
  for (const dx of [-170, 150]) ghost(g, out, rng, L, SUN_X + dx, 250 + rng() * 40, 100 + rng() * 25, dx < 0 ? 1 : -1); // two against the sun's own glare
  const back = hazed(TONES, '#e8808c', 0.2);
  for (let x = -120; x < w; x += 260 + rng() * 120) bank(g, lobes(rng, x, SEA + 10, 300 + rng() * 160, 90 + rng() * 60), back, undefined, 1, 0.35); // the sea's far rank
  const greatest = 560; // layer x of the island with the tower
  const spots = [];
  for (let x = 110; x < w - 200; ) {
    const iw = 170 + rng() * 170;
    spots.push([x + iw / 2, 60 + rng() * 140, iw, 130 + rng() * 120]);
    x += iw + 100 + rng() * 190;
  }
  const big = spots.reduce((a, s, i) => (Math.abs(s[0] - greatest) < Math.abs(spots[a][0] - greatest) ? i : a), 0);
  spots[big][2] = Math.max(spots[big][2], 330);
  spots[big][3] = Math.max(spots[big][3], 210);
  spots[big][1] = 225; // low enough for the tower to stand inside the layer
  spots.forEach(([cx, top, iw, depth], i) => {
    isle(g, out, rng, L, cx, top, iw, depth, { houses: i === big ? 2 : 1, trees: i === big ? 6 : 3, fall: i % 3 !== 1 ? SEA + 30 - top - depth : 0 });
    if (i === big) watchtower(g, out, rng, L, cx + (toward(cx) > 0 ? 40 : -40), top);
  });
  const front = hazed(TONES, '#e8808c', 0.08);
  for (let x = -100; x < w; x += 240 + rng() * 120) bank(g, lobes(rng, x, SEA + 120, 320 + rng() * 160, 90 + rng() * 50), front, undefined, 1, 0.5); // and its near rank, over the falls' feet
  g.fillStyle = lin(g, 0, SEA + 30, 0, h, [[0, rgba('#e8908c', 0)], [1, rgba('#f0a090', 1)]]);
  g.fillRect(0, SEA + 30, w, h);
  g.fillStyle = L.color;
}

export const ARMADA = { cloudisles, ...MID, ...CLOUDS };
