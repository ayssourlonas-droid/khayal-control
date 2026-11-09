// The front of fresh air (world 17's breath), baked: the AIR tile and the LIGHT tile, 960 px wide and seamless sideways, drawn
// side by side across the field at their own scroll speeds (breath-view.js), plus the twinkles that ride in it.
//   AIR    (960 x 420, the front's line at y 72): a blue-white band of air like the rim of a cumulus: a vertical alpha
//          ramp (a haze just above the line, about 0.55 below it, thinning to nothing over 350 px), a row of billows
//          along the edge whose tops follow the wavy line, bluer shaded puffs under whiter lit ones for the body, a few
//          thin wisps leaning over the crest and a sprinkle of bright motes. It is meant to be seen through.
//   LIGHT  (960 x 210, line at y 48, drawn with 'lighter'): the brilliant thin edge, a hot white core in a pale blue glow
//          that follows the same wavy line as the billows, with a handful of four-point glints on it, and under it a broad
//          cool glow that gives the band its own light (it falls away over 150 px).
//   TWINKLE  a 48 px four-point star in white and in pale mint, for the sparkles in the band and the wiped bullets'.
// Painted once on first use (cache keys `breathAir`, `breathLight`, `breathTwinkle`); nothing here runs per frame.
import { cached, rad, lin, rgba, hash } from './sprites.js';
import { swoosh } from './breath-flow.js';
import { glint } from './breath-craft.js';
import { TAU } from '../core/math.js';

export const AIR_W = 960;
export const AIR_H = 420;
export const AIR_Y0 = 72;
export const LIGHT_H = 210;
export const LIGHT_Y0 = 48;

// The edge's height above its mean at x: a sum of sines whole in AIR_W, so the tiles join, the line and the billows agree.
export const edgeY = (x) => 4 * Math.sin((x / AIR_W) * TAU * 5 + 0.7) + 3 * Math.sin((x / AIR_W) * TAU * 11 + 2.1);

function puff(g, x, y, r, color, a) {
  for (const dx of [0, -AIR_W, AIR_W]) {
    if (x + dx + r < 0 || x + dx - r > AIR_W) continue;
    g.beginPath();
    g.arc(x + dx, y, r, 0, TAU);
    g.fillStyle = rad(g, x + dx, y, 0, r, [[0, rgba(color, a)], [0.55, rgba(color, a * 0.65)], [1, rgba(color, 0)]]);
    g.fill();
  }
}

function air(g) {
  const at = (y) => y / AIR_H;
  g.fillStyle = lin(g, 0, 0, 0, AIR_H, [
    [0, rgba('#f4fcff', 0)], [at(AIR_Y0 - 38), rgba('#f4fcff', 0)], [at(AIR_Y0 - 6), rgba('#f4fcff', 0.12)], [at(AIR_Y0 + 2), rgba('#f2fcff', 0.34)],
    [at(AIR_Y0 + 40), rgba('#e2f6ff', 0.36)], [at(AIR_Y0 + 150), rgba('#c6eaff', 0.3)], [at(AIR_Y0 + 235), rgba('#b8e2fa', 0.14)], [1, rgba('#c4e6fa', 0)],
  ]);
  g.fillRect(0, 0, AIR_W, AIR_H);
  for (let i = 0; i < 30; i++) { // the shaded undersides of the billows, a bluer air
    const r = (j) => hash(i * 19 + j * 3 + 11);
    puff(g, r(1) * AIR_W, AIR_Y0 + 46 + r(2) * 120, 28 + r(3) * 30, '#5aa8d8', 0.13 + r(4) * 0.09);
  }
  for (let i = 0; i < 34; i++) { // the lit tops, whiter
    const r = (j) => hash(i * 23 + j * 5 + 3);
    puff(g, r(1) * AIR_W, AIR_Y0 + 30 + r(2) * 90, 22 + r(3) * 24, '#ffffff', 0.22 + r(4) * 0.14);
  }
  for (let i = 0; i < 28; i++) { // the billows along the edge
    const r = (j) => hash(i * 29 + j * 7 + 5);
    const x = ((i + r(1) * 0.7) / 28) * AIR_W;
    puff(g, x, AIR_Y0 + edgeY(x) + 3 + r(2) * 8, 17 + r(3) * 19, '#ffffff', 0.42 + r(4) * 0.12);
  }
  for (let i = 0; i < 9; i++) { // wisps leaning over the crest
    const r = (j) => hash(i * 31 + j * 11 + 17);
    swoosh(g, r(1) * AIR_W, AIR_Y0 - 5 - r(2) * 20, 90 + r(3) * 120, 0.07, 0, 3 + r(4) * 3, '#ffffff', 0.34, AIR_W, r(5) * 6);
  }
  for (let i = 0; i < 46; i++) { // motes
    const r = (j) => hash(i * 37 + j * 13 + 29);
    g.beginPath();
    g.arc(r(1) * AIR_W, AIR_Y0 + 4 + r(2) * 150, 0.9 + r(3) * 1.5, 0, TAU);
    g.fillStyle = rgba('#ffffff', 0.5 + r(4) * 0.4);
    g.fill();
  }
}

function light(g) {
  g.fillStyle = lin(g, 0, 0, 0, LIGHT_H, [
    [0, rgba('#9fe4ff', 0)], [(LIGHT_Y0 - 26) / LIGHT_H, rgba('#b4ecff', 0.07)], [LIGHT_Y0 / LIGHT_H, rgba('#b4ecff', 0.14)],
    [(LIGHT_Y0 + 60) / LIGHT_H, rgba('#8fdcff', 0.17)], [(LIGHT_Y0 + 150) / LIGHT_H, rgba('#8fdcff', 0.05)], [1, rgba('#8fdcff', 0)],
  ]);
  g.fillRect(0, 0, AIR_W, LIGHT_H);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  const widths = [[14, 0.07, '#bfeeff'], [6.5, 0.16, '#d4f6ff'], [3.2, 0.5, '#ecfcff'], [1.7, 1, '#ffffff']];
  for (const [w, a, c] of widths) {
    g.beginPath();
    for (let x = -16; x <= AIR_W + 16; x += 8) g.lineTo(x, LIGHT_Y0 + edgeY(x));
    g.lineWidth = w;
    g.strokeStyle = rgba(c, a);
    g.stroke();
  }
  for (let i = 0; i < 7; i++) {
    const x = 70 + ((i + hash(i * 3 + 1) * 0.6) / 7) * (AIR_W - 140);
    glint(g, x, LIGHT_Y0 + edgeY(x), 13 + hash(i * 5 + 2) * 15, 0.85);
  }
}

export const airTile = () => cached('breathAir', AIR_W, AIR_H, (g) => { g.save(); air(g); g.restore(); });
export const lightTile = () => cached('breathLight', AIR_W, LIGHT_H, (g) => { g.save(); light(g); g.restore(); });
export const twinkle = (mint) => cached(`breathTwinkle${mint ? 1 : 0}`, 48, 48, (g) => {
  g.save();
  glint(g, 24, 24, 21, 1);
  if (mint) { // a mint tint: the star again in a pale green, under its white heart
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = rgba('#a8ffd2', 0.55);
    g.fillRect(3, 3, 42, 42);
  }
  g.restore();
});
