// The mid layer of Aurora Kingdom: a wall of ice cliffs, shelf above shelf, scored by blue crevasses
// and fringed with icicles, its lips lit pale green by the aurora (lights that follow it); and in front
// of it the frozen fleet, four tall ships the ice took, heeled over in the sheet, a lantern still burning
// on two. L.lamp is the lanterns' colour. See parallax-shapes.js for the painter contract.
import { rgba, lin, soft } from './sprites.js';
import { profile, waves } from './parallax-kit.js';
import { icicles, LIT, SHADE, SNOW } from './parallax-ice-kit.js';
import { ship } from './parallax-ice-ship.js';

const GREEN = '#9affd0';
const SHEET = 0.535; // where the sheet's surface lies, as a share of the layer's height
const FLEET = [[380, 1, -0.12, false], [920, 0.82, 0.09, true], [1480, 1.14, -0.06, false], [2010, 0.9, 0.14, true]]; // x, scale, heel, lantern

// The cliff wall: shelves of ice with risers between them, [x0, x1, y] each.
function shelves(rng, w, h) {
  const out = [];
  let y = h * 0.32;
  for (let x = -20; x < w + 20; ) {
    const len = 70 + rng() * 150;
    y = Math.max(h * 0.18, Math.min(h * 0.42, y + (rng() - 0.5) * h * 0.12));
    out.push([x, x + len, y]);
    x += len;
  }
  return out;
}

function cliffs(g, rng, out, w, h) {
  const list = shelves(rng, w, h);
  g.beginPath();
  g.moveTo(-20, h);
  list.forEach(([x0, x1, y], i) => {
    g.lineTo(x0 + (i % 2 ? 5 : -4), y);
    g.lineTo(x1 - 3, y - 2);
  });
  g.lineTo(w + 20, h);
  g.closePath();
  g.fill();
  const top = (x) => (list.find(([x0, x1]) => x >= x0 && x < x1) ?? list[0])[2];
  g.save();
  g.clip();
  for (let x = -10; x < w; ) { // columns of ice, lit on some faces and shaded on others
    const cw = 14 + rng() * 26;
    g.fillStyle = rng() < 0.5 ? rgba(LIT, 0.05 + rng() * 0.16) : rgba(SHADE, 0.12 + rng() * 0.22);
    g.fillRect(x, top(x) - 4, cw, h);
    x += cw;
  }
  g.fillStyle = lin(g, 0, h * 0.2, 0, h * 0.56, [[0, rgba(LIT, 0.22)], [1, rgba(SHADE, 0.3)]]);
  g.fillRect(0, h * 0.2, w, h);
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (let i = 0; i < 34; i++) { // crevasses: a blue crack with the aurora on its lip
    let x = rng() * w;
    let y = top(x) + 3;
    const pts = [[x, y]];
    for (let k = 0; k < 5; k++) pts.push([(x += (rng() - 0.5) * 18), (y += 16 + rng() * 30)]);
    for (const [lw, c, dx] of [[7, rgba('#1e6ac8', 0.3), 0], [3.4, rgba('#031a3a', 0.85), 0], [1.1, rgba(GREEN, 0.35), 2.4]]) {
      g.beginPath();
      pts.forEach(([px, py], j) => (j ? g.lineTo(px + dx, py) : g.moveTo(px + dx, py)));
      g.strokeStyle = c;
      g.lineWidth = lw;
      g.stroke();
    }
  }
  g.restore();
  for (const [x0, x1, y] of list) {
    g.fillStyle = rgba(SNOW, 0.7); // snow along each shelf, the aurora's green on its lip
    g.fillRect(x0 + 4, y - 3, x1 - x0 - 6, 4);
    icicles(g, rng, x0 + 6, x1 - 4, () => y, 11, 8, 46);
    if (rng() < 0.45) out.lights.push({ x: (x0 + x1) / 2, y: y - 2, r: 30 + rng() * 26, color: GREEN, mode: 'aurora', ph: rng(), a: 0.55 });
  }
}

