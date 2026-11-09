// Persia: boot, the frame loop and the keys every screen shares. The fixed-step core runs inside
// the scene's session (ui/session.js: advance with fx.slow, whole TICKs); routing is ui/router.js,
// the end of a level ui/flow.js, the spoken lines and their words ui/voice.js and ui/word-moment.js.
// Each frame: step and draw the scene, tick the overlay screen, judge the work for auto quality
// (R21/R23), feed the music.
import { createInput } from './ui/input.js';
import { unlockAudio, toggleMute } from './ui/audio.js';
import { updateMusic } from './ui/music.js';
import { sampleFrame } from './ui/quality.js';
import { createStage, toast } from './ui/screens/stage.js';
import { createRouter } from './ui/router.js';
import { createFlow } from './ui/flow.js';
import { runScene } from './ui/scenes.js';
import { installDebug } from './ui/debug-hooks.js';
import { createVoice } from './ui/voice.js';
import { createWordMoment } from './ui/word-moment.js';
import { PACK } from './data/pack.js';

const canvas = document.getElementById('game');
const stage = createStage(document.getElementById('ui'));
const input = createInput(canvas);
input.onGesture = unlockAudio;
const words = createWordMoment(document.getElementById('words'), canvas, PACK);
const voice = createVoice(PACK, { show: words.show, hide: words.hide });
const router = createRouter({ canvas, stage, input, voice });
const flow = createFlow(router, stage, voice);
const { app } = router;
const jump = installDebug(router);

// Screens under which the scene steps (the world moves) and under which it is drawn at all: the
// title card covers the canvas, so it keeps its last frame there.
const STEPS = new Set(['title', 'play', 'parade', 'results', 'failed']);
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
  stage.update(dt);
  const work = performance.now() - start;
  if (sc && interval) {
    sampleFrame(sc.view.quality, work, interval);
    sc.session.fx.density = sc.view.quality.level;
  }
  updateMusic();
  requestAnimationFrame(loop);
}

if (jump) router.startLevel(jump);
else router.goTitle();
requestAnimationFrame(loop);
