import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fingerprint } from './fingerprint-kit.js';
import { POWERS } from '../../src/core/kinds.js';
import { makeRun } from '../../src/core/replay.js';

// World 13 adds two rules (the wingmen power and the broadside twist) that must touch no other world:
// worlds 1-12 play, draw rng and replay exactly as before. These are the fingerprints of one level of
// each world (two for a few) flown by the autopilot for up to 60 s, taken on commit 1ddc0b8, the last
// before world 13: the same seed and inputs give the same states, the same rng state and the same
// events. If a rule change moves any of them, either it leaked out of its world or it is meant to, and
// then these are re-pinned and RUN_V goes up. R66 (the round tallied at the clear, RUN_V 9) re-pinned
// every table below: each level plays out as before, tick for tick and event for event, and only the
// score at the clear, with the state hash that holds it, moved.
// R68 (the pointer is the ship, RUN_V 10) changed the movement of every world, so every table below was
// re-taken then, and each level now plays out differently on purpose: the autopilot flies a hand, and a ship
// that crosses the field in a tick is hit by what lay in its way. Nothing else moved: worlds-idle.test.js pins the
// same 29 levels flown by a ship that stands still, taken before R68 and unchanged by it.
// R70 (the base gun fires every 9 ticks instead of 11, RUN_V 11) re-took every table here and in worlds-idle.test.js:
// more shots change every fight, and nothing else moved.
const BEFORE_WORLD_13 = {
  'w1-2': {fold: 1827019114, end: '1810:156600:247ad624cc3a31fa', pickup: 1, power: 1, kill: 72, shipHit: 0, fire: 221},
  'w1-4': {fold: -1140449895, end: '2802:286600:69e70d4260c3e358', pickup: 4, power: 5, kill: 125, shipHit: 0, fire: 322},
  'w2-3': {fold: -1206026521, end: '1860:226900:40483c0f4a15c1fc', pickup: 2, power: 3, kill: 81, shipHit: 0, fire: 238},
  'w3-3': {fold: 317543907, end: '1790:212100:d60db00fa87bc079', pickup: 6, power: 6, kill: 84, shipHit: 0, fire: 191},
  'w4-4': {fold: -1476016634, end: '2625:326500:ac0cb415bdd83ad6', pickup: 4, power: 7, kill: 111, shipHit: 0, fire: 447},
  'w5-5': {fold: 1234322943, end: '1859:64900:fbd51ccf5cb57c45', pickup: 6, power: 5, kill: 8, shipHit: 0, fire: 252},
  'w6-3': {fold: 558022011, end: '2259:195660:45b90b9968d4c334', pickup: 11, power: 11, kill: 81, shipHit: 0, fire: 267},
  'w7-2': {fold: -1169953883, end: '2588:172270:1a87d37c2eb901e9', pickup: 7, power: 6, kill: 74, shipHit: 0, fire: 292},
  'w8-4': {fold: 346373932, end: '2109:232500:905443caeee844f0', pickup: 10, power: 8, kill: 91, shipHit: 0, fire: 216},
  'w9-2': {fold: -1734403848, end: '1689:210000:9ee7cd50557c069a', pickup: 4, power: 4, kill: 78, shipHit: 0, fire: 228},
  'w10-3': {fold: 820591058, end: '1712:200000:dc32f665c899358d', pickup: 3, power: 4, kill: 75, shipHit: 0, fire: 278},
  'w11-3': {fold: 1156442391, end: '2295:373400:efbcc8a8280af732', pickup: 6, power: 10, kill: 129, shipHit: 0, fire: 336},
  'w12-2': {fold: 1159612519, end: '1271:215000:2f0afb780fd6a3c4', pickup: 6, power: 5, kill: 75, shipHit: 0, fire: 169},
  'w12-5': {fold: -2028940213, end: '3442:72950:54a97ca8ffd49eb2', pickup: 9, power: 10, kill: 11, shipHit: 0, fire: 423},
};

for (const [id, expected] of Object.entries(BEFORE_WORLD_13)) {
  test(`${id} plays out exactly as it did before world 13`, () => {
    assert.deepEqual(fingerprint(id), expected);
  });
}

// World 14 adds one rule (the fireworks twist: shells, fuses, the burst) that must touch no other
// world, world 13 included: the aliens of every other world get no `shell` field and no extra rng
// draw, the twist state gets no fuses, and the state hash adds nothing. These are two wave levels of
// world 13 and its boss level, taken on commit cd58e7f, the last before world 14, and held to the same
// rule as the fingerprints above.
const BEFORE_WORLD_14 = {
  'w13-1': {fold: -488651813, end: '1077:124000:e263ce211f905e54', pickup: 1, power: 1, kill: 51, shipHit: 0, fire: 125},
  'w13-3': {fold: 757567773, end: '1536:189720:a4e1fdc50dbc07dd', pickup: 4, power: 0, kill: 75, shipHit: 0, fire: 201},
  'w13-5': {fold: 357484235, end: '1797:56300:ca047c740ed9e64e', pickup: 4, power: 3, kill: 7, shipHit: 0, fire: 241},
};

