import { boss, weak, armor, atk, minion, phase } from './bosses-kit.js';

// The bosses of worlds 13-15, the side-world bosses of the Sunset Armada, the Ember Carnival and the
// Lantern Deep. Like the other side-world bosses they never charge: they sway, hover, then circle. Each
// rests high enough that every part is below the HUD (R28), and ends no lower than the grimoire.

// The Thunder Galleon, a dreadnought airship of brass and patched sail. The mast (mainmast and
// crow's nest) stands over the deck; the lit bridge sits at the centre and the furnace-keel hangs
// under it, with a gun deck low at each side, so shots from below always find a weak part. A
// propeller pod stands out on each flank. The bridge shoots aimed bolts and, in the last phase, the
// laser; the gun decks fire fans; the mast drops rain (shells); the keel breathes rings; the pods
// send the divers (the gliders of the armada). About the Agent core's weight: it rests at 260 with
// the bridge's glass low in the frame (top -55), so at the top of its orbit the face is well clear
// of the HUD (R28), and the gun decks and the keel end no lower than the grimoire's quills.
const galleon = boss('galleon', 'Thunder Galleon', 260, { w: 700, h: 340 }, [
  armor('mast', 0, -114, 90, 92, 8),
  weak('bridge', 0, -20, 160, 90, 84),
  armor('propL', -265, -45, 120, 130, 7),
  armor('propR', 265, -45, 120, 130, 7),
  weak('gunL', -190, 85, 110, 80, 46),
  weak('gunR', 190, 85, 110, 80, 46),
  weak('keel', 0, 95, 140, 90, 38),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2.2, 'bridge'),
    atk('fan', 3.4, 'gunL', { count: 3, spread: 0.5 }),
    atk('fan', 3.4, 'gunR', { count: 3, spread: 0.5 }),
    atk('rain', 4.4, 'mast', { count: 5, spread: 400 }),
  ], { rate: 1, minions: [minion('carrier', 1, 4.5, 'mast')] }),
  phase(0.3, 'hover', [
    atk('aimed', 2, 'bridge'),
    atk('fan', 3, 'gunL', { count: 3, spread: 0.6 }),
    atk('fan', 3, 'gunR', { count: 3, spread: 0.6 }),
    atk('rain', 3.6, 'mast', { count: 6, spread: 440 }),
    atk('ring', 5.6, 'keel', { count: 12 }),
  ], { rate: 1, minions: [minion('diver', 2, 10, 'propL'), minion('carrier', 1, 4.5, 'mast')] }),
  phase(0, 'orbit', [
    atk('aimed', 2, 'bridge'),
    atk('fan', 3, 'gunL', { count: 5, spread: 0.8 }),
    atk('fan', 3.4, 'gunR', { count: 4, spread: 0.7 }),
    atk('rain', 3.4, 'mast', { count: 6, spread: 460 }),
    atk('ring', 5.2, 'keel', { count: 14 }),
    atk('laser', 6.4, 'bridge'),
  ], { rate: 1.15, minions: [minion('diver', 3, 8.5, 'propR'), minion('carrier', 1, 4.5, 'mast')] }),
]);

// The Grand Carousel, a flying fairground carousel, all gilt and mirrors. The striped canopy's crown
// (and its pennant) tops it; the band organ sits at its heart with the turning drum under the floor
// beneath it, and a hanging lantern low at each side, so shots from below always find a weak part.
// A carved horse on its brass pole stands out on each flank. The organ shoots aimed bolts and, in the
// last phase, the laser; the lanterns fire fans; the crown drops confetti (rain, shells); the drum
// breathes rings; the horses send the divers. About the galleon's weight and no lower than it: it
// rests at 260 with the organ low in the frame (top -58), so at the top of its orbit the organ is
// well clear of the HUD (R28). Its minions may be shells (world 14), and one that bursts beside the
// carousel hurts it.
const carousel = boss('carousel', 'The Grand Carousel', 260, { w: 700, h: 340 }, [
  armor('crown', 0, -116, 150, 84, 8),
  weak('organ', 0, -8, 170, 100, 80),
  armor('horseL', -262, -45, 130, 140, 7),
  armor('horseR', 262, -45, 130, 140, 7),
  weak('lampL', -172, 78, 90, 104, 48),
  weak('lampR', 172, 78, 90, 104, 48),
  weak('drum', 0, 94, 120, 88, 40),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2.3, 'organ'),
    atk('fan', 3.5, 'lampL', { count: 3, spread: 0.5 }),
    atk('fan', 3.6, 'lampR', { count: 3, spread: 0.5 }),
    atk('rain', 4.5, 'crown', { count: 5, spread: 420 }),
  ], { rate: 1, minions: [minion('carrier', 1, 4.5, 'crown')] }),
  phase(0.3, 'hover', [
    atk('aimed', 2, 'organ'),
    atk('fan', 3, 'lampL', { count: 3, spread: 0.6 }),
    atk('fan', 3, 'lampR', { count: 3, spread: 0.6 }),
    atk('rain', 3.6, 'crown', { count: 6, spread: 450 }),
    atk('ring', 5.6, 'drum', { count: 12 }),
  ], { rate: 1, minions: [minion('diver', 2, 10, 'horseL'), minion('carrier', 1, 4.5, 'crown')] }),
  phase(0, 'orbit', [
    atk('aimed', 2, 'organ'),
    atk('fan', 3, 'lampL', { count: 5, spread: 0.8 }),
    atk('fan', 3.4, 'lampR', { count: 4, spread: 0.7 }),
    atk('rain', 3.4, 'crown', { count: 6, spread: 470 }),
    atk('ring', 5.2, 'drum', { count: 14 }),
    atk('laser', 6.4, 'organ'),
  ], { rate: 1.3, minions: [minion('diver', 3, 8.5, 'horseR'), minion('carrier', 1, 4.5, 'crown')] }),
]);

