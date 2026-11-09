// World 16, Glass Cathedral, the beetle's shell (see w16.js): a tiny rose window. A ring of pale carved stone
// studded with beads holds, from the outside in, sixteen panes divided by radial lead cames (rose between
// jewels of gold, cobalt, violet and ruby), a flower of eight lens-shaped petals set in dark lead, and a golden
// hub; a soft shadow gathers at its lower right (the dome of the shell) and its upper left holds the specular
// arc and a star of light that moves between the two beats. Every pane shines through on the lights layer.
import { pane, sector, came, stoneFill, grain, star4, spark, bloom, circle, ellipse, ink, rad, rgba, shade, mix, line, LEAD, GOLD, SAPPHIRE, AMETHYST, RUBY, DAWN, TAU } from './w16-kit.js';

export const CY = -7; // the shell's centre
const RIM = 23.6; // outer radius of the stone ring
const OUT = [12, 19.4]; // the sixteen panes' inner and outer radius
const ROSEN = '#dcc4d8'; // the ring's stone, warmed by the rose glass beside it
const JEWELS = [GOLD, SAPPHIRE, AMETHYST, RUBY];

function ring(b) {
  circle(b, 0, CY, RIM);
  ink(b, stoneFill(b, -RIM, CY - RIM, RIM, CY + RIM, ROSEN), 2.4);
  b.save();
  circle(b, 0, CY, RIM);
  b.clip();
  grain(b, 40, 16, 0, CY, RIM, RIM, 0.22);
  b.restore();
  for (let k = 0; k < 16; k++) { // beads of stone set in the ring
    const a = (k * TAU) / 16 + TAU / 32;
    const [x, y] = [Math.cos(a) * 21.6, CY + Math.sin(a) * 21.6];
    circle(b, x, y, 0.95);
    b.fillStyle = rgba(k % 2 ? DAWN : LEAD, 0.75);
    b.fill();
  }
}

function panes(b, l, c, lit) {
  circle(b, 0, CY, OUT[0] + 0.6);
  b.fillStyle = mix(c, LEAD, 0.78);
  b.fill();
  for (let k = 0; k < 16; k++) {
    const [a0, a1] = [(k * TAU) / 16 - Math.PI / 2, ((k + 1) * TAU) / 16 - Math.PI / 2];
    const am = (a0 + a1) / 2;
    const col = k % 2 ? JEWELS[(k >> 1) % 4] : k % 4 ? shade(c, 0.12) : c;
    pane(b, l, (g) => sector(g, 0, CY, OUT[0], OUT[1], a0, a1), col, [Math.cos(am) * 15.6, CY + Math.sin(am) * 15.6, 5.2], lit, 1.5);
  }
  for (let k = 0; k < 8; k++) { // the flower of petals, each a lens along its radius
    const a = (k * TAU) / 8 - Math.PI / 2;
    const [x, y] = [Math.cos(a) * 8.3, CY + Math.sin(a) * 8.3];
    pane(b, l, (g) => ellipse(g, x, y, 4, 3.1, a), k % 2 ? shade(c, 0.32) : mix(c, AMETHYST, 0.35), [x, y, 3.4], lit, 1.3);
  }
  circle(b, 0, CY, 4.6);
  b.fillStyle = rad(b, 0, CY, 0, 4.6, [[0, '#fff6d0'], [0.5, GOLD], [1, mix(GOLD, '#7a3a00', 0.6)]], -1, CY - 1.2);
  b.fill();
  came(b, 1.6);
  star4(b, -1.2, CY - 1.4, 2.6, '#ffffff', 0.9);
  for (const r of OUT) {
    b.beginPath();
    b.arc(0, CY, r, 0, TAU);
    came(b, 1.9);
  }
}

// The shell: window, dome shading, specular arc and star; f moves the star and brightens the light shining through.
export function rose(b, l, f, c) {
  ring(b);
  panes(b, l, c, 0.12 + f * 0.08);
  b.save();
  circle(b, 0, CY, OUT[1] + 0.8);
  b.clip();
  b.fillStyle = rad(b, 0, CY, 0, 31, [[0, rgba('#ffffff', 0.14)], [0.5, rgba('#ffffff', 0)], [1, rgba('#1a0838', 0.45)]], -8, CY - 9);
  b.fillRect(-24, CY - 24, 48, 48);
  b.restore();
  b.beginPath();
  b.arc(0, CY, 16.6, Math.PI * 1.08, Math.PI * 1.42);
  line(b, rgba('#ffffff', 0.5), 1.3);
  b.beginPath();
  b.arc(0, CY, 22.6, Math.PI * 1.1, Math.PI * 1.35);
  line(b, rgba(DAWN, 0.6), 1.2);
  const [sx, sy] = f ? [-3.5, CY - 15.5] : [-11, CY - 9.5];
  star4(b, sx, sy, f ? 5.2 : 4, '#ffffff', 0.95);
  spark(l, sx, sy, f ? 1.9 : 1.3, '#fff0f8', f ? 0.9 : 0.6);
  bloom(l, 0, CY, 30, c, 0.24 + f * 0.1);
  spark(l, 0, CY, 2.2, GOLD, 0.8);
}
