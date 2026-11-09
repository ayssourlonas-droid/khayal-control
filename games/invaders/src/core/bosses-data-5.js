import { boss, weak, armor, atk, minion, phase } from './bosses-kit.js';

// The bosses of worlds 16-18, the side-world bosses of the Glass Cathedral, of Ash to Air and of Anvil Sky.
// Like the other side-world bosses they never charge: they sway, hover, then circle. They rest high enough that
// every part is below the HUD (R28), and end no lower than the grimoire.

// The Vesper Moth, a colossal moth whose wings are stained-glass windows. The crown (its head and
// feathered antennae) tops it; the rose-window jewel of the thorax sits at its heart with the banded
// abdomen under it, and a stained-glass forewing stands out on each flank with an eyespot of the
// hindwing low beneath it, so shots from below always find a weak part. The eyespots take aim; the
// wings fan their light and drop glass scales (rain, falling); the abdomen breathes rings; the heart
// fires the laser in the last phase only, as the beam of dawn through the rose window; the wings send
// the divers. The mirror twin (world 16's power) doubles the ship's gun against it, and no maelstrom
// drinks its bolts, so it fires faster than the angler (rates 1.25, 1.25, 1.7; at 1.1, 1.1, 1.5 it was
// the easiest late boss for the bot). About the angler's weight and no lower than the grimoire:
// it rests at 260 with the crown's top at the HUD's edge (-158, where the antennae stop) and the heart
// low in the frame (top -60), so at the top of its orbit the heart and the eyespots are well clear of
// the HUD (R28). No two parts touch.
const moth = boss('moth', 'The Vesper Moth', 260, { w: 760, h: 340 }, [
  armor('crown', 0, -112, 200, 92, 8),
  weak('heart', 0, -10, 150, 100, 80),
  armor('wingL', -245, -58, 270, 156, 7),
  armor('wingR', 245, -58, 270, 156, 7),
  weak('spotL', -200, 82, 120, 106, 46),
  weak('spotR', 200, 82, 120, 106, 46),
  weak('tail', 0, 92, 130, 96, 40),
], [
  phase(0.65, 'sway', [
    atk('aimed', 4.6, 'spotL'),
    atk('aimed', 4.6, 'spotR'),
    atk('fan', 3.5, 'wingL', { count: 3, spread: 0.5 }),
    atk('fan', 3.6, 'wingR', { count: 3, spread: 0.5 }),
    atk('rain', 4.5, 'wingL', { count: 5, spread: 420 }),
  ], { rate: 1.25, minions: [minion('carrier', 1, 4.5, 'crown')] }),
  phase(0.3, 'hover', [
    atk('aimed', 4, 'spotL'),
    atk('aimed', 4, 'spotR'),
    atk('fan', 2.8, 'wingL', { count: 4, spread: 0.7 }),
    atk('fan', 2.8, 'wingR', { count: 4, spread: 0.7 }),
    atk('rain', 3.4, 'wingR', { count: 7, spread: 450 }),
    atk('ring', 5.6, 'tail', { count: 12 }),
  ], { rate: 1.25, minions: [minion('diver', 2, 10, 'wingL'), minion('carrier', 1, 4.5, 'crown')] }),
  phase(0, 'orbit', [
    atk('aimed', 4, 'spotL'),
    atk('aimed', 4, 'spotR'),
    atk('fan', 2.8, 'wingL', { count: 6, spread: 0.9 }),
    atk('fan', 3, 'wingR', { count: 5, spread: 0.8 }),
    atk('rain', 3.2, 'wingL', { count: 7, spread: 470 }),
    atk('ring', 5.2, 'tail', { count: 14 }),
    atk('laser', 6.4, 'heart'),
  ], { rate: 1.7, minions: [minion('diver', 3, 8.5, 'wingR'), minion('carrier', 1, 4.5, 'crown')] }),
]);

// The Craving, a giant of smoke on a throne of ash: a crown of half-smoked cigarettes on top, ember eyes
// at the sides of the head with the burning maw between them, a smoke arm ending in a grasping claw on
// each flank, and the glowing rim of the ashtray under the head, where its butts smoulder. The eyes take
// aim; the claws fan; the crown rains embers and ash; the tray breathes rings; the maw fires the laser
// and homing shots from the hover phase on (an eye joins the homing in the last). World 17 is the
// hardest world, so this is a world-7-hard boss, tuned against the titan with the breath included: the
// titan's hover phase kills with homing shots and a laser, and so does this one's. It is heavier than
// the titan (hp 268 against 225) and rests at 380, the lowest of all bosses (the low point of its orbit
// keeps the tray above ARENA_FLOOR), so its shots start near the ship, as the titan's do from its
// cannons; its rates (the pace it moves at) are near the titan's. The crown's top is 158 above the
// centre, so at the top of its orbit every part is well clear of the HUD (R28). The tray shields the
// maw from below as the abdomen shields the moth's heart, and the eyes are open to the sides of it. No
// two parts touch.
const craving = boss('craving', 'The Craving', 380, { w: 740, h: 340 }, [
  armor('crown', 0, -118, 280, 80, 8),
  weak('maw', 0, -14, 150, 112, 92),
  armor('clawL', -288, -10, 150, 200, 7),
  armor('clawR', 288, -10, 150, 200, 7),
  weak('eyeL', -150, -36, 110, 76, 52),
  weak('eyeR', 150, -36, 110, 76, 52),
  weak('tray', 0, 96, 280, 88, 50),
], [
  phase(0.65, 'sway', [
    atk('aimed', 3.2, 'eyeL'),
    atk('aimed', 3.2, 'eyeR'),
    atk('fan', 3.0, 'clawL', { count: 3, spread: 0.45 }),
    atk('fan', 3.1, 'clawR', { count: 3, spread: 0.45 }),
    atk('rain', 3.8, 'crown', { count: 6, spread: 460 }),
  ], { rate: 0.9, minions: [minion('carrier', 1, 4.5, 'crown')] }),
  phase(0.3, 'hover', [
    atk('aimed', 3.2, 'eyeL'),
    atk('aimed', 3.2, 'eyeR'),
    atk('fan', 2.8, 'clawL', { count: 4, spread: 0.65 }),
    atk('fan', 2.8, 'clawR', { count: 4, spread: 0.65 }),
    atk('rain', 3.4, 'crown', { count: 7, spread: 480 }),
    atk('ring', 4.6, 'tray', { count: 14 }),
    atk('homing', 2.8, 'maw'),
    atk('laser', 7, 'maw'),
  ], { rate: 1.0, minions: [minion('diver', 2, 11, 'clawL'), minion('carrier', 1, 4.5, 'crown')] }),
  phase(0, 'orbit', [
    atk('aimed', 3.4, 'eyeL'),
    atk('aimed', 3.4, 'eyeR'),
    atk('fan', 2.8, 'clawL', { count: 6, spread: 0.9 }),
    atk('fan', 3.0, 'clawR', { count: 5, spread: 0.8 }),
    atk('rain', 3.2, 'crown', { count: 9, spread: 520 }),
    atk('ring', 4.4, 'tray', { count: 16 }),
    atk('laser', 6, 'maw'),
    atk('homing', 3.2, 'eyeL'),
  ], { rate: 1.2, minions: [minion('diver', 3, 9, 'clawR'), minion('carrier', 1, 4.5, 'crown')] }),
]);

