// The sprites of Glass Cathedral's light flourishes (flourish-glass.js draws them), each painted once: a shaft of coloured
// light falling slant through a high window, in four colours, its sides feathered, its head bright and its foot gone,
// with the faint lozenge shadow of the window's lead cames across it; a patch of window light lying on the flags, a
// foreshortened lancet with its cames left dark, in four colours; and the fan the great rose window throws, twelve
// wedges of ruby, gilt, cobalt and violet light that fade out with distance. All of it is additive, soft and dim:
// the bullets and the ship must stay the loudest things on screen.
import { cached, rgba, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';

export const SHAFT = { w: 240, h: 760, colors: ['#ff7aa8', '#ffd070', '#6a9aff', '#b48cff'] }; // the box; the four colours (rose, gilt, cobalt, violet)
export const PATCH = { w: 150, h: 54, colors: ['#ff7aa8', '#ffc86a', '#6a9aff', '#b48cff'] };
export const FAN = { size: 720, wedges: 12 };

// A shaft in colour k, 240 x 760, its head centred on the top edge: five nested wedges (so the sides are soft), bright at
// the head and gone by the foot, and a lattice of faint lozenge shadows from the window's lead.
export const shaftSprite = (k) => cached('glassfxShaft' + (k % SHAFT.colors.length), SHAFT.w, SHAFT.h, (g, w, h) => {
  const c = SHAFT.colors[k % SHAFT.colors.length];
  g.fillStyle = lin(g, 0, 0, 0, h, [[0, rgba(c, 0.34)], [0.35, rgba(c, 0.18)], [0.7, rgba(c, 0.06)], [1, rgba(c, 0)]]);
  for (let j = 0; j < 5; j++) {
    const s = 1 - j * 0.17;
    g.beginPath();
    g.moveTo(w / 2 - 34 * s, 0);
    g.lineTo(w / 2 + 34 * s, 0);
    g.lineTo(w / 2 + 104 * s, h);
    g.lineTo(w / 2 - 104 * s, h);
    g.closePath();
    g.fill();
  }
  g.globalCompositeOperation = 'destination-out'; // the cames cut faint dark diamonds out of the light
  g.strokeStyle = 'rgba(0,0,0,0.16)';
  g.lineWidth = 3;
  g.beginPath();
  for (let y = 60; y < h * 0.8; y += 92) {
    const half = 30 + (y / h) * 70;
    g.moveTo(w / 2 - half, y);
    g.lineTo(w / 2, y + 46);
    g.lineTo(w / 2 + half, y);
    g.moveTo(w / 2 - half, y + 46);
    g.lineTo(w / 2, y);
    g.lineTo(w / 2 + half, y + 46);
  }
  g.stroke();
  g.globalCompositeOperation = 'source-over';
});

// A patch of light on the floor in colour k, 150 x 54: a lancet foreshortened to a flat arch, sheared a little, a lattice of dark
// cames across it, its edge feathered and a paler heart.
export const patchSprite = (k) => cached('glassfxPatch' + (k % PATCH.colors.length), PATCH.w, PATCH.h, (g, w, h) => {
  const c = PATCH.colors[k % PATCH.colors.length];
  const edge = (x, y) => [x, y];
  g.beginPath();
  g.moveTo(...edge(18, h - 4));
  g.lineTo(...edge(30, 18));
  g.quadraticCurveTo(...edge(52, 2), ...edge(78, 4));
  g.quadraticCurveTo(...edge(102, 2), ...edge(124, 18));
  g.lineTo(...edge(w - 18, h - 4));
  g.closePath();
  g.save();
  g.clip();
  g.fillStyle = rad(g, w / 2, h * 0.55, 0, w * 0.52, [[0, rgba(c, 0.5)], [0.7, rgba(c, 0.3)], [1, rgba(c, 0.08)]]);
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-out';
  g.strokeStyle = 'rgba(0,0,0,0.5)';
  g.lineWidth = 1.8;
  g.beginPath();
  for (let x = -h; x < w + h; x += 19) {
    g.moveTo(x, 0);
    g.lineTo(x + h, h);
    g.moveTo(x + h, 0);
    g.lineTo(x, h);
  }
  g.stroke();
  g.restore();
});

// The rose window's fan, 720 x 720 centred on the window: twelve wedges in four colours round, each brightest near the window and
// fading to nothing at the rim, each drawn twice (a wide soft one under a narrow one) so its edges are feathered.
export const fanSprite = () => cached('glassfxFan', FAN.size, FAN.size, (g, w) => {
  const [m, r] = [w / 2, w / 2];
  const cols = ['#ff6a90', '#ffd070', '#5a8aff', '#a47cff'];
  for (let i = 0; i < FAN.wedges; i++) {
    const a = (i * TAU) / FAN.wedges;
    const c = cols[i % cols.length];
    for (const [half, alpha] of [[TAU / FAN.wedges / 2.1, 0.5], [TAU / FAN.wedges / 3.4, 0.75]]) {
      g.fillStyle = rad(g, m, m, 10, r, [[0, rgba(c, 0.5 * alpha)], [0.45, rgba(c, 0.22 * alpha)], [1, rgba(c, 0)]]);
      g.beginPath();
      g.moveTo(m, m);
      g.arc(m, m, r, a - half, a + half);
      g.closePath();
      g.fill();
    }
  }
});

// Paint the sprites these draw, so none is baked mid-fight.
export function warmLight() {
  SHAFT.colors.forEach((_, k) => shaftSprite(k));
  PATCH.colors.forEach((_, k) => patchSprite(k));
  fanSprite();
}
