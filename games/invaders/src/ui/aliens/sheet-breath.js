// World 17's breath on the alien sheet (dev.html?sheet=w17), in the free corner: the two frames of a little craft at 1:1, a
// strip of the band of air with its edge, wind streaks, leaves and twinkles in it, and under it a sample of the wake's veil.
// The same sprites breath-view.js blits, so what is judged here is what flies (the whole front is dev.html?level=w17-1).
import { label } from '../hud-kit.js';
import { breathKit } from '../breath-sprites.js';
import { CRAFT_W, CRAFT_H, ORIGIN } from '../breath-craft.js';
import { AIR_Y0, LIGHT_Y0 } from '../breath-air.js';

const STRIP = [1530, 872, 370, 150]; // x, y, w, h of the band's strip
const EDGE = 912; // where its edge runs

export function breathSheet(g) {
  const k = breathKit();
  for (let f = 0; f < 2; f++) {
    const [x, y] = [1340 + f * 100 - ORIGIN[0], 920 - ORIGIN[1]];
    g.drawImage(k.body[f], x, y, CRAFT_W, CRAFT_H);
    g.globalCompositeOperation = 'lighter';
    g.drawImage(k.lights[f], x, y, CRAFT_W, CRAFT_H);
    g.globalCompositeOperation = 'source-over';
  }
  g.save();
  g.beginPath();
  g.rect(...STRIP);
  g.clip();
  g.fillStyle = 'rgba(40,30,22,0.5)';
  g.fillRect(...STRIP);
  g.drawImage(k.air, 1480, EDGE - AIR_Y0);
  g.drawImage(k.flow, 1300, EDGE + 4);
  for (let i = 0; i < 6; i++) { // leaves, a few turned
    g.save();
    g.translate(1560 + i * 58, EDGE + 28 + (i % 3) * 30);
    g.rotate(i * 1.1);
    g.drawImage(k.leaves[i * 2], -20, -20);
    g.restore();
  }
  g.globalCompositeOperation = 'lighter';
  g.drawImage(k.light, 1480, EDGE - LIGHT_Y0);
  for (let i = 0; i < 3; i++) g.drawImage(k.twinkles[i & 1], 1580 + i * 120, EDGE + 40 + (i % 2) * 24, 36, 36);
  g.globalCompositeOperation = 'source-over';
  g.drawImage(k.wake, STRIP[0], 1004, STRIP[2], 40);
  g.restore();
  g.save();
  label(g, 'BREATH · CRAFT · AIR · LEAVES · WAKE', 1300, 1060, 'left');
  g.restore();
}