// The Lantern Leviathan, a colossal anglerfish of the lightless deep. The crest (its dorsal spines, from
// which the lure's stalk rises) tops it; the open maw sits at its heart with the row of belly lights
// beneath it, and a huge pale eye at each side and a pectoral fin out on each flank, so shots from
// below always find a weak part. The eyes take aim and fire fans; the maw only fires the laser, in the
// last phase, because the maelstrom (world 15's gravity well, at 960, 300) lies just under it at rest
// and drinks its bolts; the crest drops spines (rain, falling); the belly breathes rings; the fins
// send the divers. The world's own powers (the pearls, the trident) help a great deal against it, so
// it fires faster than the carousel (rates 1.15, 1.15, 1.6). About the carousel's weight and no lower than it: it rests at 260 with the crest's top at
// the HUD's edge and the maw low in the frame (top -65), so at the top of its orbit the maw and the
// eyes are well clear of the HUD (R28). The lure (the art's) stays above the crest, under y -158.
const angler = boss('angler', 'The Lantern Leviathan', 260, { w: 700, h: 340 }, [
  armor('crest', 0, -114, 180, 92, 8),
  weak('maw', 0, -15, 180, 100, 80),
  armor('finL', -270, -30, 120, 150, 7),
  armor('finR', 270, -30, 120, 150, 7),
  weak('eyeL', -155, -45, 90, 90, 46),
  weak('eyeR', 155, -45, 90, 90, 46),
  weak('belly', 0, 96, 200, 80, 40),
], [
  phase(0.65, 'sway', [
    atk('aimed', 4.6, 'eyeL'),
    atk('aimed', 4.6, 'eyeR'),
    atk('fan', 3.5, 'eyeL', { count: 3, spread: 0.5 }),
    atk('fan', 3.6, 'eyeR', { count: 3, spread: 0.5 }),
    atk('rain', 4.5, 'crest', { count: 5, spread: 420 }),
  ], { rate: 1.15, minions: [minion('carrier', 1, 4.5, 'crest')] }),
  phase(0.3, 'hover', [
    atk('aimed', 4, 'eyeL'),
    atk('aimed', 4, 'eyeR'),
    atk('fan', 2.8, 'eyeL', { count: 4, spread: 0.7 }),
    atk('fan', 2.8, 'eyeR', { count: 4, spread: 0.7 }),
    atk('rain', 3.4, 'crest', { count: 7, spread: 450 }),
    atk('ring', 5.6, 'belly', { count: 12 }),
  ], { rate: 1.15, minions: [minion('diver', 2, 10, 'finL'), minion('carrier', 1, 4.5, 'crest')] }),
  phase(0, 'orbit', [
    atk('aimed', 4, 'eyeL'),
    atk('aimed', 4, 'eyeR'),
    atk('fan', 2.8, 'eyeL', { count: 6, spread: 0.9 }),
    atk('fan', 3, 'eyeR', { count: 5, spread: 0.8 }),
    atk('rain', 3.2, 'crest', { count: 7, spread: 470 }),
    atk('ring', 5.2, 'belly', { count: 14 }),
    atk('laser', 6.4, 'maw'),
  ], { rate: 1.6, minions: [minion('diver', 3, 8.5, 'finR'), minion('carrier', 1, 4.5, 'crest')] }),
]);

export const BOSSES4 = [galleon, carousel, angler];
