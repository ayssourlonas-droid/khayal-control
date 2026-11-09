/* DELTA STRIKE — sprites.js
 * Pixel-map sprite atlas + bitmap fonts (DS.Sprites).
 *
 * Every pixel matrix below is transcribed VERBATIM from docs/plan/visual-spec.md
 * (§5.3 bridge, §5.4 house/tree, §7 entities, §8 fonts). Colours come ONLY from
 * DS.C.PALETTE, resolved through the single letter->key legend of
 * interfaces.md §4.3 — no hex literal ever appears in this file. Public API is
 * exactly interfaces.md §4.1.
 */
(function () {
  'use strict';
  window.DS = window.DS || {};

  // --- Legend: matrix letter -> DS.C.PALETTE key (interfaces §4.3) ----------
  // '.' means transparent (not drawn). This is the ONLY colour source here.
  var LEGEND = {
    K: 'BLACK',      W: 'WHITE',      H: 'HUD_GRAY',   I: 'ROAD_LIGHT',
    J: 'ROAD_DARK',  Y: 'YELLOW',     P: 'PALE_YELLOW', G: 'GOLD',
    M: 'MAGENTA',    R: 'RED',        C: 'ORANGE',     D: 'BROWN',
    S: 'DARK_BROWN', T: 'TRUNK',      N: 'NAVY',       E: 'HELI_GREEN',
    A: 'CYAN',       B: 'SKY',        Z: 'VIOLET',     O: 'WATER',
    Q: 'GRASS_A',    X: 'GRASS_B',    V: 'LIGHT_GREEN', L: 'LIME'
  };

  function repeatStr(chunk, n) {
    var s = '';
    for (var k = 0; k < n; k++) s += chunk;
    return s;
  }

  // --- Bridge (VS §5.3): 64x16. Rows 0 & 15 = beam pattern; rows 1..14 solid.
  var BRIDGE_BEAM = repeatStr('SSSS....', 8); // 64 px, VS §5.3 literal
  function buildBridge(inner) {                // inner = 14 solid-row colours
    var rows = [BRIDGE_BEAM];
    for (var k = 0; k < inner.length; k++) rows.push(repeatStr(inner[k], 64));
    rows.push(BRIDGE_BEAM);
    return rows;
  }
  // Normal bridge rows 1..14, then bridgeFire with swaps C->Y, D->G, G->P.
  var BRIDGE_INNER      = ['C', 'D', 'C', 'D', 'C', 'D', 'G',
                           'D', 'C', 'D', 'C', 'D', 'C', 'D'];
  var BRIDGE_FIRE_INNER = ['Y', 'G', 'Y', 'G', 'Y', 'G', 'P',
                           'G', 'Y', 'G', 'Y', 'G', 'Y', 'G'];

  // --- Sprite pixel maps ----------------------------------------------------
  // Each entry: name -> array of frames; each frame -> array of row strings.
  var SPRITES = {

    // Player jet — 14x12, VS §7.1 (single flight frame)
    player: [[
      '......YY......',
      '......YY......',
      '.....YYYY.....',
      '.....YYYY.....',
      '....YYYYYY....',
      '.YYYYYYYYYYYY.',
      'YYYYYYYYYYYYYY',
      'YYY..YYYY..YYY',
      '.....YYYY.....',
      '..Y..YYYY..Y..',
      '.YYYYYYYYYYYY.',
      '.YYY..YY..YYY.'
    ]],

    // Player explosion — 14x12, VS §7.1 frames A (fireball) and B (shards)
    playerBoom: [[
      '..............',
      '.....GGGG.....',
      '...GGYYYYGG...',
      '..GYYPPPPYYG..',
      '.GYPPPPPPPPYG.',
      '.GYPPPPPPPPYG.',
      '.GYPPPPPPPPYG.',
      '.GYPPPPPPPPYG.',
      '..GYYPPPPYYG..',
      '...GGYYYYGG...',
      '.....GGGG.....',
      '..............'
    ], [
      '.W...G....R...',
      '....R....W....',
      '.G.....G....W.',
      '.....W......R.',
      'R...G...W.....',
      '.....R....G...',
      '..W......R....',
      'G....W.......G',
      '....R...G.....',
      '.W.......W..R.',
      '...G...R......',
      'W.....W....G..'
    ]],

    // Player missile — 2x6, VS §7.2
    missile: [[
      'YY',
      'YY',
      'YY',
      'YY',
      'YY',
      'YY'
    ]],

    // Helicopter — 16x10, VS §7.3 (rotor frames 1 & 2). Faces right.
    heli: [[
      '..GGGGGGG.......',
      '........G.......',
      '.........GGGGGGG',
      '.......EEEE.....',
      'GG....EEEEEE....',
      'NNNNNNNNNNNNNN..',
      '.NNNNNNNNNNNNN..',
      '......E....E....',
      '.....EEEEEEEEE..',
      '................'
    ], [
      '.........GGGGGGG',
      '........G.......',
      '..GGGGGGG.......',
      'GG.....EEEE.....',
      '......EEEEEE....',
      'NNNNNNNNNNNNNN..',
      '.NNNNNNNNNNNNN..',
      '......E....E....',
      '.....EEEEEEEEE..',
      '................'
    ]],

    // Ship — 24x8, VS §7.4. Bow to the right = moving right.
    ship: [[
      '..........KK............',
      '..........KK............',
      '.......KKKKKKKK.........',
      '....KKKKKKKKKKKKKK......',
      '.KKKKKKKKKKKKKKKKKKKK...',
      'RRRRRRRRRRRRRRRRRRRRRRRR',
      '.RRRRRRRRRRRRRRRRRRRRRR.',
      '..VVVVVVVVVVVVVVVVVVVV..'
    ]],

    // Enemy jet — 16x8, VS §7.5. Nose points right, tail (fin) behind = moving right.
    jet: [[
      '.AA.............',
      '.AAA............',
      '.AAAA...........',
      '..BBBBBBBBBBBB..',
      '..BBBBBBBBBBBBBB',
      '..ZZZZZZZZZZZZ..',
      '......ZZZZ......',
      '.......ZZ.......'
    ]],

    // Fuel depot — 12x24, VS §7.6. F-U-E-L letters are hollow (transparent).
    fuel: [[
      '..MMMMMMMM..',
      '.MMMMMMMMMM.',
      'MMM......MMM',
      'MMM..MMMMMMM',
      'MMM.....MMMM',
      'MMM..MMMMMMM',
      'MMM..MMMMMMM',
      'WWW..WW..WWW',
      'WWW..WW..WWW',
      'WWW..WW..WWW',
      'WWW..WW..WWW',
      'WWW......WWW',
      'MMM......MMM',
      'MMM..MMMMMMM',
      'MMM....MMMMM',
      'MMM..MMMMMMM',
      'MMM......MMM',
      'WWW..WWWWWWW',
      'WWW..WWWWWWW',
      'WWW..WWWWWWW',
      'WWW..WWWWWWW',
      'WWW......WWW',
      '.MMMMMMMMMM.',
      '..MMMMMMMM..'
    ]],

    // Intact bridge — 64x16, VS §5.3
    bridge: [buildBridge(BRIDGE_INNER)],
    // Bridge flicker — 64x16, VS §5.3 with C->Y, D->G, G->P
    bridgeFire: [buildBridge(BRIDGE_FIRE_INNER)],

    // Generic explosion — 16x16, 3 frames, VS §7.7
    explosion: [[
      '................',
      '................',
      '......PPPP......',
      '....PPYYYYPP....',
      '....PYYYYYYP....',
      '...PYYYPPYYYP...',
      '...PYYPPPPYYP...',
      '...PYYPPPPYYP...',
      '...PYYYPPYYYP...',
      '....PYYYYYYP....',
      '....PPYYYYPP....',
      '......PPPP......',
      '................',
      '................',
      '................',
      '................'
    ], [
      '.....CCCCCC.....',
      '...CCGGGGGGCC...',
      '..CGGYYYYYYGGC..',
      '.CGYYYYYYYYYYGC.',
      '.CGYYPPPPPPYYGC.',
      'CGYYPPPPPPPPYYGC',
      'CGYPPPPPPPPPPYGC',
      'CGYPPPPPPPPPPYGC',
      'CGYPPPPPPPPPPYGC',
      'CGYPPPPPPPPPPYGC',
      'CGYYPPPPPPPPYYGC',
      '.CGYYPPPPPPYYGC.',
      '.CGYYYYYYYYYYGC.',
      '..CGGYYYYYYGGC..',
      '...CCGGGGGGCC...',
      '.....CCCCCC.....'
    ], [
      '..W.....G....R..',
      '......R.......W.',
      '.R..........G...',
      '....G...W.......',
      'W.........R....G',
      '...R....G.......',
      '.........W...R..',
      '..G..W..........',
      '..........G....W',
      '.W....R.........',
      '............R...',
      '...W....G.......',
      '.........W....G.',
      '..R.....W.......',
      '......G....R....',
      'W.............W.'
    ]],

    // Debris — 8x6, 2 frames, VS §7.8
    debris: [[
      'W..G..R.',
      '..R...W.',
      'G...W...',
      '.W....G.',
      '...R..W.',
      'W...G...'
    ], [
      '.G..W..R',
      'R....G..',
      '..W...R.',
      'G...W...',
      '.R....G.',
      '..W..R..'
    ]],

    // Life icon (mini plane) — 8x6, VS §7.9
    lifeIcon: [[
      '...YY...',
      '...YY...',
      '.YYYYYY.',
      'YYYYYYYY',
      '...YY...',
      '..YYYY..'
    ]],

    // House decoration — 20x9, VS §5.4
    house: [[
      '......KKKKKKKK......',
      '....KKKKKKKKKKKK....',
      '..KKKKKKKKKKKKKKKK..',
      '.WWWWWWWWWWWWWWWWWW.',
      '.WWWWWWWWWWWWWWWWWW.',
      '.WW.KKK..KKK..KKK.WW',
      '.WW.KKK..KKK..KKK.WW',
      '.WWWWWWWWWWWWWWWWWW.',
      '.WWWWWWWWWWWWWWWWWW.'
    ]],

    // Tree decoration — 12x9, VS §5.4
    tree: [[
      '.....LL.....',
      '....LLLL....',
      '..LLLLLLLL..',
      '.LLLLLLLLLL.',
      'LLLLLLLLLLLL',
      '..LLLLLLLL..',
      '....LLLL....',
      '.....TT.....',
      '.....TT.....'
    ]],

    // Fuel-gauge "half" glyph — 9x9, VS §8.3
    half: [[
      '.K.......',
      'KK....K..',
      '.K...K...',
      '.K..K....',
      'KKKK..KKK',
      '..K.....K',
      '.K....KKK',
      '......K..',
      '......KKK'
    ]]
  };

  // --- Mini-font 3x5 (VS §8.2 A-Z, 0-9; plus '!' from interfaces §4.3 and ' ')
  // 'X' = ink (colour chosen at draw time), '.' = transparent.
  var MINI = {
    A: ['.X.', 'X.X', 'XXX', 'X.X', 'X.X'],
    B: ['XX.', 'X.X', 'XX.', 'X.X', 'XX.'],
    C: ['.XX', 'X..', 'X..', 'X..', '.XX'],
    D: ['XX.', 'X.X', 'X.X', 'X.X', 'XX.'],
    E: ['XXX', 'X..', 'XX.', 'X..', 'XXX'],
    F: ['XXX', 'X..', 'XX.', 'X..', 'X..'],
    G: ['.XX', 'X..', 'X.X', 'X.X', '.XX'],
    H: ['X.X', 'X.X', 'XXX', 'X.X', 'X.X'],
    I: ['XXX', '.X.', '.X.', '.X.', 'XXX'],
    J: ['..X', '..X', '..X', 'X.X', '.X.'],
    K: ['X.X', 'XX.', 'X..', 'XX.', 'X.X'],
    L: ['X..', 'X..', 'X..', 'X..', 'XXX'],
    M: ['X.X', 'XXX', 'XXX', 'X.X', 'X.X'],
    N: ['XX.', 'X.X', 'X.X', 'X.X', 'X.X'],
    O: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
    P: ['XXX', 'X.X', 'XXX', 'X..', 'X..'],
    Q: ['XXX', 'X.X', 'X.X', 'XXX', '..X'],
    R: ['XXX', 'X.X', 'XX.', 'X.X', 'X.X'],
    S: ['.XX', 'X..', '.X.', '..X', 'XX.'],
    T: ['XXX', '.X.', '.X.', '.X.', '.X.'],
    U: ['X.X', 'X.X', 'X.X', 'X.X', 'XXX'],
    V: ['X.X', 'X.X', 'X.X', 'X.X', '.X.'],
    W: ['X.X', 'X.X', 'XXX', 'XXX', 'X.X'],
    X: ['X.X', 'X.X', '.X.', 'X.X', 'X.X'],
    Y: ['X.X', 'X.X', '.X.', '.X.', '.X.'],
    Z: ['XXX', '..X', '.X.', 'X..', 'XXX'],
    '0': ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'],
    '1': ['.X.', 'XX.', '.X.', '.X.', 'XXX'],
    '2': ['XXX', '..X', 'XXX', 'X..', 'XXX'],
    '3': ['XXX', '..X', 'XXX', '..X', 'XXX'],
    '4': ['X.X', 'X.X', 'XXX', '..X', '..X'],
    '5': ['XXX', 'X..', 'XXX', '..X', 'XXX'],
    '6': ['XXX', 'X..', 'XXX', 'X.X', 'XXX'],
    '7': ['XXX', '..X', '.X.', '.X.', '.X.'],
    '8': ['XXX', 'X.X', 'XXX', 'X.X', 'XXX'],
    '9': ['XXX', 'X.X', 'XXX', '..X', 'XXX'],
    '!': ['.X.', '.X.', '.X.', '...', '.X.'],
    ' ': ['...', '...', '...', '...', '...']
  };

  // --- Big font 8x10 (VS §8.1 digits 0-9 and '!'). Ink is always YELLOW.
  var BIG = {
    '0': ['.YYYYYY.', 'YYYYYYYY', 'YY....YY', 'YY....YY', 'YY....YY',
          'YY....YY', 'YY....YY', 'YY....YY', 'YYYYYYYY', '.YYYYYY.'],
    '1': ['...YY...', '..YYY...', '.YYYY...', '...YY...', '...YY...',
          '...YY...', '...YY...', '...YY...', '.YYYYYY.', '.YYYYYY.'],
    '2': ['.YYYYYY.', 'YYYYYYYY', 'YY....YY', '......YY', '....YYYY',
          '..YYYY..', '.YYY....', 'YY......', 'YYYYYYYY', 'YYYYYYYY'],
    '3': ['YYYYYYYY', 'YYYYYYYY', '......YY', '....YYY.', '....YYY.',
          '......YY', '......YY', 'YY....YY', 'YYYYYYYY', '.YYYYYY.'],
    '4': ['....YYY.', '...YYYY.', '..YYYYY.', '.YY.YYY.', 'YY..YYY.',
          'YYYYYYYY', 'YYYYYYYY', '....YYY.', '....YYY.', '....YYY.'],
    '5': ['YYYYYYYY', 'YYYYYYYY', 'YY......', 'YYYYYYY.', 'YYYYYYYY',
          '......YY', '......YY', 'YY....YY', 'YYYYYYYY', '.YYYYYY.'],
    '6': ['..YYYYY.', '.YYYYYYY', 'YY......', 'YY......', 'YYYYYYY.',
          'YYYYYYYY', 'YY....YY', 'YY....YY', 'YYYYYYYY', '.YYYYYY.'],
    '7': ['YYYYYYYY', 'YYYYYYYY', '......YY', '.....YY.', '....YY..',
          '...YY...', '..YY....', '..YY....', '..YY....', '..YY....'],
    '8': ['.YYYYYY.', 'YYYYYYYY', 'YY....YY', 'YY....YY', '.YYYYYY.',
          '.YYYYYY.', 'YY....YY', 'YY....YY', 'YYYYYYYY', '.YYYYYY.'],
    '9': ['.YYYYYY.', 'YYYYYYYY', 'YY....YY', 'YY....YY', 'YYYYYYYY',
          '.YYYYYYY', '......YY', '......YY', 'YYYYYYY.', '.YYYYY..'],
    '!': ['...YY...', '...YY...', '...YY...', '...YY...', '...YY...',
          '...YY...', '........', '........', '...YY...', '...YY...']
  };

  // --- Load-time integrity checks (contract: dims of §4.2 are exact) --------
  // These run once on script load. They only throw on a transcription error,
  // never in a correct build; the rest of the game relies on size()/frameCount.
  function validateMatrix(name, f, mat, w, h) {
    if (mat.length !== h) {
      throw new Error('sprite ' + name + ' frame ' + f + ' height ' +
        mat.length + ' != ' + h);
    }
    for (var y = 0; y < h; y++) {
      var row = mat[y];
      if (row.length !== w) {
        throw new Error('sprite ' + name + ' frame ' + f + ' row ' + y +
          ' width ' + row.length + ' != ' + w);
      }
      for (var x = 0; x < w; x++) {
        var ch = row.charAt(x);
        if (ch !== '.' && !LEGEND.hasOwnProperty(ch)) {
          throw new Error('sprite ' + name + ' frame ' + f + ' row ' + y +
            ' bad char "' + ch + '"');
        }
      }
    }
  }

  var META = {};   // name -> { w, h, n }
  (function buildMeta() {
    for (var name in SPRITES) {
      if (!SPRITES.hasOwnProperty(name)) continue;
      var frames = SPRITES[name];
      var w = frames[0][0].length;
      var h = frames[0].length;
      for (var f = 0; f < frames.length; f++) {
        validateMatrix(name, f, frames[f], w, h);
      }
      META[name] = { w: w, h: h, n: frames.length };
    }
  })();

  (function validateFonts() {
    var ch, g, i, j, c;
    for (ch in MINI) {
      if (!MINI.hasOwnProperty(ch)) continue;
      g = MINI[ch];
      if (g.length !== 5) throw new Error('minifont ' + ch + ' height ' + g.length);
      for (i = 0; i < 5; i++) {
        if (g[i].length !== 3) {
          throw new Error('minifont ' + ch + ' row ' + i + ' width ' + g[i].length);
        }
        for (j = 0; j < 3; j++) {
          c = g[i].charAt(j);
          if (c !== '.' && c !== 'X') {
            throw new Error('minifont ' + ch + ' bad char "' + c + '"');
          }
        }
      }
    }
    for (ch in BIG) {
      if (!BIG.hasOwnProperty(ch)) continue;
      g = BIG[ch];
      if (g.length !== 10) throw new Error('bigfont ' + ch + ' height ' + g.length);
      for (i = 0; i < 10; i++) {
        if (g[i].length !== 8) {
          throw new Error('bigfont ' + ch + ' row ' + i + ' width ' + g[i].length);
        }
        for (j = 0; j < 8; j++) {
          c = g[i].charAt(j);
          if (c !== '.' && c !== 'Y') {
            throw new Error('bigfont ' + ch + ' bad char "' + c + '"');
          }
        }
      }
    }
  })();

  // --- Pre-rendered offscreen caches (built by init) ------------------------
  var CACHE = {};        // name -> { normal:[canvas...], flip:[canvas...] }
  var COLORMAP = null;   // matrix letter -> css colour (from DS.C.PALETTE)
  var inited = false;

  function makeCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function renderFrame(mat, w, h, flip) {
    var cv = makeCanvas(w, h);
    var g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    for (var y = 0; y < h; y++) {
      var row = mat[y];
      for (var x = 0; x < w; x++) {
        var ch = row.charAt(x);
        if (ch === '.') continue;
        g.fillStyle = COLORMAP[ch];
        g.fillRect(flip ? (w - 1 - x) : x, y, 1, 1);
      }
    }
    return cv;
  }

  function init() {
    if (inited) return;
    var PAL = DS.C.PALETTE;
    COLORMAP = {};
    for (var lch in LEGEND) {
      if (LEGEND.hasOwnProperty(lch)) COLORMAP[lch] = PAL[LEGEND[lch]];
    }
    for (var name in SPRITES) {
      if (!SPRITES.hasOwnProperty(name)) continue;
      var frames = SPRITES[name];
      var meta = META[name];
      var norm = [];
      var flp = [];
      for (var f = 0; f < frames.length; f++) {
        norm.push(renderFrame(frames[f], meta.w, meta.h, false));
        flp.push(renderFrame(frames[f], meta.w, meta.h, true));
      }
      CACHE[name] = { normal: norm, flip: flp };
    }
    inited = true;
  }

  // --- Public draw ----------------------------------------------------------
  function draw(ctx, name, frame, sx, sy, flip) {
    var c = CACHE[name];
    if (!c) return;                       // draw before init(): no-op, no throw
    var n = c.normal.length;
    var f = frame % n;
    if (f < 0) f += n;
    ctx.drawImage((flip ? c.flip : c.normal)[f], sx, sy);
  }

  function size(name) {
    var m = META[name];
    return { w: m.w, h: m.h };
  }

  function frameCount(name) {
    return META[name].n;
  }

  // --- Mini-font text (3x5, dynamic colour, integer scale) ------------------
  function drawText(ctx, text, x, y, colorKey, scale) {
    if (scale === undefined) scale = 1;
    if (colorKey === undefined) colorKey = 'YELLOW';
    var color = DS.C.PALETTE[colorKey];
    if (color === undefined) color = DS.C.PALETTE.YELLOW;
    ctx.fillStyle = color;
    var cx = x;
    for (var i = 0; i < text.length; i++) {
      var glyph = MINI[text.charAt(i)];
      if (glyph) {                        // out-of-charset chars advance blank
        for (var ry = 0; ry < 5; ry++) {
          var row = glyph[ry];
          for (var rx = 0; rx < 3; rx++) {
            if (row.charAt(rx) === 'X') {
              ctx.fillRect(cx + rx * scale, y + ry * scale, scale, scale);
            }
          }
        }
      }
      cx += 4 * scale;
    }
  }

  function textWidth(text, scale) {
    if (scale === undefined) scale = 1;
    if (!text || text.length === 0) return 0;
    return (text.length * 4 - 1) * scale;
  }

  // --- Big font (8x10, fixed YELLOW). Advance 10 px per glyph. --------------
  function drawBig(ctx, text, x, y) {
    ctx.fillStyle = DS.C.PALETTE.YELLOW;
    var cx = x;
    for (var i = 0; i < text.length; i++) {
      var glyph = BIG[text.charAt(i)];
      if (glyph) {
        for (var ry = 0; ry < 10; ry++) {
          var row = glyph[ry];
          for (var rx = 0; rx < 8; rx++) {
            if (row.charAt(rx) === 'Y') ctx.fillRect(cx + rx, y + ry, 1, 1);
          }
        }
      }
      cx += 10;
    }
  }

  DS.Sprites = {
    init: init,
    draw: draw,
    size: size,
    frameCount: frameCount,
    drawText: drawText,
    textWidth: textWidth,
    drawBig: drawBig
  };
})();
