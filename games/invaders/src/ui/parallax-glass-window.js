// The stained-glass windows of Glass Cathedral's far layer (see parallax-glass.js): a lancet is punched out of the
// wall (so a broken one shows the dawn through its empty tracery), then glazed with panes of jewel glass divided by
// lead cames, in one of three patterns: a lattice of lozenges, a field with round medallions, or bands. A glazed
// window is lit from behind (a pale bloom inside it and a halo among the layer's lights). A broken window keeps
// only the glass below a ragged line and the stone bars above it. pairWindow is two lancets under one arch with a
// round window in the spandrel, the way the nave's clerestory does it.
import { rgba, shade, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { pick } from '../core/rng.js';
import { SETS, LEAD, lamp, lancetPath, riseOf, ragged, arcSteps, tint } from './parallax-glass-kit.js';

const K = 1.2; // the arch of a window: slightly lancet
const MODES = ['steady', 'steady', 'steady', 'pulse'];

function diamond(g, x, y, hw, hh) {
  g.beginPath();
  g.moveTo(x, y - hh);
  g.lineTo(x + hw, y);
  g.lineTo(x, y + hh);
  g.lineTo(x - hw, y);
  g.closePath();
}

// Rows of lozenges over the box, every one in a jewel of the set.
function lozenges(g, rng, x0, y0, w, h, set, field = null) {
  const cw = w / Math.max(2, Math.round(w / 10));
  const ch = cw * 1.6;
  g.lineWidth = 0.9;
  g.strokeStyle = rgba(LEAD, 0.9);
  for (let r = 0; r * ch * 0.5 < h + ch; r++) {
    for (let c = -1; c * cw < w + cw; c++) {
      const [x, y] = [x0 + c * cw + (r & 1 ? cw / 2 : 0) + cw / 2, y0 - ch / 2 + r * ch * 0.5];
      diamond(g, x, y, cw / 2, ch / 2);
      g.fillStyle = rgba(field ?? set[Math.floor(rng() * set.length)], 0.78 + rng() * 0.2);
      g.fill();
      g.stroke();
    }
  }
}

// A round medallion in the glass: a ring of lead, a jewel, a gilt heart.
function medallion(g, x, y, r, c1, c2) {
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fillStyle = rgba(c1, 0.95);
  g.fill();
  g.beginPath();
  g.arc(x, y, r * 0.55, 0, TAU);
  g.fillStyle = rgba(c2, 0.95);
  g.fill();
  g.strokeStyle = rgba(LEAD, 0.9);
  g.lineWidth = 1.1;
  g.stroke();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.stroke();
}

// The panes of one lancet into the box (x0, y0, w, h), in the pattern `kind`.
function panes(g, rng, kind, x0, y0, w, h, set) {
  if (kind === 'medallion') {
    lozenges(g, rng, x0, y0, w, h, set, set[0]);
    g.fillStyle = rgba('#000000', 0.28);
    g.fillRect(x0, y0, w, h);
    const n = h > w * 3.4 ? 3 : 2;
    for (let i = 0; i < n; i++) medallion(g, x0 + w / 2, y0 + h * ((i + 0.62) / (n + 0.3)), w * 0.3, set[1 + (i % 2)], set[(i + 2) % set.length]);
  } else if (kind === 'bands') {
    const n = Math.max(4, Math.round(h / 16));
    for (let i = 0; i < n; i++) {
      g.fillStyle = rgba(set[i % set.length], 0.9);
      g.fillRect(x0, y0 + (h * i) / n, w, h / n + 0.6);
    }
    lozenges(g, rng, x0 + w * 0.25, y0, w * 0.5, h, set);
  } else {
    lozenges(g, rng, x0, y0, w, h, set);
  }
}

// A lancet of half-width hw standing on y, h tall at x, punched out of the wall and glazed. o: { set, kind, broken
// (0..0.8 of the height lost from the top), lit (false: no halo), a (the halo's alpha) }.
export function glaze(g, out, rng, L, x, y, hw, h, o = {}) {
  const set = o.set ?? pick(rng, SETS);
  const kind = o.kind ?? pick(rng, ['lozenge', 'medallion', 'lozenge', 'bands']);
  const build = (c) => lancetPath(c, x, y, hw, h, K);
  g.save();
  g.globalCompositeOperation = 'destination-out';
  build(g);
  g.fill();
  g.globalCompositeOperation = 'source-over';
  g.save();
  lancetPath(g, x, y - 0.5, hw - 1.6, h - 2.2, K);
  g.clip();
  if (o.broken) {
    const cut = ragged(rng, x - hw - 2, x + hw + 2, y - h * (1 - o.broken), 7, 5);
    g.beginPath();
    g.moveTo(x - hw - 3, y + 2);
    for (const [px, py] of cut) g.lineTo(px, py);
    g.lineTo(x + hw + 3, y + 2);
    g.closePath();
    g.clip();
  }
  panes(g, rng, kind, x - hw, y - h, hw * 2, h, set);
  g.globalCompositeOperation = 'lighter';
  g.fillStyle = rad(g, x, y - h * 0.45, 0, h * 0.62, [[0, 'rgba(255,236,200,0.34)'], [1, 'rgba(255,236,200,0)']]);
  g.fillRect(x - hw, y - h, hw * 2, h);
  g.restore();
  g.lineWidth = 1.6; // the jamb: a moulding of paler stone round the glass
  g.strokeStyle = rgba(tint(L, '#d8b8e8', 0.5), 0.55);
  build(g);
  g.stroke();
  if (o.broken) { // the mullion and the arch's stone bars still stand above the glass
    g.fillStyle = L.color;
    g.fillRect(x - 1.1, y - h, 2.2, h * o.broken + 2);
  }
  g.restore();
  g.fillStyle = rgba('#000000', 0.13); // weathering: a few drips of dark down the wall under the sill
  for (let i = 0; i < 3; i++) g.fillRect(x - hw + 2 + rng() * (hw * 2 - 6), y + 1, 1.6 + rng(), 8 + rng() * 26);
  if (o.lit !== false) lamp(out, x, y - h * 0.5, Math.min(48, 8 + hw * 1.6 + h * 0.12), set[0], pick(rng, MODES), rng(), o.a ?? 0.32);
}

// A round window of radius r at (x, y): four quadrants of glass cut by a cross of lead, a gilt heart.
export function oculus(g, x, y, r, set) {
  g.save();
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.clip();
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(x, y);
    arcSteps(g, x, y, r + 1, (i * TAU) / 4, ((i + 1) * TAU) / 4);
    g.closePath();
    g.fillStyle = rgba(set[i % set.length], 0.92);
    g.fill();
  }
  g.restore();
  g.strokeStyle = rgba(LEAD, 0.9);
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(x - r, y);
  g.lineTo(x + r, y);
  g.moveTo(x, y - r);
  g.lineTo(x, y + r);
  g.arc(x, y, r, 0, TAU);
  g.stroke();
  g.beginPath();
  g.arc(x, y, r * 0.32, 0, TAU);
  g.fillStyle = rgba(shade(set[1], 0.4), 0.95);
  g.fill();
}

