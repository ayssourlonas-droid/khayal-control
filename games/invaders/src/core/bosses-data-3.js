import { boss, weak, armor, atk, minion, phase } from './bosses-kit.js';

// The bosses of worlds 9-12, the side-world bosses, none of which charges: they sway, hover, then circle.
// All rest high enough that every part is below the HUD (R28); the Count, the wyrm and the grimoire
// sit no lower than the behemoth.

// The boss of world 9: the Abyssal behemoth, a sea beast rising out of the harbour. Its maw breathes
// the laser, its gills fan out spray, its crest rains, and its claws send the divers.

const behemoth = boss('behemoth', 'Abyssal behemoth', 255, { w: 640, h: 330 }, [
  armor('crest', 0, -120, 240, 60, 8),
  armor('skull', 0, -45, 200, 110, 10),
  weak('maw', 0, 55, 120, 70, 80),
  weak('gillL', -170, 0, 80, 90, 44),
  weak('gillR', 170, 0, 80, 90, 44),
  armor('clawL', -270, 70, 100, 140, 6),
  armor('clawR', 270, 70, 100, 140, 6),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2.4, 'maw'),
    atk('fan', 4, 'gillL', { count: 3, spread: 0.5 }),
    atk('fan', 4, 'gillR', { count: 3, spread: 0.5 }),
  ], { rate: 1, minions: [minion('carrier', 1, 4.5, 'crest')] }),
  phase(0.3, 'hover', [
    atk('rain', 3.4, 'crest', { count: 6, spread: 420 }),
    atk('laser', 7, 'maw'),
    atk('fan', 3, 'gillL', { count: 4, spread: 0.6 }),
    atk('fan', 3, 'gillR', { count: 4, spread: 0.6 }),
  ], { minions: [minion('diver', 2, 10, 'clawL'), minion('carrier', 1, 4.5, 'crest')] }),
  phase(0, 'orbit', [
    atk('ring', 4.4, 'maw', { count: 14 }),
    atk('laser', 7.5, 'maw'),
    atk('rain', 3.2, 'crest', { count: 7, spread: 480 }),
  ], { rate: 1.1, minions: [minion('diver', 3, 9, 'clawR'), minion('carrier', 1, 4.5, 'crest')] }),
]);

// The boss of world 10: the Crimson Count, a vampire lord whose black cape spreads like wings. The
// collar and the head stand over the cape; the heart-amulet hangs at the centre, bottom, and the
// clawed hands at the cape's lower corners, so shots from below always find a weak part. His eyes
// shoot aimed bolts, his claws fan, his heart breathes rings and spirals, and the cape's wings loose
// homing bats and send the divers (the bat swarm of the last phase). A bit gentler than the behemoth:
// no laser, no rain, about the shogun's pace. He rests at 270, not 250, so at the top of his orbit
// the collar and face stay clear of the HUD (as the shogun's helmet does, R28).
const count = boss('count', 'Crimson Count', 270, { w: 700, h: 340 }, [
  armor('collar', 0, -120, 240, 60, 8),
  armor('head', 0, -70, 120, 100, 10),
  armor('wingL', -215, -20, 270, 240, 8),
  armor('wingR', 215, -20, 270, 240, 8),
  weak('heart', 0, 65, 100, 100, 86),
  weak('clawL', -300, 85, 80, 110, 34),
  weak('clawR', 300, 85, 80, 110, 34),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2.6, 'head'),
    atk('fan', 4.2, 'clawL', { count: 3, spread: 0.5 }),
    atk('fan', 4.2, 'clawR', { count: 3, spread: 0.5 }),
  ], { rate: 0.9, minions: [minion('carrier', 1, 4.5, 'collar')] }),
  phase(0.3, 'hover', [
    atk('aimed', 2.8, 'head'),
    atk('ring', 5.4, 'heart', { count: 12 }),
    atk('homing', 4.4, 'wingL'),
    atk('fan', 3.6, 'clawR', { count: 4, spread: 0.6 }),
  ], { minions: [minion('diver', 2, 10, 'wingL'), minion('carrier', 1, 4.5, 'collar')] }),
  phase(0, 'orbit', [
    atk('aimed', 2.6, 'head'),
    atk('spiral', 5, 'heart', { count: 14 }),
    atk('homing', 3.8, 'wingR'),
    atk('fan', 3.4, 'clawL', { count: 4, spread: 0.6 }),
    atk('ring', 6, 'heart', { count: 12 }),
  ], { minions: [minion('diver', 3, 9, 'wingR'), minion('carrier', 1, 4.5, 'collar')] }),
]);

