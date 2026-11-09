// World 17's flourishes (registry). Each environment worker's own table is spread in.
import { FLOURISH_GROUND } from './flourish-smog-ground.js';
import { FLOURISH_SKY } from './flourish-smog-sky.js';

export const FLOURISH_SMOG = { ...FLOURISH_GROUND, ...FLOURISH_SKY };
