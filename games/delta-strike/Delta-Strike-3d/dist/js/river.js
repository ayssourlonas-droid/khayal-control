/* DELTA STRIKE — river.js
 * Deterministic procedural river: geometry, spawns, decoration, and playfield
 * rendering. Owns DS.River. Pure function of (seed, sectionIndex) per section,
 * cached on demand. Consumes rng in the sacred order defined in interfaces §6.2:
 * geometry -> decoration -> deposits -> enemies -> jets.
 */
(function () {
  'use strict';
  window.DS = window.DS || {};

  var C = DS.C;
  var U = DS.U;

  // --- module state ---------------------------------------------------------
  var _seed = 0;
  var _sections = {};          // sectionIndex -> { chunks, spawns, decor }

  var CX_CENTER = C.LOGICAL_W >> 1;                 // 80
  var BRIDGE_W = C.BRIDGE_XR - C.BRIDGE_XL;         // 64
  var RIGHT_MARGIN = C.LOGICAL_W - C.RIVER_MARGIN;  // 152

  // --- small helpers --------------------------------------------------------

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  // Interval of `chunk` selected by `branch` (0 = first, 1 = last). A single
  // interval chunk collapses both branches to its only interval.
  function branchInterval(chunk, branch) {
    return chunk[branch < chunk.length ? branch : chunk.length - 1];
  }

  // Intersection of the branch-selected navigable intervals across chunks
  // c-1, c, c+1. Returns { ixl, ixr } (ixr exclusive).
  function intersectBranch(chunks, c, branch) {
    var ixl = -Infinity, ixr = Infinity;
    for (var cc = c - 1; cc <= c + 1; cc++) {
      var iv = branchInterval(chunks[cc], branch);
      if (iv.xl > ixl) ixl = iv.xl;
      if (iv.xr < ixr) ixr = iv.xr;
    }
    return { ixl: ixl, ixr: ixr };
  }

  // --- geometry (chunks 0..149) --------------------------------------------

  function genGeometry(rng, diff) {
    var chunks = new Array(C.SECTION_CHUNKS);
    var half;

    // Chunk 0: forced bridge channel.
    chunks[0] = [{ xl: C.BRIDGE_XL, xr: C.BRIDGE_XR }];

    // Chunks 1..5: centred WIDEN +8/chunk -> widths 72,80,88,96,104.
    for (var k = 1; k <= 5; k++) {
      var w = BRIDGE_W + 2 * C.EDGE_QUANT * k;       // 64 + 8k
      half = w >> 1;
      chunks[k] = [{ xl: CX_CENTER - half, xr: CX_CENTER + half }];
    }

    // Chunks 6..11: straight at SAFE_WIDEN_TARGET (104) centred.
    half = C.SAFE_WIDEN_TARGET >> 1;                 // 52
    for (k = 6; k < C.GEOM_FIRST_CHUNK; k++) {
      chunks[k] = [{ xl: CX_CENTER - half, xr: CX_CENTER + half }];
    }

    // Segment state carried across chunks 12..130.
    var xl = CX_CENTER - half;                       // 28
    var xr = CX_CENTER + half;                       // 132

    // Try to widen the current channel by one chunk (mutates xl/xr via return).
    function widenStep() {
      if (xr - xl >= diff.wMax) return;              // only widen if w < wMax
      if (xl - C.EDGE_QUANT < C.RIVER_MARGIN) {
        // left edge blocked: shift the whole widening to the right (+8)
        if (xr + 2 * C.EDGE_QUANT <= RIGHT_MARGIN) xr += 2 * C.EDGE_QUANT;
      } else if (xr + C.EDGE_QUANT > RIGHT_MARGIN) {
        // right edge blocked (mirror): widen left by 8
        if (xl - 2 * C.EDGE_QUANT >= C.RIVER_MARGIN) xl -= 2 * C.EDGE_QUANT;
      } else {
        xl -= C.EDGE_QUANT;
        xr += C.EDGE_QUANT;
      }
    }

    var c = C.GEOM_FIRST_CHUNK;                       // 12
    while (c <= C.GEOM_LAST_CHUNK) {
      // (1) segment type by cumulative weights: STRAIGHT, NARROW, WIDEN, SHIFT, ISLAND
      var base = C.SEG_W_STRAIGHT + C.SEG_W_NARROW + C.SEG_W_WIDEN +
                 diff.pShift + diff.pIsland;
      var r = U.rngInt(rng, base);
      var t1 = C.SEG_W_STRAIGHT;
      var t2 = t1 + C.SEG_W_NARROW;
      var t3 = t2 + C.SEG_W_WIDEN;
      var t4 = t3 + diff.pShift;
      var type;
      if (r < t1) type = 'STRAIGHT';
      else if (r < t2) type = 'NARROW';
      else if (r < t3) type = 'WIDEN';
      else if (r < t4) type = 'SHIFT';
      else type = 'ISLAND';

      // (2) segment length (roll depends on the ROLLED type, not the effect).
      var len;
      if (type === 'ISLAND') len = C.ISLAND_LEN_BASE + U.rngInt(rng, C.ISLAND_LEN_RAND);
      else len = C.SEG_LEN_BASE + U.rngInt(rng, C.SEG_LEN_RAND);

      // (3) SHIFT consumes one extra roll for direction.
      var dir = 0;
      if (type === 'SHIFT') dir = U.rngInt(rng, 2) ? 1 : -1;

      // Truncate so the segment never passes chunk 130.
      if (c + len - 1 > C.GEOM_LAST_CHUNK) len = C.GEOM_LAST_CHUNK - c + 1;

      // (4) per-chunk effect.
      var p;
      if (type === 'STRAIGHT') {
        for (p = 0; p < len; p++) chunks[c + p] = [{ xl: xl, xr: xr }];
      } else if (type === 'NARROW') {
        for (p = 0; p < len; p++) {
          if (xr - xl > diff.wMin) { xl += C.EDGE_QUANT; xr -= C.EDGE_QUANT; }
          chunks[c + p] = [{ xl: xl, xr: xr }];
        }
      } else if (type === 'WIDEN') {
        for (p = 0; p < len; p++) {
          widenStep();
          chunks[c + p] = [{ xl: xl, xr: xr }];
        }
      } else if (type === 'SHIFT') {
        var blocked = false;
        for (p = 0; p < len; p++) {
          if (!blocked) {
            var nxl = xl + C.EDGE_QUANT * dir;
            var nxr = xr + C.EDGE_QUANT * dir;
            if (nxl >= C.RIVER_MARGIN && nxr <= RIGHT_MARGIN) {
              xl = nxl; xr = nxr;
            } else {
              blocked = true;                        // stay blocked for the rest
            }
          }
          chunks[c + p] = [{ xl: xl, xr: xr }];
        }
      } else { // ISLAND
        var w0 = xr - xl;
        if (w0 >= C.ISLAND_MIN_RIVER_W) {
          var icx = (xl + xr) >> 1;
          var wiMax = Math.min(w0 - 56, C.ISLAND_MAX_W_CAP);   // multiple of 8
          for (p = 0; p < len; p++) {
            var up = C.ISLAND_START_W + 2 * C.EDGE_QUANT * p;             // 8,16,...
            var down = C.ISLAND_START_W + 2 * C.EDGE_QUANT * (len - 1 - p);
            var wi = Math.min(up, down, wiMax);
            var iw = wi >> 1;
            chunks[c + p] = [
              { xl: xl, xr: icx - iw },
              { xl: icx + iw, xr: xr }
            ];
          }
          // outer edges (xl, xr) stay frozen across the island.
        } else {
          // river too narrow: the whole segment behaves as WIDEN.
          for (p = 0; p < len; p++) {
            widenStep();
            chunks[c + p] = [{ xl: xl, xr: xr }];
          }
        }
      }

      c += len;
    }

    // Convergence 131..148: drift cx -> 80 and w -> 64.
    for (c = C.CONVERGE_FIRST_CHUNK; c < C.SECTION_CHUNKS - 1; c++) {
      var ccx = (xl + xr) >> 1;
      var cw = xr - xl;
      if (ccx !== CX_CENTER) ccx += C.EDGE_QUANT * Math.sign(CX_CENTER - ccx);
      if (cw !== BRIDGE_W) cw += 2 * C.EDGE_QUANT * Math.sign(BRIDGE_W - cw);
      var ch = cw >> 1;
      xl = ccx - ch;
      xr = ccx + ch;
      chunks[c] = [{ xl: xl, xr: xr }];
    }

    // Chunk 149: forced bridge channel (continuity with next section).
    chunks[C.SECTION_CHUNKS - 1] = [{ xl: C.BRIDGE_XL, xr: C.BRIDGE_XR }];

    return chunks;
  }

  // --- decoration (§6.2.2) --------------------------------------------------

  function genDecor(rng, chunks, i) {
    var decor = [];
    var base = i * C.SECTION_LEN;
    var side = U.rngInt(rng, 2);                      // 0 = left
    var cursor = C.DECOR_CHUNK_MIN;                   // 3

    while (cursor <= C.DECOR_CHUNK_MAX) {             // <= 144
      var t = U.rngInt(rng, 3);                       // 0 tree, 1 house, 2 combo
      var c = cursor;
      var refW = t === 0 ? DS.Sprites.size('tree').w : DS.Sprites.size('house').w;

      // conservative water edges over the two covered chunks (c, c+1)
      var L = Math.min(chunks[c][0].xl, chunks[c + 1][0].xl);
      var R = Math.max(chunks[c][chunks[c].length - 1].xr,
                       chunks[c + 1][chunks[c + 1].length - 1].xr);

      var ax;
      var ok = false;
      if (side === 0) {
        ax = L - C.DECOR_CLEARANCE - refW;
        ok = ax >= 0;
      } else {
        ax = R + C.DECOR_CLEARANCE;
        ok = ax + refW <= C.LOGICAL_W;
      }

      if (ok) {
        var yTop = base + c * C.RIVER_STEP + C.RIVER_STEP;   // world top-left y
        if (t === 0) {
          decor.push({ sprite: 'tree', x: ax, yTop: yTop });
        } else if (t === 1) {
          decor.push({ sprite: 'house', x: ax, yTop: yTop });
        } else {
          decor.push({ sprite: 'house', x: ax, yTop: yTop });
          decor.push({ sprite: 'tree', x: ax + 10, yTop: yTop - 10 });
        }
      }

      cursor += C.DECOR_STEP_MIN + U.rngInt(rng, C.DECOR_STEP_RAND);
      side ^= 1;
    }

    return decor;
  }

  // --- deposits (§6.2.3; 3 rolls per k) -------------------------------------

  function genFuel(rng, diff, chunks, i, occupied, fuelW) {
    var records = [];
    var nFuel = diff.nFuel;
    var base = i * C.SECTION_LEN;
    var need = fuelW + 2 * C.FUEL_CLEARANCE;          // 32

    for (var k = 0; k < nFuel; k++) {
      var c0 = C.GEOM_FIRST_CHUNK + Math.round((k + 0.5) * 119 / nFuel);
      var jit = U.rngInt(rng, 17) - 8;
      var c = U.clamp(c0 + jit, C.GEOM_FIRST_CHUNK, C.GEOM_LAST_CHUNK);
      var branch = U.rngInt(rng, 2);
      var roll = rng();

      var chosen = null;
      for (var a = 0; a < 2; a++) {
        var br = a === 0 ? branch : 1 - branch;
        var it = intersectBranch(chunks, c, br);
        var interW = it.ixr - it.ixl;
        if (interW >= need) { chosen = { it: it, interW: interW }; break; }
      }
      if (!chosen) continue;                          // skip; rolls consumed

      var maxDev = Math.floor((chosen.interW - fuelW - 2 * C.FUEL_CLEARANCE) / 2);
      var dev = Math.floor(roll * (2 * maxDev + 1)) - maxDev;
      var x = Math.round((chosen.it.ixl + chosen.it.ixr) / 2) + dev;
      var y = base + c * C.RIVER_STEP + 4;
      records.push({ type: 'fuel', x: x, y: y, dir: 1, moving: false });
      occupied.push(c);
    }

    return records;
  }

  // --- enemies (§6.2.4; 6 rolls per k) --------------------------------------

  function genEnemies(rng, diff, chunks, i, occupied, shipW, heliW) {
    var records = [];
    var nEnemy = diff.nEnemy;
    var base = i * C.SECTION_LEN;

    for (var k = 0; k < nEnemy; k++) {
      var c0 = C.GEOM_FIRST_CHUNK + Math.round((k + 0.5) * 119 / nEnemy);
      var jit = U.rngInt(rng, 17) - 8;
      var c = U.clamp(c0 + jit, C.GEOM_FIRST_CHUNK, C.GEOM_LAST_CHUNK);

      // gap: push forward while within ENTITY_MIN_GAP_CHUNKS of any record.
      var skipped = false;
      for (;;) {
        var conflict = false;
        for (var q = 0; q < occupied.length; q++) {
          if (Math.abs(occupied[q] - c) < C.ENTITY_MIN_GAP_CHUNKS) { conflict = true; break; }
        }
        if (!conflict) break;
        c++;
        if (c > C.GEOM_LAST_CHUNK) { skipped = true; break; }
      }

      // remaining rolls are ALWAYS consumed (even when skipped).
      var typeBit = U.rngInt(rng, 2);
      var moveRoll = rng();
      var dirBit = U.rngInt(rng, 2);
      var branch = U.rngInt(rng, 2);
      var posRoll = rng();
      if (skipped) continue;

      var chosen = null;
      for (var a = 0; a < 2; a++) {
        var br = a === 0 ? branch : 1 - branch;
        var it = intersectBranch(chunks, c, br);
        var interW = it.ixr - it.ixl;
        var t = typeBit === 0 ? 'ship' : 'heli';
        if (t === 'ship' && interW < C.SHIP_MIN_CHANNEL_W) t = 'heli';
        var sw = t === 'ship' ? shipW : heliW;
        if (interW >= sw + 4) { chosen = { it: it, interW: interW, t: t, sw: sw }; break; }
      }
      if (!chosen) continue;

      var maxDev = Math.floor((chosen.interW - chosen.sw - 4) / 2);
      var dev = Math.floor(posRoll * (2 * maxDev + 1)) - maxDev;
      var x = Math.round((chosen.it.ixl + chosen.it.ixr) / 2) + dev;
      var y = base + c * C.RIVER_STEP + 4;
      var moving = moveRoll < (chosen.t === 'heli' ? diff.heliMove : diff.shipMove);
      var dir = dirBit ? 1 : -1;
      records.push({ type: chosen.t, x: x, y: y, dir: dir, moving: moving });
      occupied.push(c);
    }

    return records;
  }

  // --- jets (§6.2.5; 2 rolls per k) -----------------------------------------

  function genJets(rng, diff, i) {
    var records = [];
    var nJet = diff.nJet;
    var base = i * C.SECTION_LEN;

    for (var k = 0; k < nJet; k++) {
      var c0 = C.JET_CHUNK_MIN + Math.round((k + 0.5) * 100 / nJet);
      var jit = U.rngInt(rng, 2 * C.JET_JITTER + 1) - C.JET_JITTER;   // rngInt(11) - 5
      var c = U.clamp(c0 + jit, C.JET_CHUNK_MIN, C.JET_CHUNK_MAX);
      var sideBit = U.rngInt(rng, 2);
      var x = sideBit ? C.LOGICAL_W + C.RIVER_MARGIN : -C.RIVER_MARGIN;  // 168 or -8
      var dir = sideBit ? -1 : 1;
      var y = base + c * C.RIVER_STEP + 4;
      records.push({ type: 'jet', x: x, y: y, dir: dir, moving: true });
    }

    return records;
  }

  // --- assembly -------------------------------------------------------------

  function assembleSpawns(i, fuels, enemies, jets) {
    var all = [];
    if (i >= 1) {
      all.push({ type: 'bridge', x: CX_CENTER, y: i * C.SECTION_LEN, dir: 1, moving: false });
    }
    var lists = [fuels, enemies, jets];
    for (var li = 0; li < lists.length; li++) {
      for (var j = 0; j < lists[li].length; j++) all.push(lists[li][j]);
    }

    // Stable sort by y ascending (decorate with original index for a fully
    // deterministic tie-break independent of the engine's sort stability).
    var order = [];
    for (var m = 0; m < all.length; m++) order.push(m);
    order.sort(function (a, b) { return all[a].y - all[b].y || a - b; });

    var sorted = new Array(all.length);
    for (var n = 0; n < order.length; n++) {
      var rec = all[order[n]];
      rec.id = 's' + pad2(i) + '-' + pad2(n);
      sorted[n] = rec;
    }
    return sorted;
  }

  // --- section cache --------------------------------------------------------

  function ensureSection(i) {
    var cached = _sections[i];
    if (cached) return cached;

    var rng = U.mulberry32(U.sectionSeed(_seed, i));
    var diff = C.DIFFICULTY[Math.min(i, C.DIFFICULTY.length - 1)];

    var fuelW = DS.Sprites.size('fuel').w;   // 12
    var shipW = DS.Sprites.size('ship').w;   // 24
    var heliW = DS.Sprites.size('heli').w;   // 16

    // Sacred consumption order: geometry -> decoration -> deposits -> enemies -> jets.
    var chunks = genGeometry(rng, diff);
    var decor = genDecor(rng, chunks, i);
    var occupied = [];
    var fuels = genFuel(rng, diff, chunks, i, occupied, fuelW);
    var enemies = genEnemies(rng, diff, chunks, i, occupied, shipW, heliW);
    var jets = genJets(rng, diff, i);
    var spawns = assembleSpawns(i, fuels, enemies, jets);

    var section = { chunks: chunks, spawns: spawns, decor: decor };
    _sections[i] = section;
    return section;
  }

  // --- render (§6.3) --------------------------------------------------------

  function renderPlayfield(ctx, camInt) {
    var P = C.PALETTE;
    var sy, w, ivs, x, iv;

    // 1. land + water lines.
    for (sy = 0; sy < C.PLAYFIELD_H; sy++) {
      w = camInt - sy;
      ivs = DS.River.channelAt(w);
      ctx.fillStyle = (sectionAt(w) % 2 === 0) ? P.GRASS_A : P.GRASS_B;
      ctx.fillRect(0, sy, C.LOGICAL_W, 1);
      ctx.fillStyle = P.WATER;
      for (x = 0; x < ivs.length; x++) {
        iv = ivs[x];
        ctx.fillRect(iv.xl, sy, iv.xr - iv.xl, 1);
      }
    }

    // 2. road strips over the banks at each visible bridge band.
    var bLo = Math.floor((camInt - 176) / C.SECTION_LEN);
    var bHi = Math.floor((camInt + 16) / C.SECTION_LEN) + 1;
    if (bLo < 1) bLo = 1;
    for (var b = bLo; b <= bHi; b++) {
      var syTop = camInt - b * C.SECTION_LEN - 8 + 1;  // +1 = §1.3 rule: align band to bridge sprite; rows syTop..syTop+15
      for (var r = 0; r < 16; r++) {
        sy = syTop + r;
        if (sy < 0 || sy >= C.PLAYFIELD_H) continue;
        if (r === 0 || r === 15) ctx.fillStyle = P.ROAD_DARK;
        else if (r === 7) ctx.fillStyle = P.YELLOW;
        else ctx.fillStyle = P.ROAD_LIGHT;
        ivs = DS.River.channelAt(camInt - sy);
        // paint the land parts only (complement of the water intervals).
        var cursor = 0;
        for (x = 0; x < ivs.length; x++) {
          iv = ivs[x];
          if (iv.xl > cursor) ctx.fillRect(cursor, sy, iv.xl - cursor, 1);
          if (iv.xr > cursor) cursor = iv.xr;
        }
        if (cursor < C.LOGICAL_W) ctx.fillRect(cursor, sy, C.LOGICAL_W - cursor, 1);
      }
    }

    // 3. decoration sprites.
    var iLo = sectionAt(camInt - (C.PLAYFIELD_H - 1));
    var iHi = sectionAt(camInt);
    for (var si = iLo; si <= iHi; si++) {
      var decor = ensureSection(si).decor;
      for (var d = 0; d < decor.length; d++) {
        var rec = decor[d];
        var dsy = camInt - rec.yTop;
        if (dsy > -12 && dsy < C.PLAYFIELD_H) {
          DS.Sprites.draw(ctx, rec.sprite, 0, rec.x, dsy);
        }
      }
    }
  }

  function sectionAt(worldY) {
    return Math.max(0, Math.floor(worldY / C.SECTION_LEN));
  }

  // --- public API (§6.1) ----------------------------------------------------

  DS.River = {
    init: function (seed) {
      _seed = seed >>> 0;
      _sections = {};
    },

    channelAt: function (worldY) {
      var y = worldY < 0 ? 0 : worldY;
      var i = Math.max(0, Math.floor(y / C.SECTION_LEN));
      var s = ensureSection(i);
      var c = Math.floor((y - i * C.SECTION_LEN) / C.RIVER_STEP);
      if (c < 0) c = 0;
      else if (c >= C.SECTION_CHUNKS) c = C.SECTION_CHUNKS - 1;
      return s.chunks[c];
    },

    sectionAt: sectionAt,

    sectionStartY: function (i) {
      return i * C.SECTION_LEN;
    },

    bridgeY: function (b) {
      return b * C.SECTION_LEN;
    },

    spawns: function (i) {
      return ensureSection(i).spawns;
    },

    render: function (ctx, camInt) {
      renderPlayfield(ctx, camInt);
    }
  };
})();
