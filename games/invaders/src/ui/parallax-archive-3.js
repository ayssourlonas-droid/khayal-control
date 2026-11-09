// The near layer of Starlit Archive: the gallery the ship flies along, seen from its floor of dark marble,
// the balustrade at the far edge of it with the whole library beyond. Turned balusters under a heavy rail,
// pedestals every so often carrying a brazier or a book on a lectern, candelabra and candles guttering on
// the rail (lights that flicker), books lying open, an inkwell with its quill; and on the floor pools of ink,
// black and glossy, holding the stars. The pools and the open books leave signs for the flourishes that
// twinkle in them and turn their pages (flourish-7.js). L.flame is the candle flames' colour. See
// parallax-shapes.js for the painter contract.
import { rgba, shade, lin, rad } from './sprites.js';
import { TAU } from '../core/math.js';
import { LILAC, NIGHT, poly } from './parallax-archive-kit.js';
import { candelabra, candle, brazier, openBook, inkwell } from './parallax-archive-candles.js';

const RAIL = 140; // the top of the rail, in layer px
const FOOT = 252; // where the balusters stand on the floor
const PROFILE = [[0, 8], [0.05, 8], [0.09, 5.5], [0.2, 5], [0.3, 9], [0.45, 12], [0.58, 9.5], [0.68, 5], [0.8, 5.5], [0.9, 8], [1, 8]]; // [how far down, half width]

// One baluster: a vase of marble, lit on its right.
function baluster(g, x, y0, y1, color) {
  const at = (s) => PROFILE.map(([t, hw]) => [x + s * hw, y0 + (y1 - y0) * t]);
  poly(g, [...at(1), ...at(-1).toReversed()]);
  g.fillStyle = color;
  g.fill();
  g.fillStyle = lin(g, x - 12, 0, x + 12, 0, [[0, rgba(NIGHT, 0.5)], [0.55, rgba(NIGHT, 0)], [1, rgba(LILAC, 0.3)]]);
  g.fill();
  g.beginPath();
  for (const [px, py] of at(1)) g.lineTo(px - 0.6, py);
  g.strokeStyle = rgba('#f2dca0', 0.34);
  g.lineWidth = 1.2;
  g.stroke();
}

// The floor: marble in tiles running back to a vanishing point, veined, dark toward the viewer.
function floor(g, w, h, rng, L) {
  g.fillStyle = lin(g, 0, FOOT - 10, 0, h, [[0, shade(L.color, 0.16)], [0.35, shade(L.color, 0.07)], [1, L.color]]);
  g.fillRect(0, FOOT - 10, w, h);
  g.save();
  g.beginPath();
  g.rect(0, FOOT - 10, w, h);
  g.clip();
  g.strokeStyle = rgba(LILAC, 0.09);
  g.lineWidth = 1;
  g.beginPath();
  for (let x = -w; x < w * 2; x += 150) {
    g.moveTo(w / 2 + (x - w / 2) * 0.12, FOOT - 10);
    g.lineTo(x, h);
  }
  for (const k of [0.1, 0.28, 0.56, 1]) {
    g.moveTo(0, FOOT - 10 + (h - FOOT + 10) * k);
    g.lineTo(w, FOOT - 10 + (h - FOOT + 10) * k);
  }
  g.stroke();
  for (let i = 0; i < 40; i++) { // veins in the marble
    let [x, y] = [rng() * w, FOOT + rng() * (h - FOOT)];
    g.beginPath();
    g.moveTo(x, y);
    for (let j = 0; j < 4; j++) g.quadraticCurveTo(x + (rng() - 0.5) * 60, y + (rng() - 0.5) * 12, (x += 30 + rng() * 30), (y += (rng() - 0.5) * 8));
    g.strokeStyle = rgba('#d8ccff', 0.05 + rng() * 0.05);
    g.lineWidth = 1 + rng() * 1.4;
    g.stroke();
  }
  g.restore();
}

// A pool of ink on the floor: black and glossy, a sheen across it, the sky's stars in it and a smear of
// galaxy; a lit lip on its far edge.
function pool(g, out, rng, x, y, rx, ry) {
  g.save();
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, TAU);
  g.fillStyle = '#010108';
  g.fill();
  g.clip();
  g.fillStyle = lin(g, x - rx, y - ry, x + rx * 0.4, y + ry, [[0, rgba(LILAC, 0.34)], [0.5, rgba(LILAC, 0.06)], [1, rgba('#4af0d8', 0.1)]]);
  g.fillRect(x - rx, y - ry, rx * 2, ry * 2);
  g.fillStyle = rad(g, x + rx * 0.3, y, 0, rx * 0.5, [[0, rgba('#ffd8a0', 0.3)], [1, rgba('#ffd8a0', 0)]]);
  g.fillRect(x - rx, y - ry, rx * 2, ry * 2);
  for (let i = 0; i < Math.round(rx / 5); i++) {
    g.fillStyle = rgba(i % 3 ? '#fff4d6' : '#cfd8ff', 0.4 + rng() * 0.5);
    const s = rng() > 0.85 ? 2.2 : 1.2;
    g.fillRect(x + (rng() * 2 - 1) * rx * 0.85, y + (rng() * 2 - 1) * ry * 0.8, s, s);
  }
  g.restore();
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, Math.PI * 1.04, Math.PI * 1.96);
  g.strokeStyle = rgba('#f2dca0', 0.34);
  g.lineWidth = 1.4;
  g.stroke();
  out.signs.push({ ink: true, x, y, rx, ry });
}

