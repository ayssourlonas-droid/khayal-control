// Screen routing: title (over the backdrop battle) -> lobby -> title card -> play -> pause ->
// results / failed, and "watch, then try". `app` is the one piece of state the loop reads.
//   app = { screen, scene, backdrop, shown, demo, lastLevel, token, film }
//   screen 'title' | 'lobby' | 'loading' | 'play' | 'demo' | 'paused' | 'results' | 'failed' |
//          'trailer' (the trailer or the blooper draws the canvas) | 'cinema'
//   backdrop: the title's battle, kept across menu visits; starting a level drops it, so the title
//   bakes another world's battle (shown: the world it showed last) on the menu, never mid-level (M5)
//   token: counts the routes taken, so a deferred bake can tell its screen was left; film: the
//   trailer or blooper screen while one rolls (trailer/routes.js)
// The end of a level goes through flow.js; trailer/routes.js puts the trailer and the blooper there
// and adds r.goCinema (it uses r.leave).
// Every route away from a level goes through leave(): the old scene stops stepping at once (the
// loop only runs app.scene) and the level's own sounds (the laser hum) stop with it.
import { DEMO_LEVEL, reelName, worldName } from '../core/levels.js';
import { lookFor } from './looks/index.js';
import { store } from './storage.js';
import { play, duck, setBeam } from './audio.js';
import { setWorld } from './music.js';
import { resetInput } from './input.js';
import { backdropScene, pickBackdrop, playScene } from './scenes.js';
import { titleScreen } from './screens/title.js';
import { lobbyScreen } from './screens/lobby.js';
import { cardScreen } from './screens/card.js';
import { pauseScreen } from './screens/pause.js';
import { warmPosters } from './screens/posters.js';
import { demoScreen } from './demo/demo-screen.js';
import { DEMO_SEED, createDirector, directInput, noteEvents } from './demo/script.js';

const MIN_CARD = 0.9; // s the title card stays, so it reads as a moment, not a flicker

const labelOf = (level) => (level === DEMO_LEVEL ? 'Watch, then try' : `${worldName(level)} · ${reelName(level)}`);

export function createRouter({ canvas, stage, input }) {
  const app = { screen: 'boot', scene: null, backdrop: null, shown: 0, demo: null, lastLevel: 'w1-1', token: 0 };
  const r = { app, labelOf };
  const live = () => app.screen === 'play' || app.screen === 'demo';
  const menus = () => ['title', 'lobby', 'cinema'].includes(app.screen); // posters bake only here

  // Leave whatever runs for `screen`: nothing steps until the caller sets a new scene.
  function leave(screen) {
    app.token += 1;
    app.screen = screen;
    app.scene = null;
    setBeam(false);
    duck(1);
  }

  r.goTitle = () => {
    leave('title');
    app.demo = null;
    const items = [ // the main menu, in order
      { label: 'Play', pick: r.goLobby },
      { label: 'Watch, then try', pick: r.startDemo },
      { label: 'Cinema', pick: () => r.goCinema() }, // trailer/routes.js
    ];
    const level = app.backdrop?.level ?? pickBackdrop(app.shown);
    app.shown = level.world;
    setWorld(lookFor(level));
    stage.show(titleScreen({ items, nowShowing: worldName(level) }));
    warmPosters(menus);
    if (app.backdrop) {
      app.scene = app.backdrop;
      return;
    }
    const token = app.token; // the first time, the battle is baked once the menu has painted
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== app.token) return; // already gone (Play pressed at once): bake it next time
      app.backdrop = backdropScene(canvas, level);
      app.scene = app.backdrop;
    }));
  };

  r.goLobby = () => {
    leave('lobby');
    app.demo = null;
    warmPosters(menus);
    stage.show(lobbyScreen({
      best: store.allBest(), start: r.startLevel, back: r.goTitle, focusId: app.lastLevel,
      reset: () => { // Reset scores, confirmed: the lobby again with every best emptied
        store.resetBest();
        r.goLobby();
      },
    }));
  };

  // Show the level's card, bake its view behind it, then play. build(level) -> scene.
  function load(level, kicker, build, then) {
    leave('loading');
    app.backdrop = null; // back on the title, another world's battle (M5)
    const token = app.token;
    setWorld(lookFor(level));
    stage.show(cardScreen(level, kicker));
    play('start');
    const t0 = performance.now();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== app.token) return;
      const scene = build();
      setTimeout(() => {
        if (token !== app.token) return;
        app.scene = scene;
        resetInput(input);
        then(scene);
        if (document.hidden) r.pause(); // the tab went away during the card: start paused, not unseen
      }, Math.max(0, MIN_CARD * 1000 - (performance.now() - t0)));
    }));
  }

  r.startLevel = (level) => {
    app.lastLevel = level.id;
    app.demo = null;
    load(level, null, () => playScene(canvas, level, input, { onEvent: (e) => r.flow.onEvent(app.scene, e) }), () => {
      app.screen = 'play';
      stage.show(null);
    });
  };

  // Watch: the director flies the demo level and captions it.
  r.startDemo = () => {
    store.setDemoSeen(); // shown once on first launch; from then on it waits on the title menu
    load(DEMO_LEVEL, 'Watch, then try', () => {
      const sc = playScene(canvas, DEMO_LEVEL, input, { seed: DEMO_SEED, mode: 'watch' });
      const d = createDirector();
      sc.source = (world) => (sc.last = directInput(d, world));
      const base = sc.onEvents;
      sc.onEvents = (events) => {
        base(events);
        noteEvents(d, events);
      };
      app.demo = { d, view: sc.view, screen: demoScreen({ skip: r.startTry }) };
      return sc;
    }, () => {
      app.screen = 'demo';
      stage.show(app.demo.screen);
    });
  };

  // Try: the same level, fresh, in the player's hands (the view is kept: no bake).
  r.startTry = () => {
    if (!app.demo) return;
    leave('demo');
    app.scene = playScene(canvas, DEMO_LEVEL, input, { view: app.demo.view, seed: DEMO_SEED, mode: 'try' });
    app.demo.d = null;
    resetInput(input);
    stage.show(app.demo.screen);
    app.demo.screen.yourTurn();
    play('start');
  };

  r.restart = () => (app.scene.mode === 'play' ? r.startLevel(app.scene.level) : app.scene.mode === 'try' ? r.startTry() : r.startDemo());

  r.pause = () => {
    if (!live()) return;
    app.screen = 'paused';
    setBeam(false);
    duck(0.35);
    play('pause');
    const back = app.demo ? app.demo.screen : null;
    stage.show(pauseScreen({
      label: labelOf(app.scene.level),
      resume: () => {
        app.screen = app.demo ? 'demo' : 'play';
        duck(1);
        resetInput(input);
        stage.show(back);
      },
      restart: r.restart,
      select: r.goLobby,
      title: r.goTitle,
    }));
  };

  r.live = live;
  r.leave = leave;
  return r;
}