// The Squall Ray, a colossal manta of thundercloud gliding head-first down the storm: the boss of Anvil Sky,
// the first world where the ship flies free (R67), so it is built to be fought from every side. Iron anvil
// plates run down its spine at the top; the storm heart glows through its back at the centre; the great
// wings spread out on each flank, armoured in iron; a Tesla coil crackles at each wing tip, below and
// past the wing, where a ship climbing beside the ray meets it level (the side guns, world 18's power,
// reach it there) and a shot from below finds it too; the maw between its horn-fins is at the bottom,
// and shields the heart from below as the Craving's tray shields its maw. The coils take aim; the
// wings fan; the spine rains lightning; the maw fires homing shots from the first phase on, the ones
// the ship drags round into the ray (R67), and the laser in the last; the heart throws shock rings,
// so flying in close is paid for. It weighs about the moth's hp, below the Craving, but world 18 is the
// hardest world (d up to 1.0), so it fights as hard as the titan: homing fire from a coil as well as the maw
// from the hover on, and its last phase from 40 % of its hp. It rests at 280 with its spine's top 150 above the centre, so at
// rest every part is below the HUD, and at the top of its orbit the heart, the coils and the maw are well
// clear of it while the spine's top slips under its edge, as the moth's crown does (R28). No two parts touch,
// and every box lies inside the art: in a free level a box is what rams (free.js), so the swept wing's box is
// the strip under its trailing edge at the tip (x 120 to 390, y -48 to 34), not the wing's bounding box.
const ray = boss('ray', 'The Squall Ray', 280, { w: 900, h: 300 }, [
  armor('spine', 0, -116, 120, 68, 8),
  weak('heart', 0, -24, 150, 96, 84),
  armor('wingL', -255, -7, 270, 82, 8),
  armor('wingR', 255, -7, 270, 82, 8),
  weak('coilL', -390, 80, 110, 84, 46),
  weak('coilR', 390, 80, 110, 84, 46),
  weak('maw', 0, 86, 160, 80, 50),
], [
  phase(0.65, 'sway', [
    atk('aimed', 4.2, 'coilL'),
    atk('aimed', 4.2, 'coilR'),
    atk('fan', 3.5, 'wingL', { count: 3, spread: 0.5 }),
    atk('fan', 3.6, 'wingR', { count: 3, spread: 0.5 }),
    atk('rain', 4.4, 'spine', { count: 5, spread: 440 }),
    atk('homing', 3.0, 'maw'),
  ], { rate: 1.0, minions: [minion('carrier', 1, 4.5, 'spine')] }),
  phase(0.4, 'hover', [
    atk('aimed', 3.5, 'coilL'),
    atk('aimed', 3.5, 'coilR'),
    atk('fan', 2.7, 'wingL', { count: 4, spread: 0.7 }),
    atk('fan', 2.7, 'wingR', { count: 4, spread: 0.7 }),
    atk('rain', 3.3, 'spine', { count: 7, spread: 460 }),
    atk('ring', 4.8, 'heart', { count: 12 }),
    atk('homing', 2.5, 'maw'),
    atk('homing', 3.6, 'coilL'),
  ], { rate: 1.1, minions: [minion('diver', 2, 10, 'wingL'), minion('carrier', 1, 4.5, 'spine')] }),
  phase(0, 'orbit', [
    atk('aimed', 3.2, 'coilL'),
    atk('aimed', 3.2, 'coilR'),
    atk('fan', 2.6, 'wingL', { count: 6, spread: 0.9 }),
    atk('fan', 2.8, 'wingR', { count: 5, spread: 0.8 }),
    atk('rain', 2.8, 'spine', { count: 8, spread: 500 }),
    atk('ring', 4.4, 'heart', { count: 14 }),
    atk('homing', 2.1, 'maw'),
    atk('homing', 3.1, 'coilL'),
    atk('homing', 3.1, 'coilR'),
    atk('laser', 5.4, 'maw'),
  ], { rate: 1.3, minions: [minion('diver', 3, 9, 'wingR'), minion('carrier', 1, 4.5, 'spine')] }),
]);

export const BOSSES5 = [moth, craving, ray];
