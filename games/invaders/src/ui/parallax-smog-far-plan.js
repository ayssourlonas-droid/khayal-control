// The plan of world 17's far skyline, x in layer px (2240 wide, the frame shows about x 160-2080): every building and landmark in
// the order it is painted, farthest first. Plain data, the same in every mode and for every level, so the smog, the clean and
// the 'over' passes agree on every place. { k: kind, x: left edge, w, top: the highest point (layer y; the layer is 700 tall and
// its top is screen y 380, so the tallest towers, top 150, reach screen y 530), s: seed, t: tier }. Tiers: 0 the far, pale and
// slender towers in the thickest haze, 1 the main skyline, 2 the low blocks and the roofs in front. The middle of the frame
// (x 710-1530 here, x 550-1370 on screen) belongs to the Craving: nothing in it is higher than top 180. The giant cigarettes
// (parallax-smog-far-cig.js) stand in two groups outside it, so the towers around them stay low.
export const TIER_MIX = [0.42, 0.12, 0]; // how far each tier's wall is lifted toward the haze

export const PLAN = [
  // tier 0: far, pale, slender
  { k: 'slab', x: -20, w: 70, top: 210, s: 1, t: 0 }, { k: 'deco', x: 120, w: 66, top: 164, s: 2, t: 0 },
  { k: 'slab', x: 332, w: 72, top: 178, s: 3, t: 0 }, { k: 'deco', x: 540, w: 70, top: 160, s: 4, t: 0 },
  { k: 'slab', x: 730, w: 66, top: 196, s: 5, t: 0 }, { k: 'deco', x: 860, w: 78, top: 190, s: 6, t: 0 },
  { k: 'slab', x: 1050, w: 72, top: 204, s: 7, t: 0 }, { k: 'slab', x: 1260, w: 70, top: 186, s: 8, t: 0 },
  { k: 'deco', x: 1400, w: 72, top: 196, s: 9, t: 0 }, { k: 'slab', x: 1545, w: 78, top: 174, s: 10, t: 0 },
  { k: 'deco', x: 1690, w: 72, top: 156, s: 11, t: 0 }, { k: 'slab', x: 1870, w: 74, top: 162, s: 12, t: 0 },
  { k: 'deco', x: 2130, w: 78, top: 168, s: 13, t: 0 },
  // tier 1: the main skyline
  { k: 'slab', x: 4, w: 88, top: 188, s: 21, t: 1 }, { k: 'deco', x: 84, w: 104, top: 150, s: 22, t: 1 },
  { k: 'slab', x: 190, w: 104, top: 226, s: 35, t: 1 }, { k: 'slab', x: 290, w: 96, top: 196, s: 23, t: 1 }, { k: 'deco', x: 370, w: 108, top: 166, s: 24, t: 1 },
  { k: 'crane', x: 520, w: 150, top: 168, s: 25, t: 1 }, { k: 'gas', x: 716, w: 168, top: 262, s: 26, t: 1 },
  { k: 'dome', x: 902, w: 214, top: 232, s: 27, t: 1 }, { k: 'cool', x: 1140, w: 250, top: 206, s: 28, t: 1 },
  { k: 'mast', x: 1420, w: 64, top: 184, s: 29, t: 1 }, { k: 'slab', x: 1536, w: 100, top: 188, s: 30, t: 1 },
  { k: 'deco', x: 1630, w: 112, top: 160, s: 31, t: 1 }, { k: 'slab', x: 1850, w: 98, top: 168, s: 32, t: 1 },
  { k: 'crane', x: 1960, w: 120, top: 190, s: 33, t: 1 }, { k: 'deco', x: 2082, w: 120, top: 152, s: 34, t: 1 },
  // tier 2: the low blocks
  { k: 'block', x: -16, w: 120, top: 280, s: 41, t: 2 }, { k: 'block', x: 100, w: 96, top: 300, s: 42, t: 2 },
  { k: 'block', x: 300, w: 110, top: 296, s: 43, t: 2 }, { k: 'block', x: 410, w: 106, top: 284, s: 44, t: 2 },
  { k: 'block', x: 600, w: 124, top: 292, s: 45, t: 2 }, { k: 'block', x: 880, w: 70, top: 306, s: 46, t: 2 },
  { k: 'block', x: 1100, w: 62, top: 308, s: 47, t: 2 }, { k: 'block', x: 1380, w: 96, top: 296, s: 48, t: 2 },
  { k: 'block', x: 1470, w: 120, top: 282, s: 49, t: 2 }, { k: 'block', x: 1700, w: 130, top: 290, s: 50, t: 2 }, { k: 'block', x: 1826, w: 70, top: 304, s: 54, t: 2 },
  { k: 'block', x: 1920, w: 100, top: 300, s: 51, t: 2 }, { k: 'block', x: 2100, w: 130, top: 284, s: 52, t: 2 },
];