// Two lancets under one pointed arch with a round window above them, hw the whole window's half-width, h its height.
export function pairWindow(g, out, rng, L, x, y, hw, h, o = {}) {
  const set = o.set ?? pick(rng, SETS);
  const rise = riseOf(hw, K);
  const rO = Math.min(hw * 0.5, rise * 0.4);
  const cy = y - h + rise * 0.55 + rO * 0.5;
  const hl = y - (cy + rO + 3);
  g.fillStyle = L.color; // the stone between: a pier and the spandrel
  lancetPath(g, x, y, hw, h, K);
  g.fill();
  for (const s of [-1, 1]) {
    glaze(g, out, rng, L, x + s * hw * 0.5, y - 1, hw * 0.5 - 2, hl, { set, kind: o.kind ?? 'lozenge', a: 0.3 });
  }
  g.save();
  g.globalCompositeOperation = 'destination-out';
  g.beginPath();
  g.arc(x, cy, rO, 0, TAU);
  g.fill();
  g.restore();
  oculus(g, x, cy, rO - 1, [set[1], set[0], set[2], set[0]]);
  g.strokeStyle = rgba(tint(L, '#d8b8e8', 0.5), 0.5);
  g.lineWidth = 1.4;
  g.beginPath();
  g.arc(x, cy, rO, 0, TAU);
  g.stroke();
}
