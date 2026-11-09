// World 16, Glass Cathedral: the Vesper Moth, a colossal moth whose wings are stained-glass windows, seen from the front
// like a heraldic moth with its wings spread, the dawn shining through them. Lead cames divide jewel-coloured panes
// (rose, cobalt, amber, violet and gold glass, one dark emerald accent), each pane bright at its middle and dark at the
// lead, on a body of carved indigo stone: two forewings that are fans of twenty pointed-arch lancets (the lancet window
// of a cathedral, laid on its side and set flying, its margin a row of gothic cusps fringed with glass scales); two
// hindwings that are rose windows round great eyespots of concentric rings of glass; a thorax of stone fur set with the
// rose window of the heart in a gilt sunburst; a head of faceted glass eyes under a gilt lancet crest and a pair of
// long feathered antennae; and a banded abdomen glowing between its bands. The weak points are the heart, the eyespots
// and the abdomen: hot white-gold light, where everything else is jewel glass and dark stone, so that they read at once.
// The hull is moth-hull.js (the dawn behind it and the coloured light the wings throw under them, the hindwings
// moth-hind.js, the thorax moth-thorax.js); the parts are moth-crown.js (with the antennae of moth-antenna.js), moth-heart.js,
// moth-tail.js and, painted as the left ones and mirrored for the right, moth-wing.js (its geometry moth-wing-geo.js) and
// moth-spot.js; the glass, the lead and the tufts of fur are moth-kit.js, moth-rose.js and moth-fur.js. The live extras
// are moth-fx.js: the slow wingbeat (the forewing painted whole at eight poses of the beat, moth-frames.js, drawn over the
// part's static body by moth-wing-live.js, with a wave of light running out through its rows of panes and glints on the
// glass), the rose window's light turning, the light circling the eyespots, the abdomen breathing between its bands
// (moth-light.js, every clock integrated per boss in moth-motion.js), and glass scales shaking loose in the last phase
// (moth-scales.js). Each phase lights more of it: the hover phase holds the wings wide open and sets the eyespots
// blazing, the orbit phase beats them fast and full, lights the whole moth and sheds scales (the rage layers,
// moth-rage.js; art only: the divers the core sends launch from the wings).
import { hull } from './moth-hull.js';
import { crown } from './moth-crown.js';
import { heart } from './moth-heart.js';
import { wing } from './moth-wing.js';
import { spot } from './moth-spot.js';
import { tail } from './moth-tail.js';
import { rage } from './moth-rage.js';
import { fx, warm } from './moth-fx.js';

export default {
  pad: 60,
  crack: '#ffe9b0',
  hull,
  parts: { crown, heart, wing, spot, tail },
  margins: { wingL: 58, wingR: 58, heart: 42, spotL: 46, spotR: 46, tail: 44 },
  rage,
  live: fx,
  warm,
};
