// The giant cigarettes of world 17's far layer: the table of them (CIGS, shared with the flourish that draws the tall part,
// flourish-smog-sky-cig.js), the paper cylinder every one is made of, and the STUMP the layer paints for each. A cigarette
// stands on its filter end like a factory chimney: a tan filter with a cork fleck texture and a darker tipping band, then a
// paper cylinder with a faint seam, lit from the right (the sun behind the smog). The stump is the bottom STUMP_H px, a little
// paper over the filter with a ragged broken top, painted identically in both twins but in grimy brown-grey in the smog and a
// warm cream in the morning; it is what is left once the tall cigarette (the flourish) has gone out and crumbled. The tall
// body is cigBody() again with a higher top, so the two match to the pixel where they meet. The cigarettes stand in two groups
// outside the middle of the frame (x 550-1370 on screen belongs to the Craving) so the boss reads against sky, not paper.
// Geometry: CIGS are in layer px (x = the axis, h = height above GROUND); `out` and `gone` are the healing (heal.js h) at which
// one goes out and at which its crumbling is done.
import { rgba, lin, hash } from './sprites.js';
import { GROUND, poly } from './parallax-smog-far-kit.js';

export const FILTER = 52; // the filter's height
export const STUMP_H = 112; // what the layer paints of each cigarette, from the ground up
// `top` is the y of the cigarette's flat top in layer px: above the layer's own top for the tall ones, which the flourish draws in screen space.
export const CIGS = [
  { x: 235, w: 66, h: 470, out: 0.14, gone: 0.58, seed: 3 },
  { x: 470, w: 52, h: 360, out: 0.3, gone: 0.72, seed: 5 },
  { x: 655, w: 70, h: 430, out: 0.22, gone: 0.66, seed: 8 },
  { x: 1585, w: 64, h: 440, out: 0.46, gone: 0.84, seed: 13 },
  { x: 1790, w: 48, h: 330, out: 0.52, gone: 0.78, seed: 17 },
  { x: 2010, w: 74, h: 480, out: 0.36, gone: 0.85, seed: 21 },
].map((c) => ({ ...c, top: GROUND - c.h }));

// The paper and the filter, one palette per mode.
export const CIGP = {
  smog: {
    paper: ['#463e35', '#736a5c', '#8f8574', '#766d60', '#40382f'], rim: '#dba56c', rimA: 0.5, seam: '#3a3128', soot: '#1a130f', grime: 0.34,
    filter: ['#3a2c1b', '#6e5535', '#92754a', '#705636', '#2b2014'], band: '#54422b', bandLine: '#241a10', cork: '#241810', corkLit: '#b08e58', foot: '#0a0706',
  },
  clean: {
    paper: ['#bcc2cc', '#ece6d8', '#fffaf0', '#efe8da', '#bec2cc'], rim: '#fff0c0', rimA: 0.8, seam: '#b8b0a4', soot: '#6f7a88', grime: 0.05,
    filter: ['#a07840', '#d8a864', '#f0c888', '#d0a060', '#8a6434'], band: '#e8cd96', bandLine: '#8a6c40', cork: '#7a5428', corkLit: '#ffe0aa', foot: '#38526c',
  },
};
export const cigPal = (mode) => CIGP[mode === 'clean' ? 'clean' : 'smog'];

// The ragged top of a broken cylinder: the points of its snapped edge from left to right, `yTop` the highest it stands. The break
// slants (one side high, which side by the seed), is roughened a few px, and throws up two splinters of paper; seed s, so the
// stump and the crumbling cap draw the same break.
export function raggedTop(x0, w, yTop, s) {
  const pts = [];
  const dir = s % 2 ? 1 : -1;
  const n = 11;
  for (let k = 0; k <= n; k++) {
    const u = k / n;
    const slope = 24 * (dir > 0 ? u : 1 - u);
    const x = x0 + w * u;
    const y = yTop + 8 + slope + (hash(s + 20 + k) - 0.5) * 7;
    if (k === 3 || k === 8) pts.push([x - 2, y], [x + 1.5, y - 15 - hash(s + k) * 8], [x + 3, y + 2]); // a splinter
    else pts.push([x, y]);
  }
  return pts;
}

const cyl = (g, x0, w, y, h, colors, rim, rimA) => {
  g.fillStyle = lin(g, x0, 0, x0 + w, 0, [[0, colors[0]], [0.14, colors[1]], [0.58, colors[2]], [0.82, colors[3]], [1, colors[4]]]);
  g.fillRect(x0, y, w, h);
  g.fillStyle = rgba(rim, rimA);
  g.fillRect(x0 + w - 2.4, y, 2.4, h);
};