for (const [id, expected] of Object.entries(BEFORE_WORLD_14)) {
  test(`${id} plays out exactly as it did before world 14`, () => {
    assert.deepEqual(fingerprint(id), expected);
  });
}

// World 15 adds two powers (the pearls and the trident) and the angler boss, none of which may touch any
// other world, world 14 included: the powers drop in world 15 alone (powersFor), the shot only changes
// under the trident, the pearls' cooldown field exists only on an alien a pearl has hit, and the state
// hash adds nothing. These are two wave levels of world 14 and its boss level, taken on commit 5a73adc,
// the last before world 15, and held to the same rule as the fingerprints above.
const BEFORE_WORLD_15 = {
  'w14-1': {fold: 744208696, end: '1094:158800:c9883acd5bbd4a91', pickup: 4, power: 2, kill: 65, shipHit: 0, fire: 79},
  'w14-3': {fold: -1983509421, end: '1047:271000:fc83dea1f9203a2a', pickup: 6, power: 4, kill: 113, shipHit: 0, fire: 127},
  'w14-5': {fold: 695462808, end: '2436:56400:ec4a54b07815251c', pickup: 5, power: 5, kill: 7, shipHit: 0, fire: 262},
};

for (const [id, expected] of Object.entries(BEFORE_WORLD_15)) {
  test(`${id} plays out exactly as it did before world 15`, () => {
    assert.deepEqual(fingerprint(id), expected);
  });
}

// World 16 adds one power (the mirror twin) and the moth boss, and reuses world 7's reassemble twist:
// none of it may touch any other world, world 15 included. The power drops in world 16 alone
// (powersFor), the twin's shot exists only under the power, and the state hash adds nothing. These are
// two wave levels of world 15 and its boss level, taken on commit f7a807a, the last before world 16,
// and held to the same rule as the fingerprints above.
const BEFORE_WORLD_16 = {
  'w15-1': {fold: 726148812, end: '1001:165200:8521685a6096c182', pickup: 4, power: 4, kill: 65, shipHit: 0, fire: 117},
  'w15-3': {fold: -1450948112, end: '2077:221170:cacbf4ed2ba3c1fc', pickup: 13, power: 13, kill: 105, shipHit: 0, fire: 278},
  'w15-5': {fold: -223682165, end: '2603:66600:968b38c140fb3ae3', pickup: 8, power: 9, kill: 13, shipHit: 0, fire: 319},
};

for (const [id, expected] of Object.entries(BEFORE_WORLD_16)) {
  test(`${id} plays out exactly as it did before world 16`, () => {
    assert.deepEqual(fingerprint(id), expected);
  });
}

// World 17 adds one twist (the breath) and the Craving boss: none of it may touch any other world, world 16
// included. The breath's state is made for world 17 alone, the state hash adds nothing elsewhere and its
// rule draws no rng. These are two wave levels of world 16 and its boss level, taken on commit 034947a,
// the last before world 17, and held to the same rule as the fingerprints above.
const BEFORE_WORLD_17 = {
  'w16-1': {fold: -1516998583, end: '1202:146300:5b91f3cc4ca9ab35', pickup: 3, power: 2, kill: 65, shipHit: 0, fire: 168},
  'w16-3': {fold: -1111077021, end: '1776:265400:97d2c7bbe2955d1e', pickup: 10, power: 9, kill: 106, shipHit: 0, fire: 239},
  'w16-5': {fold: 159751391, end: '2220:57400:56e2e92ef7f7429c', pickup: 5, power: 4, kill: 7, shipHit: 0, fire: 314},
};

for (const [id, expected] of Object.entries(BEFORE_WORLD_17)) {
  test(`${id} plays out exactly as it did before world 17`, () => {
    assert.deepEqual(fingerprint(id), expected);
  });
}

// World 18 adds free flight (R67: the zone under the HUD, rams by any alien, dragged homing bullets), all
// behind its levels' `free` flag: none of it may touch any other world, world 17 included. These are two
// wave levels of world 17 and its boss level, taken on commit e9193a5, the last before world 18, and held
// to the same rule as the fingerprints above.
const BEFORE_WORLD_18 = {
  'w17-1': {fold: 648893129, end: '1155:211540:bd7f8b289a7a354b', pickup: 9, power: 7, kill: 83, shipHit: 0, fire: 178},
  'w17-3': {fold: 302684716, end: '1903:234100:bfd921144cd2c3c6', pickup: 10, power: 8, kill: 92, shipHit: 0, fire: 221},
  'w17-5': {fold: 2043149313, end: '2489:59430:747399763bc831e2', pickup: 6, power: 4, kill: 8, shipHit: 0, fire: 343},
};

for (const [id, expected] of Object.entries(BEFORE_WORLD_18)) {
  test(`${id} plays out exactly as it did before world 18`, () => {
    assert.deepEqual(fingerprint(id), expected);
  });
}

test('the replay version is 11 (R70), and the six powers stay the six', () => {
  assert.equal(makeRun('w1-1', 1, [], { score: 0, stars: 0 }).v, 11);
  assert.deepEqual(POWERS, ['spread', 'laser', 'rapid', 'shield', 'homing', 'slow']);
});
