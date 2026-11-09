import { boss, weak, armor, hull, atk, minion, phase } from './bosses-kit.js';
import { BOSSES2 } from './bosses-data-2.js';
import { BOSSES3 } from './bosses-data-3.js';
import { BOSSES4 } from './bosses-data-4.js';
import { BOSSES5 } from './bosses-data-5.js';

// The first four bosses (worlds 1-4); bosses-data-2.js holds worlds 5-8, bosses-data-3.js worlds 9-12,
// bosses-data-4.js worlds 13-15, bosses-data-5.js worlds 16-17.
// Each is built from its world's look: parts are where the picture needs them, the attack mix is
// what the world shoots.
// Layouts keep a clear column to some weak part from below at every moment of the fight (the boss
// tests check it tick by tick), and when the last weak part falls the plates crack open to be shot
// at full strength (boss-phase.js), so there is always something to aim at.

const mothership = boss('mothership', 'Mothership', 240, { w: 640, h: 220 }, [
  armor('dome', 0, -60, 240, 80, 8),
  armor('wingL', -240, 10, 150, 70, 6),
  armor('wingR', 240, 10, 150, 70, 6),
  weak('gunL', -110, 50, 80, 60, 44),
  weak('gunR', 110, 50, 80, 60, 44),
  weak('eye', 0, 70, 90, 70, 70),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2.2, 'eye', { speed: 0.8 }),
    atk('fan', 4.2, 'gunL', { count: 3, spread: 0.6 }),
    atk('fan', 4.2, 'gunR', { count: 3, spread: 0.6 }),
  ], { minions: [minion('carrier', 1, 4, 'dome')] }),
  phase(0.3, 'sway', [
    atk('fan', 3.2, 'eye', { count: 5, spread: 0.9 }),
    atk('ring', 6, 'eye', { count: 12 }),
    atk('aimed', 2.6, 'gunL'),
    atk('aimed', 2.6, 'gunR'),
  ], { rate: 1.2, minions: [minion('grunt', 3, 10, 'eye'), minion('carrier', 1, 4, 'dome')] }),
  phase(0, 'charge', [
    atk('ring', 4.5, 'eye', { count: 16, speed: 0.8 }),
    atk('fan', 3, 'gunL', { count: 5, spread: 0.8 }),
    atk('fan', 3, 'gunR', { count: 5, spread: 0.8 }),
    atk('laser', 8, 'eye'),
  ], { rate: 1.4, minions: [minion('grunt', 3, 9, 'eye'), minion('carrier', 1, 4, 'dome')] }),
]);

// The tiers are split by a shaft down the middle: the eye hangs in it at the bottom, the spire sits
// at its top, so the spire opens to the player's fire as soon as the eye is gone.
const pyramid = boss('pyramid', 'Corporate pyramid', 250, { w: 560, h: 300 }, [
  weak('spire', 0, -105, 60, 60, 36),
  armor('capL', -75, -55, 60, 50, 3),
  armor('capR', 75, -55, 60, 50, 3),
  armor('midL', -100, 0, 110, 56, 4),
  armor('midR', 100, 0, 110, 56, 4),
  armor('baseL', -133, 60, 176, 56, 4),
  armor('baseR', 133, 60, 176, 56, 4),
  weak('eye', 0, 105, 80, 44, 62),
  weak('signL', -150, 100, 90, 40, 32),
  weak('signR', 150, 100, 90, 40, 32),
], [
  phase(0.6, 'hover', [
    atk('rain', 2.6, 'baseL', { count: 3, spread: 300 }),
    atk('rain', 2.6, 'baseR', { count: 3, spread: 300 }),
    atk('fan', 3, 'eye', { count: 5, spread: 0.7 }),
  ], { minions: [minion('carrier', 1, 4.5, 'capL')] }),
  phase(0.25, 'sway', [
    atk('rain', 2.6, 'baseL', { count: 4, spread: 340 }),
    atk('rain', 2.6, 'baseR', { count: 4, spread: 340 }),
    atk('homing', 3, 'signL'),
    atk('homing', 3, 'signR'),
    atk('laser', 7, 'eye'),
  ], { rate: 1.1, minions: [minion('gunner', 2, 12, 'signL'), minion('carrier', 1, 4.5, 'capL')] }),
  phase(0, 'orbit', [
    atk('rain', 2.2, 'baseL', { count: 5, spread: 380 }),
    atk('rain', 2.2, 'baseR', { count: 5, spread: 380 }),
    atk('spiral', 4.2, 'spire', { count: 14 }),
    atk('fan', 2.6, 'eye', { count: 5, spread: 0.9 }),
    atk('laser', 6, 'signR'),
  ], { rate: 1.2, minions: [minion('gunner', 2, 10, 'signR'), minion('carrier', 1, 4.5, 'capL')] }),
]);

