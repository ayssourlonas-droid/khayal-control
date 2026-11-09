// Damage states of a boss part, baked from its body canvas: cracked (stage 1 | 2, armour losing
// hp), exposed (a plate cracked wide open, fissures burning in the weak colour) and wreck (the part
// destroyed: charred dark, cracks glowing like embers). Baked once, ahead of the fight (warmBoss);
// never per frame.
import { makeCanvas, hash, rgba, shade, INK, rad } from '../sprites.js';
import { path, line, bloom, TAU } from './kit.js';
import { clamp } from '../../core/math.js';

// n jagged cracks inside a w x h rect (centred), seeded: each starts inside the rect and wanders.
function crackPaths(seed, w, h, n, reach = 1) {
  const out = [];
  const step = Math.max(7, (Math.min(w, h) / 6) * reach);
  for (let k = 0; k < n; k++) {
    const r = (j) => hash(seed * 977 + k * 131 + j);
    let x = (r(1) - 0.5) * w * 0.6;
    let y = (r(2) - 0.5) * h * 0.6;
    let a = r(3) * TAU;
    const pts = [[x, y]];
    const len = 3 + Math.floor(r(4) * 3 * reach);
    for (let s = 0; s < len; s++) {
      a += (r(10 + s) - 0.5) * 1.5;
      const d = step * (0.6 + r(20 + s));
      x = clamp(x + Math.cos(a) * d, -w / 2 + 3, w / 2 - 3);
      y = clamp(y + Math.sin(a) * d, -h / 2 + 3, h / 2 - 3);
      pts.push([x, y]);
    }
    out.push(pts);
  }
  return out;
}

const count = (set, stage) => stage * (1 + Math.round(Math.sqrt(set.w * set.h) / 70));

// A copy of the body canvas with ctx set up at the part's centre, drawing only onto the body.
function over(set, src = set.body) {
  const c = makeCanvas(src.width, src.height);
  const g = c.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.translate(src.width / 2, src.height / 2);
  return [c, g];
}

function scratch(g, pts, w, lip = 0.35) {
  g.save();
  g.translate(1, 1.3);
  path(g, pts, true);
  line(g, rgba('#ffffff', lip), w * 0.45);
  g.restore();
  path(g, pts, true);
  g.lineJoin = 'miter';
  line(g, INK, w);
}

export function cracked(set, stage) {
  if (set.cracks[stage]) return set.cracks[stage];
  const [c, g] = over(set);
  for (const pts of crackPaths(set.seed, set.w, set.h, count(set, stage))) {
    scratch(g, pts, 3);
    if (set.crack) {
      path(g, pts, true);
      line(g, rgba(set.crack, 0.8), 1);
    }
  }
  set.cracks[stage] = c;
  return c;
}

// The plate split open: deep fissures in the body, the same fissures burning in the lights.
export function exposed(set, weak) {
  if (set.exposed) return set.exposed;
  const cracks = crackPaths(set.seed + 5, set.w, set.h, count(set, 2) + 2, 1.5);
  const [body, g] = over(set);
  g.fillStyle = rgba('#000000', 0.12);
  g.fillRect(-body.width / 2, -body.height / 2, body.width, body.height);
  for (const pts of cracks) scratch(g, pts, 6, 0.2);
  const lights = makeCanvas(body.width, body.height);
  const l = lights.getContext('2d');
  l.translate(body.width / 2, body.height / 2);
  l.globalCompositeOperation = 'lighter';
  for (const pts of cracks) {
    for (const [w, a] of [[9, 0.18], [4, 0.6], [1.6, 1]]) {
      path(l, pts, true);
      line(l, rgba(w < 2 ? '#ffffff' : weak, a), w);
    }
    bloom(l, pts[0][0], pts[0][1], 26, weak, 0.5);
  }
  set.exposed = { body, lights };
  return set.exposed;
}

// Destroyed: the body charred nearly black, scorched, its cracks glowing ember-orange (on the body).
export function wreck(set) {
  if (set.wreck) return set.wreck;
  const [c, g] = over(set, set.body);
  g.fillStyle = 'rgba(14,8,6,0.74)';
  g.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
  for (let i = 0; i < 4; i++) {
    const x = (hash(set.seed * 13 + i) - 0.5) * set.w * 0.8;
    const y = (hash(set.seed * 17 + i) - 0.5) * set.h * 0.8;
    const r = Math.min(set.w, set.h) * (0.25 + 0.2 * hash(set.seed + i * 7));
    g.fillStyle = rad(g, x, y, 0, r, [[0, 'rgba(0,0,0,0.7)'], [1, 'rgba(0,0,0,0)']]);
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (const pts of crackPaths(set.seed + 3, set.w, set.h, count(set, 2))) {
    scratch(g, pts, 3.5, 0.1);
    path(g, pts, true);
    line(g, rgba(shade('#ff6a1a', 0.1), 0.85), 1.4);
  }
  set.wreck = c;
  return c;
}