// The balustrade: a plinth, the balusters between, the heavy rail on top with a lit moulding.
function balustrade(g, w, L) {
  g.fillStyle = L.color;
  g.fillRect(0, FOOT - 14, w, 14);
  for (let x = 14; x < w; x += 34) baluster(g, x, RAIL + 16, FOOT - 14, L.color);
  g.fillStyle = L.color;
  g.fillRect(0, RAIL, w, 16);
  g.fillRect(0, RAIL + 16, w, 4);
  g.fillStyle = rgba('#f2dca0', 0.3);
  g.fillRect(0, RAIL + 1, w, 1.4);
  g.fillStyle = rgba(NIGHT, 0.5);
  g.fillRect(0, RAIL + 13, w, 3);
}

// A pedestal on the balustrade: a square shaft with a capital and a plinth; on top a brazier or a lectern.
function pedestal(g, out, rng, L, x, i) {
  g.fillStyle = L.color;
  g.fillRect(x - 28, RAIL - 20, 56, FOOT - RAIL + 20);
  g.fillRect(x - 36, RAIL - 30, 72, 10);
  g.fillRect(x - 36, FOOT - 22, 72, 22);
  g.fillStyle = lin(g, x - 36, 0, x + 36, 0, [[0, rgba(NIGHT, 0.55)], [0.6, rgba(NIGHT, 0)], [1, rgba(LILAC, 0.3)]]);
  g.fillRect(x - 36, RAIL - 30, 72, FOOT - RAIL + 30);
  g.strokeStyle = rgba('#d8ccff', 0.1);
  g.lineWidth = 1;
  g.strokeRect(x - 20.5, RAIL - 6.5, 41, 84);
  g.fillStyle = rgba('#f2dca0', 0.34);
  g.fillRect(x - 36, RAIL - 30, 72, 1.4);
  if (i % 3 === 0) brazier(g, out, rng, L, x, RAIL - 30);
  else { // a lectern: a book open on a slanted rest
    g.fillStyle = L.color;
    poly(g, [[x - 20, RAIL - 30], [x + 20, RAIL - 30], [x + 14, RAIL - 46], [x - 14, RAIL - 46]]);
    g.fill();
    openBook(g, out, x, RAIL - 44, 38, true);
  }
}

function gallery(g, w, h, rng, L, out) {
  floor(g, w, h, rng, L);
  for (let x = 90; x < w; x += 120 + rng() * 140) pool(g, out, rng, x, FOOT + 22 + rng() * 36, 56 + rng() * 96, 8 + rng() * 10);
  balustrade(g, w, L);
  const peds = [];
  for (let x = 210; x < w; x += 430) peds.push(x);
  peds.forEach((x, i) => pedestal(g, out, rng, L, x, i));
  g.globalCompositeOperation = 'source-atop'; // the stone of the rail warmed by the flames that will stand on it
  for (const x of peds.flatMap((px) => [px + 110, px + 255])) {
    g.fillStyle = rad(g, x, RAIL - 20, 0, 90, [[0, rgba(L.flame, 0.34)], [1, rgba(L.flame, 0)]]);
    g.fillRect(x - 90, RAIL - 60, 180, 190);
  }
  g.globalCompositeOperation = 'source-over';
  g.save(); // and the floor shining with them: a streak of each flame laid down the polished marble
  g.beginPath();
  g.rect(0, FOOT, w, h);
  g.clip();
  g.globalCompositeOperation = 'lighter';
  for (const x of peds.flatMap((px) => [px + 110, px + 255])) {
    g.save();
    g.translate(x, FOOT + 30);
    g.scale(1, 0.34);
    g.fillStyle = rad(g, 0, 0, 0, 80, [[0, rgba(L.flame, 0.2)], [1, rgba(L.flame, 0)]]);
    g.fillRect(-80, -80, 160, 160);
    g.restore();
  }
  g.restore();
  peds.forEach((x, i) => {
    const mid = x + 215;
    candelabra(g, out, rng, L, x + 110, RAIL, 3 + (i % 3), 44 + (i % 2) * 14);
    openBook(g, out, mid - 40, RAIL + 1, 84, i % 2 === 0);
    candle(g, out, rng, L, mid + 36, RAIL, 20 + rng() * 14);
    candle(g, out, rng, L, mid + 50, RAIL, 12 + rng() * 10, 1, true);
    candle(g, out, rng, L, mid + 64, RAIL, 26 + rng() * 10);
    if (i % 2) inkwell(g, mid + 96, RAIL);
  });
}

export const GALLERY = { gallery };
