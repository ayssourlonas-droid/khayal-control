// What World 17's painters draw as light and smoke (w17-kit.js has the rest): a coal on the lights layer, a pair of
// angry glowing eyes, a billowing wisp of smoke over a dark underlay, and a tumbling flake of ash. Everything here is
// baked once at load, and leaves the context's state as it found it (except the stroke helpers' round caps, which every
// painter's tidy() takes back).
import { lin, rad, rgba, shade, mix, bloom, line, circle, TAU, INK, hash, ASH_D, ASH_L, CHAR, EMBER, HOT } from './w17-kit.js';

// A coal on the lights layer: a wide warm bloom, a flattened disc hot to white in the middle; k (0..1) flares it.
export function coal(l, x, y, rx, ry, k = 0.5, rot = 0) {
  bloom(l, x, y, rx * 1.65, EMBER, 0.6 + k * 0.3);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.translate(x, y);
  l.rotate(rot);
  l.scale(1, ry / rx);
  l.fillStyle = rad(l, 0, 0, 0, rx, [[0, '#ffffff'], [0.3, HOT], [0.62, rgba(EMBER, 0.95)], [1, rgba('#c0300a', 0)]]);
  l.beginPath();
  l.arc(0, 0, rx * (0.92 + k * 0.16), 0, TAU);
  l.fill();
  l.restore();
}

// A glowing eye socket pair: angry slits sloping down toward the middle, a heavy brow over each. The sockets are
// burnt dark on the body; the slit itself (hot white in the middle, ember at the ends) is on the lights.
// (x, y) the pair's centre, gap each eye's offset, w half-length, h half-height, k (0..1) the flare of this beat.
export function glare(b, l, x, y, gap, w, h, k = 0.5, c = EMBER, glow = 1) {
  for (const m of [-1, 1]) {
    const x0 = x + m * gap;
    const slit = (g, s = 1) => {
      g.beginPath();
      g.moveTo(x0 - m * w * s, y + h * 0.55 * s);
      g.quadraticCurveTo(x0, y - h * 1.25 * s, x0 + m * w * 1.1 * s, y - h * 0.9 * s);
      g.quadraticCurveTo(x0 + m * w * 0.3 * s, y + h * 0.9 * s, x0 - m * w * s, y + h * 0.55 * s);
      g.closePath();
    };
    slit(b, 1.25);
    b.fillStyle = CHAR;
    b.fill();
    b.beginPath();
    b.moveTo(x0 - m * w * 1.4, y - h * 0.35);
    b.lineTo(x0 + m * w * 1.5, y - h * 2.1);
    line(b, rgba(INK, 0.95), 1.5);
    bloom(l, x0, y, w * 2.6, c, (0.5 + k * 0.25) * glow);
    l.save();
    l.globalCompositeOperation = 'lighter';
    slit(l);
    l.fillStyle = lin(l, x0 - w, y, x0 + w, y, [[0, rgba(c, 0.95)], [0.5, '#ffffff'], [1, rgba(c, 0.95)]]);
    l.fill();
    l.restore();
  }
}

// A wisp of smoke: soft puffs along pts ([x, y, r]), each a feathered disc that billows a little off the line, over a
// dark soft underlay (so it still reads on a pale sky); cold grey, warm where the ember lights it, lightest and
// thinnest at the far end. a (0..1) scales the opacity.
export function wisp(g, pts, a = 1, warm = EMBER, seed = 1, fade = 0) {
  const n = pts.length - 1;
  const at = (i) => {
    const [x, y, r] = pts[i];
    const w = (k) => hash(seed * 61 + i * 5 + k) - 0.5;
    return [x + w(0) * r * 0.7, y + w(1) * r * 0.5, r * (0.85 + w(2) * 0.5)];
  };
  g.save();
  for (let i = 0; i <= n; i++) {
    const [x, y, r] = at(i);
    const u = (1 - (i / n) * 0.55) * (1 - (i / n) * fade);
    circle(g, x, y, r + 2.4);
    g.fillStyle = rad(g, x, y, r * 0.3, r + 2.4, [[0, rgba(INK, 0.5 * a * u)], [0.75, rgba(INK, 0.34 * a * u)], [1, rgba(INK, 0)]]);
    g.fill();
  }
  for (let i = 0; i <= n; i++) {
    const [x, y, r] = at(i);
    const t = i / n;
    const k = a * (1 - t * fade);
    const c = mix(mix('#6a5f57', warm, 0.3 * (1 - t) ** 2), '#d4ccc2', t * 0.65);
    circle(g, x, y, r);
    g.fillStyle = rad(g, x, y, 0, r, [[0, rgba(shade(c, 0.3), 0.97 * k)], [0.55, rgba(c, 0.88 * k)], [1, rgba(mix(c, '#2a2420', 0.4), 0)]], x - r * 0.32, y - r * 0.32);
    g.fill();
  }
  for (let i = 1; i <= n; i += 2) { // pale highlights on the sunward side of the billows
    const [x, y, r] = at(i);
    circle(g, x - r * 0.28, y - r * 0.3, r * 0.5);
    g.fillStyle = rgba('#f4eee6', 0.2 * a);
    g.fill();
  }
  g.restore();
}

// A flake of ash tumbling: a small irregular chip, pale on top and grey beneath, with a thin dark edge.
export function flake(g, x, y, s, rot, seed = 1) {
  g.save();
  g.translate(x, y);
  g.rotate(rot);
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU;
    const r = s * (0.65 + hash(seed * 5 + i) * 0.55);
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.8);
  }
  g.closePath();
  g.fillStyle = lin(g, -s, -s, s, s, [[0, ASH_L], [1, ASH_D]]);
  g.fill();
  line(g, rgba(INK, 0.8), 1);
  g.restore();
}
