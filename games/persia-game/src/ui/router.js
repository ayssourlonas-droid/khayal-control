// Screen routing: title (over the backdrop battle) -> title card, or the open on the session's first
// level -> play -> pause -> parade -> results, or failed. `app` is the one piece of state the loop reads.
//   app = { screen, scene, backdrop, token, opened }
//   screen 'title' | 'loading' | 'play' | 'paused' | 'parade' | 'results' | 'failed'
//   backdrop: the title's battle, kept across menu visits; starting a level drops it, so the title
//   bakes another battle on the menu, never mid-level
//   token: counts the routes taken, so a deferred bake can tell its screen was left
//   opened: the open has played this page load (memory only, so a reload plays it again)
// The end of a level goes through flow.js. r.pilot (debug-hooks.js, ?debug&auto) flies every level.
// Every route away from a level goes through leave(): the old scene stops stepping at once (the
// loop only runs app.scene) and the level's own sounds (the laser hum) stop with it, as do its voice
// lines and its word on screen.
import { LEVEL, LEVELS } from '../core/levels.js';
import { LOOK } from './looks/index.js';
import { play, duck, setBeam } from './audio.js';
import { setWorld } from './music.js';
import { resetInput } from './input.js';
import { backdropScene, playScene } from './scenes.js';
import { titleScreen } from './screens/title.js';
import { landmarkArt } from './landmark-art.js';
import { levelName } from './format.js';
import { cardScreen } from './screens/card.js';
import { openScreen } from './screens/open.js';
import { pauseScreen } from './screens/pause.js';

const MIN_CARD = 0.9; // s the title card stays, so it reads as a moment, not a flicker

export function createRouter({ canvas, stage, input, voice }) {
  const app = { screen: 'boot', scene: null, backdrop: null, token: 0, opened: false };
  const r = { app, pilot: null };
  const live = () => app.screen === 'play';

  // Leave whatever runs for `screen`: nothing steps until the caller sets a new scene.
  function leave(screen) {
    app.token += 1;
    app.screen = screen;
    app.scene = null;
    input.view = null; // the panel tap's view of the scene just left; let it go
    setBeam(false);
    voice.clear();
    duck(1);
  }

  r.goTitle = () => {
    leave('title');
    // Every level, by its name, its place and a picture of its landmark. Nothing is locked.
    const items = LEVELS.map((level) => ({
      label: level.name, place: level.place, art: landmarkArt(level), pick: () => r.startLevel(level, !app.opened),
    }));
    setWorld(LOOK);
    stage.show(titleScreen({ items, nowShowing: LEVEL.name }));
    if (app.backdrop) {
      app.scene = app.backdrop;
      return;
    }
    const token = app.token; // the first time, the battle is baked once the menu has painted
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== app.token) return; // already gone (a level picked at once): bake it next time
      app.backdrop = backdropScene(canvas, LEVEL);
      app.scene = app.backdrop;
    }));
  };

  // Show the level's card (or the open), bake its view behind it, and play once both are done.
  r.startLevel = (level, open = false) => {
    leave('loading');
    app.backdrop = null; // back on the title, another battle
    const token = app.token;
    let scene = null;
    let shown = false;
    const go = () => {
      if (token !== app.token || !scene || !shown) return;
      app.scene = scene;
      resetInput(input);
      app.screen = 'play';
      stage.show(null);
      if (document.hidden) r.pause(); // the tab went away during the card: start paused, not unseen
    };
    const ready = () => {
      shown = true;
      go();
    };
    setWorld(LOOK);
    if (open) {
      app.opened = true;
      stage.show(openScreen({ onDone: ready }));
    } else {
      stage.show(cardScreen(level));
      play('start');
      setTimeout(ready, MIN_CARD * 1000);
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== app.token) return;
      scene = playScene(canvas, level, input, { pilot: r.pilot, onEvent: (e) => r.flow.onEvent(app.scene, e), voice });
      go();
    }));
  };

  r.restart = () => r.startLevel(app.scene.level);

  r.pause = () => {
    if (!live()) return;
    app.screen = 'paused';
    setBeam(false);
    duck(0.35);
    play('pause');
    stage.show(pauseScreen({
      label: levelName(app.scene.level),
      resume: () => {
        app.screen = 'play';
        duck(1);
        resetInput(input);
        stage.show(null);
      },
      restart: r.restart,
      title: r.goTitle,
    }));
  };

  r.live = live;
  r.leave = leave;
  return r;
}
