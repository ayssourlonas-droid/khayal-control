/* DELTA STRIKE — constants.js
 * Single source of truth: every tunable number + the canonical palette.
 * Transcribed verbatim from docs/plan/interfaces.md — edit there first.
 */
(function () {
  'use strict';
  window.DS = window.DS || {};

  var C = {

    // --- Presentation -------------------------------------------------
    LOGICAL_W: 160,
    LOGICAL_H: 210,
    PLAYFIELD_H: 162,            // playfield = screen rows 0..161
    HUD_Y: 162,                  // HUD = rows 162..209
    HUD_H: 48,
    PLAYER_SCREEN_Y: 134,        // screen y of the player sprite CENTER
    TITLE_CAMERA_Y: 161,         // camera for the static title backdrop

    // --- Fixed-timestep loop -------------------------------------------
    DT: 1 / 60,                  // s per update
    MAX_FRAME_DELTA: 0.25,       // s; larger rAF deltas are discarded
    MAX_STEPS: 5,                // max updates per rAF frame
    BLINK_TICKS: 30,             // half-period of blinking texts (0.5 s)

    // --- RNG ------------------------------------------------------------
    DEFAULT_SEED: 0x0D517A,      // official seed; every normal run is identical

    // --- State timers (ticks) -------------------------------------------
    DYING_BOOM_TICKS: 48,        // playerBoom A/B alternating every 4 ticks
    DYING_BLANK_TICKS: 30,       // player invisible, world still frozen
    DYING_TICKS: 78,             // = BOOM + BLANK
    RESPAWN_TICKS: 45,           // frozen at checkpoint, then playing
    GAMEOVER_INPUT_DELAY_TICKS: 60,

    // --- Player -----------------------------------------------------------
    PLAYER_START_Y: 27,          // worldY of player center at new run
    RESPAWN_OFFSET: 27,          // player worldY = sectionStartY + this
    PLAYER_SPEED_MIN: 30,        // px/s  (brake; can never stop)
    PLAYER_SPEED_CRUISE: 60,     // px/s  (no throttle input)
    PLAYER_SPEED_MAX: 150,       // px/s  (full throttle)
    PLAYER_ACCEL: 240,           // px/s^2 toward a higher speed target
    PLAYER_DECEL: 300,           // px/s^2 toward a lower speed target
    PLAYER_STEER_SPEED: 72,      // px/s lateral, constant, no inertia
    PLAYER_MIN_X: 9,             // clamp of player CENTER x
    PLAYER_MAX_X: 151,

    // --- Missile ----------------------------------------------------------
    MISSILE_SPEED: 420,          // px/s relative to the SCREEN
                                 // (world vy = MISSILE_SPEED + player.speed)
    MISSILE_MAX_ONSCREEN: 1,
    FIRE_COOLDOWN: 0.18,         // s between shots (autofire cadence)

    // --- Fuel ---------------------------------------------------------------
    FUEL_MAX: 100,               // units (full tank ~77 s)
    FUEL_DRAIN_PER_S: 1.3,       // constant, independent of speed
    REFUEL_PER_S: 30,            // while overlapping a live depot
    FUEL_LOW_FRAC: 0.25,         // alarm strictly below this fraction
    REFUEL_TICK_PERIOD: 6,       // game ticks between Audio.refuelTick (100 ms)

    // --- Lives / score --------------------------------------------------------
    LIVES_START: 3,              // reserve jets shown in HUD (total 4 planes)
    LIVES_MAX: 9,
    EXTRA_LIFE_SCORE: 10000,
    SCORE_SHIP: 30,
    SCORE_HELI: 60,
    SCORE_FUEL: 80,
    SCORE_JET: 100,
    SCORE_BRIDGE: 500,
    SCORE_MAX: 1000000,          // freezes here; display becomes SCORE_BANG
    SCORE_BANG: '!!!!!!',

    // --- River layout (px world / chunks of 8 px) -------------------------------
    SECTION_LEN: 1200,           // px per section (150 chunks)
    RIVER_STEP: 8,               // chunk height; channel constant inside a chunk
    SECTION_CHUNKS: 150,
    BRIDGE_XL: 48,               // forced channel at bridge chunks (0 and 149)
    BRIDGE_XR: 112,              // xr exclusive -> water spans x 48..111
    SAFE_CHUNKS: 12,             // chunks 0..11: entity-free respawn zone
    SAFE_WIDEN_TARGET: 104,      // safe zone widens 64 -> 104 then holds
    GEOM_FIRST_CHUNK: 12,        // random segments in chunks 12..130
    GEOM_LAST_CHUNK: 130,
    CONVERGE_FIRST_CHUNK: 131,   // 131..148: converge to 64 px centered
    RIVER_MARGIN: 8,             // channel always inside x in [8, 152]
    EDGE_QUANT: 4,               // bank edges are multiples of 4
    SEG_LEN_BASE: 8,             // segment length = 8 + rngInt(8)  (8..15)
    SEG_LEN_RAND: 8,
    ISLAND_LEN_BASE: 20,         // island length = 20 + rngInt(16) (20..35)
    ISLAND_LEN_RAND: 16,
    ISLAND_MIN_RIVER_W: 88,      // island only if channel width >= this
    ISLAND_START_W: 8,           // island appears at 8 px, grows +8/chunk
    ISLAND_MAX_W_CAP: 48,        // plateau width = min(w - 56, 48)
    SEG_W_STRAIGHT: 6,           // fixed segment weights
    SEG_W_NARROW: 3,
    SEG_W_WIDEN: 2,

    // --- Spawning (chunks) ---------------------------------------------------
    SPAWN_AHEAD: 16,             // px beyond camera top to arm spawns
    CULL_BEHIND: 16,             // px below camera bottom to cull
    ENTITY_MIN_GAP_CHUNKS: 5,    // min chunk distance between fuel/enemy records
    SPAWN_JITTER: 8,             // +- chunks for fuel/enemy targets
    JET_CHUNK_MIN: 20,
    JET_CHUNK_MAX: 120,
    JET_JITTER: 5,
    FUEL_CLEARANCE: 10,          // px of water required on each side of a depot
    DECOR_CHUNK_MIN: 3,
    DECOR_CHUNK_MAX: 144,
    DECOR_STEP_MIN: 8,           // next decor at + 8 + rngInt(8) chunks
    DECOR_STEP_RAND: 8,
    DECOR_CLEARANCE: 8,          // px of land between decor and water

    // --- Enemies -----------------------------------------------------------------
    SHIP_SPEED: 15,              // px/s, scaled by section speedMult
    HELI_SPEED: 20,
    JET_SPEED: 120,
    SHIP_MIN_CHANNEL_W: 48,      // ship spawns only in intervals this wide
    ENEMY_BOUNCE_MARGIN: 2,      // px from bank edge where dir flips
    HELI_ANIM_TICKS: 8,
    HITBOX_SHRINK: 1,            // px removed from each side of every AABB

    // --- Explosions / debris (ticks) ------------------------------------------------
    EXPLOSION_FRAME_TICKS: 8,    // generic explosion: 3 frames -> 24 ticks
    DEBRIS_LIFE_TICKS: 60,
    DEBRIS_FRAME_TICKS: 8,
    PLAYER_BOOM_FRAME_TICKS: 4,
    BRIDGE_FLICKER_TICKS: 32,
    BRIDGE_FLICKER_PERIOD_TICKS: 4,

    // --- Difficulty per section (index 0 = first; index >= 7 repeats row 7) -----------
    // wMin/wMax: channel width bounds (multiples of 8). pIsland/pShift: segment weights.
    // nEnemy/nFuel/nJet: records per section. heliMove/shipMove: probability of moving.
    // speedMult: multiplies SHIP/HELI/JET speed.
    DIFFICULTY: [
      { wMin: 64, wMax: 120, pIsland: 0, pShift: 1, nEnemy: 10, nFuel: 6, heliMove: 0.00, shipMove: 0.00, nJet: 0, speedMult: 1.0 },
      { wMin: 56, wMax: 120, pIsland: 1, pShift: 1, nEnemy: 13, nFuel: 5, heliMove: 0.25, shipMove: 0.00, nJet: 0, speedMult: 1.0 },
      { wMin: 56, wMax: 112, pIsland: 2, pShift: 2, nEnemy: 16, nFuel: 5, heliMove: 0.50, shipMove: 0.00, nJet: 2, speedMult: 1.1 },
      { wMin: 48, wMax: 112, pIsland: 2, pShift: 2, nEnemy: 19, nFuel: 4, heliMove: 0.75, shipMove: 0.25, nJet: 3, speedMult: 1.2 },
      { wMin: 48, wMax: 104, pIsland: 3, pShift: 3, nEnemy: 22, nFuel: 4, heliMove: 1.00, shipMove: 0.50, nJet: 4, speedMult: 1.3 },
      { wMin: 40, wMax: 104, pIsland: 3, pShift: 3, nEnemy: 25, nFuel: 3, heliMove: 1.00, shipMove: 0.75, nJet: 5, speedMult: 1.4 },
      { wMin: 40, wMax:  96, pIsland: 4, pShift: 4, nEnemy: 28, nFuel: 3, heliMove: 1.00, shipMove: 1.00, nJet: 6, speedMult: 1.5 },
      { wMin: 32, wMax:  96, pIsland: 4, pShift: 4, nEnemy: 30, nFuel: 2, heliMove: 1.00, shipMove: 1.00, nJet: 7, speedMult: 1.6 }
    ],

    // --- Touch input -----------------------------------------------------------------
    TOUCH_STEER_ZONE: 0.6,       // left fraction of the viewport = steering zone
    TOUCH_DEADZONE_X: 28,        // px CSS; |dx| >= 28 ENGAGES steer -1/+1
    TOUCH_STEER_RELEASE_X: 14,   // px CSS; steer RELEASES only when |dx| < 14 (hysteresis)
    TOUCH_THROTTLE_DY: 36,       // px CSS; dy <= -36 fast, dy >= +36 slow
    CORNER_BTN: 24,              // logical px; invisible mute (TL) / pause (TR) hotspots

    // --- HUD layout (from visual-spec §9; screen px) -----------------------------------
    HUD: {
      SEP_Y: 162, SEP_H: 2,          // black separator rows 162..163
      BG_Y: 164,                     // gray rows 164..209
      SCORE_RIGHT_X: 104,            // units digit occupies x 96..103
      SCORE_Y: 166,                  // digits rows 166..175
      GAUGE_X: 56, GAUGE_Y: 178,     // gauge box 48x14 (x 56..103, y 178..191)
      GAUGE_W: 48, GAUGE_H: 14,
      NOTCH_L_X: 58, NOTCH_R_X: 100, NOTCH_Y: 180,   // 2x2 black notches
      E_X: 61, E_Y: 182,             // 'E' minifont x1
      HALF_X: 75, HALF_Y: 180,       // 'half' glyph 9x9
      F_X: 96, F_Y: 182,             // 'F' minifont x1
      PTR_X0: 58, PTR_RANGE: 42,     // pointer x = 58 + round(fuel01 * 42)
      PTR_Y: 180, PTR_W: 2, PTR_H: 10,
      LIVES_DIGIT_X: 8, LIVES_DIGIT_Y: 180,
      LIVES_ICON_X: 20, LIVES_ICON_Y: 182,
      RAINBOW_X: 24, RAINBOW_Y: 198, RAINBOW_W: 112, // 6 rows y 198..203
      MUTE_X: 148, MUTE_Y: 182       // black 'M' when muted
    },
    RAINBOW: ['RED', 'ORANGE', 'GOLD', 'YELLOW', 'LIGHT_GREEN', 'VIOLET'],

    // --- Title / overlay layout (screen px) -----------------------------------------------
    TITLE_LOGO_X: 10, TITLE_LOGO_Y: 20,     // 'DELTA STRIKE' minifont x3 (141 px wide)
    TITLE_CALL_Y: 100,                      // blinking PRESS ENTER / TAP TO START
    TITLE_HI_Y: 112,                        // 'HI <score>' white
    TITLE_BTN_X: 56, TITLE_BTN_Y: 126,      // touch-only START button 48x16
    TITLE_BTN_W: 48, TITLE_BTN_H: 16,
    TITLE_BTN_TXT_X: 61, TITLE_BTN_TXT_Y: 129,
    PAUSE_TXT_X: 61, PAUSE_TXT_Y: 76,       // 'PAUSE' minifont x2, blinking

    // --- Canonical palette (visual-spec §13; the hex is normative) --------------------------
    PALETTE: {
      BLACK:       '#000000',
      WHITE:       '#F2F2F2',
      HUD_GRAY:    '#ABABAB',
      ROAD_LIGHT:  '#CDCDCD',
      ROAD_DARK:   '#797979',
      YELLOW:      '#FFF456',
      PALE_YELLOW: '#FFFF98',
      GOLD:        '#FFC545',
      MAGENTA:     '#EA51EB',
      RED:         '#B21D17',
      ORANGE:      '#C85F24',
      BROWN:       '#833008',
      DARK_BROWN:  '#451904',
      TRUNK:       '#391701',
      NAVY:        '#0C048B',
      HELI_GREEN:  '#0A4108',
      CYAN:        '#73CFEF',
      SKY:         '#73B6EF',
      VIOLET:      '#7382F7',
      WATER:       '#584FDA',
      GRASS_A:     '#649228',   // banks of even-index sections (0, 2, ...)
      GRASS_B:     '#0C4A1C',   // banks of odd-index sections
      LIGHT_GREEN: '#61D070',
      LIME:        '#B2D241'
    },

    // --- Persistence ------------------------------------------------------------------------
    HISCORE_KEY: 'ds.hiscore',
    MUTED_KEY: 'ds.muted'
  };

  Object.freeze(C.PALETTE);
  Object.freeze(C.HUD);
  Object.freeze(C.RAINBOW);
  for (var i = 0; i < C.DIFFICULTY.length; i++) Object.freeze(C.DIFFICULTY[i]);
  Object.freeze(C.DIFFICULTY);
  Object.freeze(C);
  DS.C = C;

  // --- DS.U: pure utilities -------------------------------------------------
  var U = {};

  U.mulberry32 = function (seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  U.sectionSeed = function (seed, i) {
    return (seed ^ Math.imul(i + 1, 0x9E3779B1)) >>> 0;
  };

  U.clamp = function (v, lo, hi) {
    return v < lo ? lo : (v > hi ? hi : v);
  };

  U.rngInt = function (rng, n) {          // int in [0, n)
    return Math.floor(rng() * n);
  };

  // AABB with CENTER coords + full dims (shrink is applied by the caller)
  U.aabb = function (ax, ay, aw, ah, bx, by, bw, bh) {
    return Math.abs(ax - bx) * 2 < (aw + bw) &&
           Math.abs(ay - by) * 2 < (ah + bh);
  };

  Object.freeze(U);
  DS.U = U;
})();
