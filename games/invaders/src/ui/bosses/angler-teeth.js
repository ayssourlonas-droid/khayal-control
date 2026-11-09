// The Lantern Leviathan's teeth (World 15, Lantern Deep; see angler.js): glassy needles, long and uneven, in two
// rows made once (TEETH) from a seed. The upper row hangs from the upper lip inside the mouth; the lower row stands
// on the lower jaw and its longest fangs reach up past the upper lip, over the face (they are painted with the jaw,
// angler-jaw-sprite.js). Neither is a comb: a few great fangs stand near the middle, the rest are short, a few are
// broken, the gaps between them are never the same and every one leans its own way. The hull paints the upper
// teeth from where the maw's chamber fades out to the corners (angler-jaw.js), the maw the ones in its chamber
// (angler-maw.js). A tooth has a dark gum at its root, a glassy body with a bright edge and a core line, and a
// glint at its tip on the lights layer; in the later phases the whole needle is lit (angler-lights.js).
import { line, lin, rgba, bloom } from './kit.js';
import { needlePath, upper, lower, rng, circle, CORNER, INK, PALE } from './angler-kit.js';

const UP = Math.PI / 2; // pointing down, from the upper lip
const DOWN = -Math.PI / 2; // pointing up, from the lower lip

// The teeth of one row, laid out by hand as x and length down the right-hand side: great fangs now and then,
// teeth between them of every size, the lower row's longest reaching up past the upper lip. The left side is the
// right's cousin, not its twin: each tooth is moved a little, longer or shorter, and one is lost or added.
const TABLE = {
  dn: [[14, 46], [30, 86], [44, 28], [70, 66], [80, 22], [96, 44], [116, 90], [124, 30], [150, 68], [158, 20], [180, 40], [192, 15]],
  up: [[22, 34], [40, 58], [49, 16], [78, 62], [88, 24], [120, 52], [128, 18], [160, 40], [166, 16], [190, 26]],
};

// The teeth of one row (both sides): { x, y, a, len, w, bend }. Each tilts in toward the throat, more toward the
// corners, and curls its tip that way.
export function teeth(row, seed) {
  const lo = row === 'dn';
  const out = [];
  for (const s of [-1, 1]) {
    const r = rng(seed * 31 + (lo ? 1 : 2) + (s > 0 ? 50 : 0));
    TABLE[row].forEach(([tx, tl], i) => {
      if (s < 0 && i === (lo ? 5 : 6)) return; // the left lost one
      const x = tx + (s < 0 ? (r() - 0.5) * 9 : (r() - 0.5) * 3);
      const len = Math.max(9, tl * (s < 0 ? 0.75 + 0.4 * r() : 0.94 + 0.12 * r()));
      const k = Math.min(1, x / CORNER);
      const tilt = Math.max(0.05, (0.06 + 0.3 * k) * (0.5 + r()) + (r() - 0.5) * 0.28);
      const px = s * x;
      out.push({
        x: px,
        y: (lo ? lower(px) : upper(px)) + (lo ? 1.5 : -1.5),
        a: lo ? DOWN - s * tilt : UP + s * tilt,
        len,
        w: 3.6 + len * (lo ? 0.12 : 0.1),
        bend: (lo ? -1 : 1) * s * len * (0.1 + 0.26 * r()),
      });
    });
  }
  return out;
}

export const TEETH = { up: teeth('up', 4), dn: teeth('dn', 6) };

// One tooth: its gum, the glassy needle shaded across its width, an outline, a bright core line, a glint at the tip.
export function fang(b, l, t) {
  for (const g of l ? [b, l] : [b]) {
    g.save();
    g.translate(t.x, t.y);
    g.rotate(t.a);
  }
  b.beginPath();
  b.ellipse(0, 0, t.w * 0.72, t.w * 0.62, 0, 0, Math.PI * 2);
  b.fillStyle = '#16263e';
  b.fill();
  needlePath(b, t.len, t.w, t.bend);
  b.fillStyle = lin(b, 0, -t.w / 2, 0, t.w / 2, [[0, '#f4fdff'], [0.38, '#b8e0ea'], [0.72, '#4a7c90'], [1, '#1a384c']]);
  b.fill();
  line(b, INK, 1.2);
  b.beginPath();
  b.moveTo(t.len * 0.1, -t.w * 0.2);
  b.quadraticCurveTo(t.len * 0.55, -t.w * 0.17 + t.bend * 0.3, t.len * 0.93, t.bend * 0.93);
  line(b, rgba('#ffffff', 0.75), 0.9);
  b.beginPath();
  b.moveTo(t.len * 0.16, t.w * 0.22);
  b.quadraticCurveTo(t.len * 0.5, t.w * 0.18 + t.bend * 0.4, t.len * 0.74, t.bend * 0.78 + t.w * 0.05);
  line(b, rgba('#9ae8ff', 0.28), 0.8);
  if (l) {
    needlePath(l, t.len, t.w, t.bend);
    l.fillStyle = rgba(PALE, 0.1);
    l.fill();
    bloom(l, t.len, t.bend, 7, PALE, 0.4);
  }
  for (const g of l ? [b, l] : [b]) g.restore();
}

// The same needle lit from within, on a lights layer: the rage layers' teeth.
export function litFang(l, t, a = 0.6) {
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.translate(t.x, t.y);
  l.rotate(t.a);
  needlePath(l, t.len, t.w * 1.25, t.bend);
  l.fillStyle = rgba(PALE, a);
  l.fill();
  bloom(l, t.len * 0.7, t.bend * 0.7, t.len * 0.6, PALE, a * 0.35);
  l.restore();
}

// A thin strand of spit from (x0, y0) to (x1, y1), sagging between, with a bead where it sags most.
export function strand(b, x0, y0, x1, y1, sag = 8, a = 0.4) {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2 + sag;
  b.beginPath();
  b.moveTo(x0, y0);
  b.quadraticCurveTo(mx, my + sag * 0.5, x1, y1);
  line(b, rgba('#d8f6ff', a), 0.9);
  circle(b, mx, my + sag * 0.25, 1.3);
  b.fillStyle = rgba('#e8fbff', a + 0.2);
  b.fill();
}
