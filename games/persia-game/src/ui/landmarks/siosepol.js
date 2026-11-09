// Si-o-se-pol at night, the parallax layer kind 'siosepol' (parallax-shapes.js has the painter
// contract), painted in PIXEL-sized blocks (kit.js): the whole bridge in view, its thirty-three
// arches lit gold from inside with glows that pulse (layer lights), a pier pierced by its own small
// arch between each two, an arcade of dark arches above under a flat parapet; a pavilion at each end
// on its bank among poplars, and the Zayandeh river below with all of it mirrored, dimmer and broken
// by ripples. The layer brings L.lit, L.ink, L.glow, L.lamp, L.water and L.tree. Rows are counted
// from F, the waterline.
import { PIXEL, mix } from '../sprites.js';
import { scene, reflect } from './kit.js';

const SPANS = 33;
const PITCH = 12; // blocks per span: a 3-block pier, then a 9-block arch
const RISE = 36; // blocks from the waterline up to the parapet's top
const UNDER = 44; // blocks from the waterline down to the band's foot; the ground hides the lowest 20
const PAVILION = 16; // blocks across

// The top row of a pointed arch `wide` blocks across at column c, `tall` blocks from its springing
// up to its point at row `apex`.
const archTop = (c, wide, apex, tall) => apex + Math.round(tall * (Math.abs(c + 0.5 - wide / 2) / (wide / 2)) ** 1.6);

export function siosepol(g, w, h, rng, L, lights) {
  const tone = {
    '#': L.color, '+': L.lit, '-': L.ink, G: L.lamp, g: L.glow, h: mix(L.glow, L.ink, 0.55), '~': L.water, t: L.tree,
  };
  const art = scene(g, w, h, rng, L, lights, tone, UNDER);
  const x0 = Math.round((art.BW - SPANS * PITCH - 3) / 2); // the first pier
  const x1 = x0 + SPANS * PITCH + 3; // past the last pier
  g.save();
  g.scale(PIXEL, PIXEL);
  bank(art, x0 - PAVILION, -1);
  bank(art, x1, 1);
  bridge(art, x0, x1);
  river(art);
  g.restore();
  reflect(g, 0, w, art.F, UNDER);
}

// The deck in one face of stone, then the piers, and the arches lit or cut into it.
function bridge({ box, post, slab, lights, L, F }, x0, x1) {
  slab(x0, F - RISE, x1 - x0, RISE);
  box(x0, F - 22, x1 - x0, 1, '+'); // the string course under the arcade
  for (let i = 0; i <= SPANS; i++) {
    const x = x0 + i * PITCH;
    post(x, F - 12, 3, 12);
    box(x + 1, F - 17, 1, 4, 'h');
    box(x + 1, F - 31, 1, 6, '-');
  }
  for (let i = 0; i < SPANS; i++) {
    const x = x0 + 3 + i * PITCH;
    for (let c = 0; c < 9; c++) {
      const top = archTop(c, 9, F - 19, 7);
      box(x + c, top, 1, 2, 'G');
      box(x + c, top + 2, 1, F - 7 - top, 'g');
      box(x + c, F - 5, 1, 5, 'h');
    }
    for (let c = 0; c < 4; c++) {
      const top = archTop(c, 4, F - 32, 2);
      box(x + 2 + c, top, 1, F - 26 - top, '-');
      box(x + 2 + c, F - 26, 1, 2, 'h');
    }
    lights.push({ x: (x + 4.5) * PIXEL, y: (F - 10) * PIXEL, r: 50, color: L.lamp, ph: i / 7.3, a: 0.4 });
  }
}

// A bank on side s (-1 left, 1 right) of the pavilion standing at x: poplars behind, the pavilion
// a storey above the deck with its lit gateway, and the quay wall running out to the band's edge.
function bank({ box, slab, rng, lights, L, F, BW }, x, s) {
  for (let k = 0; k < 9; k++) {
    const tx = s < 0 ? x - 4 - k * 7 - Math.floor(rng() * 3) : x + PAVILION + 1 + k * 7 + Math.floor(rng() * 3);
    poplar(box, tx, F - 6, 18 + Math.floor(rng() * 16));
  }
  const top = F - RISE - 8;
  slab(x, top, PAVILION, F - top);
  box(x - 1, top + 2, PAVILION + 2, 1, '+'); // the cornice
  for (let c = 0; c < 6; c++) {
    const at = archTop(c, 6, F - 24, 4);
    box(x + 5 + c, at, 1, F - at, c === 0 || c === 5 ? 'h' : 'g');
  }
  for (const wx of [x + 2, x + PAVILION - 4]) box(wx, top + 6, 2, 4, '-');
  lights.push({ x: (x + 8) * PIXEL, y: (F - 12) * PIXEL, r: 60, color: L.lamp, ph: x / 31, a: 0.45 });
  slab(s < 0 ? 0 : x + PAVILION, F - 6, s < 0 ? x : BW - x - PAVILION, 6);
}

// A poplar `tall` blocks high standing on row y: a narrow spire, widest a third of the way up.
function poplar(box, x, y, tall) {
  box(x + 1, y - tall, 1, tall, 't');
  box(x, y - Math.round(tall * 0.75), 3, Math.round(tall * 0.6), 't');
}

// The river from the waterline down, its surface glinting.
function river({ box, rng, F, BW }) {
  box(0, F, BW, UNDER, '~');
  for (let x = 0; x < BW; x += 3 + Math.floor(rng() * 7)) box(x, F, 1 + Math.floor(rng() * 3), 1, '+');
}
