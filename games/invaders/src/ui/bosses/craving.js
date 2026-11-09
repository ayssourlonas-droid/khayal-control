// The Craving (World 17, Ash to Air): a giant of smoke with ember eyes and a burning maw, a crown of half-smoked cigarettes and two
// raised hands of smoke with hooked black claws, rising from a colossal ashtray: its throne. Two halves of one boss. The throne and the
// parts are the hard half: the hull (craving-hull.js: the ashtray, a round glazed bowl, craving-throne*.js, with one frozen frame of the smoke
// body in it), the armour (craving-crown*.js: nine cigarettes and a row of burnt-out ones on a band that melts into the smoke;
// craving-claw*.js: a forearm and a splayed palm of smoke, four fingers and a thumb ending in hooked claws, painted as the left one and
// mirrored) and the weak points (craving-maw*.js: a furnace in a charred lip with teeth; craving-eye*.js: a molten ember eye under a
// brow, painted as the left one and mirrored; craving-tray*.js: the bed of coals in the front of the ashtray), and the rage layers
// (craving-rage.js). The smoke body and everything that moves are the soft half: craving-frames.js (the figure), craving-fx.js (the
// churning body drawn behind the parts, the embers and wisps over them, warm()). The colours and the part rects are craving-kit.js; the
// throne's and the parts' own tools are craving-pkit.js and craving-pkit-edge.js (how a hard part melts into the smoke). The hover phase
// blazes the maw and the throne's coals, the orbit phase the whole throne (rage). Nothing is drawn above y -158, the HUD's edge.
import { hull } from './craving-hull.js';
import { crown } from './craving-crown.js';
import { maw } from './craving-maw.js';
import { claw } from './craving-claw.js';
import { eye } from './craving-eye.js';
import { tray } from './craving-tray.js';
import { rage } from './craving-rage.js';
import { behind, fx, warm } from './craving-fx.js';

export default {
  pad: 60,
  crack: '#ffb347',
  hull,
  parts: { crown, maw, claw, eye, tray },
  rage,
  margins: { crown: 42, maw: 48, clawL: 56, clawR: 56, eyeL: 38, eyeR: 38, tray: 36 },
  behind,
  live: fx,
  warm,
};
