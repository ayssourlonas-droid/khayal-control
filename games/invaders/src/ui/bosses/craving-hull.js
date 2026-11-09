// The Craving's hull (World 17, Ash to Air; see craving.js): the throne, a colossal ashtray, a round glazed bowl of grey ceramic (lighter
// and glossier than the smoke, so it separates from the figure), with the frozen smoke body in it. From the back forward: the back
// half of the rim's top face, the bowl with its heap of ash and butts (craving-throne-bowl.js), then ONE FROZEN FRAME of the smoke body
// (bodyOn(b, 0) from craving-frames.js, so the collapse in death.js has a body to break), then, over the bottom of the smoke, the
// round belly and the foot (craving-throne-wall.js), the rolled lip with its glossy streak, the front half of the rim's top face, the two
// heaps of ash and butts piled on it at each side of the tray (craving-throne-heap.js) and the four cigarette rests cut in front of them,
// a lit cigarette lying in each outer one (craving-throne-rim.js). The live smoke is drawn over the hull down to the mouth's edge, so
// what must stay visible lies on the rim and below. Geometry is craving-throne-geo.js. The hull's lights are the coals in the bowl,
// glowing cracks and the warmth on the belly; the tray (craving-tray.js) is the hot bed at the front. Boss coordinates; everything lies
// in x -300..300, y 20..170 (the frozen smoke is drawn from craving-frames.js).
import { bodyOn } from './craving-frames.js';
import { bowl } from './craving-throne-bowl.js';
import { wall, foot } from './craving-throne-wall.js';
import { topFace, lipFace, rests } from './craving-throne-rim.js';
import { heap } from './craving-throne-heap.js';

export function hull(b, l) {
  b.save();
  l.save();
  topFace(b, l, false);
  bowl(b, l);
  bodyOn(b, 0);
  wall(b, l);
  foot(b);
  lipFace(b);
  topFace(b, l, true);
  heap(b, l);
  rests(b, l);
  b.restore();
  l.restore();
}
