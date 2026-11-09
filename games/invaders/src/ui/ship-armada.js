// What Sunset Armada adds to the player's ship (ship-view.js draws it): the wingmen, two small brass-and-
// canvas fighters flying either side of it for the power's 10 s, and the broadside, gun ports glowing on
// the ship's flanks while the side guns are open (6 s from each catch), the barrels run out and the glow
// dimming as the time runs down. The escorts' shots are the ship's own (lasers-view.js) and the side shots'
// flash and smoke are fx (fx/react-armada.js); the cannon balls are in shots-armada.js.
import { INK, rgba, shade, lin, glow, soft, star, cached, addGlow } from './sprites.js';
import { clamp, TAU } from '../core/math.js';
import { escortsOf, SHIP_SPEED } from '../core/ship.js';
import { powerTime, BROADSIDE_TIME } from '../core/powerups.js';

const BRASS = '#d9a441';
const PORT_DX = 22; // px: where the side guns sit, either side of the ship (GUN_DX in core/ship.js)
const COME = 0.35; // s the escorts take to fade in when the power starts, and out at its end

// One escort, nose up, 52 px across and 50 long, baked at twice that: a swept canvas wing seamed and
// patched with its brass leading edge, a lower wing peeking out behind, struts and wires, a tailplane, a
// teardrop fuselage of riveted brass with a cowling at the nose and a glass cockpit in the accent colour.
const escort = (accent) => cached('escort' + accent, 120, 120, (g) => {
  g.translate(60, 60);
  g.scale(2, 2);
  g.lineJoin = 'round';
  const wing = (pts, fill, w = 1.3) => {
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.lineWidth = w;
    g.strokeStyle = INK;
    g.stroke();
  };
  wing([[-11, 16], [-3, 12], [3, 12], [11, 16], [10, 21], [-10, 21]], lin(g, -11, 0, 11, 0, [[0, '#e8d0a0'], [1, '#a88a60']])); // the tailplane
  wing([[-24, 3], [-4, -1], [4, -1], [24, 3], [23, 10], [-23, 10]], lin(g, -24, 0, 24, 0, [[0, '#d8b888'], [0.5, '#c8a070'], [1, '#8a6a48']])); // the lower wing
  wing([[-26, -6], [-4, -10], [4, -10], [26, -6], [26, 3], [4, 5], [-4, 5], [-26, 3]], lin(g, -26, 0, 26, 0, [[0, '#fff6dc'], [0.45, '#f0d6a8'], [1, '#b89868']])); // the upper wing
  g.strokeStyle = rgba(INK, 0.5);
  g.lineWidth = 0.8;
  g.beginPath();
  for (const x of [-20, -14, -8, 8, 14, 20]) { // ribs
    g.moveTo(x, -9 + Math.abs(x) * 0.18);
    g.lineTo(x, 4 - Math.abs(x) * 0.04);
  }
  g.stroke();
  g.fillStyle = rgba('#c8664a', 0.85); // a patch of red canvas on each wing
  for (const s of [-1, 1]) g.fillRect(s * 16 - 3, -4, 6, 5);
  g.strokeStyle = rgba(BRASS, 0.95); // the brass leading edge
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(-26, -6);
  g.lineTo(-4, -10);
  g.lineTo(4, -10);
  g.lineTo(26, -6);
  g.stroke();
  g.strokeStyle = INK; // struts and wires between the wings
  g.lineWidth = 1;
  g.beginPath();
  for (const s of [-1, 1]) {
    g.moveTo(s * 10, -2);
    g.lineTo(s * 10, 8);
    g.moveTo(s * 20, -1);
    g.lineTo(s * 20, 8);
    g.moveTo(s * 10, -2);
    g.lineTo(s * 20, 8);
  }
  g.stroke();
  g.beginPath(); // the fuselage
  g.moveTo(0, -25);
  g.quadraticCurveTo(5.4, -17, 4.8, -6);
  g.quadraticCurveTo(4.4, 10, 1, 23);
  g.lineTo(-1, 23);
  g.quadraticCurveTo(-4.4, 10, -4.8, -6);
  g.quadraticCurveTo(-5.4, -17, 0, -25);
  g.fillStyle = lin(g, -5, 0, 5, 0, [[0, '#fff0b0'], [0.4, '#d9a441'], [1, '#6a4a1a']]);
  g.fill();
  g.lineWidth = 1.4;
  g.strokeStyle = INK;
  g.stroke();
  g.fillStyle = rgba('#fff6d0', 0.8); // rivets
  for (let y = -16; y < 18; y += 5) g.fillRect(-0.4, y, 0.8, 0.8);
  g.beginPath(); // the cowling at the nose, and the cockpit
  g.ellipse(0, -21, 4.8, 3.2, 0, 0, TAU);
  g.fillStyle = shade(BRASS, -0.35);
  g.fill();
  g.stroke();
  g.beginPath();
  g.ellipse(0, -5, 2.9, 5.6, 0, 0, TAU);
  g.fillStyle = lin(g, 0, -10, 0, 1, [[0, '#f2fcff'], [0.45, accent], [1, '#0a1428']]);
  g.fill();
  g.lineWidth = 1;
  g.stroke();
  g.fillStyle = rgba('#ffffff', 0.75);
  g.fillRect(-1.6, -9, 0.9, 3.6);
});