// The sheet the fleet is locked in: snow-covered hummocks along its lip, a pale lip, a blue face
// streaked with frost and scored by cracks.
function sheet(g, rng, w, h) {
  const f = waves(rng, 3, 0.011);
  const y0 = h * SHEET;
  const top = (x) => y0 + 5 * f(x);
  profile(g, w, h, top, 3);
  for (let i = 0; i < 46; i++) {
    const x = rng() * w;
    const [bw, bh] = [40 + rng() * 90, 6 + rng() * 18];
    g.beginPath();
    g.moveTo(x, top(x) + 3);
    g.quadraticCurveTo(x + bw / 2, top(x + bw / 2) - bh * 1.7, x + bw, top(x + bw) + 3);
    g.fill();
  }
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lin(g, 0, y0 - 24, 0, y0 + 8, [[0, rgba(SNOW, 0)], [1, rgba(SNOW, 0.6)]]); // snow lying on top
  g.fillRect(0, y0 - 24, w, 32);
  g.fillStyle = lin(g, 0, y0 + 2, 0, y0 + 70, [[0, rgba('#5aa8e0', 0.36)], [1, rgba(SHADE, 0.55)]]); // the face
  g.fillRect(0, y0 + 2, w, h);
  g.lineCap = 'round';
  for (let i = 0; i < 150; i++) {
    const x = rng() * w;
    g.strokeStyle = i % 4 ? rgba('#cfeaff', 0.14 + rng() * 0.1) : rgba(SHADE, 0.5);
    g.lineWidth = 1 + rng() * 2;
    g.beginPath();
    g.moveTo(x, top(x) + 6);
    g.lineTo(x + (rng() - 0.5) * 8, top(x) + 12 + rng() * 40);
    g.stroke();
  }
  g.globalCompositeOperation = 'source-over';
  icicles(g, rng, 0, w, top, 13, 6, 26, 0.5);
}

// Blocks of ice piled against a hull where the sheet closed round it: tilted slabs, lit on one face,
// snow on top.
function piled(g, rng, L, x, wl, s) {
  for (let i = 0; i < 6; i++) {
    const bx = x + s * (-170 + rng() * 300);
    const [bw, bh] = [20 + rng() * rng() * 60, (8 + rng() * rng() * 46) * s];
    const lean = (rng() - 0.5) * 22;
    g.beginPath();
    g.moveTo(bx, wl + 5);
    g.lineTo(bx + bw * 0.15 + lean, wl - bh);
    g.lineTo(bx + bw * 0.75 + lean, wl - bh * 0.8);
    g.lineTo(bx + bw, wl + 5);
    g.fillStyle = L.color;
    g.fill();
    g.beginPath();
    g.moveTo(bx, wl + 5);
    g.lineTo(bx + bw * 0.15 + lean, wl - bh);
    g.lineTo(bx + bw * 0.45, wl + 3);
    g.fillStyle = rgba(LIT, 0.4);
    g.fill();
    g.beginPath();
    g.moveTo(bx + bw * 0.15 + lean, wl - bh);
    g.lineTo(bx + bw * 0.75 + lean, wl - bh * 0.8);
    g.lineTo(bx + bw * 0.66 + lean, wl - bh * 0.55);
    g.lineTo(bx + bw * 0.2 + lean, wl - bh * 0.5);
    g.fillStyle = rgba(SNOW, 0.75);
    g.fill();
  }
}

function icefleet(g, w, h, rng, L, out) {
  g.fillStyle = L.color;
  cliffs(g, rng, out, w, h);
  g.fillStyle = L.color;
  const wl = h * SHEET;
  for (const [x, s, heel, lantern] of FLEET) {
    const hh = Math.min(300 * s, wl * 1.1);
    g.globalAlpha = 0.2; // a haze of aurora-lit ice behind each hull, so the dark spars stand out
    g.drawImage(soft('#7ac8f0'), x - 250 * s, wl - hh * 0.8, 500 * s, hh);
    g.globalAlpha = 1;
    ship(g, out, rng, L, x, wl + 2, s, heel, lantern);
  }
  sheet(g, rng, w, h);
  for (const [x, s] of FLEET) piled(g, rng, L, x, wl + 2, s);
  g.fillStyle = L.color;
}

export const ICE2 = { icefleet };
