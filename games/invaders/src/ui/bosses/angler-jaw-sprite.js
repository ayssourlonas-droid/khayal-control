// The Lantern Leviathan's lower jaw (World 15, Lantern Deep; angler-fx.js draws it): a heavy crescent of flesh that
// juts out under the mouth, a rolled lip along its top and a few long glassy needles standing on it (angler-teeth.js),
// the longest reaching up past the upper lip over the face. Closed, it sits DROP px higher than the hull has it;
// in the hover and orbit phases it hangs open, where the hull's own baked jaw (jawBase, angler-jaw.js) lies right
// under it, so a frozen frame or the collapse shows the same jaw. That is why the sprite is only the jaw's top: its
// foot fades out into the baked one. Two sprites, both painted once on first use: the body (opaque: the own pass
// only) and its lights (additive, every pass). Cache keys 'angler...'. Boss coordinates, the jaw open; the sprites'
// box is JB.
import { cached } from '../sprites.js';
import { path, line, lin, rad, rgba, bloom } from './kit.js';
import { circle, lower, rng, photophore, INK, PALE, AQUA, TEAL, VIOLET } from './angler-kit.js';
import { TEETH, fang, litFang } from './angler-teeth.js';
import { texture, lumps, wrinkles } from './angler-skin.js';

export const JB = { x: -240, y: -104, w: 480, h: 224 };
const top = (x) => lower(x) - 5; // the lip roll's top edge
const END = 206; // where the jaw runs out into the corners of the mouth, a point
export const chin = (x) => top(x) + 81 * Math.max(0, 1 - (Math.abs(x) / END) ** 2.3) ** 0.9; // the jaw's underside, a U: a crescent with the top

// The jaw, whole: the lip across the top and the U of the chin under it.
export function jawPath(g) {
  g.beginPath();
  g.moveTo(-END, top(-END));
  for (let x = -END + 6; x <= END; x += 6) g.lineTo(x, top(x));
  for (let x = END; x >= -END; x -= 6) g.lineTo(x, chin(x));
  g.closePath();
}

// The photophores along the jaw, a loose row under the lip: x, y, radius, colour.
const LAMPS = (() => {
  const r = rng(71);
  return Array.from({ length: 11 }, (_, i) => {
    const x = (i - 5) * 25 + (r() - 0.5) * 10;
    return { x, y: lower(x) + 30 + (r() - 0.5) * 10 - 10 * (x / 206) ** 2, r: 1.7 + r() * 1.3, c: i % 3 === 1 ? VIOLET : TEAL };
  });
})();

// The skin down the jaw, anchored on the jaw as the hull has it, so the sprite and the baked jaw match.
export const jawSkin = (g) => lin(g, 0, top(0), 0, chin(0), [[0, '#386c8e'], [0.16, '#1e4a6c'], [0.5, '#0f2c46'], [1, '#07182a']]);

// The rolled lip: a lit edge, a fold under it, the corner folds and the row of pores; the seam at the chin.
export function lip(g) {
  const edge = (dy) => {
    g.beginPath();
    for (let x = -END; x <= END; x += 6) g[x === -END ? 'moveTo' : 'lineTo'](x, top(x) + dy);
  };
  edge(0);
  line(g, INK, 3.6);
  edge(2.6);
  line(g, rgba('#a8e4f8', 0.55), 1.7);
  edge(10);
  line(g, rgba('#000812', 0.38), 2);
  edge(12.5);
  line(g, rgba('#9ad8f0', 0.14), 1);
  const r = rng(23);
  for (let x = 10; x < END - 8; x += 12 + r() * 6) { // lumps of flesh along the roll
    for (const s of [-1, 1]) {
      const [px, py, rr] = [s * (x + r() * 6), top(x) + 7 + r() * 3, 6 + r() * 5];
      g.fillStyle = rad(g, px, py, 0, rr, [[0, rgba('#7ab4d4', 0.34)], [0.55, rgba('#1e4a6c', 0.15)], [1, rgba('#000610', 0.34)]], px - rr * 0.3, py - rr * 0.35);
      circle(g, px, py, rr);
      g.fill();
    }
  }
  for (let x = -188; x <= 188; x += 12 + r() * 6) {
    circle(g, x, lower(x) + 20 + 3 * Math.sin(x * 0.17) + r() * 2, 1.2 + r() * 0.8);
    g.fillStyle = rgba('#000308', 0.5);
    g.fill();
  }
  path(g, [[0, lower(0) + 4], [1.5, lower(0) + 30], [0, lower(0) + 58]], true);
  line(g, rgba('#000812', 0.36), 1.8);
  for (const s of [-1, 1]) {
    for (const k of [0, 1, 2]) {
      path(g, [[s * (END - 12), top(END) + 3 + k * 6], [s * (END - 1), top(END) + 12 + k * 7], [s * (END + 6), top(END) + 28 + k * 6]], true);
      line(g, rgba('#000812', 0.5), 1.6);
    }
  }
}

