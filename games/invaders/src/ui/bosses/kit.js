// Painting kit for the boss painters (bosses/<kind>.js), on top of the alien kit (aliens/kit.js):
// the same body/lights split, the same INK outline, plus what big machines need: plates, rivets,
// slats, panel lines, procedural pixel art and a hot muzzle. Bake-time only; nothing here runs per
// frame. A painter draws centred on (0, 0) in world px: the hull in boss coordinates, a part in its
// own (its rect is w x h around the origin and its art must cover it, since the rect is the hit box).
import { path, pixels, ink, lin, rad, line, circle, eye, bloom, rgba, shade } from '../aliens/kit.js';
import { cached } from '../sprites.js';

export {
  TAU, path, sym, both, ink, lin, rad, chrome, gloss, bloom, eye, neon, phosphor, line, ellipse, rgba, shade,
} from '../aliens/kit.js';

export function rrect(g, x, y, w, h, r) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}

// A plate: a rounded rect filled top-lit (light, colour, dark), outlined in INK, with a thin bright
// bevel along its top edge.
export function plate(g, x, y, w, h, r, c, lw = 3) {
  rrect(g, x, y, w, h, r);
  ink(g, lin(g, 0, y, 0, y + h, [[0, shade(c, 0.35)], [0.45, c], [1, shade(c, -0.55)]]), lw);
  g.save();
  rrect(g, x + 3, y + 3, w - 6, h - 6, Math.max(1, r - 3));
  g.clip();
  path(g, [[x, y + 4], [x + w, y + 4]], true);
  line(g, rgba('#ffffff', 0.28), 2);
  g.restore();
}

export function rivets(g, pts, r = 2.2, c = '#ffffff') {
  for (const [x, y] of pts) {
    circle(g, x, y + 0.8, r);
    g.fillStyle = rgba('#000000', 0.55);
    g.fill();
    circle(g, x, y, r);
    g.fillStyle = rgba(c, 0.7);
    g.fill();
  }
}

// Rivets along the inside of a rect, every `step` px.
export function rivetRect(g, x, y, w, h, step, r = 2, c = '#ffffff', inset = 7) {
  const pts = [];
  const nx = Math.max(1, Math.round((w - inset * 2) / step));
  const ny = Math.max(1, Math.round((h - inset * 2) / step));
  for (let i = 0; i <= nx; i++) pts.push([x + inset + ((w - inset * 2) * i) / nx, y + inset], [x + inset + ((w - inset * 2) * i) / nx, y + h - inset]);
  for (let j = 1; j < ny; j++) pts.push([x + inset, y + inset + ((h - inset * 2) * j) / ny], [x + w - inset, y + inset + ((h - inset * 2) * j) / ny]);
  rivets(g, pts, r, c);
}

// Panel seams: dark lines with a faint lit lip below each.
export function seams(g, segs, a = 0.45, w = 1.6) {
  for (const s of segs) {
    path(g, s, true);
    line(g, rgba('#000000', a), w);
    g.save();
    g.translate(0, w);
    path(g, s, true);
    line(g, rgba('#ffffff', a * 0.25), 1);
    g.restore();
  }
}

// Vertical slats (vents, grilles) across a box.
export function slats(g, x, y, w, h, n, a = 0.6, lw = 2) {
  for (let i = 1; i < n; i++) {
    const xx = x + (w * i) / n;
    path(g, [[xx, y], [xx, y + h]], true);
    line(g, rgba('#000000', a), lw);
  }
}

// Pixel art from a function: at(i, j) -> null | colour | [colour, lit], over cols x rows cells of
// px, centred (the alien kit's bevelled phosphor cells).
export function pixelArt(b, l, cols, rows, px, at) {
  const keys = new Map();
  const map = {};
  const grid = [];
  for (let j = 0; j < rows; j++) {
    let row = '';
    for (let i = 0; i < cols; i++) {
      const v = at(i, j);
      if (!v) {
        row += '.';
        continue;
      }
      const id = Array.isArray(v) ? v.join('|') : v;
      if (!keys.has(id)) {
        const ch = String.fromCharCode(65 + keys.size + (keys.size > 25 ? 6 : 0));
        keys.set(id, ch);
        map[ch] = v;
      }
      row += keys.get(id);
    }
    grid.push(row);
  }
  pixels(b, l, grid, px, map);
}

// A muzzle or emitter that glows: a dark ring, a hot coloured core (lights).
export function muzzle(b, l, x, y, r, c, a = 1) {
  circle(b, x, y, r + 3);
  ink(b, '#14161c', 2.5);
  circle(b, x, y, r);
  b.fillStyle = rad(b, x, y, 0, r, [[0, shade(c, -0.2)], [1, shade(c, -0.8)]]);
  b.fill();
  eye(l, x, y, r * 0.7, c, 2.4);
  bloom(l, x, y, r * 3, c, 0.3 * a);
}

// A soft cone of light, narrow end at the bottom centre, cached once per colour (the one helper here
// a live() extra may call per frame: it only paints on first use).
export const cone = (color) => cached('bossCone' + color, 120, 600, (g, w, h) => {
  g.fillStyle = lin(g, 0, h, 0, 0, [[0, rgba(color, 0.55)], [1, rgba(color, 0)]]);
  g.beginPath();
  g.moveTo(w / 2 - 5, h);
  g.lineTo(0, 0);
  g.lineTo(w, 0);
  g.lineTo(w / 2 + 5, h);
  g.fill();
});
