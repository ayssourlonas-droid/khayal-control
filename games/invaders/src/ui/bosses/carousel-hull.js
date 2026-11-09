// The Grand Carousel's hull (World 14, Ember Carnival; see carousel.js): everything the parts stand in
// front of, from the back forward: the hollow, the column and far poles, the floor and bowl, the end posts,
// the striped canopy (frame 0 of the turning set) and the valance and moulding that hang from it.
import { bloom } from './kit.js';
import { CYAN } from './carousel-kit.js';
import { inside, posts } from './carousel-column.js';
import { floor } from './carousel-floor.js';
import { putCanopy } from './carousel-canopy.js';
import { valance } from './carousel-valance.js';

export function hull(b, l, S) {
  inside(b, l);
  floor(b, l, S.pal.hull);
  posts(b, l);
  putCanopy(b);
  valance(b, l);
  bloom(l, 0, -30, 200, '#ffb0e0', 0.05);
}

// The glows are kept to what the hull's canvas holds (820 x 460 round the middle): nothing reaches past y -230.
const lamps = (l, r, a) => [-172, 172].forEach((x) => bloom(l, x, 78, r, CYAN, a));
export const rage = [null, (l) => {
  bloom(l, 0, -70, 150, '#ff8ac8', 0.22); // the canopy's colour spilling under it
  for (const x of [-250, -125, 0, 125, 250]) bloom(l, x, -62, 64, '#ffd27a', 0.14);
  bloom(l, 0, -6, 120, CYAN, 0.1);
  bloom(l, 0, 94, 96, CYAN, 0.16);
  lamps(l, 70, 0.12);
}, (l) => {
  bloom(l, 0, -70, 158, '#ff8ac8', 0.36);
  for (const x of [-290, -210, -125, -40, 40, 125, 210, 290]) bloom(l, x, -62, 70, '#ffd27a', 0.26);
  bloom(l, 0, -6, 130, CYAN, 0.16);
  bloom(l, 0, 94, 104, CYAN, 0.32);
  lamps(l, 78, 0.2);
  for (const x of [-262, 262]) bloom(l, x, -45, 92, '#ff6ab8', 0.28);
}];
