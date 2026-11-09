// What Anvil Sky (world 18) adds to the player's ship while the borrowed broadside is open (ship-view.js draws it where it draws
// Sunset Armada's brass gun ports): a COIL EMITTER run out of each flank, a copper barrel wound with windings and a pair of
// prongs at its mouth, an arc crackling between the prongs and a longer one flicking off the tip, in the ship's cyan, with a
// faint halo. The glow is brightest at the catch and dims as the six seconds run down; the barrels slide in during the last
// third of a second, as the brass ones do. Drawn in the ship's own banked frame (centre at the origin), straight paths and
// cached glows only. The bolts they throw are shots-storm.js, the flash is fx/react-storm.js.
import { INK, rgba, lin, glow, hash } from './sprites.js';
import { clamp } from '../core/math.js';
import { BROADSIDE_TIME } from '../core/powerups.js';
import { arcPath } from './storm-bolt.js';

const COPPER = '#c9783c';
const PORT_DX = 22; // px: where the side guns sit, either side of the ship (GUN_DX in core/ship.js)
const REACH = 13; // px a barrel runs out

export function drawCoilPorts(ctx, s, t, look) {
  const accent = look.palette.accent;
  const left = s.broadside;
  const out = Math.min(clamp((BROADSIDE_TIME - left) / 0.18, 0, 1), clamp(left / 0.3, 0, 1));
  const heat = 0.3 + 0.7 * clamp(left / BROADSIDE_TIME, 0, 1);
  const own = ctx.globalAlpha; // the ship's own (it blinks while invulnerable)
  const frame = Math.floor(t * 30);
  for (const side of [-1, 1]) {
    const x0 = side * PORT_DX;
    const len = REACH * out;
    const x1 = x0 + side * len;
    ctx.fillStyle = INK;
    ctx.fillRect(Math.min(x0, x1) - 1.4, -5.4, len + 2.8, 10.8);
    ctx.fillStyle = lin(ctx, 0, -4, 0, 4, [[0, '#ffd8a0'], [0.45, COPPER], [1, '#5a2c12']]);
    ctx.fillRect(Math.min(x0, x1), -4, len, 8);
    ctx.strokeStyle = rgba('#2a1206', 0.85); // the windings
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 1; k <= 3; k++) {
      const x = x0 + (side * len * k) / 4;
      ctx.moveTo(x, -4);
      ctx.lineTo(x, 4);
    }
    ctx.stroke();
    for (const py of [-4.4, 4.4]) { // the two prongs at the mouth
      ctx.fillStyle = INK;
      ctx.fillRect(Math.min(x1, x1 + side * 3.4) - 0.8, py - 1.5, 5, 3);
      ctx.fillStyle = '#d8e4ff';
      ctx.fillRect(Math.min(x1, x1 + side * 3.4), py - 0.7, 3.4, 1.4);
    }
    ctx.globalCompositeOperation = 'lighter';
    const flick = 0.8 + 0.2 * Math.sin(t * 23 + side);
    ctx.globalAlpha = own * heat * flick * out;
    ctx.drawImage(glow(accent), x1 + side * 6 - 17, -17, 34, 34); // the crackle's halo
    ctx.globalAlpha = own * heat * heat * out;
    ctx.drawImage(glow('#ffffff'), x1 + side * 2 - 6, -6, 12, 12);
    ctx.globalAlpha = own * out * (0.55 + 0.45 * heat);
    ctx.beginPath();
    arcPath(ctx, x1 + side * 1.5, -4.4, x1 + side * 1.5, 4.4, 4, 2.6, frame * 2 + side); // the arc between the prongs
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    if (hash(frame + side * 5) > 0.35) { // and now and then a longer one flicking off the tip
      const a = (hash(frame * 3 + side) - 0.5) * 1.4;
      ctx.beginPath();
      arcPath(ctx, x1 + side * 2, 0, x1 + side * (11 + hash(frame) * 9), Math.sin(a) * 15, 3, 3, frame + side * 7);
      ctx.strokeStyle = rgba(accent, 0.95);
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
    ctx.globalAlpha = own;
    ctx.globalCompositeOperation = 'source-over';
  }
}
