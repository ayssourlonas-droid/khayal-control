// The shared vocabulary: the roles aliens fight as, the powers, the species, and the playfield.

// fire = shots per second at difficulty 0.
export const ROLES = {
  grunt: { hp: 1, score: 100, fire: 0.08 },
  diver: { hp: 1, score: 150, fire: 0.05 },
  gunner: { hp: 2, score: 200, fire: 0.35 },
  armored: { hp: 3, score: 300, fire: 0.1 },
  carrier: { hp: 1, score: 250, fire: 0 },
};

export const POWERS = ['spread', 'laser', 'rapid', 'shield'];

// The animal an alien is drawn as and named by; its value is the invaders role it fights as.
export const SPECIES = { dog: 'grunt', cat: 'diver', bird: 'diver', fish: 'gunner', horse: 'gunner', cow: 'armored', rabbit: 'carrier', mouse: 'diver', lion: 'diver', camel: 'gunner', fox: 'diver' };

// The playfield: a fixed 1920x1080 frame, y down. Its top is the HUD band, whose panels end at
// HUD_BOTTOM; nothing that must be seen or shot may sit behind them.
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const HUD_BOTTOM = 96;
export const MID_X = WIDTH / 2;
export const MID_Y = HEIGHT / 2;
export const EDGE = 20; // px: the closest an alien flies to either side

// Collision sizes shared by the collision code and by everything that must agree with it.
export const ALIEN_R = 26; // hit radius of an alien
export const NEAR_MISS = 28; // centre distance, for a standard 8 px bullet: 6 px outside the hit circle

// The fixed step of the simulation, in seconds: every stepWorld call in a game or a test.
export const TICK = 1 / 60;
