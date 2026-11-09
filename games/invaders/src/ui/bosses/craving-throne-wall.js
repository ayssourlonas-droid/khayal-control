// The belly and foot of the Craving's throne (World 17, Ash to Air; geometry craving-throne-geo.js, assembled by craving-hull.js): the
// ashtray's round bowl, glazed ceramic gone grey and sooty (a lighter, glossier stuff than the smoke above it, so it separates from
// it). The belly is mid grey-brown under the lip, stained with nicotine yellow, blackened toward the bottom; dark where it turns away
// at both ends, a cold sheen on its upper left and a long glossy streak of reflected sky following the curve of the bowl, a thin rim
// light down its right edge, soot dripping from the lip, pitted grain, chips, and a long crack that glows. The ember bed of the tray
// warms the middle of it (lights). The foot is a short dark ring under the round bottom. Boss coordinates. Bake-time only.
import { crack, crackPts, grain, heat, line, lin, path, rad, rgba, ribbon, rng, streaks, ellipse, SOOT, IRON, ASH, COAL, RUST } from './craving-pkit.js';
import { wallPath, footPath, lipBottom, footBottom, profile } from './craving-throne-geo.js';

// The long crack down the belly and its branch (shared with the rage layers, which make it blaze).
export const wallCrack = () => crackPts(rng(73), -180, lipBottom(-180) - 2, 1.57, 7, 10);
export const wallCrack2 = () => crackPts(rng(74), -162, 100, 1.25, 3, 9);

function chips(b, r, n) { // pale gouges where the glaze has been knocked off
  for (let i = 0; i < n; i++) {
    const x = (r() - 0.5) * 470;
    const y = lipBottom(x) + 3 + r() * 14;
    ellipse(b, x, y, 2.5 + r() * 4, 1.2 + r() * 1.8, (r() - 0.5) * 0.6);
    b.fillStyle = rgba(ASH[4], 0.55);
    b.fill();
    path(b, [[x - 3, y + 1.6], [x + 4, y + 1.6]], true);
    line(b, rgba(SOOT, 0.6), 1);
  }
}

function gloss(b) { // reflected sky: a long soft streak down the upper left, a thin rim light down the right edge
  const rb = ribbon(b, [[-208, 70], [-184, 92], [-162, 114], [-140, 134]], 20, 6, 18, 0.9);
  b.fillStyle = lin(b, -208, 70, -140, 134, [[0, 'rgba(255,248,236,0)'], [0.3, 'rgba(255,248,236,0.2)'], [0.7, 'rgba(255,248,236,0.1)'], [1, 'rgba(255,248,236,0)']]);
  b.fill();
  path(b, rb.left.slice(3, 15), true);
  line(b, 'rgba(255,250,240,0.22)', 1.4);
  const edge = [];
  for (let y = 62; y <= 144; y += 6) edge.push([profile(y) - 5, y]);
  path(b, edge, true);
  line(b, 'rgba(190,200,220,0.22)', 3);
  path(b, edge, true);
  line(b, 'rgba(235,240,250,0.3)', 1.2);
}

export function wall(b, l) {
  const r = rng(71);
  wallPath(b);
  b.fillStyle = lin(b, 0, 56, 0, 164, [[0, '#8a7e72'], [0.28, '#62584f'], [0.65, '#40392f'], [1, '#1e1a16']]);
  b.fill();
  b.save();
  wallPath(b);
  b.clip();
  b.fillStyle = lin(b, -282, 0, 282, 0, [[0, 'rgba(0,0,0,0.62)'], [0.14, 'rgba(0,0,0,0.2)'], [0.3, 'rgba(255,248,236,0.1)'], [0.5, 'rgba(0,0,0,0)'], [0.82, 'rgba(0,0,0,0.28)'], [1, 'rgba(0,0,0,0.62)']]);
  b.fillRect(-282, 52, 564, 114); // it turns away at both ends
  b.fillStyle = lin(b, 0, 62, 0, 100, [[0, 'rgba(190,140,60,0.22)'], [1, 'rgba(190,140,60,0)']]); // nicotine stain under the lip
  b.fillRect(-282, 52, 564, 46);
  b.fillStyle = lin(b, 0, 110, 0, 168, [[0, 'rgba(8,5,4,0)'], [1, 'rgba(8,5,4,0.7)']]); // soot gathers at the bottom
  b.fillRect(-282, 108, 564, 58);
  b.fillStyle = rad(b, 0, 112, 10, 170, [[0, rgba(COAL[2], 0.3)], [0.5, rgba(COAL[1], 0.14)], [1, rgba(COAL[1], 0)]]);
  b.fillRect(-200, 60, 400, 110); // the ember bed warms the glaze under it
  grain(b, -282, 52, 564, 114, 1);
  streaks(b, r, -270, 270, lipBottom(0) - 30, 160, 46, SOOT, 0.4, 0.95);
  streaks(b, r, -270, 270, 58, 150, 10, RUST, 0.24, 0.8);
  for (let i = 0; i < 5; i++) { // soft smudges of soot
    ellipse(b, (r() - 0.5) * 440, 96 + r() * 56, 26 + r() * 30, 8 + r() * 10, 0);
    b.fillStyle = rgba(SOOT, 0.12 + r() * 0.12);
    b.fill();
  }
  gloss(b);
  b.restore();
  wallPath(b);
  line(b, rgba(SOOT, 0.9), 2.4);
  b.save();
  wallPath(b);
  b.clip();
  crack(b, l, wallCrack(), 2.4, COAL[2], 0.55);
  crack(b, l, wallCrack2(), 1.5, COAL[2], 0.4);
  chips(b, r, 12);
  b.restore();
  heat(l, 0, 112, 118, COAL[1], 0.14);
}

export function foot(b) { // the short dark ring the bowl stands on, a lit top edge, soot, a rim of cold light along its lower edge
  const r = rng(72);
  footPath(b);
  b.fillStyle = lin(b, 0, 146, 0, 169, [[0, IRON[3]], [0.5, IRON[2]], [1, IRON[0]]]);
  b.fill();
  b.save();
  footPath(b);
  b.clip();
  b.fillStyle = lin(b, -104, 0, 104, 0, [[0, 'rgba(0,0,0,0.6)'], [0.3, 'rgba(0,0,0,0)'], [0.7, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.6)']]);
  b.fillRect(-104, 144, 208, 25);
  grain(b, -104, 144, 208, 25, 1.2);
  streaks(b, r, -96, 96, 148, 168, 14, SOOT, 0.4, 0.8);
  b.restore();
  const bottom = [];
  for (let x = -96; x <= 96; x += 8) bottom.push([x, footBottom(x) - 1]);
  path(b, bottom, true);
  line(b, rgba(ASH[3], 0.4), 1.4);
  footPath(b);
  line(b, SOOT, 2.4);
}
