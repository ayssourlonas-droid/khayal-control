// World 16, Glass Cathedral, the armoured one (see w16.js): a stone gargoyle with stained-glass wings, crouched on
// a carved plinth and facing us. Two lancet-window wings (w16-win.js) stand behind its shoulders and swing wider
// on beat 1; the heavy body is carved violet-grey stone with round pauldrons, arms folded across the chest
// with clawed hands, and thick haunches whose talons grip the plinth; the head (w16-stone.js) has a heavy
// brow, horns, fangs, a jewel in the forehead and glowing eyes that burn brighter on beat 1; a second jewel
// sits in a carved medallion on the chest. It is the one that cracks, so the torso is left smooth. Lights: the
// windows, the eyes, the two jewels, a faint violet bloom.
import { path, ink, rad, rgba, shade, mix, bloom, circle, stoneFill, grain, star4, streak, spark, LEAD, SLATE, DAWN, line } from './w16-kit.js';
import { lancetWindow } from './w16-win.js';
import { limb, claws, head } from './w16-stone.js';

function wings(b, l, f, c) {
  for (const m of [-1, 1]) {
    for (const g of [b, l]) {
      g.save();
      g.translate(m * 14, -5);
      g.rotate(m * (0.54 + f * 0.14));
      g.scale(1.2, 0.9);
    }
    lancetWindow(b, l, c, f);
    for (const g of [b, l]) g.restore();
  }
}

// The plinth the gargoyle crouches on: a slab with a chamfered top edge and a carved band.
function plinth(b, stone) {
  path(b, [[-29, 42], [-29, 36], [-25, 31.6], [25, 31.6], [29, 36], [29, 42]]);
  ink(b, stoneFill(b, -29, 31, 29, 42, mix(stone, '#c8c0d6', 0.3)), 2.6);
  b.save();
  b.clip();
  grain(b, 36, 17, 0, 37, 28, 5, 0.22);
  b.restore();
  path(b, [[-26, 37.2], [26, 37.2]], true);
  line(b, rgba(LEAD, 0.45), 1);
  for (const x of [-14, 0, 14]) { // the joints between the blocks
    path(b, [[x, 37.4], [x, 41.4]], true);
    line(b, rgba(LEAD, 0.4), 1);
  }
  path(b, [[-24, 33.4], [24, 33.4]], true);
  line(b, rgba(DAWN, 0.55), 0.9);
}

// Haunches and feet: a round thigh each side, a foot below it and three talons gripping the plinth's edge.
function legs(b, stone) {
  for (const m of [-1, 1]) {
    const [x, y] = [m * 13, 17];
    circle(b, x, y, 9);
    ink(b, rad(b, x, y, 0.5, 11, [[0, shade(stone, 0.45)], [0.55, stone], [1, mix(stone, SLATE, 0.8)]], x - 3, y - 3.4), 2.6);
    limb(b, x, y + 4, x + m * 1, 28, 7, stone);
    claws(b, x + m * 1, 27.6, Math.PI / 2, 3, 8.6, 0.46, stone);
  }
}

function torso(b, l, stone, c) {
  b.beginPath();
  b.moveTo(-8, -13);
  b.bezierCurveTo(-15, -11, -19, -3, -17.6, 6);
  b.bezierCurveTo(-16.6, 13, -13.6, 17, -11, 20);
  b.lineTo(11, 20);
  b.bezierCurveTo(13.6, 17, 16.6, 13, 17.6, 6);
  b.bezierCurveTo(19, -3, 15, -11, 8, -13);
  b.closePath();
  ink(b, stoneFill(b, -18, -13, 18, 20, stone), 2.8);
  b.save();
  b.clip();
  grain(b, 50, 31, 0, 3, 17, 18, 0.2);
  b.fillStyle = rad(b, 0, 0, 4, 28, [[0, rgba('#ffffff', 0)], [1, rgba(LEAD, 0.34)]], -7, -6);
  b.fillRect(-19, -14, 38, 36);
  streak(b, -12, -8, -14, 4, 1.2, 0.3);
  b.restore();
  circle(b, 0, -5.4, 4.8); // a carved medallion with a jewel in it
  ink(b, rad(b, 0, -5.4, 1, 5.4, [[0, shade(stone, 0.4)], [1, mix(stone, SLATE, 0.7)]], -1.2, -6.6), 1.6);
  circle(b, 0, -5.4, 2.6);
  ink(b, rad(b, 0, -5.4, 0.1, 2.8, [[0, '#ffffff'], [0.4, shade(c, 0.3)], [1, mix(c, '#12082a', 0.55)]], -0.6, -6.2), 1);
  spark(l, 0, -5.4, 1, c, 0.8);
}

// Round pauldrons on the shoulders.
function pauldrons(b, stone) {
  for (const m of [-1, 1]) {
    const [x, y] = [m * 16, -6.4];
    circle(b, x, y, 7.2);
    ink(b, rad(b, x, y, 0.5, 8.4, [[0, shade(stone, 0.5)], [0.55, stone], [1, mix(stone, SLATE, 0.8)]], x - 2.4, y - 3), 2.6);
    circle(b, x, y, 3.8);
    line(b, rgba(LEAD, 0.35), 1);
    star4(b, x - 2.4, y - 3, 2.2, '#ffffff', 0.55);
  }
}

// Arms folded across the chest: upper arms down the sides, thick forearms crossing, a fist and claws at each hand.
function arms(b, stone) {
  for (const m of [-1, 1]) limb(b, m * 16.4, -3, m * 17, 7, 7, stone);
  limb(b, 17, 7.6, -5.4, 3.6, 7.6, stone);
  limb(b, -17, 7.6, 5.4, 6.8, 7.6, stone);
  for (const [x, y] of [[8.4, 5.8], [-8.4, 7.4]]) { // a lead cuff round each wrist
    path(b, [[x + 0.6, y - 4.6], [x - 0.6, y + 4.6]], true);
    line(b, rgba(LEAD, 0.55), 1.4);
  }
  for (const m of [-1, 1]) {
    const [x, y] = [m * -5.6, m > 0 ? 3.6 : 6.8];
    circle(b, x, y, 4.8);
    ink(b, rad(b, x, y, 0.4, 5.6, [[0, shade(stone, 0.5)], [0.6, stone], [1, mix(stone, SLATE, 0.8)]], x - 1.4, y - 1.6), 1.8);
    claws(b, x, y + 2, Math.PI / 2 + m * 0.3, 3, 9, 0.42, stone);
    for (const t of [-1, 1]) { // knuckle lines
      path(b, [[x + t * 1.6 - 0.4, y - 3.4], [x + t * 1.6, y + 1.4]], true);
      line(b, rgba(LEAD, 0.4), 0.8);
    }
  }
}

export function armored(b, l, f, c) {
  const stone = mix('#9a91b4', c, 0.3);
  wings(b, l, f, c);
  plinth(b, stone);
  legs(b, stone);
  torso(b, l, stone, c);
  pauldrons(b, stone);
  arms(b, stone);
  head(b, l, f, c, stone);
  bloom(l, 0, -8, 38, c, 0.04 + f * 0.03);
}
