import { boss, weak, armor, atk, minion, phase } from './bosses-kit.js';

// The bosses of worlds 5-8: the Hive queen, the Agent core, the Endoskeleton titan, the Singularity.
// The queen, the titan and the Singularity rest low enough that no part is under the HUD (R28).

const queen = boss('queen', 'Hive queen', 275, { w: 660, h: 360 }, [
  armor('crown', 0, -130, 200, 80, 6),
  armor('thorax', 0, -40, 260, 110, 8),
  weak('head', 0, 80, 130, 110, 83),
  weak('sacL', -200, 20, 110, 100, 45),
  weak('sacR', 200, 20, 110, 100, 45),
  armor('clawL', -290, 80, 70, 150, 6),
  armor('clawR', 290, 80, 70, 150, 6),
], [
  phase(0.65, 'hover', [
    atk('homing', 3, 'head'),
    atk('spiral', 5, 'sacL', { count: 12 }),
    atk('spiral', 5, 'sacR', { count: 12 }),
  ], { minions: [minion('diver', 2, 11, 'sacL'), minion('carrier', 1, 4.5, 'crown')] }),
  phase(0.3, 'sway', [
    atk('ring', 5, 'head', { count: 14 }),
    atk('homing', 2.4, 'head'),
    atk('homing', 4, 'sacL'),
    atk('homing', 4, 'sacR'),
  ], { rate: 1.2, minions: [minion('diver', 3, 8, 'sacR'), minion('carrier', 1, 4.5, 'crown')] }),
  phase(0, 'charge', [
    atk('spiral', 4.2, 'head', { count: 20 }),
    atk('rain', 3.2, 'crown', { count: 8, spread: 520 }),
    atk('homing', 2.2, 'head'),
  ], { rate: 1.4, minions: [minion('diver', 4, 6.5, 'sacL'), minion('carrier', 1, 4.5, 'crown')] }),
]);

const agent = boss('agent', 'Agent core', 250, { w: 560, h: 340 }, [
  armor('halo', 0, -120, 400, 40, 6),
  armor('nodeL', -220, -40, 80, 80, 6),
  armor('nodeR', 220, -40, 80, 80, 6),
  weak('core', 0, 10, 130, 130, 104),
  weak('lensL', -140, 80, 70, 60, 54),
  weak('lensR', 140, 80, 70, 60, 54),
], [
  phase(0.6, 'hover', [
    atk('fan', 1.9, 'core', { count: 3, spread: 0.2 }),
    atk('rain', 3.6, 'halo', { count: 7, spread: 520 }),
  ], { minions: [minion('carrier', 1, 4.5, 'halo')] }),
  phase(0.3, 'orbit', [
    atk('fan', 1.7, 'core', { count: 3, spread: 0.25 }),
    atk('laser', 6.5, 'lensL'),
    atk('laser', 7.5, 'lensR'),
    atk('rain', 3.2, 'halo', { count: 9, spread: 560 }),
  ], { rate: 1.1, minions: [minion('gunner', 2, 11, 'nodeL'), minion('carrier', 1, 4.5, 'halo')] }),
  phase(0, 'sway', [
    atk('ring', 3.6, 'core', { count: 16 }),
    atk('fan', 1.6, 'core', { count: 5, spread: 0.3 }),
    atk('rain', 2.8, 'halo', { count: 10, spread: 600 }),
    atk('laser', 6, 'lensL'),
  ], { rate: 1.5, minions: [minion('gunner', 2, 9, 'nodeR'), minion('carrier', 1, 4.5, 'halo')] }),
]);

const titan = boss('titan', 'Endoskeleton titan', 285, { w: 620, h: 460 }, [
  armor('shoulders', 0, -150, 560, 60, 8),
  weak('skull', 0, -50, 120, 110, 89),
  armor('ribL', -100, 40, 60, 150, 6),
  armor('ribR', 100, 40, 60, 150, 6),
  armor('armL', -230, 20, 70, 280, 8),
  armor('armR', 230, 20, 70, 280, 8),
  weak('cannonL', -230, 175, 90, 60, 50),
  weak('cannonR', 230, 175, 90, 60, 50),
], [
  phase(0.65, 'sway', [
    atk('fan', 2.4, 'cannonL', { count: 2, spread: 0.3 }),
    atk('fan', 2.4, 'cannonR', { count: 2, spread: 0.3 }),
    atk('aimed', 2.6, 'skull'),
  ], { rate: 0.9, minions: [minion('carrier', 1, 4.5, 'shoulders')] }),
  phase(0.3, 'hover', [
    atk('homing', 2.8, 'skull'),
    atk('spiral', 5, 'skull', { count: 16 }),
    atk('laser', 7, 'skull'),
    atk('fan', 3, 'cannonL', { count: 4, spread: 0.7 }),
    atk('fan', 3, 'cannonR', { count: 4, spread: 0.7 }),
  ], { minions: [minion('gunner', 2, 12, 'shoulders'), minion('carrier', 1, 4.5, 'shoulders')] }),
  phase(0, 'charge', [
    atk('ring', 3.8, 'skull', { count: 18 }),
    atk('rain', 3.6, 'shoulders', { count: 8, spread: 540 }),
    atk('laser', 7, 'cannonL'),
    atk('laser', 7.8, 'cannonR'),
    atk('fan', 2.6, 'skull', { count: 5, spread: 0.9 }),
  ], { rate: 1.3, minions: [minion('gunner', 3, 10, 'shoulders'), minion('carrier', 1, 4.5, 'shoulders')] }),
]);

// The well of this world's twist sits at (960, 300): at rest the black hole's core hangs over it.
const singularity = boss('singularity', 'The Singularity', 290, { w: 700, h: 380 }, [
  armor('jetN', 0, -130, 50, 110, 6),
  weak('core', 0, 10, 120, 120, 96),
  armor('diskL', -190, 20, 230, 34, 8),
  armor('diskR', 190, 20, 230, 34, 8),
  weak('jet', 0, 120, 50, 110, 46),
  weak('moonL', -290, 70, 70, 70, 28),
  weak('moonR', 290, 70, 70, 70, 28),
], [
  phase(0.66, 'hover', [
    atk('spiral', 4, 'moonL', { count: 12 }),
    atk('spiral', 4, 'moonR', { count: 12 }),
    atk('fan', 2, 'jet', { count: 3, spread: 0.3 }),
  ], { minions: [minion('carrier', 1, 4.5, 'diskL')] }),
  phase(0.33, 'orbit', [
    atk('laser', 6.5, 'moonL'),
    atk('laser', 7.5, 'moonR'),
    atk('fan', 2.2, 'jet', { count: 5, spread: 0.7 }),
    atk('ring', 5.4, 'diskL', { count: 12 }),
    atk('ring', 5.8, 'diskR', { count: 12 }),
  ], { rate: 1.1, minions: [minion('diver', 2, 10, 'diskL'), minion('carrier', 1, 4.5, 'diskL')] }),
  phase(0, 'charge', [
    atk('rain', 3, 'diskL', { count: 6, spread: 440 }),
    atk('rain', 3, 'diskR', { count: 6, spread: 440 }),
    atk('spiral', 4.8, 'jet', { count: 16 }),
    atk('homing', 2.4, 'jet'),
    atk('laser', 7.5, 'moonL'),
  ], { rate: 1.4, minions: [minion('diver', 3, 8, 'diskR'), minion('carrier', 1, 4.5, 'diskL')] }),
]);

export const BOSSES2 = [queen, agent, titan, singularity];