// The jaw's skin, lit knob and lip, clipped to its shape.
function jawFill(g) {
  g.save();
  jawPath(g);
  g.fillStyle = jawSkin(g);
  g.fill();
  g.clip();
  texture(g, 21, [-232, top(0), 232, chin(0)], 1);
  lumps(g, 88, [-190, top(0) + 22, 190, chin(0) - 26], 12, 0.9, 12, 24);
  wrinkles(g, 19, [-190, top(0) + 18, 190, chin(0) - 6], 26);
  g.fillStyle = rad(g, 0, lower(0) + 22, 8, 90, [[0, rgba('#8cc8e8', 0.22)], [1, rgba('#8cc8e8', 0)]]); // the chin's knob catches the light
  g.fillRect(-100, lower(0) - 20, 200, 90);
  const r = rng(57);
  for (const [dy, step] of [[44, 15], [58, 19]]) { // two loose rows of bony nodes following the curve of the chin
    for (let x = -150; x <= 150; x += step + r() * 6) {
      const [px, py, rr] = [x, lower(x) + dy * (1 - 0.6 * (x / 206) ** 2) + (r() - 0.5) * 5, 1.8 + r() * 2];
      g.fillStyle = rad(g, px, py, 0, rr * 1.6, [[0, rgba('#a8dcf0', 0.5)], [0.6, rgba('#3a7090', 0.3)], [1, rgba('#000610', 0)]], px - rr * 0.4, py - rr * 0.4);
      circle(g, px, py, rr * 1.6);
      g.fill();
    }
  }
  for (const pts of [[[-120, 62], [-96, 56], [-70, 60]], [[84, 66], [110, 58], [138, 52]], [[-30, 74], [-6, 68], [20, 73]]]) { // old scars
    path(g, pts, true);
    line(g, rgba('#a8d4e8', 0.22), 1.6);
  }
  lip(g);
  for (const p of LAMPS) photophore(g, null, p.x, p.y, p.r, p.c);
  g.restore();
}

// The jaw as the hull keeps it, open, whole and without teeth: what the sprite lies over, and what the collapse shows.
export function jawBase(g) {
  jawFill(g);
  g.beginPath();
  for (let x = -END; x <= END; x += 6) g[x === -END ? 'moveTo' : 'lineTo'](x, chin(x));
  line(g, INK, 4);
  g.beginPath();
  for (let x = -END + 12; x <= END - 12; x += 6) g[x === -END + 12 ? 'moveTo' : 'lineTo'](x, chin(x) - 2.4);
  line(g, rgba('#6ab8d8', 0.3), 1.4);
}

function paintBody(g) {
  g.translate(-JB.x, -JB.y);
  jawFill(g);
  g.save(); // the foot fades into the baked jaw under it
  g.globalCompositeOperation = 'destination-out';
  g.fillStyle = lin(g, 0, lower(0) + 20, 0, lower(0) + 52, [[0, 'rgba(0,0,0,0)'], [1, '#000']]);
  g.fillRect(JB.x, lower(0) + 20, JB.w, JB.y + JB.h - lower(0) - 20);
  g.restore();
  for (const t of TEETH.dn) fang(g, null, t);
}

function paintLights(g) {
  g.translate(-JB.x, -JB.y);
  g.save();
  g.globalCompositeOperation = 'lighter';
  g.beginPath();
  for (let x = -END; x <= END; x += 6) g[x === -END ? 'moveTo' : 'lineTo'](x, top(x) + 2.6);
  line(g, rgba(AQUA, 0.26), 2.2);
  g.restore();
  for (const p of LAMPS) {
    bloom(g, p.x, p.y, p.r * 3.8, p.c, 0.36);
    circle(g, p.x, p.y, p.r * 0.7);
    g.fillStyle = rgba('#e8ffff', 0.8);
    g.fill();
  }
  for (const t of TEETH.dn) {
    g.save();
    g.translate(t.x, t.y);
    g.rotate(t.a);
    bloom(g, t.len, t.bend, 7 + t.len * 0.06, PALE, 0.34);
    g.restore();
    litFang(g, t, 0.2);
  }
}

export const jawBody = () => cached('anglerJawBody', JB.w, JB.h, paintBody);
export const jawLights = () => cached('anglerJawLights', JB.w, JB.h, paintLights);
// Where each needle ends, open, left to right: the glints run along them.
export const FANGS = TEETH.dn.map((t) => [t.x + Math.cos(t.a) * t.len - Math.sin(t.a) * t.bend, t.y + Math.sin(t.a) * t.len + Math.cos(t.a) * t.bend]).sort((a, b) => a[0] - b[0]);
