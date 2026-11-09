import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../../src/core/levels.js';
import { PARS, parOf, DEFAULT_PAR } from '../../src/core/pars.js';
import { currentPars } from '../../scripts/pars.mjs';

// Each level's par (R66) is twice what the never-hit autopilot takes to clear it, rounded up to 5 s:
// scripts/pars.mjs measures and writes them. A level, rule or autopilot change that moves a clear
// fails here until the table is written again (node scripts/pars.mjs).

test('every level has a par, a whole number of 5 s, and nothing else has one', () => {
  assert.deepEqual(Object.keys(PARS), LEVELS.map((l) => l.id));
  for (const l of LEVELS) {
    assert.ok(Number.isInteger(PARS[l.id] / 5) && PARS[l.id] >= 20, `${l.id}: ${PARS[l.id]}`);
    assert.equal(parOf(l), PARS[l.id]);
  }
  assert.equal(parOf({ id: 'not-a-level' }), DEFAULT_PAR);
});

test('every par is current: the table is what scripts/pars.mjs measures now', () => {
  assert.deepEqual(currentPars().changed, [], 'run node scripts/pars.mjs');
});
