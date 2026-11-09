// Sprites the Grand Grimoire's live extras draw (World 12, Starlit Archive; grimoire-fx.js), each painted
// once on first use and kept: a page torn loose (eight turns of two), the leaf that turns across the
// spread (its face and its back), a page in light for the ghost leaves, the eye's slit pupil and the
// ring of runes that turns in its wheel.
import { rgba, cached, hash, INK, lin, rad } from '../sprites.js';
import { TAU } from '../../core/math.js';
import { GOLD, GILT, GOLD_D, PARCH, INK_B, leaf, scriptPath, LINES } from './grimoire-kit.js';

export const TEAL = '#4af0d8'; // the look's weak colour, for the sprites that are not baked per look
const TURNS = 8;
const once = (make) => { // the sprite is asked for every frame: no key built and no painter made once it exists
  let sprite = null;
  return () => (sprite ??= make());
};

// A torn page, 34 x 44, turned frame/8 of a circle: parchment, three short lines of script, the torn
// edge scorched brown, a thread of ember along it.
const paintTorn = (variant, frame) => (g) => {
  g.translate(32, 32);
  g.rotate((frame * TAU) / TURNS);
  g.beginPath();
  g.moveTo(-17, 22);
  g.lineTo(-17, -20 + variant * 3);
  for (let i = 0; i <= 8; i++) g.lineTo(-17 + i * 4.25, -22 + hash(i * 7 + variant * 31) * 9 + (i % 2 ? 3 : 0)); // the torn edge
  g.lineTo(17, 22);
  g.closePath();
  g.fillStyle = lin(g, -17, -22, 17, 22, [[0, '#f8eecb'], [0.6, PARCH], [1, '#c8aa6e']]);
  g.fill();
  g.lineWidth = 1.3;
  g.strokeStyle = INK;
  g.stroke();
  g.strokeStyle = rgba(INK_B, 0.7);
  g.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(-12, -6 + i * 7);
    for (let x = -12; x < 12 - hash(i + variant * 9) * 8; x += 3) g.lineTo(x + 1.5, -6 + i * 7 - 2 - hash(x + i) * 2);
    g.stroke();
  }
  g.strokeStyle = rgba('#ff9a3a', 0.55); // the scorch along the tear
  g.beginPath();
  for (let i = 0; i <= 8; i++) g.lineTo(-17 + i * 4.25, -20.6 + hash(i * 7 + variant * 31) * 9 + (i % 2 ? 3 : 0));
  g.stroke();
};
const pages = [];
export const torn = (variant, n) => (pages[variant * TURNS + (n & (TURNS - 1))] ??= cached(`grimTorn${variant}.${n & (TURNS - 1)}`, 64, 64, paintTorn(variant, n & (TURNS - 1))));

// The leaf that turns across the spread, 200 x 190, its gutter edge on the left: the face, with script,
// or the back, a darker parchment with the script showing faintly through.
const paintLeaf = (back) => (g) => {
  g.translate(100, 95);
  g.scale(-0.8, 0.8);
  leaf(g);
  g.fillStyle = lin(g, 125, 0, -125, 0, back ? [[0, '#7a5a30'], [0.4, '#c8aa6e'], [1, '#b89658']] : [[0, '#7a5a30'], [0.2, '#c8ac70'], [0.5, PARCH], [1, '#f6ebc8']]);
  g.fill();
  g.lineWidth = 3.4;
  g.strokeStyle = INK;
  g.stroke();
  for (let k = 0; k < LINES.length; k++) {
    scriptPath(g, k);
    g.lineWidth = 2;
    g.strokeStyle = rgba(INK_B, back ? 0.2 : 0.9);
    g.stroke();
    if (!back) {
      g.lineWidth = 0.95;
      g.strokeStyle = GOLD;
      g.stroke();
    }
  }
};
export const leafFace = once(() => cached('grimLeaf0', 200, 190, paintLeaf(false)));
export const leafBack = once(() => cached('grimLeaf1', 200, 190, paintLeaf(true)));

// A page as a ghost, 270 x 250: gold along its edge and its script, hardly any fill. Drawn with 'lighter'.
export const ghost = once(() => cached('grimGhost', 270, 250, (g) => {
  g.translate(135, 125);
  leaf(g);
  g.fillStyle = rgba(GOLD, 0.025);
  g.fill();
  g.lineWidth = 5;
  g.strokeStyle = rgba(GOLD_D, 0.2);
  g.stroke();
  g.lineWidth = 1.6;
  g.strokeStyle = rgba(GILT, 0.7);
  g.stroke();
  g.strokeStyle = rgba(GOLD, 0.34);
  g.lineWidth = 1;
  for (let k = 0; k < LINES.length; k++) {
    scriptPath(g, k);
    g.stroke();
  }
}));

// The pupil: a vertical slit, black with a thread of teal along its left edge. 24 x 48.
export const pupil = once(() => cached('grimPupil', 24, 48, (g) => {
  g.translate(12, 24);
  g.beginPath();
  g.ellipse(0, 0, 4.6, 20, 0, 0, TAU);
  g.fillStyle = rad(g, 0, 0, 0, 20, [[0, '#010708'], [0.8, '#02191a'], [1, '#0a3a3a']]);
  g.fill();
  g.beginPath();
  g.ellipse(0, 0, 4.6, 20, 0, Math.PI * 0.62, Math.PI * 1.38);
  g.lineWidth = 1;
  g.strokeStyle = rgba(TEAL, 0.6);
  g.stroke();
}));

// Twelve runes round a ring of radius 43, in teal light with a white core: they turn in the eye's wheel.
export const runes = once(() => cached('grimRunes', 112, 112, (g) => {
  g.translate(56, 56);
  g.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    g.save();
    g.rotate((i * TAU) / 12);
    g.translate(0, -43);
    g.beginPath();
    g.moveTo(0, -3.4);
    g.lineTo(0, 3.4);
    const h = hash(i + 5);
    if (h < 0.7) { g.moveTo(0, -3.4); g.lineTo(3, -0.6); }
    if (h > 0.3) { g.moveTo(0, 0.4); g.lineTo(-3, 3); }
    if (h > 0.55) { g.moveTo(-2.4, -1.8); g.lineTo(2.4, -1.8); }
    for (const [w, c] of [[4.4, rgba(TEAL, 0.18)], [2, rgba(TEAL, 0.85)], [0.8, rgba('#ffffff', 0.8)]]) {
      g.lineWidth = w;
      g.strokeStyle = c;
      g.stroke();
    }
    g.restore();
  }
}));

// Everything above, painted now: the live extras draw these from the first frame of the fight, and the
// storm's pages and the turning leaf from its middle, and none of that should be baked mid-fight.
export function warm() {
  for (let v = 0; v < 2; v++) for (let n = 0; n < TURNS; n++) torn(v, n);
  for (const make of [leafFace, leafBack, ghost, pupil, runes]) make();
}
