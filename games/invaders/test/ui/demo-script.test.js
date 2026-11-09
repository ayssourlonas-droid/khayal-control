import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_LEVEL } from '../../src/core/levels.js';
import { TICK } from '../../src/core/kinds.js';
import { createSession, stepSession } from '../../src/ui/session.js';
import {
  CAPTIONS, DWELL, DEMO_SEED, createDirector, directInput, noteEvents, stepDirector,
} from '../../src/ui/demo/script.js';

// The watch as the game runs it: the director's input, its event log, one 60 Hz frame at a time.
function watch(seed = DEMO_SEED, limit = 60 * 120) {
  const s = createSession(DEMO_LEVEL, seed);
  const d = createDirector();
  const shown = [{ caption: 0, at: 0 }];
  let t = 0;
  for (let i = 0; i < limit && !d.done; i++) {
    stepSession(s, TICK, (w) => directInput(d, w), (evs) => noteEvents(d, evs));
    const before = d.caption;
    stepDirector(d, TICK);
    t += TICK;
    if (d.caption !== before) shown.push({ caption: d.caption, at: t, tick: s.world.tick });
  }
  return { s, d, shown, t };
}

test('the watch shows every caption in order, each on its event, and ends cleared', () => {
  const { s, d, shown } = watch();
  assert.equal(d.done, true, 'the demo reaches the hand-over');
  assert.deepEqual(shown.map((x) => CAPTIONS[x.caption].id), ['move', 'fire', 'power', 'bomb', 'stars']);
  for (let i = 1; i < shown.length; i++) {
    assert.ok(shown[i].at - shown[i - 1].at >= DWELL - 1e-9, `caption ${i} waited for the one before`);
    const on = CAPTIONS[shown[i].caption].on;
    const first = s.events.find((e) => e.type === on && (on !== 'fire' || e.side === 'ship'));
    assert.ok(first && first.tick <= shown[i].tick, `${on} happened before its caption`);
  }
  assert.equal(s.world.state, 'cleared');
  assert.ok(s.events.some((e) => e.type === 'power' && e.on), 'a power-up was taken, not just a bomb');
  assert.equal(s.events.filter((e) => e.type === 'bomb').length, 1, 'one bomb');
  assert.ok(d.stars >= 1);
});

test('the bomb caption follows the bomb at once, and the bomb finishes the level', () => {
  const { s, shown } = watch();
  const bomb = s.events.find((e) => e.type === 'bomb');
  const cap = shown.find((x) => CAPTIONS[x.caption].id === 'bomb');
  assert.ok(cap.tick - bomb.tick <= 60, `bomb caption ${cap.tick - bomb.tick} ticks after the bomb`);
  const cleared = s.events.find((e) => e.type === 'cleared');
  assert.ok(cleared.tick - bomb.tick < 120, 'the bomb takes the last aliens');
});
