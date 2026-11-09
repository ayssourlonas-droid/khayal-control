// Yazd at night, the parallax layer kind 'yazd' (parallax-shapes.js has the painter contract), painted
// in PIXEL-sized blocks (kit.js): the old city of flat mud-brick roofs seen across its whole width in
// three rows, far, middle and near, each lower, warmer and better lit than the one behind it, with
// windcatchers and low domes on their roofs, lit doors, lanterns and windows (layer lights that
// pulse); in the middle Dowlat Abad's octagonal windcatcher over its garden pool, the tallest
// thing there, and behind and to one side the Jameh Mosque's portal and twin minarets. The layer
// brings L.lit, L.ink, L.glow, L.lamp, L.brick, L.pool, L.tree and L.tile. Rows are counted from F,
// the street.
import { PIXEL, rgba, lin } from '../sprites.js';
import { scene } from './kit.js';
import { tones, hazeOf } from './yazd-brick.js';
import { layout, paintRow } from './yazd-house.js';
import { dowlat } from './yazd-dowlat.js';
import { jameh } from './yazd-jameh.js';

const UNDER = 16; // blocks from the street down to the band's foot; the ground hides the lowest 14
const MOSQUE = 86; // the mosque's distance from the middle
const MIST = [0.55, 0.4]; // how thick the haze lies on the street over the far row, and over the middle one
// Each row of houses: widths, roof heights above the street, gaps between, the chance of a
// windcatcher (and how tall it stands) and of a dome.
const ROWS = [
  { w: [9, 18], high: [34, 46], gap: [0, 1], wind: 0.6, tall: [16, 28], dome: 0.1 },
  { w: [10, 20], high: [24, 33], gap: [0, 2], wind: 0.6, tall: [13, 22], dome: 0.3 },
  { w: [11, 20], high: [13, 22], gap: [1, 3], wind: 0.5, tall: [11, 17], dome: 0.3 },
];

export function yazd(g, w, h, rng, L, lights) {
  const art = scene(g, w, h, rng, L, lights, tones(L), UNDER);
  art.mosque = art.mid + MOSQUE;
  g.save();
  g.scale(PIXEL, PIXEL);
  art.box(0, art.F, art.BW, UNDER, '-');
  const rows = ROWS.map((cfg, d) => layout(art, d, cfg));
  paintRow(art, 0, rows[0]);
  mist(g, art, MIST[0]);
  jameh(art, art.mosque);
  paintRow(art, 1, rows[1]);
  mist(g, art, MIST[1]);
  dowlat(art);
  paintRow(art, 2, rows[2]);
  g.restore();
}

// What is painted so far fades toward the haze, most at the street, so each row stands out of the
// mist in front of the one behind it.
function mist(g, { F, BW, L }, a) {
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lin(g, 0, F - 46, 0, F + 2, [[0, rgba(hazeOf(L), 0)], [1, rgba(hazeOf(L), a)]]);
  g.fillRect(0, 0, BW, F + 2);
  g.globalCompositeOperation = 'source-over';
}