// Paint the escort's sprite, so it is not baked at the first pickup (warm-armada.js).
export const warmShip = (look) => escort(look.palette.accent);

// A propeller seen edge-on from above, at the nose: the two blades a bar whose length follows the cosine of
// its turn, and the blur of the disc behind it.
function prop(ctx, x, y, t, k) {
  ctx.globalAlpha = 0.34 * k;
  ctx.drawImage(soft('#ffe8b0'), x - 17, y - 4, 34, 8);
  const half = 15 * Math.abs(Math.cos(t * 30));
  ctx.globalAlpha = 0.9 * k;
  ctx.fillStyle = '#3a2410';
  ctx.fillRect(x - half, y - 1.3, half * 2, 2.6);
  ctx.fillStyle = BRASS;
  ctx.beginPath();
  ctx.arc(x, y, 2.4, 0, TAU);
  ctx.fill();
}

// The wingmen, left then right, at the places they fire from (escortsOf), fading in when the power starts
// and out at its end, banking with the ship, bobbing a little each to its own beat, blinking over the
// power's last two seconds. `alpha` is the ship's own (it blinks while invulnerable).
export function drawEscorts(ctx, s, look, t, alpha) {
  const list = escortsOf(s);
  if (!list.length) return;
  const left = s.power.left;
  const k = Math.min(clamp((powerTime('wingmen') - left) / COME, 0, 1), clamp(left / COME, 0, 1));
  const out = k * k * (3 - 2 * k);
  const fade = left < 2 && Math.floor(t * 10) % 2 ? 0.45 : 1;
  const bank = clamp(s.vx / SHIP_SPEED, -1, 1);
  const accent = look.palette.accent;
  for (let i = 0; i < list.length; i++) {
    const e = list[i];
    const x = e.x;
    const y = e.y + Math.sin(t * 2.3 + i * 2.1) * 2.4;
    const flame = 20 + Math.sin(t * 41 + i) * 4;
    addGlow(ctx, glow(accent), x, y + 32 + flame * 0.2, 15, 0.8 * alpha * fade * out); // the engine's heat behind it
    ctx.globalAlpha = alpha * fade * out;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(bank * 0.12);
    ctx.scale(1.2, 1.2);
    ctx.drawImage(escort(accent), -30, -30, 60, 60);
    prop(ctx, 0, -25, t + i, alpha * fade * out);
    ctx.restore();
    const tip = 0.55 + 0.45 * Math.sin(t * 6 + i * 3); // port red, starboard green
    ctx.globalAlpha = 1;
    addGlow(ctx, star('#ff5a4a'), x - 31, y - 6, 9, tip * alpha * fade * out);
    addGlow(ctx, star('#5aff8a'), x + 31, y - 6, 9, (1 - tip * 0.5) * alpha * fade * out);
  }
  ctx.globalAlpha = 1;
}

// The side guns while they are open, in the ship's own banked frame (centre at the origin): a brass barrel
// run out of each flank, a hot ring at its mouth and a glow that is brightest at the catch and dims to
// embers as the six seconds run down; the barrels slide in during the last third of a second.
export function drawGunPorts(ctx, s, t) {
  const left = s.broadside;
  const out = Math.min(clamp((BROADSIDE_TIME - left) / 0.18, 0, 1), clamp(left / 0.3, 0, 1));
  const heat = 0.22 + 0.78 * clamp(left / BROADSIDE_TIME, 0, 1);
  const own = ctx.globalAlpha; // the ship's own (it blinks while invulnerable)
  for (const side of [-1, 1]) {
    const x = side * PORT_DX;
    ctx.fillStyle = INK;
    ctx.fillRect(Math.min(x, x + side * 9 * out) - 1.4, -4.2, 9 * out + 2.8, 8.4);
    ctx.fillStyle = lin(ctx, 0, -3, 0, 3, [[0, '#fff0b0'], [0.5, BRASS], [1, '#6a4a1a']]);
    ctx.fillRect(Math.min(x, x + side * 9 * out), -3, 9 * out, 6);
    ctx.fillStyle = rgba('#1a0e08', 0.9);
    ctx.fillRect(x + side * 9 * out - (side > 0 ? 1.6 : 0), -2, 1.6, 4); // the muzzle
    ctx.globalCompositeOperation = 'lighter';
    const flick = 0.85 + 0.15 * Math.sin(t * 17 + side);
    ctx.globalAlpha = own * heat * flick * out;
    ctx.drawImage(glow('#ff9a3a'), x + side * 10 * out - 14, -14, 28, 28);
    ctx.globalAlpha = own * heat * heat * out;
    ctx.drawImage(glow('#fff0c0'), x + side * 10 * out - 6, -6, 12, 12);
    ctx.globalAlpha = own;
    ctx.globalCompositeOperation = 'source-over';
  }
}
