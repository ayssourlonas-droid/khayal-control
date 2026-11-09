/* DELTA STRIKE — game.js
 * Boot, fixed-timestep loop, state machine, HUD, input, audio matrix.
 * Owns the game orchestration and the DS.C-driven presentation.
 */
(function () {
  'use strict';
  window.DS = window.DS || {};

  var C = DS.C;

  // --- Canvas / context ------------------------------------------------------
  var canvas = null;   // visible canvas (#screen)
  var vctx = null;     // visible 2d context (rebuilt on resize)
  var off = null;      // offscreen 160x210 canvas
  var octx = null;     // offscreen 2d context (all drawing happens here)

  // --- Run-time state --------------------------------------------------------
  var state = 'title';
  var score = 0;
  var lives = C.LIVES_START;
  var fuel = C.FUEL_MAX;
  var cameraY = C.TITLE_CAMERA_Y;
  var seed = C.DEFAULT_SEED;
  var tick = 0;
  var stateTimer = 0;
  var hiscore = 0;

  var refuelingThisTick = false;   // set by onRefuel during Entities.update
  var lowFuelActive = false;       // edge tracking for the low-fuel alarm
  var isTouch = false;

  // UI-only timeout (not a DS.C gameplay constant): 6 s at 60 Hz.
  var HINT_HIDE_TICKS = 360;

  // --- Loop accumulator ------------------------------------------------------
  var last = 0, acc = 0;

  // --- Hint DOM elements -----------------------------------------------------
  var hintLeftEl = null, hintRightEl = null, hintKeysEl = null;
  var hintsShownTick = -1;          // -1 until hints first shown (touch only)
  var hintLeftGesture = false, hintRightGesture = false;

  // ===========================================================================
  //  Input submodule (keyboard + multi-touch digital 60/40 + corner hotspots)
  // ===========================================================================
  var Input = (function () {
    var canvasEl = null;

    // held keyboard flags
    var keyLeft = false, keyRight = false, keyUp = false, keyDown = false, keyFire = false;
    // edge-triggered flags, consumed on poll
    var edgeStart = false, edgePause = false, edgeMute = false;

    // touch steering (single joystick) + fire-zone touches
    var steerId = -1, steerX0 = 0, steerY0 = 0, steerDx = 0, steerDy = 0;
    var steerLatch = 0;   // engaged steer sign (-1|0|1), hysteresis (interfaces §7.8)
    var fireIds = [];

    function onKeyDown(e) {
      switch (e.code) {
        case 'ArrowLeft':  keyLeft = true;  e.preventDefault(); break;
        case 'ArrowRight': keyRight = true; e.preventDefault(); break;
        case 'ArrowUp':    keyUp = true;    e.preventDefault(); break;
        case 'ArrowDown':  keyDown = true;  e.preventDefault(); break;
        case 'Space':      keyFire = true;  e.preventDefault(); break;
        case 'Enter':      if (!e.repeat) edgeStart = true; e.preventDefault(); break;
        case 'KeyP':       if (!e.repeat) edgePause = true; break;
        case 'KeyM':       if (!e.repeat) edgeMute = true; break;
        default: break;
      }
    }

    function onKeyUp(e) {
      switch (e.code) {
        case 'ArrowLeft':  keyLeft = false;  break;
        case 'ArrowRight': keyRight = false; break;
        case 'ArrowUp':    keyUp = false;    break;
        case 'ArrowDown':  keyDown = false;  break;
        case 'Space':      keyFire = false;  break;
        default: break;
      }
    }

    // Map a client point to a top corner hotspot in LOGICAL coords, or null.
    function cornerAt(clientX, clientY) {
      if (!canvasEl || !canvasEl.getBoundingClientRect) return null;
      var rect = canvasEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      var lx = (clientX - rect.left) / rect.width * C.LOGICAL_W;
      var ly = (clientY - rect.top) / rect.height * C.LOGICAL_H;
      if (ly < 0 || ly >= C.CORNER_BTN) return null;
      if (lx >= 0 && lx < C.CORNER_BTN) return 'mute';
      if (lx >= C.LOGICAL_W - C.CORNER_BTN && lx < C.LOGICAL_W) return 'pause';
      return null;
    }

    function onTouchStart(e) {
      var i, t;
      for (i = 0; i < e.changedTouches.length; i++) {
        t = e.changedTouches[i];
        // Corner hotspots are live only while playing/paused; they never
        // become steering/fire and never count as a start gesture.
        if (state === 'playing' || state === 'paused') {
          var corner = cornerAt(t.clientX, t.clientY);
          if (corner === 'mute')  { edgeMute = true;  continue; }
          if (corner === 'pause') { edgePause = true; continue; }
        }
        // Any other touch is a potential start gesture.
        edgeStart = true;
        if (t.clientX < window.innerWidth * C.TOUCH_STEER_ZONE) {
          if (steerId === -1) {
            steerId = t.identifier;
            steerX0 = t.clientX; steerY0 = t.clientY;
            steerDx = 0; steerDy = 0;
          }
          // extra steering-zone touches are ignored
        } else {
          fireIds.push(t.identifier);
        }
      }
      e.preventDefault();
    }

    function onTouchMove(e) {
      var i, t;
      for (i = 0; i < e.changedTouches.length; i++) {
        t = e.changedTouches[i];
        if (t.identifier === steerId) {
          steerDx = t.clientX - steerX0;
          steerDy = t.clientY - steerY0;
        }
      }
      e.preventDefault();
    }

    function onTouchEnd(e) {
      var i, t, idx;
      for (i = 0; i < e.changedTouches.length; i++) {
        t = e.changedTouches[i];
        if (t.identifier === steerId) {
          steerId = -1; steerDx = 0; steerDy = 0; steerLatch = 0;
        }
        idx = fireIds.indexOf(t.identifier);
        if (idx !== -1) fireIds.splice(idx, 1);
      }
      e.preventDefault();
    }

    function onMouseDown() {
      edgeStart = true;
    }

    function init(cv) {
      canvasEl = cv;
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('touchstart', onTouchStart, { passive: false });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd, { passive: false });
      window.addEventListener('touchcancel', onTouchEnd, { passive: false });
      cv.addEventListener('mousedown', onMouseDown);
    }

    function poll() {
      // Keyboard resolution (R29: L+R -> 0; U+D -> D wins).
      var kSteer = 0;
      if (keyLeft && !keyRight) kSteer = -1;
      else if (keyRight && !keyLeft) kSteer = 1;
      var kThrottle = 0;
      if (keyDown) kThrottle = -1;
      else if (keyUp) kThrottle = 1;

      // Touch resolution (digital, from the joystick delta).
      // Steer uses hysteresis (interfaces §7.8): ENGAGE at |dx| >= DEADZONE_X
      // (28), then HOLD the latched sign while |dx| >= STEER_RELEASE_X (14)
      // and dx keeps that sign; RELEASE otherwise. Crossing past DEADZONE_X on
      // the opposite side re-engages with the new sign. Throttle: no hysteresis.
      var tSteer = 0, tThrottle = 0;
      if (steerId !== -1) {
        if (steerDx >= C.TOUCH_DEADZONE_X) steerLatch = 1;
        else if (steerDx <= -C.TOUCH_DEADZONE_X) steerLatch = -1;
        else if (steerLatch !== 0 &&
                 (Math.abs(steerDx) < C.TOUCH_STEER_RELEASE_X ||
                  steerDx * steerLatch < 0)) {
          steerLatch = 0;
        }
        tSteer = steerLatch;
        if (steerDy <= -C.TOUCH_THROTTLE_DY) tThrottle = 1;
        else if (steerDy >= C.TOUCH_THROTTLE_DY) tThrottle = -1;
      }

      var out = {
        steer: kSteer !== 0 ? kSteer : tSteer,
        throttle: kThrottle !== 0 ? kThrottle : tThrottle,
        fire: keyFire || fireIds.length > 0,
        startPressed: edgeStart,
        pausePressed: edgePause,
        mutePressed: edgeMute
      };
      edgeStart = false; edgePause = false; edgeMute = false;
      return out;
    }

    return { init: init, poll: poll };
  })();

  // ===========================================================================
  //  Hooks (Entities -> Game)
  // ===========================================================================
  var hooks = {
    onScore: function (points, source) { onScore(points, source); },
    onPlayerDeath: function (cause) { onPlayerDeath(cause); },
    onBridgeDestroyed: function (b) { /* metric only; checkpoint derived from sectionAt */ },
    onRefuel: function () {
      fuel = Math.min(C.FUEL_MAX, fuel + C.REFUEL_PER_S * C.DT);
      refuelingThisTick = true;
    }
  };

  function onScore(points, source) {
    if (score >= C.SCORE_MAX) return;
    var before = score;
    score = Math.min(C.SCORE_MAX, score + points);
    if (Math.floor(before / C.EXTRA_LIFE_SCORE) < Math.floor(score / C.EXTRA_LIFE_SCORE) &&
        score < C.SCORE_MAX) {
      lives = Math.min(C.LIVES_MAX, lives + 1);
      DS.Audio.extraLife();
    }
    if (score === C.SCORE_MAX && before < C.SCORE_MAX) {
      persistHiscore();
    }
  }

  function onPlayerDeath(cause) {
    if (DS.Game.cheat.invincible && cause !== 'fuel') {
      var p = DS.Entities.getPlayer();
      if (p) p.alive = true;   // dev cheat: revive (see deviations note)
      return;
    }
    enterDying(cause);
  }

  // ===========================================================================
  //  Persistence
  // ===========================================================================
  function loadHiscore() {
    hiscore = 0;
    try {
      var v = localStorage.getItem(C.HISCORE_KEY);
      if (v !== null) {
        var n = parseInt(v, 10);
        if (isFinite(n) && n >= 0) hiscore = n;
      }
    } catch (e) { /* private mode: ignore */ }
  }

  function persistHiscore() {
    if (score > hiscore) hiscore = score;
    try {
      localStorage.setItem(C.HISCORE_KEY, String(hiscore));
    } catch (e) { /* private mode: ignore */ }
  }

  // ===========================================================================
  //  State transitions
  // ===========================================================================
  function enterTitle() {
    state = 'title';
    score = 0;
    lives = C.LIVES_START;
    fuel = C.FUEL_MAX;
    cameraY = C.TITLE_CAMERA_Y;
  }

  function startRun() {
    score = 0;
    lives = C.LIVES_START;
    fuel = C.FUEL_MAX;
    DS.Entities.startRun(C.PLAYER_START_Y);
    var p = DS.Entities.getPlayer();
    cameraY = p.y + C.PLAYER_SCREEN_Y;
    state = 'playing';
    lowFuelActive = false;
    refuelingThisTick = false;
    DS.Audio.uiStart();
    DS.Audio.startEngine();
    showHints();
  }

  function enterDying(cause) {
    state = 'dying';
    stateTimer = C.DYING_TICKS;
    lowFuelActive = false;
    DS.Audio.lowFuelAlarm(false);
    DS.Audio.stopEngine();
    DS.Audio.explosionBig();
  }

  function enterRespawn() {
    fuel = C.FUEL_MAX;
    var p = DS.Entities.getPlayer();
    var checkpointY = DS.River.sectionStartY(DS.River.sectionAt(p.y));
    DS.Entities.respawn(checkpointY + C.RESPAWN_OFFSET);
    var np = DS.Entities.getPlayer();
    cameraY = np.y + C.PLAYER_SCREEN_Y;
    state = 'respawn';
    stateTimer = C.RESPAWN_TICKS;
    lowFuelActive = false;
  }

  function enterGameOver() {
    state = 'gameover';
    stateTimer = C.GAMEOVER_INPUT_DELAY_TICKS;
    persistHiscore();
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      DS.Audio.setPaused(true);
    } else if (state === 'paused') {
      state = 'playing';
      DS.Audio.setPaused(false);
    }
  }

  // ===========================================================================
  //  Hints (touch only)
  // ===========================================================================
  function setupHints() {
    hintLeftEl = document.getElementById('hint-left');
    hintRightEl = document.getElementById('hint-right');
    hintKeysEl = document.getElementById('hint-keys');
    if (isTouch) {
      if (hintKeysEl) hintKeysEl.style.display = 'none';
      if (hintLeftEl) hintLeftEl.classList.add('hidden');
      if (hintRightEl) hintRightEl.classList.add('hidden');
    } else {
      if (hintLeftEl) hintLeftEl.style.display = 'none';
      if (hintRightEl) hintRightEl.style.display = 'none';
      // #hint-keys stays visible (default CSS)
    }
  }

  function showHints() {
    if (!isTouch || hintsShownTick !== -1) return;
    hintsShownTick = tick;
    if (hintLeftEl) hintLeftEl.classList.remove('hidden');
    if (hintRightEl) hintRightEl.classList.remove('hidden');
  }

  function updateHints(input) {
    if (!isTouch || hintsShownTick === -1) return;
    if (!hintLeftGesture && input.steer !== 0) {
      hintLeftGesture = true;
      if (hintLeftEl) hintLeftEl.classList.add('hidden');
    }
    if (!hintRightGesture && input.fire) {
      hintRightGesture = true;
      if (hintRightEl) hintRightEl.classList.add('hidden');
    }
    if (tick - hintsShownTick >= HINT_HIDE_TICKS) {
      if (hintLeftEl) hintLeftEl.classList.add('hidden');
      if (hintRightEl) hintRightEl.classList.add('hidden');
    }
  }

  // ===========================================================================
  //  Updates per state
  // ===========================================================================
  function handleMute(input) {
    if (input.mutePressed) DS.Audio.setMuted(!DS.Audio.isMuted());
  }

  function updateTitle() {
    var input = Input.poll();
    if (input.startPressed) { startRun(); return; }
    handleMute(input);
  }

  function updatePaused() {
    var input = Input.poll();
    if (input.pausePressed || input.startPressed) { togglePause(); return; }
    handleMute(input);
  }

  function updateDying(dt) {
    var input = Input.poll();
    handleMute(input);
    DS.Entities.updateExplosions(dt);
    stateTimer--;
    if (stateTimer <= 0) {
      if (lives > 0) { lives--; enterRespawn(); }
      else { enterGameOver(); }
    }
  }

  function updateRespawn() {
    var input = Input.poll();
    handleMute(input);
    stateTimer--;
    if (stateTimer <= 0) {
      state = 'playing';
      lowFuelActive = false;
      DS.Audio.startEngine();
    }
  }

  function updateGameover() {
    var input = Input.poll();
    handleMute(input);
    if (stateTimer > 0) { stateTimer--; return; }
    if (input.startPressed) enterTitle();
  }

  function updatePlaying(dt) {
    var input = Input.poll();
    if (input.pausePressed) { togglePause(); return; }
    handleMute(input);
    updateHints(input);

    DS.Entities.update(dt, input);        // may call onPlayerDeath -> enterDying
    if (state !== 'playing') return;

    var p = DS.Entities.getPlayer();
    cameraY = p.y + C.PLAYER_SCREEN_Y;

    fuel -= C.FUEL_DRAIN_PER_S * dt;       // constant drain, after refuel hook
    if (fuel <= 0) {
      fuel = 0;
      DS.Entities.killPlayer('fuel');      // -> onPlayerDeath -> enterDying
    }
    if (state !== 'playing') return;       // died by fuel

    // Audio: engine speed mapped 0..2 (brake/cruise/max).
    var speed = p.speed;
    var v = speed <= C.PLAYER_SPEED_CRUISE
      ? (speed - C.PLAYER_SPEED_MIN) / (C.PLAYER_SPEED_CRUISE - C.PLAYER_SPEED_MIN)
      : 1 + (speed - C.PLAYER_SPEED_CRUISE) / (C.PLAYER_SPEED_MAX - C.PLAYER_SPEED_CRUISE);
    DS.Audio.setEngineSpeed(v);

    if (refuelingThisTick && fuel < C.FUEL_MAX && (tick % C.REFUEL_TICK_PERIOD === 0)) {
      DS.Audio.refuelTick(fuel / C.FUEL_MAX);
    }

    var low = (fuel / C.FUEL_MAX) < C.FUEL_LOW_FRAC;
    if (low && !lowFuelActive) { lowFuelActive = true; DS.Audio.lowFuelAlarm(true); }
    else if (!low && lowFuelActive) { lowFuelActive = false; DS.Audio.lowFuelAlarm(false); }
  }

  function update(dt) {
    switch (state) {
      case 'title':    updateTitle(); break;
      case 'playing':  updatePlaying(dt); break;
      case 'paused':   updatePaused(); break;
      case 'dying':    updateDying(dt); break;
      case 'respawn':  updateRespawn(); break;
      case 'gameover': updateGameover(); break;
      default: break;
    }
    tick++;
    refuelingThisTick = false;
    syncPublic();
  }

  function syncPublic() {
    DS.Game.state = state;
    DS.Game.score = score;
    DS.Game.lives = lives;
    DS.Game.fuel = fuel;
    DS.Game.cameraY = cameraY;
    DS.Game.seed = seed;
    DS.Game.tick = tick;
  }

  // ===========================================================================
  //  Rendering (everything into octx, then blit to the visible canvas)
  // ===========================================================================
  function blinkVisible() {
    return (((tick / C.BLINK_TICKS) | 0) % 2) === 0;
  }

  function render() {
    var camInt = Math.round(cameraY);
    if (state === 'title') {
      DS.River.render(octx, C.TITLE_CAMERA_Y);
      renderTitle();
      renderHUD(octx);
    } else {
      DS.River.render(octx, camInt);
      DS.Entities.render(octx, camInt);
      renderHUD(octx);
      if (state === 'paused') renderPause();
    }
    vctx.drawImage(off, 0, 0, canvas.width, canvas.height);
  }

  function renderTitle() {
    DS.Sprites.drawText(octx, 'DELTA STRIKE', C.TITLE_LOGO_X, C.TITLE_LOGO_Y, 'YELLOW', 3);

    if (blinkVisible()) {
      var call = isTouch ? 'TAP TO START' : 'PRESS ENTER';
      var cx = (C.LOGICAL_W - DS.Sprites.textWidth(call, 1)) >> 1;
      DS.Sprites.drawText(octx, call, cx, C.TITLE_CALL_Y, 'YELLOW', 1);
    }

    var hi = hiscore >= C.SCORE_MAX ? ('HI ' + C.SCORE_BANG) : ('HI ' + hiscore);
    var hx = (C.LOGICAL_W - DS.Sprites.textWidth(hi, 1)) >> 1;
    DS.Sprites.drawText(octx, hi, hx, C.TITLE_HI_Y, 'WHITE', 1);

    if (isTouch) {
      var bx = C.TITLE_BTN_X, by = C.TITLE_BTN_Y, bw = C.TITLE_BTN_W, bh = C.TITLE_BTN_H;
      octx.fillStyle = C.PALETTE.BLACK;
      octx.fillRect(bx, by, bw, bh);
      octx.fillStyle = C.PALETTE.WHITE;
      octx.fillRect(bx, by, bw, 1);
      octx.fillRect(bx, by + bh - 1, bw, 1);
      octx.fillRect(bx, by, 1, bh);
      octx.fillRect(bx + bw - 1, by, 1, bh);
      DS.Sprites.drawText(octx, 'START', C.TITLE_BTN_TXT_X, C.TITLE_BTN_TXT_Y, 'YELLOW', 2);
    }
  }

  function renderPause() {
    if (blinkVisible()) {
      DS.Sprites.drawText(octx, 'PAUSE', C.PAUSE_TXT_X, C.PAUSE_TXT_Y, 'YELLOW', 2);
    }
  }

  function renderHUD(ctx) {
    var H = C.HUD, P = C.PALETTE;

    // 1. separator + background
    ctx.fillStyle = P.BLACK;
    ctx.fillRect(0, H.SEP_Y, C.LOGICAL_W, H.SEP_H);
    ctx.fillStyle = P.HUD_GRAY;
    ctx.fillRect(0, H.BG_Y, C.LOGICAL_W, C.LOGICAL_H - H.BG_Y);

    // 2. score (right-aligned, no leading zeros; blinks in gameover)
    if (state !== 'gameover' || blinkVisible()) {
      var txt = score >= C.SCORE_MAX ? C.SCORE_BANG : String(score);
      DS.Sprites.drawBig(ctx, txt, H.SCORE_RIGHT_X - txt.length * 10, H.SCORE_Y);
    }

    // 3. fuel gauge
    ctx.fillStyle = P.BLACK;
    ctx.fillRect(H.GAUGE_X, H.GAUGE_Y, H.GAUGE_W, H.GAUGE_H);
    ctx.fillStyle = P.HUD_GRAY;
    ctx.fillRect(H.GAUGE_X + 2, H.GAUGE_Y + 2, H.GAUGE_W - 4, H.GAUGE_H - 4);
    ctx.fillStyle = P.BLACK;
    ctx.fillRect(H.NOTCH_L_X, H.NOTCH_Y, 2, 2);
    ctx.fillRect(H.NOTCH_R_X, H.NOTCH_Y, 2, 2);
    DS.Sprites.drawText(ctx, 'E', H.E_X, H.E_Y, 'BLACK', 1);
    DS.Sprites.draw(ctx, 'half', 0, H.HALF_X, H.HALF_Y);
    DS.Sprites.drawText(ctx, 'F', H.F_X, H.F_Y, 'BLACK', 1);
    ctx.fillStyle = P.YELLOW;
    ctx.fillRect(H.PTR_X0 + Math.round(fuel / C.FUEL_MAX * H.PTR_RANGE), H.PTR_Y, H.PTR_W, H.PTR_H);

    // 4. lives digit + mini plane
    DS.Sprites.drawBig(ctx, String(lives), H.LIVES_DIGIT_X, H.LIVES_DIGIT_Y);
    DS.Sprites.draw(ctx, 'lifeIcon', 0, H.LIVES_ICON_X, H.LIVES_ICON_Y);

    // 5. rainbow band (6 rows)
    for (var i = 0; i < C.RAINBOW.length; i++) {
      ctx.fillStyle = P[C.RAINBOW[i]];
      ctx.fillRect(H.RAINBOW_X, H.RAINBOW_Y + i, H.RAINBOW_W, 1);
    }

    // 6. mute indicator
    if (DS.Audio.isMuted()) {
      DS.Sprites.drawText(ctx, 'M', H.MUTE_X, H.MUTE_Y, 'BLACK', 1);
    }
  }

  // ===========================================================================
  //  Resize (integer scale in physical pixels; nearest-neighbor blit)
  // ===========================================================================
  function resize() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var dpr = window.devicePixelRatio || 1;
    var s = Math.floor(Math.min(vw * dpr / C.LOGICAL_W, vh * dpr / C.LOGICAL_H));
    if (s < 1) s = Math.min(vw * dpr / C.LOGICAL_W, vh * dpr / C.LOGICAL_H);
    canvas.width = Math.round(C.LOGICAL_W * s);
    canvas.height = Math.round(C.LOGICAL_H * s);
    canvas.style.width = (canvas.width / dpr) + 'px';
    canvas.style.height = (canvas.height / dpr) + 'px';
    vctx = canvas.getContext('2d', { alpha: false });
    vctx.imageSmoothingEnabled = false;
  }

  // ===========================================================================
  //  Fixed-timestep rAF loop
  // ===========================================================================
  function frame(now) {
    requestAnimationFrame(frame);
    if (!last) { last = now; return; }
    var delta = (now - last) / 1000;
    last = now;
    if (delta > C.MAX_FRAME_DELTA) delta = C.DT;   // returned from background: discard
    acc += delta;
    var steps = 0;
    while (acc >= C.DT && steps < C.MAX_STEPS) {
      update(C.DT);
      acc -= C.DT;
      steps++;
    }
    if (steps === C.MAX_STEPS) acc = 0;            // anti spiral-of-death
    render();
  }

  // ===========================================================================
  //  Boot
  // ===========================================================================
  function parseSeed(search) {
    var v = new URLSearchParams(search).get('seed');
    if (v === null) return C.DEFAULT_SEED;
    var n = Number(v);                 // accepts decimal and 0x... hex
    return isFinite(n) ? (n >>> 0) : C.DEFAULT_SEED;
  }

  function init() {
    try {
      seed = parseSeed(location.search);

      canvas = document.getElementById('screen');
      vctx = canvas.getContext('2d', { alpha: false });
      off = document.createElement('canvas');
      off.width = C.LOGICAL_W;
      off.height = C.LOGICAL_H;
      octx = off.getContext('2d', { alpha: false });
      octx.imageSmoothingEnabled = false;

      isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

      DS.Sprites.init();
      DS.Audio.init();
      DS.River.init(seed);
      DS.Entities.init(hooks);
      Input.init(canvas);

      loadHiscore();

      resize();
      window.addEventListener('resize', resize);
      window.addEventListener('orientationchange', resize);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden && state === 'playing') togglePause();
      });

      setupHints();
      enterTitle();
      syncPublic();

      requestAnimationFrame(frame);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  DS.Game = {
    init: init,
    state: state,
    score: score,
    lives: lives,
    fuel: fuel,
    cameraY: cameraY,
    seed: seed,
    tick: tick,
    cheat: { invincible: false }
  };
})();
