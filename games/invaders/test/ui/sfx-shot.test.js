import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installAudio } from './audio-kit.js';
import { nextHit } from '../../src/ui/sfx-shot.js';
import { LOOKS } from '../../src/ui/looks/index.js';
import { COOLDOWN, RAPID_COOLDOWN } from '../../src/core/ship.js';
import { gunTicks, TICK } from '../core/world-kit.js';

const BASE = 'kocokoco';
const RAPID = 'ktotctotktotctot';
const BASE_EVERY = gunTicks(COOLDOWN) * TICK; // s: the ship's fire interval, a whole number of ticks
const RAPID_EVERY = gunTicks(RAPID_COOLDOWN) * TICK; // and under the rapid power

const fresh = () => ({ step: 0, at: -Infinity });

// Hold fire for `n` shots, one every `every` s from t = 10; returns the letters played.
function hold(n, every, power) {
  const st = fresh();
  return Array.from({ length: n }, (_, i) => nextHit(st, 10 + i * every, power)).join('');
}

test('held fire plays the base pattern in order and never restarts', () => {
  assert.equal(hold(16, BASE_EVERY, null), BASE.repeat(2));
  assert.equal(hold(16, BASE_EVERY, 'spread'), BASE.repeat(2));
  assert.equal(hold(16, BASE_EVERY / 0.3 + 1 / 60, null), BASE.repeat(2), 'in slow motion too (0.3x, a frame late)');
});

test('held rapid fire plays the rapid pattern in order, a kick every four shots', () => {
  const got = hold(32, RAPID_EVERY, 'rapid');
  assert.equal(got, RAPID.repeat(2));
  assert.equal([...got].filter((h) => h === 'k' || h === 'c').length, 8);
});

test('a pause over the restart gap opens the next burst on a kick; a shorter one carries on', () => {
  const st = fresh();
  assert.equal(nextHit(st, 5, null), 'k', 'the first shot of all');
  assert.equal(nextHit(st, 5 + 0.69, null), 'o', 'under the gap: the next step');
  assert.equal(nextHit(st, 5 + 0.69 + 0.71, null), 'k', 'over the gap: back to the top');
  const quick = fresh();
  assert.equal(nextHit(quick, 1, 'rapid'), 'k');
  assert.equal(nextHit(quick, 1 + RAPID_EVERY, 'rapid'), 't');
  assert.equal(nextHit(quick, 2, 'rapid'), 'k', 'rapid restarts on a kick too');
});

test('a power change mid-burst carries the step count into the other pattern', () => {
  const st = fresh();
  const powers = [null, 'rapid', 'spread', 'rapid', 'rapid', null];
  for (let i = 0; i < 48; i++) {
    const p = powers[i % powers.length];
    const pat = p === 'rapid' ? RAPID : BASE;
    assert.equal(nextHit(st, 10 + i * BASE_EVERY, p), pat[i % pat.length], `shot ${i} (${p})`);
  }
});

test('the patch builds every drum on every world and every power', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const made = { Oscillator: 0, BufferSource: 0 };
  installAudio({ currentTime: 5, onNode: (kind) => { if (kind in made) made[kind] += 1; } });
  const { unlockAudio, play, audioNodes, audioStats, setWorldSound } = await import('../../src/ui/audio.js');
  unlockAudio();
  const { ctx } = audioNodes();
  let sounds = 0;
  for (const look of LOOKS) {
    setWorldSound(look);
    const shapes = new Set(); // what each shot made: kick/open hat, kick + clap, closed hat
    for (const power of [null, 'spread', 'rapid']) {
      for (let i = 0; i < RAPID.length; i++) { // a full burst walks every step of either pattern
        made.Oscillator = made.BufferSource = 0;
        play('shot', { power, x: 960 });
        shapes.add(`${made.Oscillator}/${made.BufferSource}`);
        sounds += 1;
        ctx.currentTime += power === 'rapid' ? RAPID_EVERY : BASE_EVERY; // past the thinning gap, under the restart
      }
      ctx.currentTime += 1; // the next burst opens on a kick
    }
    assert.deepEqual([...shapes].sort(), ['0/1', '1/1', '1/3'], `world ${look.world}`);
  }
  assert.equal(audioStats().failed, 0, audioStats().error);
  assert.equal(audioStats().played, sounds);
  t.mock.timers.tick(10000);
});
