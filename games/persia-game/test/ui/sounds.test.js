import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { eventSounds } from '../../src/ui/sounds.js';
import { SFX } from '../../src/ui/sfx.js';
import { STYLES, SCALES, NOTES, kitFor, degreeMidi, midiHz } from '../../src/ui/sound-data.js';
import { LOOK } from '../../src/ui/looks/index.js';
import { sampleEvent as sample } from '../event-sample.js';

const coreDir = fileURLToPath(new URL('../../src/core/', import.meta.url));
// Every event type the core emits, read from its emit(world, '<type>', ...) calls.
const EMITTED = [...new Set(readdirSync(coreDir).flatMap((f) =>
  [...readFileSync(coreDir + f, 'utf8').matchAll(/emit\(world, '(\w+)'/g)].map((m) => m[1])))];

// The events eventSounds leaves silent on purpose, and why.
const SILENT = {
  failed: 'the failed screen plays the stinger',
  cleared: 'the results screen plays the stinger after the slow motion',
  wave: 'the voice speaks it (voice.js)',
  boss: 'the voice speaks it (voice.js)',
  minion: 'the voice names the animal a giant sends (voice.js)',
};

test('every event the core emits makes a sound that exists, or is silent on purpose', () => {
  assert.ok(EMITTED.length >= 20, `found ${EMITTED.length} event types`);
  for (const type of EMITTED) {
    const played = [];
    eventSounds([sample(type)], { boss: null }, (name, o) => played.push([name, o]));
    if (Object.hasOwn(SILENT, type)) {
      assert.equal(played.length, 0, type);
      continue;
    }
    assert.ok(played.length > 0, `${type} makes no sound`);
    for (const [name] of played) assert.equal(typeof SFX[name], 'function', `${type} -> ${name}`);
  }
});

test('SILENT names only events the core emits', () => {
  for (const type of Object.keys(SILENT)) assert.ok(EMITTED.includes(type), `${type} is never emitted`);
});

// The sounds a batch of events makes, with their options.
function names(events, world = { boss: null }) {
  const out = [];
  eventSounds(events, world, (name, o) => out.push({ name, ...o }));
  return out;
}

test('an alien death sounds once (its kill), the boss chain swells, the white-out has its own blast', () => {
  assert.deepEqual(names([sample('kill'), { ...sample('explode'), size: 1 }]).map((s) => s.name), ['kill']);
  const early = names([{ ...sample('explode'), size: 1 }], { boss: { dying: 2.7 } })[0];
  const late = names([{ ...sample('explode'), size: 1 }], { boss: { dying: 0.3 } })[0];
  assert.equal(early.name, 'boom');
  assert.ok(late.k > early.k, 'later blasts in the chain are bigger');
  assert.equal(names([{ ...sample('explode'), size: 3 }])[0].name, 'blast');
  assert.deepEqual(names([{ ...sample('fire'), power: 'laser' }]), [], 'the beam hums instead of a shot');
  assert.equal(names([{ ...sample('fire'), side: 'enemy', pattern: 'laser' }])[0].name, 'laserWarn');
});

test('the pickups swept up at the clear chime one after another, a caught one at once', () => {
  const swept = (kind, nth) => ({ ...sample('sweep'), kind, nth });
  const sounds = names([sample('kill'), swept('laser', 0), swept('bomb', 1), swept('rapid', 2), sample('cleared')]);
  const chimes = sounds.filter((s) => s.name === 'pickup');
  assert.deepEqual(chimes.map((s) => s.kind), ['laser', 'bomb', 'rapid'], 'each its own pickup sound');
  assert.equal(chimes[0].delay, 0);
  for (let i = 1; i < chimes.length; i++) {
    const gap = chimes[i].delay - chimes[i - 1].delay;
    assert.ok(gap >= 0.03 && gap <= 0.1, `a run of chimes, ${gap} s apart`);
  }
  assert.equal(names([sample('pickup')])[0].delay ?? 0, 0, 'a caught pickup sounds at once');
});

test('the look\'s sound style, root, scale and tempo come from its music entry', () => {
  const kit = kitFor(LOOK.music);
  assert.equal(kit.style, 'brass');
  assert.equal(kit.root, NOTES[LOOK.music.root], LOOK.music.root);
  assert.deepEqual(kit.scale, SCALES[LOOK.music.scale]);
  assert.deepEqual(SCALES.homayoun, [0, 1, 4, 5, 7, 8, 10]);
  assert.equal(kit.bpm, LOOK.music.bpm);
});

test('scale degrees land in the scale, an octave per scale length', () => {
  const kit = kitFor({ mood: 'desert brass', root: 'D', scale: 'homayoun', bpm: 112 });
  assert.equal(degreeMidi(kit, 0, 4), 62, 'D4');
  assert.equal(degreeMidi(kit, 7, 4), 74, 'seven steps of homayoun is the octave');
  assert.equal(degreeMidi(kit, -1, 4), 60, 'below the root: the top step an octave down (C4)');
  assert.ok(Math.abs(midiHz(69) - 440) < 1e-9);
  for (let d = -6; d < 12; d++) {
    const pc = (degreeMidi(kit, d, 4) - kit.root + 120) % 12;
    assert.ok(kit.scale.includes(pc), `degree ${d}`);
  }
});

test('every music style is well formed', () => {
  for (const [name, s] of Object.entries(STYLES)) {
    const m = s.music;
    assert.ok(m.div > 0 && m.seq.length > 0 && m.drum.length > 0, name);
    for (const d of m.seq) assert.ok(d === null || Number.isInteger(d), `${name} seq`);
    assert.match(m.drum, /^[t.]+$/, `${name} drum`);
    assert.ok(m.lead.gain > 0 && m.lead.gain < 0.2, `${name} lead gain`);
  }
});
