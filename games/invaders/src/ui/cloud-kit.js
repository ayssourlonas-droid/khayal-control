// Cumulus for Sunset Armada, lit from the sun: the towering banks baked into the sky (sky-bodies-5.js) and
// the sea of cloud tops in the near layer (parallax-armada-clouds.js) both use it. A bank is a list of
// lobes (lobes()), filled as one flat silhouette, then lit inside it: a slope of gold to rose to violet
// across the whole bank, a soft crown of light and a soft crease of shadow on every lobe (feathered, so
// the lobes run into one another and read as billows, not balls), and a thin rim of light along the edges
// that face the sun. Paint-time only.
import { makeCanvas, rgba, mix, lin, soft } from './sprites.js';
import { TAU } from '../core/math.js';

export const SUN = { x: 1240, y: 700, r: 200 }; // where the sky bakes the sun; every cloud is lit from here
export const TONES = { lit: '#fff2cc', gold: '#ffc87a', rose: '#ee8090', dusk: '#a25aa2', shade: '#5a3f98' };

// The same tones, drawn toward the haze colour `c` by k (0 as they are, 1 all haze): far clouds are paler.
export const hazed = (tones, c, k) => Object.fromEntries(Object.entries(tones).map(([n, v]) => [n, mix(v, c, k)]));

// The lobes [x, y, r] of a tower standing on `base`: rows, each narrower than the one below it and the crown
// round, big lobes on the flanks and small ones between.
export function lobes(rng, x, base, w, h) {
  const out = [];
  const rows = Math.max(3, Math.round(h / (w * 0.19)));
  const step = h / rows;
  for (let j = 0; j < rows; j++) {
    const u = j / rows;
    const half = (w / 2) * Math.sqrt(1 - u ** 2.2 * 0.9);
    const n = Math.max(2, Math.round((half * 2) / (step * 1.05)));
    for (let i = 0; i < n; i++) {
      const r = step * (0.7 + rng() * 0.8) * (1 - u * 0.2);
      out.push([x + ((i + 0.5) / n - 0.5) * half * 2 + (rng() - 0.5) * step * 0.6, base - j * step - r * 0.3, r]);
    }
  }
  return out;
}

// Paint the lobes as one lit bank onto g, at alpha a; `detail` (0 to 1) is how plainly each lobe's contours show.
export function bank(g, list, tones = TONES, light = SUN, a = 1, detail = 1) {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, y, r] of list) [x0, y0, x1, y1] = [Math.min(x0, x - r), Math.min(y0, y - r), Math.max(x1, x + r), Math.max(y1, y + r)];
  [x0, y0] = [Math.floor(x0 - 8), Math.floor(y0 - 8)];
  const c = makeCanvas(x1 - x0 + 16, y1 - y0 + 16);
  const s = c.getContext('2d');
  s.translate(-x0, -y0);
  const [cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2];
  const dir = Math.atan2(light.y - cy, light.x - cx);
  const [ux, uy] = [Math.cos(dir), Math.sin(dir)];
  s.fillStyle = tones.rose;
  s.beginPath();
  for (const [x, y, r] of list) {
    s.moveTo(x + r, y);
    s.arc(x, y, r, 0, TAU);
  }
  s.fill();
  s.globalCompositeOperation = 'source-atop';
  const [w, h] = [x1 - x0, y1 - y0];
  s.fillStyle = lin(s, cx, y0, cx, y1, [[0, rgba(tones.gold, 0.7)], [0.45, rgba(tones.rose, 0.1)], [1, rgba(tones.shade, 0.82)]]); // the slope: bright crown, violet foot
  s.fillRect(x0, y0, w, h);
  s.fillStyle = lin(s, cx - ux * w / 2, cy - uy * h / 2, cx + ux * w / 2, cy + uy * h / 2, [[0, rgba(tones.shade, 0.5)], [0.6, rgba(tones.dusk, 0)], [1, rgba(tones.gold, 0.55)]]); // and from the far flank to the sunward one
  s.fillRect(x0, y0, w, h);
  s.lineCap = 'round';
  for (const [x, y, r] of list.toSorted((p, q) => p[1] - q[1])) { // each lobe: a soft crease under it and a drawn contour on its shaded side, a lit one on the other
    s.globalAlpha = 0.34;
    s.drawImage(soft(tones.shade), x - ux * r * 0.4 - r * 1.2, y + r * 0.5 - uy * r * 0.2 - r * 1.2, r * 2.4, r * 2.4);
    s.globalAlpha = 0.22;
    s.drawImage(soft(tones.gold), x + ux * r * 0.45 - r, y - r * 0.4 + uy * r * 0.2 - r, r * 2, r * 2);
    s.globalAlpha = 1;
    for (const [da, span, color, w] of [[Math.PI, 0.9, rgba(tones.shade, 0.3 * detail), Math.max(1.6, r * 0.06)], [0, 0.7, rgba(tones.lit, 0.34 * detail), Math.max(1.4, r * 0.05)]]) {
      s.strokeStyle = color;
      s.lineWidth = w;
      s.beginPath();
      s.arc(x, y, r * 0.9, dir + da - span, dir + da + span);
      s.stroke();
    }
  }
  s.lineCap = 'butt';
  s.globalAlpha = 1;
  const rim = makeCanvas(c.width, c.height); // the edges that face the sun: the bank minus itself shifted away from it
  const r = rim.getContext('2d');
  for (const [d, color, k] of [[8, tones.gold, 0.85], [3, tones.lit, 1]]) {
    r.globalCompositeOperation = 'source-over';
    r.clearRect(0, 0, rim.width, rim.height);
    r.drawImage(c, 0, 0);
    r.globalCompositeOperation = 'destination-out';
    r.drawImage(c, -ux * d, -uy * d);
    r.globalCompositeOperation = 'source-in';
    r.fillStyle = color;
    r.fillRect(0, 0, rim.width, rim.height);
    s.globalCompositeOperation = 'source-over';
    s.globalAlpha = k;
    s.drawImage(rim, x0, y0);
  }
  g.globalAlpha = a;
  g.drawImage(c, x0, y0);
  g.globalAlpha = 1;
}
