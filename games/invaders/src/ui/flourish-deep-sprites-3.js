// The caustics of Lantern Deep (flourish-13.js draws them): the net of bright lines that sunlight throws through
// a moving surface, baked as a tile that repeats sideways without a seam. A tile is the contour lines of two
// smooth noise fields laid over one another (a line where either field crosses its middle, so lines meet and
// cross in a web), sharpened until they are thin, patchy across the tile, and faded out toward the foot so
// the player's zone stays dark. The tile is painted at half size and drawn double: the lines come out soft.
// The lattices are the world's own hash, so a tile is the same every time.
import { cached, hash, rgb } from './sprites.js';
import { smooth } from '../core/math.js';

export const CAUSTIC = {
  w: 480, h: 360, up: 2, // the tile's pixels; it is drawn `up` times as big, so 960 x 720 px of the world
  cell: 20, sharp: 30, // px between lattice points (a larger cell makes larger meshes); the power that thins a line
  color: '#b0f6f0',
  fadeFrom: 200, fadeTo: 700, // world y where the lines start to fade and where they are gone
};

// A noise lattice of nx x ny values, nx of them round the tile's width (so the field repeats sideways).
const lattice = (nx, ny, seed) => Float32Array.from({ length: nx * ny }, (_, i) => hash(i * 31 + seed * 977 + 5));

// Smooth value noise in [0, 1] at lattice position (u, v): wraps in u, stops at the last row in v. (Plain
// variables, no small arrays: the bake calls it a few hundred thousand times.)
function vnoise(a, nx, ny, u, v) {
  const x0 = Math.floor(u);
  const y0 = Math.min(ny - 2, Math.floor(v));
  const fx = smooth(u - x0);
  const fy = smooth(v - y0);
  const i0 = ((x0 % nx) + nx) % nx;
  const i1 = (i0 + 1) % nx;
  const top = a[y0 * nx + i0] * (1 - fx) + a[y0 * nx + i1] * fx;
  const bottom = a[(y0 + 1) * nx + i0] * (1 - fx) + a[(y0 + 1) * nx + i1] * fx;
  return top * (1 - fy) + bottom * fy;
}

// The brightness (0 to 1) of the lines of web `seed` at pixel (x, y) of the tile, before the fade toward the foot.
export function causticField(seed) {
  const nx = CAUSTIC.w / CAUSTIC.cell;
  const ny = Math.ceil(CAUSTIC.h / CAUSTIC.cell) + 2;
  const [setA, setB] = [[0, 1], [2, 3]].map(([c, f]) => [lattice(nx, ny, seed * 8 + c), lattice(nx * 2, ny * 2, seed * 8 + f)]); // two webs, each of a coarse and a fine lattice
  const patch = lattice(2, 5, seed * 8 + 4);
  const web = (set, u, v) => {
    const n = 0.65 * vnoise(set[0], nx, ny, u, v) + 0.35 * vnoise(set[1], nx * 2, ny * 2, u * 2, v * 2);
    return (1 - Math.abs(2 * n - 1)) ** CAUSTIC.sharp;
  };
  return (x, y) => {
    const u = x / CAUSTIC.cell;
    const v = y / CAUSTIC.cell;
    return Math.min(1, web(setA, u, v) + web(setB, u, v)) * (0.55 + 0.45 * vnoise(patch, 2, 5, (x / CAUSTIC.w) * 2, (y / CAUSTIC.h) * 3));
  };
}

// How much of the light is left at world y: all of it above `fadeFrom`, none below `fadeTo`.
export const causticFade = (y) => 1 - smooth((y - CAUSTIC.fadeFrom) / (CAUSTIC.fadeTo - CAUSTIC.fadeFrom));

// Tile `k` (0 or 1): teal-white lines, all in the alpha channel, to be drawn with 'lighter'.
export const causticTile = (k) => cached('deepfxCaustic' + k, CAUSTIC.w, CAUSTIC.h, (g, w, h) => {
  const field = causticField(k + 1);
  const [r, gr, b] = rgb(CAUSTIC.color);
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const fade = causticFade(y * CAUSTIC.up);
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      img.data[p] = r;
      img.data[p + 1] = gr;
      img.data[p + 2] = b;
      img.data[p + 3] = 255 * field(x, y) * fade;
    }
  }
  g.putImageData(img, 0, 0);
});
