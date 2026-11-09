// The shared vocabulary: every name a level, a formation, a pattern or a world may use.

// fire = shots per second at difficulty 0.
export const ROLES = {
  grunt: { hp: 1, score: 100, fire: 0.08 },
  diver: { hp: 1, score: 150, fire: 0.05 },
  gunner: { hp: 2, score: 200, fire: 0.35 },
  armored: { hp: 3, score: 300, fire: 0.1 },
  carrier: { hp: 1, score: 250, fire: 0 },
};

export const INTRO = 1.5; // s before play begins; the first wave flies in meanwhile
export const FORMATIONS = ['grid', 'sway', 'dive', 'spiral', 'split', 'escort', 'rain', 'orbit'];
export const PATTERNS = ['aimed', 'fan', 'ring', 'spiral', 'laser', 'rain', 'homing', 'shuriken'];
export const POWERS = ['spread', 'laser', 'rapid', 'shield', 'homing', 'slow'];
// World 13 alone also drops 'wingmen' (R61: two escorts that fire with the ship), world 15 alone
// 'pearls' and 'trident' (R63: a ring of pearls round the ship, and a shot that runs through everything)
// and world 16 alone 'mirror' (R64: a glass twin that flies opposite the ship and fires when it does),
// world 18 alone 'sideguns' (R67: world 13's side guns, caught as a power: powerups.js).
// POWERS stays the six, so the drop list and the rng draw of every other world are what they always
// were; powersFor picks the list a level's drops come from.
export const WINGMEN = 'wingmen';
export const PEARLS = 'pearls';
export const TRIDENT = 'trident';
export const MIRROR = 'mirror';
export const SIDE_GUNS = 'sideguns';
export const POWERS_13 = [...POWERS, WINGMEN];
export const POWERS_15 = [...POWERS, PEARLS, TRIDENT];
export const POWERS_16 = [...POWERS, MIRROR];
export const POWERS_18 = [...POWERS, SIDE_GUNS];
const DROPS = { 13: POWERS_13, 15: POWERS_15, 16: POWERS_16, 18: POWERS_18 };
export const powersFor = (level) => DROPS[level.world] ?? POWERS;

// World order: WORLDS[i].twist is TWISTS[i] and WORLDS[i].boss is BOSSES[i].
// World 9 reuses Twin Suns' storm wind, so its twist repeats world 3's; world 10 reuses Neon Rain's
// darkness, so its twist repeats world 2's; world 11 reuses Ronin Moon's shuriken, drawn there as
// ice shards, so its twist repeats world 4's; world 12 reuses Code Rain's glitch, drawn there as
// pages and gold dust, so its twist repeats world 6's. World 13's broadside is a twist of its own
// (R61): any pickup caught opens the ship's side guns for a while (powerups.js). World 14's fireworks
// is one too (R62): some aliens are shells that burst when they die (fireworks.js). World 15 reuses
// world 8's gravity well, drawn there as a maelstrom, so its twist repeats world 8's. World 16 reuses
// world 7's reassemble, drawn there as shattered glass that mends itself, so its twist repeats world 7's.
// World 17's breath is a twist of its own (R65): now and then a front of fresh air sweeps up the
// screen and wipes every enemy bullet it touches (twists-3.js). World 18's rule is free flight (R67), which
// its levels carry as `free`, so its twist 'free' adds nothing of its own; its side guns are a power
// there, not a twist. Its boss is the Squall Ray.
export const TWISTS = ['bunkers', 'darkness', 'gusts', 'shuriken', 'acid', 'glitch', 'reassemble', 'gravity', 'gusts', 'darkness', 'shuriken', 'glitch', 'broadside', 'fireworks', 'gravity', 'reassemble', 'breath', 'free'];
export const BOSSES = ['mothership', 'pyramid', 'fortress', 'shogun', 'queen', 'agent', 'titan', 'singularity', 'behemoth', 'count', 'wyrm', 'grimoire', 'galleon', 'carousel', 'angler', 'moth', 'craving', 'ray'];

// The playfield: a fixed 1920x1080 frame, y down. Its top is the HUD band, whose panels end at
// HUD_BOTTOM; nothing that must be seen or shot may sit behind them.
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const HUD_BOTTOM = 96;
export const MID_X = WIDTH / 2;
export const MID_Y = HEIGHT / 2;
export const EDGE = 20; // px: the closest an alien flies to either side

// The gravity world's well (a template: a world takes a copy, so it stays plain cloneable data).
export const WELL = { x: MID_X, y: 300 };

// Collision sizes shared by the collision code and by everything that must agree with it.
export const ALIEN_R = 26; // hit radius of an alien
export const NEAR_MISS = 28; // centre distance, for a standard 8 px bullet: 6 px outside the hit circle

// The fixed step of the simulation, in seconds: every stepWorld call in a game, a replay or a test.
export const TICK = 1 / 60;
// The float dust a sum of ticks carries: fifteen ticks of 1 / 60 make 0.25, and 8 / 60 added fifteen times
// makes 2, only up to rounding. So a cooldown, a timer, a fuse or a count that falls due on a whole tick is
// taken as due within EPS of it, and never waits one tick more.
export const EPS = 1e-9;
