// The end of a level: the best and the run (trailer/runs.js decides whether the run is kept) are
// saved the moment the level is cleared, so leaving through the pause menu during the slow motion
// loses neither (M10); once it has played out the outcome goes to `flow.cleared` or `flow.failed`,
// which show the results or failed card. trailer/routes.js replaces those two to run the trailer or
// the blooper first; each ends by calling flow.showResults(outcome) / flow.showFailed(outcome).
//   outcome = { level, mode ('play' | 'try'), cleared, score, stars, best, newBest,
//               tally (the world's tally of a cleared level: time, par, speed, the bonuses, medal; else null),
//               promoted (the name of the rank this clear's medal reached, else null),
//               recording: { level, seed, inputs, events, ticks, score, stars, state, tainted },
//               saved: saveBestRun's answer at the clear ('saved' | 'unsaved' | 'skip'), session,
//               view (the level's baked view: replay clips can draw on it without a bake) }
import { LEVELS, worldName } from '../core/levels.js';
import { store, medalCount } from './storage.js';
import { rankOf } from '../core/ranks.js';
import { play, setBeam } from './audio.js';
import { recording, runOf } from './session.js';
import { finished } from '../core/util.js';
import { saveBestRun } from './trailer/runs.js';
import { resultsScreen } from './screens/results.js';
import { failedScreen } from './screens/failed.js';

const CLEAR_WAIT = 2.4; // s after the clear: the slow motion and the bonus pop-up
const FAIL_WAIT = 1.6; // s after the last life

function progress(world) {
  const b = world.boss;
  if (b) return `${worldName(world.level)}'s boss held at ${Math.ceil((100 * b.hp) / b.maxHp)} %`;
  return `Wave ${world.wave} of ${world.level.waves.length}`;
}

export function createFlow(r, stage) {
  const { app } = r;
  const flow = {
    onEvent(scene, e) {
      if (e.type !== 'cleared' || scene.mode !== 'play') return;
      const before = rankOf(medalCount(store.allBest())).index;
      scene.result = store.recordResult(scene.level.id, e); // e carries score, stars and medal
      const rank = rankOf(medalCount(store.allBest()));
      scene.promoted = rank.index > before ? rank.name : null; // this clear's medal raised the rank
      const { level, mode, session } = scene;
      scene.saved = saveBestRun(store, { level, mode, cleared: true, score: e.score, run: runOf(session) });
    },

    // Once a frame while a level is up: has it ended, and has its moment played out?
    check(scene) {
      const s = scene.session;
      if (scene.ended || !finished(s.world) || (scene.mode !== 'play' && scene.mode !== 'try')) return;
      const cleared = s.world.state === 'cleared';
      if (s.over < (cleared ? CLEAR_WAIT : FAIL_WAIT)) return;
      scene.ended = true;
      setBeam(false);
      const res = scene.result ?? { best: { score: s.world.score, stars: 0 }, newBest: false };
      const rec = recording(s);
      const o = {
        level: scene.level, mode: scene.mode, cleared, score: s.world.score, stars: rec.stars,
        tally: cleared ? s.world.tally ?? null : null, promoted: scene.promoted ?? null,
        best: res.best, newBest: res.newBest, recording: rec, saved: scene.saved ?? 'skip',
        session: s, view: scene.view,
      };
      flow[cleared ? 'cleared' : 'failed'](o);
    },

    cleared: (o) => flow.showResults(o),
    failed: (o) => flow.showFailed(o),

    showResults(o) {
      app.screen = 'results';
      play('cleared');
      const { level } = o; // the buttons close over this, not over o (its session and view)
      const demo = o.mode === 'try';
      const i = LEVELS.indexOf(level);
      const next = demo ? r.goLobby : LEVELS[i + 1] && (() => r.startLevel(LEVELS[i + 1]));
      stage.show(resultsScreen({
        label: r.labelOf(level), title: demo ? 'You’re ready!' : level.boss ? 'Victory' : 'Cleared',
        score: o.score, stars: o.stars, best: demo ? null : o.best, newBest: o.newBest && !demo,
        tally: demo ? null : o.tally, promoted: demo ? null : o.promoted, // the demo has no best, tally, medal or rank
      }, {
        next, nextLabel: demo ? 'Pick a level' : 'Next',
        retry: demo ? r.startTry : () => r.startLevel(level), retryLabel: demo ? 'Again' : 'Retry',
        select: demo ? r.goTitle : r.goLobby, selectLabel: demo ? 'Title' : 'Select',
      }));
    },

    showFailed(o) {
      app.screen = 'failed';
      play('failed');
      const { level } = o;
      const demo = o.mode === 'try';
      stage.show(failedScreen({ label: r.labelOf(level), score: o.score, progress: progress(o.session.world) }, {
        retry: demo ? r.startTry : () => r.startLevel(level),
        select: r.goLobby,
      }));
    },
  };
  r.flow = flow;
  return flow;
}
