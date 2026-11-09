// Invaders: boot, the frame loop and the keys every screen shares. The fixed-step core runs inside
// the scene's session (ui/session.js: advance with fx.slow, whole TICKs, the recording); routing is
// ui/router.js, the end of a level ui/flow.js. Each frame: step and draw the scene, tick the overlay
// screen (the trailer and the blooper draw there), judge the work for auto quality (R21/R23/R46),
// feed the music.
import { store } from './ui/storage.js';
import { createInput } from './ui/input.js';
import { unlockAudio, toggleMute } from './ui/audio.js';
import { updateMusic } from './ui/music.js';
import { sampleFrame } from './ui/quality.js';
import { createDebug } from './ui/debug.js';
import { createStage, toast } from './ui/screens/stage.js';
import { createRouter } from './ui/router.js';
import { createFlow } from './ui/flow.js';
import { installTrailers } from './ui/trailer/routes.js';
import { runScene } from './ui/scenes.js';
import { installDebug } from './ui/debug-hooks.js';
import { stepDirector } from './ui/demo/script.js';

const canvas = document.getElementById('game');
const stage = createStage(document.getElementById('ui'));
const input = createInput(canvas);
input.onGesture = unlockAudio;
const router = createRouter({ canvas, stage, input });
const flow = createFlow(router, stage);
installTrailers(router, { stage, canvas }); // the trailer, the blooper and the cinema
const { app } = router;
const debug = createDebug();
const jump = installDebug(router);

// Screens under which the scene steps (the world moves) and under which it is drawn at all: the
// lobby and the title card cover the canvas, so it keeps its last frame there.
const STEPS = new Set(['title', 'play', 'demo', 'results', 'failed']);
const DRAWS = new Set([...STEPS, 'paused']);

input.onKey = (code, e) => {
  if (code === 'KeyM') {
    toast(toggleMute() ? 'Sound off' : 'Sound on');
    return;
  }
  if (stage.onKey(code, e)) return;
  if (router.live() && (code === 'Escape' || code === 'KeyP')) router.pause();
};
document.addEventListener('visibilitychange', () => {
  if (document.hidden) router.pause();
});

function frame(dt, t) {
  const sc = app.scene;
  if (!sc || !DRAWS.has(app.screen)) return null;
  runScene(sc, dt, t, STEPS.has(app.screen));
  if (sc.mode === 'watch' && app.screen === 'demo' && app.demo?.d) {
    stepDirector(app.demo.d, dt);
    app.demo.screen.watch(app.demo.d, sc.session.world, sc.last);
    const lost = sc.session.world.state === 'failed' && sc.session.over > 2; // the autopilot fell: hand over anyway
    if (app.demo.d.done || lost) router.startTry();
  }
  flow.check(sc);
  document.body.classList.toggle('playing', router.live());
  return sc;
}

let last = null;
function loop(now) {
  const interval = last == null ? 0 : now - last;
  last = now;
  const dt = Math.min(0.1, interval / 1000); // a stalled tab is not a 10 s step
  const start = performance.now();
  const sc = frame(dt, now / 1000);
  stage.update(dt); // the trailer and the blooper draw the canvas from here (screen 'trailer')
  const work = performance.now() - start;
  const quality = sc ? sc.view.quality : app.film?.quality(); // R46: film frames are judged too
  if (quality && interval) {
    sampleFrame(quality, work, interval);
    if (sc) sc.session.fx.density = quality.level;
    debug?.sample(work, interval, quality);
  }
  updateMusic();
  requestAnimationFrame(loop);
}

if (jump) router.startLevel(jump);
else if (!store.demoSeen()) router.startDemo(); // first launch: watch, then try
else router.goTitle();
requestAnimationFrame(loop);
