// World 12, Starlit Archive: the Grand Grimoire. A colossal living spellbook floating open and upright, its
// bronze-bound cover tooled in gilt, a spread of pages fanned out like wings with gold script crawling
// over them, a great sigil-eye on the spine looking out of a wheel of turning runes, a gilded crown at its
// head, two quills that write its attacks hanging at the lower corners and a jewelled clasp from its foot.
// The cover, fanned leaves, spine and medallion are in grimoire-body.js (-cover.js); the parts in
// grimoire-pages.js, -eye.js, -crown.js, -quill.js and -clasp.js; the live extras in grimoire-fx.js. Each
// phase draws more of it: the hover phase burns the script brighter and fans ghost leaves out from the
// pages; the orbit phase sends a storm of torn pages circling the book (art only: the divers the core
// sends are paper cranes). Teal, the world's one accent, is the weak points: the eye, the quills' ink and
// the clasp's stone.
import { body, rage } from './grimoire-body.js';
import { page } from './grimoire-pages.js';
import { sigilEye } from './grimoire-eye.js';
import { crown } from './grimoire-crown.js';
import { quill } from './grimoire-quill.js';
import { clasp } from './grimoire-clasp.js';
import { live } from './grimoire-fx.js';
import { warm } from './grimoire-sprites.js';

export default {
  pad: 60,
  crack: '#ffd470',
  margins: { crown: 30, eye: 44, clasp: 44 },
  hull: body,
  parts: { crown, eye: sigilEye, page, quill, clasp },
  rage,
  live,
  warm,
};
