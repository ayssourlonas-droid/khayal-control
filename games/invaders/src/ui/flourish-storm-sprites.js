// The sprites of Anvil Sky's flourishes (flourish-storm.js), each baked once under its own key: the forked bolts (BOLTS drawings, a jagged
// trunk with branches, a wide lilac glow under a pale stroke under a white core), the rain curtain (a soft slanted-able band with streaks in it),
// the sun's beam (a long triangle fading with its length) and the scud (a ragged streak of dark cloud, three drawings). warmStormFx() bakes them
// all, which the far layer's painter calls (parallax-storm-anvil.js), so no frame of the fight pays for one. Nothing here is lettered or
// randomised: every jitter is a hash of the drawing's number.
import { cached, glow, soft, hash, rgba, makeCanvas } from './sprites.js';

export const BOLT = { w: 240, h: 420, count: 4 }; // a bolt's canvas; how many drawings
export const CURTAIN = { w: 300, h: 860 };
export const BEAM = { w: 170, h: 800 };
export const SCUD = { w: 900, h: 100, count: 3 };

// One bolt: a trunk from the top centre down in segments with a jitter, and branches off it going down and out; three strokes over each.
export const boltSprite = (v) => cached('stormBolt' + v, BOLT.w, BOLT.h, (g, w, h) => {
  const H = (k) => hash(v * 211 + k * 17 + 5);
  const trunk = [[w / 2, 2]];
  for (let y = 0, k = 0; y < h - 10; k++) {
    y += 30 + H(k) * 26;
    trunk.push([w / 2 + (H(k + 40) - 0.5) * 64 + (v % 2 ? 1 : -1) * (y / h) * 20, Math.min(y, h - 6)]);
  }
  const paths = [trunk];
  for (let b = 0; b < 3; b++) { // branches: from a point of the trunk, down and to one side
    const [bx, by] = trunk[1 + Math.floor(H(b + 80) * (trunk.length - 3))];
    const side = H(b + 90) < 0.5 ? -1 : 1;
    const br = [[bx, by]];
    for (let s = 1; s <= 3 + Math.floor(H(b + 100) * 2); s++) br.push([br[s - 1][0] + side * (14 + H(b * 9 + s) * 24), br[s - 1][1] + 18 + H(b * 7 + s + 30) * 22]);
    paths.push(br);
  }
  g.lineCap = 'round';
  g.lineJoin = 'round';
  for (const [color, width, alpha] of [['#8c9cff', 24, 0.2], ['#c4d0ff', 9, 0.7], ['#ffffff', 3.4, 1]]) {
    g.strokeStyle = rgba(color, alpha);
    paths.forEach((p, i) => {
      g.lineWidth = i ? width * 0.55 : width;
      g.beginPath();
      p.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
    });
  }
});

// A curtain of rain: bell-shaped across, fading out along its length, streaks inside it.
export const curtainSprite = () => cached('stormCurtain', CURTAIN.w, CURTAIN.h, (g, w, h) => {
  g.fillStyle = (() => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    for (const [at, a] of [[0, 0], [0.3, 0.3], [0.5, 0.6], [0.7, 0.3], [1, 0]]) gr.addColorStop(at, rgba('#a0b2ec', a));
    return gr;
  })();
  g.fillRect(0, 0, w, h);
  g.strokeStyle = rgba('#d0dcff', 0.28);
  g.lineWidth = 1.4;
  g.beginPath();
  for (let i = 0; i < 30; i++) {
    const x = w * (0.22 + 0.56 * hash(i + 900));
    const y = hash(i + 940) * h * 0.8;
    g.moveTo(x, y);
    g.lineTo(x - 5, y + 40 + 50 * hash(i + 980));
  }
  g.stroke();
  g.globalCompositeOperation = 'destination-in';
  const fade = g.createLinearGradient(0, 0, 0, h);
  for (const [at, a] of [[0, 0], [0.22, 1], [0.7, 0.9], [1, 0]]) fade.addColorStop(at, rgba('#000000', a));
  g.fillStyle = fade;
  g.fillRect(0, 0, w, h);
});

// The sun's beam, apex at the top: a triangle widening downward and fading with its length, blurred so it has no edge.
export const beamSprite = () => cached('stormBeam', BEAM.w, BEAM.h, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, rgba('#ffb060', 0.9));
  gr.addColorStop(0.5, rgba('#ff9a50', 0.4));
  gr.addColorStop(1, rgba('#ff8a40', 0));
  const t = makeCanvas(w, h);
  const tg = t.getContext('2d');
  tg.fillStyle = gr;
  tg.beginPath();
  tg.moveTo(w / 2 - 6, 0);
  tg.lineTo(w * 0.12, h);
  tg.lineTo(w * 0.88, h);
  tg.lineTo(w / 2 + 6, 0);
  tg.fill();
  g.filter = 'blur(14px)';
  g.drawImage(t, 0, 0);
});

// A streak of scud: a row of flat soft discs of dark cloud along a wavering line, bigger toward the middle.
export const scudSprite = (v) => cached('stormScud' + v, SCUD.w, SCUD.h, (g, w, h) => {
  const n = 22 + v * 4;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const mid = 1 - Math.abs(u * 2 - 1) ** 1.6;
    const [rx, ry] = [(60 + 110 * hash(v * 77 + i)) * (0.5 + 0.5 * mid), (14 + 30 * hash(v * 77 + i + 30)) * (0.45 + 0.55 * mid)];
    g.globalAlpha = 0.5 + 0.3 * hash(v * 77 + i + 60);
    g.drawImage(soft('#0a0e20'), u * w - rx, h / 2 + (hash(v * 77 + i + 90) - 0.5) * 26 - ry, rx * 2, ry * 2);
  }
});

export function warmStormFx() {
  for (let v = 0; v < BOLT.count; v++) boltSprite(v);
  for (let v = 0; v < SCUD.count; v++) scudSprite(v);
  curtainSprite();
  beamSprite();
  for (const c of ['#b4c0ff', '#8c9cff', '#cdd6ff', '#ff8a3a', '#e8f0ff']) glow(c);
  soft('#7a86b8'); // the generic mist's bank (flourish.js), in the look's colour
}
