// A tall ship locked in the ice, for the frozen fleet (parallax-ice-2.js): a galleon heeled over where
// the floe took her, three masts with yards, frozen sails, furled ones and a hanging lantern, rigging
// strung with icicles. Painted in the layer colour with frost laid along every edge that would hold it.
// The ice sheet that swallows her keel is the caller's.
import { rgba, shade, lin } from './sprites.js';
import { icicles, SNOW, SHADE } from './parallax-ice-kit.js';

const MASTS = [[-72, 168, 3.6], [0, 232, 4.6], [78, 190, 4]]; // x, height above the deck, width
const DECK = -58;

// The hull in the ship's own frame: stern castle on the left, forecastle and bowsprit on the right.
function hull(g, lit) {
  g.beginPath();
  g.moveTo(-142, 14);
  g.lineTo(-150, -50);
  g.lineTo(-146, -90);
  g.lineTo(-98, -92);
  g.lineTo(-94, DECK);
  g.lineTo(62, DECK + 2);
  g.lineTo(96, -76);
  g.lineTo(152, -80);
  g.quadraticCurveTo(182, -54, 172, -22);
  g.lineTo(150, 14);
  g.closePath();
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, 0, -92, 0, 14, [[0, rgba('#9fd8f0', 0.36)], [0.45, rgba('#9fd8f0', 0.06)], [1, rgba(SHADE, 0.4)]]);
  g.fillRect(-160, -100, 340, 120);
  g.strokeStyle = rgba('#cfeaff', 0.24); // planking
  g.lineWidth = 1;
  g.beginPath();
  for (let y = -84; y < 12; y += 7) {
    g.moveTo(-160, y);
    g.lineTo(180, y);
  }
  g.stroke();
  for (let x = -120; x < 130; x += 22) { // gun ports, dark, two of them lit when there is a lantern
    g.fillStyle = rgba(SHADE, 0.7);
    g.fillRect(x, -32, 9, 7);
    if (lit && (x === -76 || x === -10)) {
      g.fillStyle = rgba('#ffc060', 0.85);
      g.fillRect(x + 1, -31, 7, 5);
    }
  }
  if (lit) for (const x of [-138, -126, -114]) { // the stern windows
    g.fillStyle = rgba('#ffd890', 0.9);
    g.fillRect(x, -74, 7, 9);
  }
  g.restore();
  g.beginPath(); // the bowsprit, a spar thrust out ahead
  g.moveTo(150, -76);
  g.lineTo(232, -108);
  g.lineTo(234, -104);
  g.lineTo(154, -68);
  g.fill();
}

// Sails and spars: the main course frozen stiff and tattered, topsails furled to their yards, a lateen on the mizzen.
function sails(g) {
  const [[mx0], [mx1, mh1], [mx2, mh2]] = MASTS;
  g.beginPath(); // the main course, bellied and torn along its foot
  g.moveTo(mx1 - 56, DECK - 150);
  g.lineTo(mx1 + 56, DECK - 150);
  g.quadraticCurveTo(mx1 + 72, DECK - 100, mx1 + 62, DECK - 66);
  for (let i = 0; i < 8; i++) g.lineTo(mx1 + 62 - i * 17, DECK - 66 + (i % 2 ? -8 : 5));
  g.quadraticCurveTo(mx1 - 70, DECK - 100, mx1 - 56, DECK - 150);
  g.fill();
  g.beginPath(); // the foresail, half set
  g.moveTo(mx2 - 38, DECK - 120);
  g.lineTo(mx2 + 38, DECK - 120);
  g.quadraticCurveTo(mx2 + 46, DECK - 96, mx2 + 30, DECK - 72);
  g.lineTo(mx2 - 34, DECK - 82);
  g.quadraticCurveTo(mx2 - 44, DECK - 100, mx2 - 38, DECK - 120);
  g.fill();
  g.beginPath(); // the mizzen's lateen
  g.moveTo(mx0 + 4, DECK - 160);
  g.lineTo(mx0 - 100, DECK - 40);
  g.lineTo(mx0 + 8, DECK - 56);
  g.closePath();
  g.fill();
  g.lineCap = 'round';
  g.strokeStyle = g.fillStyle;
  for (const [mx, mh, yards] of [[mx0, 168, [[-0.55, 70]]], [mx1, mh1, [[-0.4, 112], [-0.66, 92], [-0.9, 64]]], [mx2, mh2, [[-0.52, 78], [-0.82, 52]]]]) {
    for (const [f, len] of yards) { // yards, with the furled sail lying along them
      const y = DECK + mh * f;
      g.lineWidth = 3.4;
      g.beginPath();
      g.moveTo(mx - len / 2, y);
      g.lineTo(mx + len / 2, y);
      g.stroke();
      g.lineWidth = 8;
      g.beginPath();
      g.moveTo(mx - len / 2 + 4, y + 5);
      g.lineTo(mx + len / 2 - 4, y + 5);
      g.stroke();
    }
  }
}

