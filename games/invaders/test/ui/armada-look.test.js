import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installCanvas, recorder } from './dom-kit.js';
import { rgb } from '../../src/ui/sprites.js';

// Sunset Armada's look under stand-in canvases: what its layers light and mark, how its flourishes come and
// go, and that an enemy bullet reads on every colour of its sky (looks.test.js has the other worlds').
installCanvas(64);
const { LOOKS } = await import('../../src/ui/looks/index.js');
const { buildLayers } = await import('../../src/ui/parallax.js');
const { drawFlourishes } = await import('../../src/ui/flourish.js');
const { drawAmbient } = await import('../../src/ui/ambient.js');
const { TONES } = await import('../../src/ui/cloud-kit.js');

const look = LOOKS[12];
const layers = buildLayers(look, 5);
const [far, mid, near] = layers;

function env(t, ship = null, only = look.flourish) {
  return { v: { look: { ...look, flourish: only }, layers, cache: {} }, world: { level: {}, ship }, fx: { flashes: [], time: t }, t, quality: 1 };
}
const draw = (phase, t, x0 = -160, top = 0, only) => {
  const { ctx, calls } = recorder();
  drawFlourishes(ctx, env(t, null, only), phase, x0, top);
  return calls;
};
const images = (calls) => calls.filter(([k]) => k === 'drawImage');

test("the far layer's windows and beacon burn warm, and every waterfall is marked for its shimmer", () => {
  assert.equal(look.world, 13);
  assert.ok(far.lights.filter((l) => l.color === look.layers[0].lamp).length >= 4, `${far.lights.length} lights on the islands`);
  assert.ok(far.lights.some((l) => l.mode === 'pulse' && l.r >= 60), "the watchtower's beacon breathes");
  assert.ok(far.lights.some((l) => l.mode === 'flicker'), 'lanterns hang under the islands');
  const falls = far.signs.filter((s) => s.fall);
  assert.ok(falls.length >= 3, `${falls.length} waterfalls`);
  assert.ok(falls.every((f) => f.y1 > f.y0 + 120 && f.w > 4), 'each one a long drop with a width');
});

test('the mid layer carries airships with portholes lit and propellers marked, and windmills marked for their sails', () => {
  assert.ok(mid.lights.filter((l) => l.mode === 'pulse').length >= 8, `${mid.lights.length} lights on the ships`);
  assert.ok(mid.lights.some((l) => l.color === '#ff9a4a' && l.mode === 'flicker'), 'lanterns at the bow and the stern');
  const props = mid.signs.filter((s) => s.prop);
  assert.ok(props.length >= 3 && props.every((p) => p.r > 10 && p.n >= 3), `${props.length} propellers`);
  assert.ok(mid.signs.some((s) => s.mill && s.r > 40), 'a windmill');
});

test('flags ripple from the mastheads and the watchtower, and the sun glints off the brass of the ships now and then', () => {
  assert.ok(mid.signs.filter((s) => s.flag).length >= 5 && far.signs.some((s) => s.flag), 'flags marked');
  const edge = (t) => draw('mid', t, -160, 620, ['flags']).filter(([k]) => k === 'lineTo').map((c) => c[2].toFixed(2)).join();
  assert.ok(edge(3).length > 0, 'flags drawn');
  assert.notEqual(edge(3), edge(3.1), 'the cloth moves');
  assert.ok(mid.lights.filter((l) => l.mode === 'blink').length >= 4, 'glints on the yards and the balloon ships');
});

test('the near layer marks its mooring balloons, and its masts blink', () => {
  assert.ok(near.signs.filter((s) => s.balloon).length >= 3, 'balloons riding their cables');
  assert.ok(near.lights.some((l) => l.mode === 'blink'), 'a lamp on every mast');
  assert.equal(far.signs.filter((s) => s.balloon || s.prop || s.mill).length, 0);
});

test('shafts of light turn over the sun every frame, and the gulls of the flock cross now and then', () => {
  assert.ok(look.flourish.includes('godrays') && look.flourish.includes('birds'));
  for (const t of [0, 3.3, 11]) assert.ok(draw('sky', t).filter(([k]) => k === 'rotate').length >= 5, `shafts at ${t}`);
  let flocks = 0;
  for (let i = 0; i < 3000; i++) if (draw('sky', i * 0.1).filter(([k]) => k === 'scale').length >= 3) flocks++;
  assert.ok(flocks > 100 && flocks < 1600, `${flocks} of 3000 frames have a flock`);
});

