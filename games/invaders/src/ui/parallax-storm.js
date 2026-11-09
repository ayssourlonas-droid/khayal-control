// World 18's parallax layers (registry; see parallax-shapes.js for the painter contract): stormanvils, the far layer (parallax-storm-anvil.js), stormpillars,
// the middle one (-mid) and stormdeck, the near one (-near); what they share is parallax-storm-kit.js.
import { stormanvils } from './parallax-storm-anvil.js';
import { stormpillars } from './parallax-storm-mid.js';
import { stormdeck } from './parallax-storm-near.js';

export const STORM = { stormanvils, stormpillars, stormdeck };
