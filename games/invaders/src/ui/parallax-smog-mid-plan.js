// The plan of World 17's mid layer, x in layer px (2240 wide, the frame shows about x 130-2110): where each older block, tree,
// water tower, church, empty billboard, bus shelter, utility pole and gap lies. Plain data, the same in every mode and for
// every level (the city that heals is the same city), so the smog, the clean and the 'over' passes agree on every place.
// Blocks: { x, w, top (y of the roof line), roof: 'flat' | 'gable' | 'step' | 'mansard', brick, wall (colour index), seed,
// stacks: [[x as a share of the width, height]], aerial, dish, vents (cowl vents, x as a share), panel ([x, y from the roof line, w, h]: a blank
// painted panel on the wall), esc (fire escape bays), pipe (drainpipe side) }.
export const BLOCKS = [
  { x: 14, w: 156, top: 150, roof: 'gable', brick: true, wall: 0, seed: 11, stacks: [[0.12, 30], [0.84, 36]], pipe: 1 },
  { x: 170, w: 120, top: 112, roof: 'flat', wall: 2, seed: 12, aerial: 0.72, esc: 2, pipe: -1, vents: [0.14] },
  { x: 290, w: 152, top: 172, roof: 'step', brick: true, wall: 1, seed: 13, stacks: [[0.1, 24]], pipe: 1, tall: true, arch: true },
  { x: 756, w: 130, top: 142, roof: 'flat', wall: 4, seed: 14, aerial: 0.2, pipe: -1, vents: [0.62] },
  { x: 1034, w: 172, top: 118, roof: 'mansard', wall: 3, seed: 15, esc: 2, stacks: [[0.9, 26]], arch: true },
  { x: 1206, w: 236, top: 206, roof: 'flat', wall: 0, seed: 16, pipe: 1 },
  { x: 1462, w: 146, top: 166, roof: 'gable', brick: true, wall: 2, seed: 17, stacks: [[0.1, 28], [0.8, 32]], dish: 0.3, panel: [100, 92, 30, 20] },
  { x: 1608, w: 134, top: 132, roof: 'flat', wall: 1, seed: 18, aerial: 0.6, pipe: -1, vents: [0.2] },
  { x: 1904, w: 160, top: 146, roof: 'step', brick: true, wall: 0, seed: 19, stacks: [[0.14, 26]], pipe: 1, tall: true },
  { x: 2064, w: 176, top: 196, roof: 'mansard', wall: 4, seed: 20, aerial: 0.4 },
];
export const TOWERS = [{ x: 826, base: 140, s: 0.92 }, { x: 1672, base: 130, s: 0.78 }]; // rooftop water towers: centre, the roof's y, scale
export const BILLBOARD = { x: 1228, base: 204, w: 190, h: 74, up: 44 }; // on the low block at x 1206
export const LOT = { x0: 886, x1: 1034 }; // the vacant lot
export const SHELTER = { x: 1768 }; // the bus shelter
export const TREES = [{ x: 478, h: 176, seed: 3 }, { x: 1006, h: 150, seed: 8 }, { x: 1752, h: 164, seed: 5 }, { x: 1868, h: 132, seed: 12 }]; // dead trees: x, height, seed
export const POLES = [{ x: 452, h: 196, can: false }, { x: 896, h: 204, can: true }, { x: 1452, h: 212, can: false }, { x: 1890, h: 200, can: false }]; // utility poles, wired in order
export const KITE_POSTS = [[212, 110], [1120, 88], [1640, 130], [1212, 204]]; // where a kite's string is tied (a post with a reel, grown in the 'over' pass): x, y of its foot