test('a far airship sails across the sky now and then, much more rarely than the gulls', () => {
  let ships = 0;
  for (let i = 0; i < 4000; i++) if (draw('sky', i * 0.25).some(([k, , , , w]) => k === 'drawImage' && w === 180)) ships++;
  assert.ok(ships > 100 && ships < 1800, `${ships} of 4000 frames have the ship`);
});

test('cannon fire flashes inside the cloud sea in broadsides, each flash a core and a bloom, and the sea is quiet between', () => {
  let lit = 0;
  let most = 0;
  for (let i = 0; i < 3000; i++) {
    const n = images(draw('far', i * 0.05, -160, 380, ['cannonfire'])).length;
    if (n) lit++;
    most = Math.max(most, n);
  }
  assert.ok(lit > 150 && lit < 2000, `${lit} of 3000 frames have fire in them`);
  assert.ok(most >= 6, `${most} images at the busiest: several guns of one broadside at once`);
});

test('the waterfalls shimmer, the propellers and the windmill go round, the balloons sway', () => {
  const sig = (calls) => images(calls).map((c) => c[2].toFixed(1) + c[3].toFixed(1)).join();
  assert.ok(images(draw('far', 3, -160, 380)).length >= 12, 'streaks and mist on the falls in view');
  assert.notEqual(sig(draw('far', 3, -160, 380)), sig(draw('far', 3.4, -160, 380)), 'the streaks slide');
  const props = draw('mid', 3, -160, 620);
  assert.ok(props.filter(([k]) => k === 'rotate').length >= 1, 'the sails turn');
  assert.ok(props.filter(([k]) => k === 'lineTo').length >= 3, 'the blades are drawn edge-on');
  const blades = (t) => draw('mid', t, -160, 620).filter(([k]) => k === 'lineTo').map((c) => c[2].toFixed(1)).join();
  assert.notEqual(blades(3), blades(3.013), 'and they change from frame to frame');
  const balloons = (t) => {
    const { ctx, calls } = recorder();
    drawFlourishes(ctx, env(t, { x: 960 }), 'near');
    return calls;
  };
  assert.ok(images(balloons(2)).length >= 3, 'balloons in view');
  assert.notEqual(sig(balloons(2)), sig(balloons(5)), 'swaying on their cables');
});

test("wisps and gulls drift across the sky and the field, and every layer's lights are on the sheet", () => {
  const { ctx, calls } = recorder();
  for (const phase of ['sky', 'mid', 'front']) drawAmbient(ctx, look, phase, { t: 7, drift: 40, wind: 0, world: {} });
  const total = look.ambient.reduce((n, a) => n + (['wisps', 'gulls', 'spores'].includes(a.kind) ? a.n : 0), 0);
  assert.equal(images(calls).length, total, 'one image for each wisp, gull and mote');
  for (const l of layers.flatMap((x) => x.lights)) assert.ok(l.r > 0 && l.color && l.mode, 'a light has a size, a colour and a mode');
});

// WCAG contrast ratio between two hex colours.
function contrast(a, b) {
  const lum = (h) => rgb(h).map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

test('an enemy bullet reads on every colour of the sunset: its white core on the dark sky and its dark rim on the bright', () => {
  const { enemy, enemyRim } = look.palette;
  const skies = [...look.sky.map(([, c]) => c), ...Object.values(TONES)];
  for (const sky of skies) {
    const best = Math.max(contrast('#ffffff', sky), contrast(enemyRim, sky));
    assert.ok(best >= 3, `${sky}: core ${contrast('#ffffff', sky).toFixed(1)}, rim ${contrast(enemyRim, sky).toFixed(1)}`);
  }
  assert.ok(contrast(enemy, enemyRim) >= 3.5, `the ring stands out from its rim, ${contrast(enemy, enemyRim).toFixed(1)}`);
  assert.ok(contrast(enemy, '#ffffff') >= 3, `and from the core, ${contrast(enemy, '#ffffff').toFixed(1)}`);
  assert.ok(skies.filter((s) => contrast(enemy, s) >= 2.2).length >= 5, 'and the ring itself is plain against most of the sky');
});

test("the player's shot is not the enemy's colour, and the boss's weak points share the laser's cool accent", () => {
  const { shot, enemy, beam, boss } = look.palette;
  assert.notEqual(shot, enemy);
  assert.ok(contrast(shot, enemy) >= 2, `the shot (a pale cream) stands out from the ring: ${contrast(shot, enemy).toFixed(1)}`);
  assert.equal(boss.weak, beam, "the weak points and the laser are the world's one cool accent");
  assert.ok(contrast(beam, look.sky[0][1]) > 6, 'bright against the dark sky overhead');
});