// The cylinder: the filter on the ground (yBot), paper above it up to yTop (with rag the broken edge of raggedTop(x0, w, yTop, s)),
// all of it lit from the right. The paper carries a seam; the filter flecks of cork and a tipping band at its top.
export function cigBody(g, C, x0, yTop, w, yBot, s, rag = false) {
  const fy = yBot - FILTER;
  g.save();
  g.beginPath();
  if (rag) poly(g, [[x0, yBot], ...raggedTop(x0, w, yTop, s), [x0 + w, yBot]]);
  else g.rect(x0, yTop, w, yBot - yTop);
  g.clip();
  cyl(g, x0, w, yTop - 4, fy - yTop + 4, C.paper, C.rim, C.rimA);
  g.fillStyle = rgba(C.seam, 0.22);
  g.fillRect(x0 + w * 0.34, yTop - 4, 1.2, fy - yTop + 4);
  for (let i = 0; i < (fy - yTop) * w * 0.012; i++) { // the paper's fibres
    g.fillStyle = rgba(hash(s * 17 + i) < 0.5 ? C.seam : C.rim, 0.07);
    g.fillRect(x0 + hash(s * 17 + i * 3 + 1) * w, yTop + hash(s * 17 + i * 3 + 2) * (fy - yTop), 1.2 + hash(i) * 2.4, 0.8);
  }
  g.fillStyle = lin(g, 0, fy - 80, 0, fy, [[0, rgba(C.soot, 0)], [1, rgba(C.soot, C.grime)]]); // the street's grime on the lower paper
  g.fillRect(x0, fy - 80, w, 80);
  cyl(g, x0, w, fy, FILTER, C.filter, C.rim, C.rimA * 0.8);
  g.fillStyle = lin(g, 0, fy, 0, fy + 9, [[0, rgba(C.bandLine, 0.5)], [1, rgba(C.bandLine, 0)]]); // the paper's shadow on the filter
  g.fillRect(x0, fy, w, 9);
  g.fillStyle = C.band; // the tipping band, a paler ring with a dark line at each edge
  g.fillRect(x0, fy + 9, w, 6);
  g.fillStyle = rgba(C.bandLine, 0.7);
  g.fillRect(x0, fy + 9, w, 1.2);
  g.fillRect(x0, fy + 14, w, 1.2);
  for (let i = 0; i < w * 1.3; i++) { // cork flecks
    const lit = hash(s * 31 + i * 3) < 0.35;
    g.fillStyle = rgba(lit ? C.corkLit : C.cork, lit ? 0.5 : 0.55);
    g.fillRect(x0 + hash(s * 31 + i * 3 + 1) * w, fy + 17 + hash(s * 31 + i * 3 + 2) * (FILTER - 19), 1.4 + hash(s + i) * 1.8, 1 + hash(s + i + 9) * 1.2);
  }
  g.fillStyle = lin(g, 0, yBot - 14, 0, yBot, [[0, rgba(C.foot, 0)], [1, rgba(C.foot, 0.45)]]);
  g.fillRect(x0, yBot - 14, w, 14);
  g.restore();
}

// What the layer paints of cigarette c in palette C: a contact shadow on the ground, the stump with its broken top, and the
// rim of the break catching the sun.
export function stump(g, C, c) {
  const [x0, yBot] = [c.x - c.w / 2, GROUND];
  const yTop = yBot - STUMP_H;
  g.fillStyle = lin(g, 0, yBot - 4, 0, yBot + 10, [[0, rgba(C.foot, 0.5)], [1, rgba(C.foot, 0)]]);
  g.fillRect(x0 - 14, yBot - 4, c.w + 28, 14);
  cigBody(g, C, x0, yTop, c.w, yBot, c.seed, true);
  breakEdge(g, C, x0, c.w, yTop, c.seed);
}

// The snapped edge: the paper's thickness in shadow just under the break, the sun on its upper lip.
export function breakEdge(g, C, x0, w, yTop, s) {
  const pts = raggedTop(x0, w, yTop, s);
  g.save();
  for (const [dy, col, a, lw] of [[2.6, C.soot, 0.55, 2.4], [0, C.rim, 0.6, 1.3]]) {
    g.strokeStyle = rgba(col, a);
    g.lineWidth = lw;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y + dy) : g.moveTo(x, y + dy)));
    g.stroke();
  }
  g.restore();
}