// The world position of a point in the ship's frame, for the icicles and lights, which hang straight.
export function ship(g, out, rng, L, x, wl, s, tilt, lantern) {
  const [c, sn] = [Math.cos(tilt), Math.sin(tilt)];
  const at = (lx, ly) => [x + s * (c * lx - sn * ly), wl + s * (sn * lx + c * ly)];
  g.save();
  g.translate(x, wl);
  g.rotate(tilt);
  g.scale(s, s);
  g.lineJoin = 'round';
  g.fillStyle = shade(L.color, 0.1);
  hull(g, lantern);
  for (const [mx, mh, w] of MASTS) g.fillRect(mx - w / 2, DECK - mh, w, mh + 4);
  g.fillRect(-78, -108, 14, 5); // the tops
  for (const [mx, mh] of MASTS) g.fillRect(mx - 8, DECK - mh * 0.62, 16, 5);
  g.beginPath(); // the pennant, frozen stiff
  g.moveTo(MASTS[1][0], DECK - 232);
  g.lineTo(MASTS[1][0] + 34, DECK - 226);
  g.lineTo(MASTS[1][0] + 28, DECK - 220);
  g.lineTo(MASTS[1][0] + 38, DECK - 214);
  g.lineTo(MASTS[1][0], DECK - 214);
  g.fill();
  sails(g);
  g.lineWidth = 1.2; // rigging: shrouds down to the rails, stays between the mastheads and out to the bowsprit
  g.strokeStyle = g.fillStyle;
  g.beginPath();
  for (const [mx, mh] of MASTS) {
    g.moveTo(mx, DECK - mh * 0.7);
    g.lineTo(mx - 34, DECK + 2);
    g.moveTo(mx, DECK - mh * 0.7);
    g.lineTo(mx + 34, DECK + 2);
  }
  g.moveTo(-72, DECK - 168);
  g.lineTo(0, DECK - 232);
  g.lineTo(78, DECK - 190);
  g.lineTo(226, -106);
  g.moveTo(0, DECK - 232);
  g.lineTo(-146, -88);
  g.stroke();
  g.strokeStyle = rgba(SNOW, 0.5); // frost on the yards and the rails
  g.lineWidth = 1.4;
  g.beginPath();
  for (const [mx, mh, , ys] of [[-72, 168, 0, [-0.55]], [0, 232, 0, [-0.4, -0.66, -0.9]], [78, 190, 0, [-0.52, -0.82]]]) {
    for (const f of ys) {
      g.moveTo(mx - 38, DECK + mh * f - 1);
      g.lineTo(mx + 38, DECK + mh * f - 1);
    }
  }
  g.moveTo(-146, -92);
  g.lineTo(-98, -94);
  g.moveTo(96, -80);
  g.lineTo(152, -82);
  g.stroke();
  g.restore();
  g.fillStyle = L.color;
  for (const [mx, mh, f, len] of [[0, 232, -0.4, 112], [0, 232, -0.66, 92], [78, 190, -0.52, 78], [-72, 168, -0.55, 70]]) { // icicles hang from the yards, straight down
    const [ax, ay] = at(mx - len / 2, DECK + mh * f + 8);
    const [bx, by] = at(mx + len / 2, DECK + mh * f + 8);
    icicles(g, rng, ax, bx, (px) => ay + ((px - ax) / (bx - ax || 1)) * (by - ay), 7 * s, 5, 26 * s, 0.55);
  }
  const [sx0, sy0] = at(-148, -52);
  const [sx1] = at(-96, -52);
  icicles(g, rng, sx0, sx1, () => sy0, 8, 8, 34 * s, 0.5);
  g.fillStyle = L.color;
  if (lantern) { // a lantern on a davit over the stern, burning
    const [lx, ly] = at(-160, -74);
    g.fillRect(lx - 1, ly - 14, 2, 14);
    g.fillRect(lx - 3.5, ly, 7, 10);
    out.lights.push({ x: lx, y: ly + 5, r: 38, color: L.lamp, mode: 'flicker', ph: rng(), a: 0.95 });
    out.lights.push({ x: lx, y: ly + 5, r: 120, color: L.lamp, mode: 'flicker', ph: rng(), a: 0.2 });
    const [wx, wy] = at(-126, -70);
    out.lights.push({ x: wx, y: wy, r: 30, color: L.lamp, mode: 'pulse', ph: rng(), a: 0.4 });
  }
}
