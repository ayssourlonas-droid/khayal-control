// The light of The Squall Ray's cloud (World 18, Anvil Sky; ray-hull.js lays it on the hull's layers): the ray is a cloud lit from within and cut out of the
// sky, so what is dark in the body is lit here, and what is round it is darkened. SHADOW: a blurred copy of the cloud, near-black indigo, laid on the BODY layer
// under the cloud, so that the sky round the ray is darker than the sky further off (the slate thunderheads behind it are as dark as the ray's own cloud, and
// without it the ray melts into them). HALO: a blurred copy of the cloud with the cloud cut out of it, a soft cold glow round the silhouette. RIM: the cloud's
// own picture (a canvas) shifted a few px and taken away from itself leaves a thin line along its edges: bright ice on the edges that face up, violet and cyan on
// the edges that face down, so that the silhouette stands out of a dark sky all the way round. POCKETS: blooms of violet and cyan in the cloud, held inside it
// (what is lit from within does not light the sky), the wings' roots, the belly, the lobes, a pale one round the heart. Nothing is drawn above TOP
// (ray-hull.js feathers the layers' top). Bake-time only. The veins of lightning and the rain are ray-vein.js.
import { makeCanvas } from '../sprites.js';
import { PAL, TOP, bloom, lin, rgba } from './ray-kit.js';

// A copy of `cloud` (a W x H canvas, the boss's centre in its middle) with all but a rim of its edge taken away: what lies beyond (dx, dy) of the
// cloud's own shape is cut, and what is left is tinted c; the result is drawn with 'lighter'.
function rim(cloud, dx, dy, c, a) {
  const [w, h] = [cloud.width, cloud.height];
  const e = makeCanvas(w, h);
  const g = e.getContext('2d');
  g.drawImage(cloud, 0, 0);
  g.globalCompositeOperation = 'destination-out';
  g.drawImage(cloud, dx, dy);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = rgba(c, a);
  g.fillRect(0, 0, w, h);
  return e;
}

// A blurred copy of `cloud`, tinted c; with `cut` the cloud itself is taken out of it (so that what is left stands round the silhouette and not on it).
// Gone before the canvas's side edges, so that it is never cut off by them.
function blurred(cloud, blur, c, a, cut) {
  const [w, h] = [cloud.width, cloud.height];
  const e = makeCanvas(w, h);
  const g = e.getContext('2d');
  g.filter = `blur(${blur}px)`;
  g.drawImage(cloud, 0, 0);
  g.filter = 'none';
  if (cut) {
    g.globalCompositeOperation = 'destination-out';
    g.drawImage(cloud, 0, 0);
  }
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = rgba(c, a);
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-out';
  for (const [x0, x1] of [[0, 34], [w, w - 34]]) {
    g.fillStyle = lin(g, x0, 0, x1, 0, [[0, 'rgba(0,0,0,1)'], [1, 'rgba(0,0,0,0)']]);
    g.fillRect(Math.min(x0, x1), 0, 34, h);
  }
  return e;
}

export const SHADOW_BLUR = 15; // px: the dark halo's blur, the furthest anything spreads past the cloud (the cold halo's is HALO_BLUR)
const HALO_BLUR = 12;

// The dark halo of the cloud, for the body layer: drawn under the cloud itself.
export const shadow = (cloud) => blurred(cloud, SHADOW_BLUR, '#03041a', 0.85, false);

// Lay the cold halo and the rims of `cloud` on l (origin at the boss's centre); nothing above TOP.
export function rims(l, cloud) {
  const [w, h] = [cloud.width, cloud.height];
  const top = TOP + h / 2; // the canvas row of the HUD's line
  const lay = (e) => l.drawImage(e, 0, top, w, h - top, -w / 2, TOP, w, h - top);
  l.save();
  l.globalCompositeOperation = 'lighter';
  lay(blurred(cloud, HALO_BLUR, PAL.volt, 0.5, true));
  for (const [dx, dy, c, a] of [[2.5, 3.5, PAL.ice, 0.9], [7, 9, PAL.volt, 0.3], [-3, -4.5, PAL.cyan, 0.75], [-1.5, -2, PAL.violet, 0.6]]) lay(rim(cloud, dx, dy, c, a));
  l.restore();
}

// The pockets of light, laid on l inside the silhouette of `cloud`.
export function pockets(l, cloud) {
  const [w, h] = [cloud.width, cloud.height];
  const e = makeCanvas(w, h);
  const g = e.getContext('2d');
  g.save();
  g.translate(w / 2, h / 2);
  for (const s of [-1, 1]) {
    bloom(g, s * 250, -40, 120, PAL.electric, 0.4);
    bloom(g, s * 400, 6, 80, PAL.cyan, 0.34);
    bloom(g, s * 150, 40, 80, PAL.violet, 0.34);
    bloom(g, s * 128, 150, 64, PAL.cyan, 0.34);
    bloom(g, s * 300, 50, 60, PAL.cyan, 0.2);
  }
  bloom(g, 0, -24, 140, PAL.violet, 0.2);
  bloom(g, 0, -24, 80, PAL.electric, 0.2);
  bloom(g, 0, 100, 100, PAL.cyan, 0.2);
  g.restore();
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(cloud, 0, 0);
  const top = TOP + h / 2;
  l.save();
  l.globalCompositeOperation = 'lighter';
  l.drawImage(e, 0, top, w, h - top, -w / 2, TOP, w, h - top);
  l.restore();
}
