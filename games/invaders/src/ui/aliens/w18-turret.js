// World 18, Anvil Sky, the gunner (see w18.js): THE THUNDER TURRET, a floating capacitor with a gun. A squat drum of blue
// iron banded in copper, two glass gauges with a violet charge swirling in them, copper-wound ducted fans either side
// holding it up, a flared emitter at the bottom aimed at the ship (a lavender charge gathers in it), and on top a Tesla
// coil: copper windings on a stack of porcelain insulators under a polished terminal, with a curved prong each side.
// On the lights layer, violet-white arcs jump from the terminal to the prongs, a different pair on each beat.
import { path, ink, lin, rgba, bloom, line, ellipse, both, IRON, IRON_D, COPPER_L, VIOLET, rivets, scuff, glare, metal, round } from './w18-kit.js';
import { coilTop } from './w18-turret-coil.js';

// A band of copper round the drum at y, h tall, w wide.
function copperBand(b, y, h, w, c) {
  b.beginPath();
  b.rect(-w, y, w * 2, h);
  ink(b, round(b, -w, w, c, 0.5), 2);
  b.beginPath();
  b.moveTo(-w + 2, y + 1.2);
  b.lineTo(w - 2, y + 1.2);
  line(b, rgba(COPPER_L, 0.7), 0.8);
  rivets(b, -w + 4, y + h / 2, w - 4, y + h / 2, 5, 0.9, COPPER_L);
}

function drum(b, l, f, c) {
  b.beginPath();
  b.moveTo(-15, -14);
  b.lineTo(15, -14);
  b.lineTo(15, 17);
  b.quadraticCurveTo(0, 21, -15, 17);
  b.closePath();
  ink(b, round(b, -15, 15, IRON, 0.6), 2.8);
  b.save();
  b.clip();
  scuff(b, 14, 4, 0, 2, 13, 14, 0.2);
  b.restore();
  copperBand(b, -14, 5, 15.5, c);
  copperBand(b, 12, 5, 15.8, c);
  for (const [i, x] of [-8.5, 0, 8.5].entries()) { // the charge bank: three glass cells in copper frames, filling and emptying
    const level = (f ? [0.45, 0.95, 0.5] : [0.9, 0.5, 0.78])[i];
    b.beginPath();
    b.rect(x - 3.4, -6, 6.8, 15);
    ink(b, lin(b, x - 3.4, 0, x + 3.4, 0, [[0, '#2a1a58'], [0.4, '#6a46c0'], [1, '#150a30']]), 1.8);
    b.beginPath();
    b.moveTo(x - 1.8, -4.6);
    b.lineTo(x - 1.8, 5);
    line(b, rgba('#ffffff', 0.6), 0.9);
    b.beginPath();
    b.rect(x - 4.4, -7.4, 8.8, 2.2);
    ink(b, c, 1.2);
    b.beginPath();
    b.rect(x - 4.4, 8, 8.8, 2.2);
    ink(b, c, 1.2);
    bloom(l, x, 2, 11, VIOLET, 0.4);
    l.fillStyle = lin(l, 0, 8.6, 0, 8.6 - 14.4 * level, [[0, rgba(VIOLET, 0.7)], [1, rgba('#e8e0ff', 0.75)]]);
    l.fillRect(x - 2.6, 8.6 - 14.4 * level, 5.2, 14.4 * level);
  }
}

// A ducted fan held out either side of the drum on a strut.
function ducts(b, l, f, c) {
  both((s) => {
    path(b, [[s * 14, -2], [s * 21, -4], [s * 21, 8], [s * 14, 9]]);
    ink(b, metal(b, 14, -4, 21, 9, IRON_D), 1.8); // the strut
    const [x, y] = [s * 26, 2];
    b.beginPath();
    b.rect(x - 6.4, y - 11.5, 12.8, 23);
    ink(b, round(b, x - 6.4, x + 6.4, IRON, 0.55), 2.4);
    b.beginPath();
    b.rect(x - 6.4, y - 11.5, 12.8, 4);
    ink(b, round(b, x - 6.4, x + 6.4, c, 0.5), 1.6);
    b.beginPath();
    b.rect(x - 6.4, y + 7.5, 12.8, 4);
    ink(b, round(b, x - 6.4, x + 6.4, c, 0.5), 1.6);
    for (let k = 0; k < 3; k++) { // the fan's blades seen edge-on, turned a notch between beats
      const yy = y - 4 + k * 4 + (f ? 1.4 : 0);
      b.beginPath();
      b.moveTo(x - 4.6, yy);
      b.lineTo(x + 4.6, yy + 1.2);
      line(b, '#0a0c16', 1.6);
    }
    bloom(l, x, y + 12.4, 9, '#9fd8ff', f ? 0.45 : 0.3); // the downwash glows under it
    rivets(b, x - 4, y - 9.5, x + 4, y - 9.5, 2, 0.8, COPPER_L);
  });
}

// The flared emitter at the bottom, and the charge gathering in it.
function nozzle(b, l, f, c) {
  b.beginPath();
  b.moveTo(-9, 17);
  b.lineTo(-6, 31);
  b.lineTo(6, 31);
  b.lineTo(9, 17);
  b.closePath();
  ink(b, round(b, -9, 9, IRON_D, 0.5), 2.4);
  copperBand(b, 22, 3.6, 7.6, c);
  b.beginPath();
  b.ellipse(0, 33, 10.6, 4.2, 0, 0, Math.PI * 2);
  ink(b, round(b, -10.6, 10.6, c, 0.5), 2.6);
  b.beginPath();
  b.ellipse(0, 33.4, 7.6, 2.9, 0, 0, Math.PI * 2);
  ink(b, '#0d0818', 1.6);
  rivets(b, -9, 33.4, 9, 33.4, 4, 0.8, COPPER_L);
  const r = f ? 3.4 : 5; // the charge swells and eases with the beat
  bloom(l, 0, 35, 9, VIOLET, f ? 0.6 : 0.85);
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.beginPath();
  l.ellipse(0, 33.4, 7.2, 2.6, 0, 0, Math.PI * 2);
  l.fillStyle = rgba(VIOLET, 0.6);
  l.fill();
  l.restore();
  glare(l, 0, 34.6, r * 0.6, '#ffffff', 0.8);
}

export function gunner(b, l, f, c) {
  b.translate(0, 4); // set a little low: the coil's arcs need the room above
  l.translate(0, 4);
  coilTop(b, l, f, c);
  ducts(b, l, f, c);
  nozzle(b, l, f, c);
  drum(b, l, f, c);
}