// The trench: in the last phase the core, a bare hull until then, takes full damage.
const fortress = boss('fortress', 'Star fortress', 235, { w: 760, h: 280 }, [
  armor('dish', -190, -70, 160, 120, 8),
  armor('plateL', -120, 40, 150, 110, 6),
  armor('plateR', 120, 40, 150, 110, 6),
  weak('turretL', -250, 70, 90, 60, 49),
  weak('turretR', 250, 70, 90, 60, 49),
  hull('core', 0, 60, 70, 90, 62),
], [
  phase(0.7, 'sway', [
    atk('fan', 2, 'turretL', { count: 3, spread: 0.3 }),
    atk('fan', 2, 'turretR', { count: 3, spread: 0.3 }),
    atk('fan', 4, 'dish', { count: 5, spread: 0.6 }),
  ], { rate: 0.8, minions: [minion('carrier', 1, 4.5, 'plateL')] }),
  phase(0.4, 'hover', [
    atk('laser', 5.5, 'dish'),
    atk('fan', 2.8, 'turretL', { count: 5, spread: 0.7 }),
    atk('fan', 2.8, 'turretR', { count: 5, spread: 0.7 }),
  ], { minions: [minion('diver', 3, 9, 'plateR'), minion('carrier', 1, 4.5, 'plateL')] }),
  phase(0, 'charge', [
    atk('ring', 3.2, 'core', { count: 14 }),
    atk('rain', 3.6, 'core', { count: 7, spread: 420 }),
    atk('laser', 6, 'dish'),
  ], { open: ['core'], minions: [minion('carrier', 1, 4.5, 'plateL')] }),
]);

// Rests 40 px lower than first set (ruling R28) so the helmet and its crest clear the HUD.
const shogun = boss('shogun', 'Shogun mecha', 320, { w: 600, h: 440 }, [
  armor('helm', 0, -170, 120, 90, 6),
  armor('torso', 0, -40, 200, 150, 10),
  armor('pauldronL', -160, -70, 110, 110, 6),
  armor('pauldronR', 160, -70, 110, 110, 6),
  weak('core', 0, 70, 90, 90, 70),
  armor('legL', -130, 130, 90, 170, 6),
  armor('legR', 130, 130, 90, 170, 6),
  weak('bladeL', -270, 60, 40, 230, 34),
  weak('bladeR', 270, 60, 40, 230, 34),
], [
  phase(0.6, 'sway', [
    atk('shuriken', 2.4, 'bladeL'),
    atk('shuriken', 2.4, 'bladeR'),
    atk('shuriken', 3.6, 'helm'),
  ], { rate: 0.9, minions: [minion('carrier', 1, 5, 'torso')] }),
  phase(0.28, 'charge', [
    atk('shuriken', 2, 'bladeL'),
    atk('shuriken', 2, 'bladeR'),
    atk('shuriken', 2.8, 'core'),
    atk('fan', 4.5, 'core', { count: 5, spread: 1 }),
  ], { minions: [minion('carrier', 1, 5, 'torso')] }),
  phase(0, 'orbit', [
    atk('laser', 6, 'bladeL'),
    atk('laser', 7, 'bladeR'),
    atk('shuriken', 1.9, 'helm'),
    atk('shuriken', 2.2, 'core'),
    atk('spiral', 5, 'core', { count: 16 }),
  ], { rate: 1.15, minions: [minion('carrier', 1, 5, 'torso')] }),
]);

export const BOSS_DEFS = [mothership, pyramid, fortress, shogun, ...BOSSES2, ...BOSSES3, ...BOSSES4, ...BOSSES5];

const BY_KIND = new Map(BOSS_DEFS.map((d) => [d.kind, d]));

// The static definition of a boss kind (the world keeps only the kind and the live part state).
export const bossDef = (kind) => BY_KIND.get(kind);
