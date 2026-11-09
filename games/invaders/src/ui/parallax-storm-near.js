// The near layer of Anvil Sky (stormdeck): the storm's own deck in front of everything, black-blue and heaving, a ridge of big round
// billows along its top (parallax-storm-field.js, large lumps), a faint cold rim catching the lightning on every crest, and pockets inside it
// that flicker when a flash passes. Under the crests it goes to black so the ship and the bullets are never lost against it.
import { rgba } from './sprites.js';
import { paintCloud, unit } from './parallax-storm-field.js';
import { offscreen } from './parallax-storm-kit.js';

const TOP = 150; // the deck's mean top in the layer (320 tall: the lowest third of the frame is cloud)

export function stormdeck(g, w, h, rng, L, out) {
  const top = (x) => TOP + 16 * Math.sin(x * 0.0061) + 12 * Math.sin(x * 0.017 + 2.4) + 7 * Math.sin(x * 0.043 + 1);
  const [c, dg] = offscreen(w, h);
  paintCloud(dg, rng, (x, y) => y - top(x), [0, TOP - 90, w, 260], {
    color: L.color, mid: '#12183a', cold: '#5a6cb8', glow: '#8090e0', light: unit(0.4, -0.92), n: 120, edge: 330, rMax: 110, rEdge: 60, lit: 0.34, pockets: 6, pocketA: 0.08,
  });
  const fill = dg.createLinearGradient(0, TOP + 20, 0, TOP + 110); // the heart of the deck is solid dark, so it never thins to the sky
  fill.addColorStop(0, rgba(L.color, 0));
  fill.addColorStop(1, rgba(L.color, 1));
  dg.fillStyle = fill;
  dg.fillRect(0, TOP + 20, w, h);
  dg.globalCompositeOperation = 'source-atop';
  const gr = dg.createLinearGradient(0, TOP - 30, 0, h);
  gr.addColorStop(0, rgba('#000000', 0));
  gr.addColorStop(0.6, rgba('#000000', 0.7));
  gr.addColorStop(1, rgba('#000000', 0.9));
  dg.fillStyle = gr;
  dg.fillRect(0, 0, w, h);
  g.drawImage(c, 0, 0);
  for (let i = 0; i < 3; i++) out.lights.push({ x: 400 + i * 740 + rng() * 120, y: TOP + 40, r: 100 + rng() * 20, color: '#8090e0', mode: 'flicker', ph: rng(), a: 0.16 });
}
