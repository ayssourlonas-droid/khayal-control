/* DELTA STRIKE — entities.js
 * DS.Entities: player, missiles, enemies, bridges, explosions and debris.
 * Contract: docs/plan/interfaces.md §7.1, §7.4, §7.5 (interfaces.md is law).
 * World coords: worldY grows UP (player.y only increases while flying).
 */
(function () {
  'use strict';
  window.DS = window.DS || {};

  var C = DS.C;
  var U = DS.U;

  // --- Anchor / offset constants (interfaces.md §7.4 / §7.5, world px) --------
  // Named locals so no unexplained magic numbers live in the update/collision code.
  var MISSILE_TOP_MARGIN = 8;   // §7.4: cull a missile once y > cameraTop + this
  var SHIP_EXP_DX = 4;          // §7.5: ship explosions at (x-4, y+2) and (x+4, y+2)
  var SHIP_EXP_DY = 2;
  var FUEL_EXP_DY = 4;          // §7.5: fuel explosions at (x, y+4) and (x, y-4)
  var BRIDGE_EXP_COUNT = 4;     // §7.5: 4 explosions spread across the bridge span

  // --- Module state ----------------------------------------------------------
  var hooks = null;
  var started = false;

  var player = null;
  var enemies = [];
  var missiles = [];
  var explosions = [];
  var debris = [];
  var bridges = {};             // map: bridge index -> { b, x, y, destroyed, boomT }
  var pending = [];             // spawn records queued but not yet instantiated (y-ordered)
  var pendingHead = 0;
  var nextSection = 0;
  var fireCooldown = 0;

  // Values derived from constants / sprite sizes (filled in init()).
  var playerHbW = 12;           // 14 - 2*HITBOX_SHRINK
  var playerHbH = 10;           // 12 - 2*HITBOX_SHRINK
  var missileW = 2;
  var missileH = 6;
  var missileSpawnDy = 9;       // playerHalfH + missileHalfH
  var explosionTotalTicks = 24; // frameCount('explosion') * EXPLOSION_FRAME_TICKS

  // --- Small helpers ---------------------------------------------------------

  function swapRemove(arr, i) {
    arr[i] = arr[arr.length - 1];
    arr.pop();
  }

  function scoreForType(t) {
    return t === 'ship' ? C.SCORE_SHIP
      : t === 'heli' ? C.SCORE_HELI
      : t === 'fuel' ? C.SCORE_FUEL
      : t === 'jet' ? C.SCORE_JET
      : 0;
  }

  function baseSpeed(t) {
    return t === 'ship' ? C.SHIP_SPEED : C.HELI_SPEED;
  }

  // Enemy AABB half-dims after the 1px-per-side shrink. Sprite name == entity type.
  function shrunkW(name) { return DS.Sprites.size(name).w - 2 * C.HITBOX_SHRINK; }
  function shrunkH(name) { return DS.Sprites.size(name).h - 2 * C.HITBOX_SHRINK; }

  // Push an explosion. If (dbx,dby) are given, that explosion seeds one debris
  // at that world center when it expires (interfaces.md §7.4/§7.5).
  function addExplosion(x, y, dbx, dby) {
    var hasDebris = arguments.length >= 4;
    explosions.push({
      x: x, y: y, t: 0,
      hasDebris: hasDebris,
      debrisX: hasDebris ? dbx : 0,
      debrisY: hasDebris ? dby : 0
    });
  }

  // Spawn the explosions + debris seeds for a destroyed entity and play the
  // small-explosion sound. Does NOT award score (caller decides — §7.7).
  function explodeEnemyEffects(e) {
    switch (e.type) {
      case 'ship':
        addExplosion(e.x - SHIP_EXP_DX, e.y + SHIP_EXP_DY, e.x, e.y);
        addExplosion(e.x + SHIP_EXP_DX, e.y + SHIP_EXP_DY);
        break;
      case 'fuel':
        addExplosion(e.x, e.y + FUEL_EXP_DY, e.x, e.y);
        addExplosion(e.x, e.y - FUEL_EXP_DY);
        break;
      default: // heli / jet: single explosion + debris at the same center
        addExplosion(e.x, e.y, e.x, e.y);
        break;
    }
    DS.Audio.explosionSmall();
  }

  function destroyBridge(br) {
    br.destroyed = true;
    br.boomT = 0;
    DS.Audio.explosionBig();
    hooks.onScore(C.SCORE_BRIDGE, 'bridge');
    hooks.onBridgeDestroyed(br.b);
    // 4 explosions evenly across the span [BRIDGE_XL, BRIDGE_XR); debris at edges.
    var seg = (C.BRIDGE_XR - C.BRIDGE_XL) / BRIDGE_EXP_COUNT; // 16
    for (var k = 0; k < BRIDGE_EXP_COUNT; k++) {
      var cx = C.BRIDGE_XL + seg * k + seg / 2; // 56, 72, 88, 104
      if (k === 0) {
        addExplosion(cx, br.y, C.BRIDGE_XL, br.y);            // debris at 48
      } else if (k === BRIDGE_EXP_COUNT - 1) {
        addExplosion(cx, br.y, C.BRIDGE_XR, br.y);            // debris at 112
      } else {
        addExplosion(cx, br.y);
      }
    }
  }

  // --- Spawning --------------------------------------------------------------

  function instantiateRecord(rec, cameraBottom) {
    if (rec.y < cameraBottom) return;             // already behind: discard
    if (rec.type === 'bridge') {
      var b = rec.y / C.SECTION_LEN;
      var existing = bridges[b];
      if (existing && existing.destroyed) return; // stays destroyed: discard
      bridges[b] = { b: b, x: rec.x, y: rec.y, destroyed: false, boomT: -1 };
      return;
    }
    var e = {
      type: rec.type,
      x: rec.x,
      y: rec.y,
      dir: rec.dir,
      moving: rec.moving,
      animT: 0,
      xl: C.RIVER_MARGIN,
      xr: C.LOGICAL_W - C.RIVER_MARGIN
    };
    if (rec.type === 'ship' || rec.type === 'heli') {
      // Cache the navigable interval at this (constant) y for bouncing.
      var ivs = DS.River.channelAt(rec.y);
      var chosen = null;
      var k;
      for (k = 0; k < ivs.length; k++) {
        if (ivs[k].xl <= rec.x && rec.x < ivs[k].xr) { chosen = ivs[k]; break; }
      }
      if (!chosen) {
        var best = Infinity;
        for (k = 0; k < ivs.length; k++) {
          var c = (ivs[k].xl + ivs[k].xr) / 2;
          var d = Math.abs(c - rec.x);
          if (d < best) { best = d; chosen = ivs[k]; }
        }
      }
      if (chosen) { e.xl = chosen.xl; e.xr = chosen.xr; }
    }
    enemies.push(e);
  }

  function doSpawning(cameraTop, cameraBottom) {
    var threshold = cameraTop + C.SPAWN_AHEAD;
    // Queue whole sections whose start is within the spawn window.
    while (DS.River.sectionStartY(nextSection) <= threshold) {
      var recs = DS.River.spawns(nextSection);
      for (var k = 0; k < recs.length; k++) pending.push(recs[k]);
      nextSection++;
    }
    // Instantiate/discard every queued record already within the window.
    while (pendingHead < pending.length && pending[pendingHead].y <= threshold) {
      instantiateRecord(pending[pendingHead], cameraBottom);
      pendingHead++;
    }
    if (pendingHead > 0) { pending.splice(0, pendingHead); pendingHead = 0; }
  }

  // --- Player / missiles / enemies steps ------------------------------------

  function stepPlayer(dt, input) {
    player.x += input.steer * C.PLAYER_STEER_SPEED * dt;
    player.x = U.clamp(player.x, C.PLAYER_MIN_X, C.PLAYER_MAX_X);

    var target = input.throttle > 0 ? C.PLAYER_SPEED_MAX
      : input.throttle < 0 ? C.PLAYER_SPEED_MIN
        : C.PLAYER_SPEED_CRUISE;
    if (player.speed < target) {
      player.speed = Math.min(target, player.speed + C.PLAYER_ACCEL * dt);
    } else if (player.speed > target) {
      player.speed = Math.max(target, player.speed - C.PLAYER_DECEL * dt);
    }
    player.y += player.speed * dt;
  }

  function stepFire(dt, input) {
    fireCooldown -= dt;
    if (player.alive && input.fire && fireCooldown <= 0 &&
        missiles.length < C.MISSILE_MAX_ONSCREEN) {
      missiles.push({ x: player.x, y: player.y + missileSpawnDy });
      fireCooldown = C.FIRE_COOLDOWN;
      DS.Audio.shoot();
    }
  }

  function stepMissiles(dt, input, cameraTop) {
    var limit = cameraTop + MISSILE_TOP_MARGIN;
    for (var i = missiles.length - 1; i >= 0; i--) {
      var m = missiles[i];
      m.y += (C.MISSILE_SPEED + player.speed) * dt;   // world speed (§R5)
      m.x += input.steer * C.PLAYER_STEER_SPEED * dt; // guided (§R5)
      if (m.y > limit) swapRemove(missiles, i);       // off the top only (§R4)
    }
  }

  function stepEnemies(dt) {
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      var mult = C.DIFFICULTY[Math.min(DS.River.sectionAt(e.y), C.DIFFICULTY.length - 1)].speedMult;
      if (e.type === 'ship' || e.type === 'heli') {
        if (e.moving) {
          e.x += e.dir * baseSpeed(e.type) * mult * dt;
          var hw = DS.Sprites.size(e.type).w / 2;
          var m = C.ENEMY_BOUNCE_MARGIN;
          if (e.x - hw < e.xl + m) { e.dir = 1; e.x = e.xl + m + hw; }
          if (e.x + hw > e.xr - m) { e.dir = -1; e.x = e.xr - m - hw; }
        }
        if (e.type === 'heli') e.animT++;
      } else if (e.type === 'jet') {
        e.x += e.dir * C.JET_SPEED * mult * dt;        // ignores the river
        if (e.x < -10 || e.x > 170) swapRemove(enemies, i);
      }
      // fuel: static
    }
  }

  function cullEnemies(cameraBottom) {
    var floorY = cameraBottom - C.CULL_BEHIND;
    for (var i = enemies.length - 1; i >= 0; i--) {
      if (enemies[i].y < floorY) swapRemove(enemies, i);
    }
  }

  // --- Collisions (interfaces.md §7.7) --------------------------------------

  function stepCollisions() {
    var i, j, e, m;

    // 1) missile x enemy/depot: full 2x6 missile vs shrunk enemy AABB.
    for (i = enemies.length - 1; i >= 0; i--) {
      e = enemies[i];
      var ew = shrunkW(e.type), eh = shrunkH(e.type);
      for (j = missiles.length - 1; j >= 0; j--) {
        m = missiles[j];
        if (U.aabb(m.x, m.y, missileW, missileH, e.x, e.y, ew, eh)) {
          explodeEnemyEffects(e);
          hooks.onScore(scoreForType(e.type), e.type);
          swapRemove(missiles, j);
          swapRemove(enemies, i);
          break;
        }
      }
    }

    // 2) missile x bridge (undestroyed): 64x16 - 1px per side.
    var bw = shrunkW('bridge'), bh = shrunkH('bridge');
    for (j = missiles.length - 1; j >= 0; j--) {
      m = missiles[j];
      for (var key in bridges) {
        if (!bridges.hasOwnProperty(key)) continue;
        var br = bridges[key];
        if (br.destroyed) continue;
        if (U.aabb(m.x, m.y, missileW, missileH, br.x, br.y, bw, bh)) {
          destroyBridge(br);
          swapRemove(missiles, j);
          break;
        }
      }
    }

    // 3) player x ship/heli/jet: enemy explodes (no score) and player dies.
    if (player.alive) {
      for (i = enemies.length - 1; i >= 0; i--) {
        e = enemies[i];
        if (e.type === 'fuel') continue;
        if (U.aabb(player.x, player.y, playerHbW, playerHbH,
                   e.x, e.y, shrunkW(e.type), shrunkH(e.type))) {
          explodeEnemyEffects(e);
          swapRemove(enemies, i);
          killPlayer('enemy');
          break;
        }
      }
    }

    // 4) player x bridge (undestroyed).
    if (player.alive) {
      for (var key2 in bridges) {
        if (!bridges.hasOwnProperty(key2)) continue;
        var br2 = bridges[key2];
        if (br2.destroyed) continue;
        if (U.aabb(player.x, player.y, playerHbW, playerHbH, br2.x, br2.y, bw, bh)) {
          killPlayer('bridge');
          break;
        }
      }
    }

    // 5) player x live depot: refuel only, never lethal.
    if (player.alive) {
      for (i = 0; i < enemies.length; i++) {
        e = enemies[i];
        if (e.type !== 'fuel') continue;
        if (U.aabb(player.x, player.y, playerHbW, playerHbH,
                   e.x, e.y, shrunkW('fuel'), shrunkH('fuel'))) {
          hooks.onRefuel();
          break;
        }
      }
    }

    // 6) player x banks: 3 world-line sampling (§R18).
    if (player.alive) {
      var half = playerHbH / 2;         // 5
      var hx = playerHbW / 2;           // 6
      var lines = [player.y - half, player.y, player.y + half];
      for (var li = 0; li < lines.length; li++) {
        var ivs = DS.River.channelAt(lines[li]);
        var safe = false;
        for (var k = 0; k < ivs.length; k++) {
          if (ivs[k].xl <= player.x - hx && player.x + hx <= ivs[k].xr) {
            safe = true;
            break;
          }
        }
        if (!safe) { killPlayer('bank'); break; }
      }
    }
  }

  // --- Animations (advance in both update() and updateExplosions()) ----------

  function stepAnimations() {
    var i;
    for (i = explosions.length - 1; i >= 0; i--) {
      var ex = explosions[i];
      ex.t++;
      if (ex.t >= explosionTotalTicks) {
        if (ex.hasDebris) debris.push({ x: ex.debrisX, y: ex.debrisY, t: 0 });
        swapRemove(explosions, i);
      }
    }
    for (i = debris.length - 1; i >= 0; i--) {
      var d = debris[i];
      d.t++;
      if (d.t >= C.DEBRIS_LIFE_TICKS) swapRemove(debris, i);
    }
    for (var key in bridges) {
      if (!bridges.hasOwnProperty(key)) continue;
      var br = bridges[key];
      if (br.destroyed && br.boomT >= 0 && br.boomT < C.BRIDGE_FLICKER_TICKS) br.boomT++;
    }
    if (player && !player.alive && player.boomT < C.DYING_BOOM_TICKS) player.boomT++;
  }

  // --- Kill ------------------------------------------------------------------

  function killPlayer(cause) {
    if (!player || !player.alive) return; // idempotent within a tick
    player.alive = false;
    player.boomT = 0;
    missiles.length = 0;                  // remove the in-flight missile
    hooks.onPlayerDeath(cause);
  }

  // --- Render ----------------------------------------------------------------

  function drawSprite(ctx, camInt, name, frame, x, y, flip) {
    var sz = DS.Sprites.size(name);
    var sx = Math.round(x) - (sz.w >> 1);
    var sy = (camInt - Math.round(y)) - (sz.h >> 1) + 1; // +1 is mandatory (§1.3)
    DS.Sprites.draw(ctx, name, frame, sx, sy, flip);
  }

  // --- Public API ------------------------------------------------------------

  DS.Entities = {

    init: function (h) {
      hooks = h;
      player = { x: 80, y: 0, speed: C.PLAYER_SPEED_CRUISE, alive: false, boomT: -1 };
      enemies = [];
      missiles = [];
      explosions = [];
      debris = [];
      bridges = {};
      pending = [];
      pendingHead = 0;
      nextSection = 0;
      fireCooldown = 0;
      started = false;

      var ps = DS.Sprites.size('player');
      playerHbW = ps.w - 2 * C.HITBOX_SHRINK;
      playerHbH = ps.h - 2 * C.HITBOX_SHRINK;
      var ms = DS.Sprites.size('missile');
      missileW = ms.w;
      missileH = ms.h;
      missileSpawnDy = ps.h / 2 + ms.h / 2;
      explosionTotalTicks = DS.Sprites.frameCount('explosion') * C.EXPLOSION_FRAME_TICKS;
    },

    startRun: function (startY) {
      enemies = [];
      missiles = [];
      explosions = [];
      debris = [];
      bridges = {};
      pending = [];
      pendingHead = 0;
      nextSection = 0;
      fireCooldown = 0;
      player = { x: 80, y: startY, speed: C.PLAYER_SPEED_CRUISE, alive: true, boomT: -1 };
      started = true;
    },

    respawn: function (playerY) {
      enemies = [];
      missiles = [];
      explosions = [];
      debris = [];
      pending = [];        // bridges map is intentionally PRESERVED (checkpoint memory)
      pendingHead = 0;
      nextSection = DS.River.sectionAt(playerY);
      fireCooldown = 0;
      player = { x: 80, y: playerY, speed: C.PLAYER_SPEED_CRUISE, alive: true, boomT: -1 };
      started = true;
    },

    update: function (dt, input) {
      if (!started) return;
      var cameraTop = player.y + C.PLAYER_SCREEN_Y;
      var cameraBottom = cameraTop - (C.PLAYFIELD_H - 1);
      doSpawning(cameraTop, cameraBottom);
      stepPlayer(dt, input);
      stepFire(dt, input);
      stepMissiles(dt, input, cameraTop);
      stepEnemies(dt);
      cullEnemies(cameraBottom);
      stepCollisions();
      stepAnimations();
    },

    updateExplosions: function (dt) {
      if (!started) return;
      stepAnimations();
    },

    render: function (ctx, camInt) {
      if (!started) return;
      var i, e, key, br;

      // bridges
      for (key in bridges) {
        if (!bridges.hasOwnProperty(key)) continue;
        br = bridges[key];
        if (!br.destroyed) {
          drawSprite(ctx, camInt, 'bridge', 0, br.x, br.y, false);
        } else if (br.boomT < C.BRIDGE_FLICKER_TICKS) {
          var flick = Math.floor(br.boomT / C.BRIDGE_FLICKER_PERIOD_TICKS) % 2;
          drawSprite(ctx, camInt, flick ? 'bridgeFire' : 'bridge', 0, br.x, br.y, false);
        }
      }
      // fuel
      for (i = 0; i < enemies.length; i++) {
        e = enemies[i];
        if (e.type === 'fuel') drawSprite(ctx, camInt, 'fuel', 0, e.x, e.y, false);
      }
      // ship / heli
      for (i = 0; i < enemies.length; i++) {
        e = enemies[i];
        if (e.type === 'ship') {
          drawSprite(ctx, camInt, 'ship', 0, e.x, e.y, e.dir === -1);
        } else if (e.type === 'heli') {
          drawSprite(ctx, camInt, 'heli', Math.floor(e.animT / C.HELI_ANIM_TICKS),
                     e.x, e.y, e.dir === -1);
        }
      }
      // jet
      for (i = 0; i < enemies.length; i++) {
        e = enemies[i];
        if (e.type === 'jet') drawSprite(ctx, camInt, 'jet', 0, e.x, e.y, e.dir === -1);
      }
      // debris
      for (i = 0; i < debris.length; i++) {
        var d = debris[i];
        drawSprite(ctx, camInt, 'debris', Math.floor(d.t / C.DEBRIS_FRAME_TICKS),
                   d.x, d.y, false);
      }
      // missiles
      for (i = 0; i < missiles.length; i++) {
        drawSprite(ctx, camInt, 'missile', 0, missiles[i].x, missiles[i].y, false);
      }
      // player
      if (player.alive) {
        drawSprite(ctx, camInt, 'player', 0, player.x, player.y, false);
      } else if (player.boomT < C.DYING_BOOM_TICKS) {
        drawSprite(ctx, camInt, 'playerBoom',
                   Math.floor(player.boomT / C.PLAYER_BOOM_FRAME_TICKS),
                   player.x, player.y, false);
      }
      // explosions (on top)
      for (i = 0; i < explosions.length; i++) {
        var ex = explosions[i];
        drawSprite(ctx, camInt, 'explosion', Math.floor(ex.t / C.EXPLOSION_FRAME_TICKS),
                   ex.x, ex.y, false);
      }
    },

    killPlayer: killPlayer,

    getPlayer: function () {
      return player;
    }
  };
})();
