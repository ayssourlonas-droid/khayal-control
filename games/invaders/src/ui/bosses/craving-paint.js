// The Craving's smoke figure, painted (World 17, Ash to Air; craving-frames.js caches it, craving-hull.js draws one frame of it):
// paintBody(g, pose, layer) lays the figure (craving-figure.js) on a clean context whose origin is the boss's centre, lights it as a
// whole with 'source-atop' passes (they touch only smoke), and cuts it away above the bowl's mouth, dissolving into it, since it lies
// BEHIND the ashtray's rim; then the SPILL (craving-spill.js), the smoke pouring over the rim, which lies in front of it and fades
// down the wall; last the edges of the box thin out. Layers: 'body' (the figure alone: the hull's frozen frame) and 'all' (a live
// frame with the spill, drawn over the hull). FB is the box of the painting (boss-local), to y 140.
import { lin, rad, rgba } from '../sprites.js';
import { PAL } from './craving-kit.js';
import { figure, FB } from './craving-figure.js';
import { mouthFront } from './craving-throne-geo.js';
import { spill, fadeSpill } from './craving-spill.js';

export { FB };
const CUT = 34; // px the smoke takes to dissolve above the mouth's edge
const SIDE = 26; // and to thin out at the sides of the box

// The light, in the box's own coordinates (the caller has translated the origin to the boss's centre): the middle of the head and
// the chest a little darker (the face is lit from the eyes and the maw, which the game's halos add on top of this), and the embers
// of the ashtray warming the lower body.
function light(g) {
  g.save();
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = rad(g, 0, -30, 0, 240, [[0, rgba(PAL.soot, 0.3)], [0.55, rgba(PAL.soot, 0.14)], [1, rgba(PAL.soot, 0)]], 0, -10);
  g.fillRect(FB.x, FB.y, FB.w, FB.h);
  g.fillStyle = lin(g, 0, 70, 0, -20, [[0, rgba(PAL.ember, 0.2)], [0.6, rgba(PAL.coal, 0.06)], [1, rgba(PAL.coal, 0)]]);
  g.fillRect(FB.x, -20, FB.w, 90);
  g.restore();
}

// The smoke is cut away above the bowl's mouth (in the box's own coordinates), dissolving over CUT px: it lies behind the rim.
export function cutMouth(g) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  for (let x = FB.x; x < FB.x + FB.w; x += 8) {
    const y = mouthFront(Math.max(-303, Math.min(303, x + 4)));
    g.fillStyle = lin(g, 0, y - CUT, 0, y - 3, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,1)']]);
    g.fillRect(x, y - CUT, 8, FB.y + FB.h - y + CUT);
  }
  g.restore();
}

// Thin out at the sides of the box and at its top: never a hard edge.
export function edges(g) {
  g.save();
  g.globalCompositeOperation = 'destination-out';
  for (const [x0, x1, x2] of [[FB.x, FB.x + SIDE, FB.x], [FB.x + FB.w, FB.x + FB.w - SIDE, FB.x + FB.w - SIDE]]) {
    g.fillStyle = lin(g, x0, 0, x1, 0, [[0, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,0)']]);
    g.fillRect(x2, FB.y, SIDE, FB.h);
  }
  g.fillStyle = lin(g, 0, FB.y, 0, FB.y + 16, [[0, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,0)']]);
  g.fillRect(FB.x, FB.y, FB.w, 16);
  g.restore();
}

// layer: 'body' (the figure alone, behind the rim: the hull's frozen frame) or 'all' (a live frame, with the spill over the rim).
export function paintBody(g, pose, layer = 'all') {
  g.save();
  g.translate(-FB.x, -FB.y);
  figure(g, pose);
  light(g);
  cutMouth(g);
  if (layer !== 'body') {
    spill(g, pose);
    fadeSpill(g, FB.y + FB.h);
  }
  edges(g);
  g.restore();
}