// The boss of world 11: the Crystal Wyrm, a serpent of ice rising out of the glacier. The crest and
// the head stand over its coils; the maw hangs at the centre, bottom, and a glowing crystal node
// sits in each coil above the low outer coils, so shots from below always find a weak part. The
// eyes shoot aimed bolts, the gems fan and loose the ice shards (shuriken), the maw breathes the
// frost laser and an ice-nova ring, the crest rains hail, and the coils send the snow owls (divers).
// A step harder than the behemoth for its shards and its denser mix, easier than the hive queen: it
// never charges, and it moves at 1.0-1.25 (the queen at 1.4). It rests at 260 and its head sits low
// in the frame (top -105), so at the top of its orbit the face is just clear of the HUD (R28); the
// coils end no lower than the Count's claws.
const wyrm = boss('wyrm', 'Crystal Wyrm', 260, { w: 700, h: 340 }, [
  armor('crest', 0, -135, 240, 44, 8),
  armor('head', 0, -55, 140, 100, 10),
  weak('maw', 0, 35, 110, 80, 82),
  weak('gemL', -185, 0, 80, 80, 52),
  weak('gemR', 185, 0, 80, 80, 52),
  armor('coilL', -270, 90, 160, 100, 5),
  armor('coilR', 270, 90, 160, 100, 5),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2.3, 'head'),
    atk('fan', 3.2, 'gemL', { count: 3, spread: 0.5 }),
    atk('shuriken', 3.2, 'gemR'),
  ], { rate: 1, minions: [minion('carrier', 1, 4.5, 'crest')] }),
  phase(0.3, 'hover', [
    atk('aimed', 2, 'head'),
    atk('shuriken', 2.6, 'gemL'),
    atk('fan', 3.2, 'gemR', { count: 4, spread: 0.6 }),
    atk('rain', 3.3, 'crest', { count: 6, spread: 420 }),
    atk('laser', 6.4, 'maw'),
  ], { rate: 1.1, minions: [minion('diver', 3, 9, 'coilL'), minion('carrier', 1, 4.5, 'crest')] }),
  phase(0, 'orbit', [
    atk('aimed', 1.8, 'head'),
    atk('shuriken', 2.8, 'gemL'),
    atk('shuriken', 2.8, 'gemR'),
    atk('ring', 3.8, 'maw', { count: 14 }),
    atk('rain', 3, 'crest', { count: 8, spread: 520 }),
    atk('laser', 6, 'maw'),
  ], { rate: 1.25, minions: [minion('diver', 4, 6.5, 'coilR'), minion('carrier', 1, 4.5, 'crest')] }),
]);

// The boss of world 12: the Grand Grimoire, a living spellbook floating open and upright. The crown
// (the spine's gilded headband) stands over the spread; the sigil-eye sits on its centre and the
// clasp hangs below it, with a quill at the lower outer corner of each open page, so shots from
// below always find a weak part. The eye shoots aimed bolts and, in the last phase, the laser; the
// quills write fans and spirals; the clasp breathes rings; the pages loose homing sparks and, from
// phase 2, send the paper cranes (divers). About the Agent core's weight and clearly above the
// wyrm: it never charges, and it moves at 1.0-1.3. It rests at 260 with its eye low in the frame
// (top -80), so at the top of its orbit the face is well clear of the HUD (R28); its quills and
// clasp end no lower than the wyrm's coils.
const grimoire = boss('grimoire', 'Grand Grimoire', 260, { w: 700, h: 340 }, [
  armor('crown', 0, -140, 260, 40, 8),
  weak('eye', 0, -30, 120, 100, 84),
  armor('pageL', -205, -20, 250, 230, 7),
  armor('pageR', 205, -20, 250, 230, 7),
  weak('quillL', -290, 90, 70, 100, 46),
  weak('quillR', 290, 90, 70, 100, 46),
  weak('clasp', 0, 95, 90, 90, 38),
], [
  phase(0.65, 'sway', [
    atk('aimed', 2.2, 'eye'),
    atk('fan', 3.2, 'quillL', { count: 3, spread: 0.5 }),
    atk('spiral', 5, 'quillR', { count: 12 }),
    atk('homing', 4.6, 'pageL'),
  ], { rate: 1, minions: [minion('carrier', 1, 4.5, 'crown')] }),
  phase(0.3, 'hover', [
    atk('aimed', 2, 'eye'),
    atk('fan', 3, 'quillL', { count: 4, spread: 0.6 }),
    atk('spiral', 4.8, 'quillR', { count: 14 }),
    atk('homing', 3.6, 'pageR'),
    atk('ring', 5.2, 'clasp', { count: 12 }),
  ], { rate: 1.15, minions: [minion('diver', 2, 10, 'pageL'), minion('carrier', 1, 4.5, 'crown')] }),
  phase(0, 'orbit', [
    atk('aimed', 1.8, 'eye'),
    atk('spiral', 4.4, 'quillL', { count: 16 }),
    atk('fan', 2.8, 'quillR', { count: 5, spread: 0.8 }),
    atk('homing', 3.2, 'pageL'),
    atk('ring', 4.6, 'clasp', { count: 14 }),
    atk('laser', 6.4, 'eye'),
  ], { rate: 1.3, minions: [minion('diver', 3, 7.5, 'pageR'), minion('carrier', 1, 4.5, 'crown')] }),
]);

export const BOSSES3 = [behemoth, count, wyrm, grimoire];
