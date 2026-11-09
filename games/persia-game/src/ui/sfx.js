// Every sound patch by name (audio.js play(name)): the fight, power-ups and the bomb, the bosses and
// big blasts, bullet time, the stingers and menus, and the open's film sounds.
import { FIGHT } from './sfx-fight.js';
import { POWER } from './sfx-power.js';
import { BOSS } from './sfx-boss.js';
import { WORLD } from './sfx-world.js';
import { UI } from './sfx-ui.js';
import { FILM } from './sfx-film.js';

export const SFX = { ...FIGHT, ...POWER, ...BOSS, ...WORLD, ...UI, ...FILM };
