// The plan of World 17's near layer, x and y in layer px (2240 x 320; its top is screen y 760, so layer y 186 is screen 946; the
// frame shows about x 90-2150 as the ship moves): the street's levels from the back to the front and where each fence
// section, pier and thing stands. Plain data, shared by every mode, so smog, clean and 'over' agree on every place.
export const Y = { soil: 130, pave: 188, kerb: 252, gutter: 270, road: 284 }; // the park's soil band, the pavement's far edge, the kerb's top, the gutter, the road
export const FENCE = { top: 92, base: 170, plinth: 18 }; // the railings' top, their foot (the plinth's top), the plinth's height
export const SECTIONS = [[70, 452], [522, 923], [1049, 1456], [1526, 1966], [2036, 2200]]; // the railings between the piers: from x to x
export const PIERS = [46, 488, 940, 1032, 1490, 2000, 2224]; // stone piers with a ball on top: x of their centres (the gate stands between 940 and 1032)
export const GATE = { x0: 957, x1: 1015 }; // the opening between the gate piers, where a path of flags leads into the park
export const BENCH = { x: 700, base: 236 }; // iron-ended bench with slats
export const BOLLARDS = [{ x: 380, base: 242 }, { x: 1256, base: 240 }]; // squat iron-and-stone posts
export const STUMP = { x: 1346, base: 238, h: 78 }; // a lamp-post snapped off
export const BIN = { x: 1776, base: 238 }; // a wire litter bin
export const PIT = { x: 1160, base: 236 }; // a tree pit with a sapling
export const DRAINS = [860, 1900]; // grates in the gutter
export const PUDDLES = [[300, 298, 64], [1480, 304, 78], [2060, 296, 54], [1010, 308, 48]]; // x, y, half-width
export const MANHOLE = { x: 1190, y: 303, rx: 40, ry: 7 };
