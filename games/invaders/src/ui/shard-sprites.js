// The pieces the Glass Cathedral breaks into (mending-view.js draws the wreck from them, mending-fx-view.js the
// flight of them in and out): a shard of stained glass, a chip of stone and a bent strip of lead came, each a small
// baked sprite. A shard is one of four cuts (a sliver, a kite, a quadrilateral, a pentagon) in one of six glasses
// (rose, cobalt, amber, violet, gold and clear, the jewel colours of the aliens), a jewel gradient lit from the
// upper left with a dark lead edge, a white glint along one side and a hairline flaw. Painted once on first use;
// warmShards paints every one ahead of the fight. The sprites are 32 px, the piece's middle at 16, 16.
import { cached, rad, lin, rgba, shade } from './sprites.js';
import { poly, LEAD } from './glass-kit.js';

export const GLASSES = ['#ff5fa2', '#4fa8ff', '#ffb04a', '#a47cff', '#ffe27a', '#d8f4ff']; // rose, cobalt, amber, violet, gold, clear
export const SHARD_SHAPES = 4;
export const CHIP_SHAPES = 3;
const STONE = '#8a7a96';
const CUTS = [ // unit-ish outlines, about 11 px from the middle at most
  [[-3, -12], [4, -10], [6, 11], [-1, 12]],
  [[0, -12], [9, -1], [1, 12], [-8, 0]],
  [[-9, -6], [7, -9], [10, 7], [-6, 10]],
  [[0, -11], [10, -4], [6, 9], [-6, 9], [-10, -4]],
];
const CHIPS = [
  [[-8, -3], [-2, -8], [7, -4], [8, 5], [-3, 8]],
  [[-6, -7], [7, -5], [5, 7], [-8, 4]],
  [[-9, 1], [-3, -8], [6, -6], [9, 3], [1, 9]],
];

export const shardSprite = (shape, color) => cached(`glassShard${shape}${color}`, 32, 32, (g) => {
  g.translate(16, 16);
  g.lineJoin = 'round';
  const pts = CUTS[shape % SHARD_SHAPES];
  const c = GLASSES[color % GLASSES.length];
  poly(g, pts);
  g.fillStyle = rad(g, 0, 0, 0.5, 14, [[0, shade(c, 0.55)], [0.5, c], [1, shade(c, -0.5)]], -4, -5);
  g.fill();
  g.save();
  g.clip();
  g.fillStyle = lin(g, -10, -10, 10, 10, [[0, rgba('#ffffff', 0.4)], [0.45, rgba('#ffffff', 0)], [1, rgba('#102050', 0.3)]]);
  g.fillRect(-12, -12, 24, 24);
  g.restore();
  g.lineWidth = 2;
  g.strokeStyle = LEAD;
  poly(g, pts);
  g.stroke();
  g.lineWidth = 1;
  g.strokeStyle = rgba('#ffffff', 0.85); // the glint along the lit edge
  g.beginPath();
  g.moveTo(pts[0][0] + 1.4, pts[0][1] + 1.6);
  g.lineTo(pts[pts.length - 1][0] + 1.2, pts[pts.length - 1][1] - 1.4);
  g.stroke();
  g.lineWidth = 0.7; // and a flaw
  g.strokeStyle = rgba(LEAD, 0.6);
  g.beginPath();
  g.moveTo(-1, -1);
  g.lineTo(3 + shape, 5);
  g.stroke();
});

export const chipSprite = (shape) => cached(`glassChip${shape}`, 32, 32, (g) => {
  g.translate(16, 16);
  g.lineJoin = 'round';
  const pts = CHIPS[shape % CHIP_SHAPES];
  poly(g, pts);
  g.fillStyle = lin(g, -8, -8, 8, 9, [[0, shade(STONE, 0.4)], [0.5, STONE], [1, shade(STONE, -0.55)]]);
  g.fill();
  g.lineWidth = 1.8;
  g.strokeStyle = LEAD;
  g.stroke();
  g.lineWidth = 1;
  g.strokeStyle = rgba('#ffffff', 0.4); // a lit edge, and the grain of the stone
  g.beginPath();
  g.moveTo(pts[0][0] + 1, pts[0][1] + 1.4);
  g.lineTo(pts[1][0] - 0.6, pts[1][1] + 1.2);
  g.stroke();
  g.strokeStyle = rgba(LEAD, 0.35);
  g.beginPath();
  g.moveTo(-3, 1);
  g.lineTo(2, 3);
  g.moveTo(1, -2);
  g.lineTo(4, -1);
  g.stroke();
});

// A strip of lead came, bent a little, with a lit edge: 32 px long.
export const cameSprite = () => cached('glassCame', 32, 32, (g) => {
  g.translate(16, 16);
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-12, 3);
  g.quadraticCurveTo(0, -7, 12, 1);
  g.lineWidth = 3.4;
  g.strokeStyle = '#2a2236';
  g.stroke();
  g.lineWidth = 1;
  g.strokeStyle = rgba('#b8a8d0', 0.8);
  g.translate(0, -0.9);
  g.stroke();
});

export function warmShards() { // paint all of them now, so none is baked at the first wreck (warm-glass.js)
  for (let s = 0; s < SHARD_SHAPES; s++) for (let c = 0; c < GLASSES.length; c++) shardSprite(s, c);
  for (let s = 0; s < CHIP_SHAPES; s++) chipSprite(s);
  cameSprite();
}
