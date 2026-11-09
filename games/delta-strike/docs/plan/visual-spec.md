# DELTA STRIKE — Visual Specification (pixel by pixel)

> Normative document. The implementer MUST NOT make any visual decision:
> everything drawn on screen is defined here — colors, coordinates,
> sprite matrices, frames and sequences. Design reference: the look of
> River Raid (Atari 2600, NTSC). All assets below are ORIGINAL drawings
> created for this project, with the same reading/silhouette as the classic. No
> data was extracted from ROM.

---

## 0. Conventions of this document

- Game logical resolution: **160×210 px**, square pixels, origin `(0,0)` at the
  top-left corner. `x` grows to the right, `y` grows downward.
- Coordinate ranges are **inclusive**: `y=162..209` is 48 rows.
- Sprites are given as character matrices in code blocks:
  - `.` = transparent pixel (do not draw);
  - letters = colors, per the legend in Section 3.2 (e.g., `Y` = yellow).
- Anchor of every sprite = **top-left corner** of the matrix.
- Animation "frame" = swaps every N *game frames* at 60 fps (N indicated
  case by case).
- The mini font (3×5) uses `X` as generic ink; the color is defined at the point
  of use.

---

## 1. Rendering principles (mandatory)

1. **No smoothing.** `ctx.imageSmoothingEnabled = false` in all
   contexts; CSS `image-rendering: pixelated` on the visible canvas.
2. **Flat colors.** Forbidden: gradients, shadows, blur, anti-aliasing,
   partial transparency (alpha ≠ 1) and any filter. Every pixel is 100%
   opaque and one of the colors of the Canonical Palette (Section 13).
3. **Integer coordinates.** All positions/drawings in integers; the river scroll
   advances in integer pixel increments (1–4 px/frame depending on the
   speed). Never draw at a fractional position.
4. **Per-row shading (TIA style).** Multicolored sprites vary the color
   per horizontal ROW (like the 2600 hardware), never with dithering.
5. **No outlines.** Flat color meets flat color (river→bank, etc.) with no
   outline.
6. The entire game is drawn on a **160×210 offscreen canvas** and then
   copied (scaled) to the visible canvas — see Section 2.

---

## 2. Presentation on the page (outside the logical resolution)

- Page background (`html, body`): **black `#000000`**, no margins.
- The visible canvas is **centered horizontally and vertically** in the viewport
  (flexbox), with **black letterbox** on the leftover space.
- **Scale**: largest integer `k ≥ 1` such that `160·k ≤ viewportWidth` and
  `210·k ≤ viewportHeight`. If not even `k=1` fits (tiny viewport), use
  fractional scale `min(vw/160, vh/210)` as the single exception.
- Target orientation on mobile: **portrait** (the manifest sets
  `"orientation": "portrait"`).
- **Keyboard hint (desktop only)**: a single line of HTML text below the
  canvas, outside it:
  - exact text: `← → steer · ↑ ↓ speed · SPACE fire · ENTER start · P pause · M mute`
  - font: `12px monospace`, color `#666666`, `text-align: center`;
  - hide when `('ontouchstart' in window)` is true.
- On touch there **are no** permanent visual buttons during the game (touch
  zones are invisible). The only drawn control is the START button on the title
  screen (Section 11.1).

---

## 3. Logical screen layout (160×210)

```
y=0   ┌──────────────────────────────┐
      │        PLAYFIELD             │  y = 0..161  (162 rows)
      │  river, banks, entities      │
y=161 ├──────────────────────────────┤
y=162 │ black line (2 px)            │  y = 162..163
y=164 │        HUD (gray)            │  y = 164..209
y=209 └──────────────────────────────┘
x=0                                x=159
```

### 3.1 Fixed regions

| Region                    | Coordinates               | Background color    |
|---------------------------|---------------------------|---------------------|
| Playfield                 | x=0..159, y=0..161        | river/banks (Sec.5) |
| Separator                 | x=0..159, y=162..163      | `#000000`           |
| HUD                       | x=0..159, y=164..209      | `#ABABAB`           |

### 3.2 Sprite color legend (letter → color)

This legend applies to ALL matrices in the document. Hex values in Section 13.

| Letter | Name                       | Hex       |
|--------|----------------------------|-----------|
| `.`    | transparent                | —         |
| `K`    | black                      | `#000000` |
| `W`    | white                      | `#F2F2F2` |
| `H`    | HUD gray                   | `#ABABAB` |
| `I`    | light gray (road)          | `#CDCDCD` |
| `J`    | dark gray (road)           | `#797979` |
| `Y`    | primary yellow             | `#FFF456` |
| `P`    | pale yellow (flash)        | `#FFFF98` |
| `G`    | gold (rotor/explosion)     | `#FFC545` |
| `M`    | magenta (FUEL depot)       | `#EA51EB` |
| `R`    | red                        | `#B21D17` |
| `C`    | brick-orange (bridge)      | `#C85F24` |
| `D`    | dark brown (bridge)        | `#833008` |
| `S`    | shadow brown (bridge)      | `#451904` |
| `T`    | trunk brown (tree)         | `#391701` |
| `N`    | navy blue (helicopter)     | `#0C048B` |
| `E`    | heli-green (helicopter)    | `#0A4108` |
| `A`    | light cyan (enemy jet)     | `#73CFEF` |
| `B`    | sky blue (enemy jet)       | `#73B6EF` |
| `Z`    | blue-violet (enemy jet)    | `#7382F7` |
| `O`    | river blue                 | `#584FDA` |
| `Q`    | olive green (light bank)   | `#649228` |
| `X`    | forest green (dark bank)   | `#0C4A1C` |
| `V`    | light green (ship/strip)   | `#61D070` |
| `L`    | lime green (tree)          | `#B2D241` |

---

## 4. Palette — origin and rules

- The hex values were fixed from reading the Atari 2600 NTSC palette as
  rendered by the classic emulators (Stella/z26 family) in captures of the
  reference game. **The normative value is the hex** — the TIA code column in
  Section 13 is only informative/approximate.
- It is forbidden to use any color outside the Canonical Palette.
- There are no dynamic brightness variations (no "day/night", no fade).
  Screen transitions are a **hard cut** (2600 style).

---

## 5. Playfield: river, banks, road and bridge

### 5.1 River and banks

- **River**: fill the entire playfield with blue `O #584FDA`; the banks are
  drawn on top.
- **Banks** (left and right) and **islands**: flat green rectangles.
  - Bank color alternates **per section** (one section = stretch between two
    bridges): odd sections (1st, 3rd, ...) = olive green `Q #649228`; even
    sections = forest green `X #0C4A1C`. The color change happens exactly at the
    bridge row (the road/bridge is the boundary).
  - Trees and houses use the same colors in both sections.
- **"Playfield 2600" quantization** (mandatory):
  - every vertical edge of bank/island sits at `x` multiple of **4**;
  - the bank width only changes in steps: horizontal segments of minimum
    height **4 px** (typical height 8 px), maximum variation of **8 px** of
    width per step;
  - result: rectangular "staircase" outline, never diagonal or curved.
- The river geometry (widths, forks around islands, narrowings) is defined in
  the gameplay spec; this document sets only the drawing rule above.
- The river has NO texture, waves or highlights: 100% flat blue.

### 5.2 Road (on the banks, at the height of each bridge)

Verified in the original: the road is **horizontal**, crossing both banks
exactly at the vertical band of the bridge (there is no vertical road). A band
of **16 rows** in height, aligned with the bridge (same `y`):

| Band rows (relative, 0..15)        | Color |
|------------------------------------|-----|
| 0                                  | `J #797979` |
| 1..6                               | `I #CDCDCD` |
| 7                                  | `Y #FFF456` (center line of the lane) |
| 8..14                              | `I #CDCDCD` |
| 15                                 | `J #797979` |

- Draw the road over the ENTIRE width of the left and right bank
  (x=0 to the river edge; from the other river edge to x=159).
- The road scrolls together with the playfield (it is part of the scenery).

### 5.3 Bridge (over the channel, between the two halves of the road)

- In the bridge stretch the channel has a fixed width of **64 px centered**
  (x=48..111) — the bridge is a **64×16 px** block that completes the road.
- Rows 1..14 are solid color fills from edge to edge (64 px);
  rows 0 and 15 are the "beams/pillars" pattern with water showing through:

Row 0 and row 15 (literal, 64 characters — `S` = shadow brown, `.` = river):

```
SSSS....SSSS....SSSS....SSSS....SSSS....SSSS....SSSS....SSSS....
```

| Rows 1..14 | Color |
|--------------|-----|
| 1            | `C #C85F24` |
| 2            | `D #833008` |
| 3            | `C` |
| 4            | `D` |
| 5            | `C` |
| 6            | `D` |
| 7            | `G #FFC545` (the yellow road line continues over the bridge, in a gold tone) |
| 8            | `D` |
| 9            | `C` |
| 10           | `D` |
| 11           | `C` |
| 12           | `D` |
| 13           | `C` |
| 14           | `D` |

- **Bridge exploding** (when hit): for **32 frames**, alternate every
  4 frames between the normal matrix and a version with color swaps
  `C→Y`, `D→G`, `G→P` (fire flicker). Together, draw 4 generic
  16×16 explosions (Section 7.7) side by side over the bridge, at
  x = 48, 64, 80, 96 (y = top of the bridge), advancing the 3 frames normally.
- **Bridge destroyed**: after the sequence, the bridge is removed entirely
  (the river shows); draw the debris sprite (Section 7.8) for 60 frames
  at the two abutments (x=44 and x=108, y = row 6 of the band).

### 5.4 Bank decoration (houses and trees)

They enter the game (faithful to the original, which decorates the banks with
little houses and trees). Rules:

- They appear ONLY over green bank; never over the road, never over the
  river, never closer than 8 px from the water edge.
- Allowed patterns (chosen by terrain generation, gameplay spec):
  1. **House** alone;
  2. **Tree** alone;
  3. **House + tree**: tree with anchor offset `(+10, +10)` relative to the
     house anchor (tree below and to the right — typical composition of the
     original).
- Target visual density: 1 decoration every 40–80 px of scroll, alternating
  left/right side.

**House — 20×9 px** (stepped black roof, white body, 3 black windows):

```
......KKKKKKKK......
....KKKKKKKKKKKK....
..KKKKKKKKKKKKKKKK..
.WWWWWWWWWWWWWWWWWW.
.WWWWWWWWWWWWWWWWWW.
.WW.KKK..KKK..KKK.WW
.WW.KKK..KKK..KKK.WW
.WWWWWWWWWWWWWWWWWW.
.WWWWWWWWWWWWWWWWWW.
```

**Tree — 12×9 px** (lime-green crown in a cross, brown trunk):

```
.....LL.....
....LLLL....
..LLLLLLLL..
.LLLLLLLLLL.
LLLLLLLLLLLL
..LLLLLLLL..
....LLLL....
.....TT.....
.....TT.....
```

---

## 6. Entities — general table

| Entity              | Size     | Frames | Mirroring |
|---------------------|----------|--------|--------------|
| Player (delta jet)  | 14×12    | 1 + 2 explosion | no |
| Player missile      | 2×6      | 1      | no |
| Helicopter          | 16×10    | 2 (rotor) | yes (horizontal) |
| Ship                | 24×8     | 1      | yes (horizontal) |
| Enemy jet           | 16×8     | 1      | yes (horizontal) |
| FUEL depot          | 12×24    | 1      | no |
| Bridge              | 64×16    | 1 + flicker | no |
| Generic explosion   | 16×16    | 3      | no |
| Debris              | 8×6      | 2      | no |
| Mini-plane (lives)  | 8×6      | 1      | no |

Mirroring rule: directional sprites (helicopter, ship, enemy jet) are drawn
mirrored horizontally when they move left. The matrices below show the
"moving RIGHT" version.

---

## 7. Sprites (normative matrices)

### 7.1 Player — delta jet, 14×12, single color `Y`

**Fidelity decision:** in the original the plane does NOT bank when
maneuvering — the sprite is a single one. Delta Strike does the same: **a single
state**, with no "banked" variants. (The "3 states" were evaluated and discarded
for fidelity.)

```
......YY......
......YY......
.....YYYY.....
.....YYYY.....
....YYYYYY....
.YYYYYYYYYYYY.
YYYYYYYYYYYYYY
YYY..YYYY..YYY
.....YYYY.....
..Y..YYYY..Y..
.YYYYYYYYYYYY.
.YYY..YY..YYY.
```

- Initial/respawn position: anchor at `x=73, y=140` (sprite center at
  x=80).
- Reading: thin nose, delta wings at mid-height, notch, twin tail.

**Player exploding — frame A (fireball), 14×12:**

```
..............
.....GGGG.....
...GGYYYYGG...
..GYYPPPPYYG..
.GYPPPPPPPPYG.
.GYPPPPPPPPYG.
.GYPPPPPPPPYG.
.GYPPPPPPPPYG.
..GYYPPPPYYG..
...GGYYYYGG...
.....GGGG.....
..............
```

**Player exploding — frame B (shards), 14×12:**

```
.W...G....R...
....R....W....
.G.....G....W.
.....W......R.
R...G...W.....
.....R....G...
..W......R....
G....W.......G
....R...G.....
.W.......W..R.
...G...R......
W.....W....G..
```

Death sequence: see Section 10.2.

### 7.2 Player missile — 2×6, single color `Y`

```
YY
YY
YY
YY
YY
YY
```

- Spawns with anchor at `(playerX + 6, playerY - 6)` and rises.
- There is only **one missile on screen at a time** (faithful cadence; detailed
  in the gameplay spec).

### 7.3 Helicopter — 16×10, 2 frames (rotor alternates)

Colors per row (TIA style): gold rotor `G`, heli-green cabin `E`,
navy-blue fuselage/tail `N`, skids `E`. Tail on the left = flying to the
right.

**Frame 1:**

```
..GGGGGGG.......
........G.......
.........GGGGGGG
.......EEEE.....
GG....EEEEEE....
NNNNNNNNNNNNNN..
.NNNNNNNNNNNNN..
......E....E....
.....EEEEEEEEE..
................
```

**Frame 2:**

```
.........GGGGGGG
........G.......
..GGGGGGG.......
GG.....EEEE.....
......EEEEEE....
NNNNNNNNNNNNNN..
.NNNNNNNNNNNNN..
......E....E....
.....EEEEEEEEE..
................
```

- Frame swap every **8 frames** of game (~7.5 Hz).
- Mirror horizontally when flying left (tail always behind).

### 7.4 Ship — 24×8

Black superstructure `K` with funnel, red hull `R`, light-green waterline
`V`. Bow on the right = moving to the right.

```
..........KK............
..........KK............
.......KKKKKKKK.........
....KKKKKKKKKKKKKK......
.KKKKKKKKKKKKKKKKKKKK...
RRRRRRRRRRRRRRRRRRRRRRRR
.RRRRRRRRRRRRRRRRRRRRRR.
..VVVVVVVVVVVVVVVVVVVV..
```

### 7.5 Enemy jet — 16×8

Fighter in side view, 3 shades of blue (`A` light on the fin, `B` on the
fuselage, `Z` on the belly/wing). Elements that ensure it reads as a plane:
**fin (vertical tail) behind**, long fuselage tapering to a **pointed nose in
front** and **wing below the center**. Nose on the right = flying to the right;
mirror to the left (tail always behind).

> Revision 2026-07-10: the previous drawing ("dart with arrow-shaped wings")
> read as an arrow, not a plane (bug reported in playtest). Matrix replaced;
> same dimensions, legend and anchors — no contract affected.

```
.AA.............
.AAA............
.AAAA...........
..BBBBBBBBBBBB..
..BBBBBBBBBBBBBB
..ZZZZZZZZZZZZ..
......ZZZZ......
.......ZZ.......
```

### 7.6 Fuel depot — 12×24, hollow F-U-E-L letters

Alternating horizontal bands magenta `M` / white `W`, rounded top and base.
The letters are **hollow** (transparent pixels — the river shows through them,
exactly like the reading of the original). Depots only exist over water, so the
hollow always shows blue.

```
..MMMMMMMM..
.MMMMMMMMMM.
MMM......MMM
MMM..MMMMMMM
MMM.....MMMM
MMM..MMMMMMM
MMM..MMMMMMM
WWW..WW..WWW
WWW..WW..WWW
WWW..WW..WWW
WWW..WW..WWW
WWW......WWW
MMM......MMM
MMM..MMMMMMM
MMM....MMMMM
MMM..MMMMMMM
MMM......MMM
WWW..WWWWWWW
WWW..WWWWWWW
WWW..WWWWWWW
WWW..WWWWWWW
WWW......WWW
.MMMMMMMMMM.
..MMMMMMMM..
```

Reading top to bottom: M band with `F`, W band with `U`, M band with `E`,
W band with `L`.

### 7.7 Generic explosion — 16×16, 3 frames

Each frame lasts **8 game frames** (total 24). Then the debris (7.8) comes in.

**Frame 1 — flash:**

```
................
................
......PPPP......
....PPYYYYPP....
....PYYYYYYP....
...PYYYPPYYYP...
...PYYPPPPYYP...
...PYYPPPPYYP...
...PYYYPPYYYP...
....PYYYYYYP....
....PPYYYYPP....
......PPPP......
................
................
................
................
```

**Frame 2 — fireball:**

```
.....CCCCCC.....
...CCGGGGGGCC...
..CGGYYYYYYGGC..
.CGYYYYYYYYYYGC.
.CGYYPPPPPPYYGC.
CGYYPPPPPPPPYYGC
CGYPPPPPPPPPPYGC
CGYPPPPPPPPPPYGC
CGYPPPPPPPPPPYGC
CGYPPPPPPPPPPYGC
CGYYPPPPPPPPYYGC
.CGYYPPPPPPYYGC.
.CGYYYYYYYYYYGC.
..CGGYYYYYYGGC..
...CCGGGGGGCC...
.....CCCCCC.....
```

**Frame 3 — dispersion:**

```
..W.....G....R..
......R.......W.
.R..........G...
....G...W.......
W.........R....G
...R....G.......
.........W...R..
..G..W..........
..........G....W
.W....R.........
............R...
...W....G.......
.........W....G.
..R.....W.......
......G....R....
W.............W.
```

Centering by target (the explosion is drawn centered on the target's center):

| Target       | Explosions and anchors (relative to the target anchor) |
|--------------|---------------------------------------------------|
| Helicopter   | 1 explosion at `(0, -3)` |
| Enemy jet    | 1 explosion at `(0, -4)` |
| Ship         | 2 explosions, at `(0, -6)` and `(8, -6)` |
| Depot        | 2 explosions, at `(-2, 0)` and `(-2, 8)` |
| Bridge       | 4 explosions (see 5.3) |
| Player       | uses its own frames from Section 7.1 |

### 7.8 Debris — 8×6, 2 frames (alternate every 8 frames, last 60 frames)

They stay floating/stationary at the point of the entity's death and scroll with
the scenery (faithful to the "remains" the original leaves in the water).

**Frame 1:**

```
W..G..R.
..R...W.
G...W...
.W....G.
...R..W.
W...G...
```

**Frame 2:**

```
.G..W..R
R....G..
..W...R.
G...W...
.R....G.
..W..R..
```

### 7.9 Mini-plane (lives icon) — 8×6, single color `Y`

```
...YY...
...YY...
.YYYYYY.
YYYYYYYY
...YY...
..YYYY..
```

---

## 8. Fonts

### 8.1 Score digits — 8×10, Atari "chunky" style, color `Y`

2 px stroke, corners rounded by step. Horizontal advance: **10 px**
(8 for the glyph + 2 for spacing).

**0**
```
.YYYYYY.
YYYYYYYY
YY....YY
YY....YY
YY....YY
YY....YY
YY....YY
YY....YY
YYYYYYYY
.YYYYYY.
```

**1**
```
...YY...
..YYY...
.YYYY...
...YY...
...YY...
...YY...
...YY...
...YY...
.YYYYYY.
.YYYYYY.
```

**2**
```
.YYYYYY.
YYYYYYYY
YY....YY
......YY
....YYYY
..YYYY..
.YYY....
YY......
YYYYYYYY
YYYYYYYY
```

**3**
```
YYYYYYYY
YYYYYYYY
......YY
....YYY.
....YYY.
......YY
......YY
YY....YY
YYYYYYYY
.YYYYYY.
```

**4**
```
....YYY.
...YYYY.
..YYYYY.
.YY.YYY.
YY..YYY.
YYYYYYYY
YYYYYYYY
....YYY.
....YYY.
....YYY.
```

**5**
```
YYYYYYYY
YYYYYYYY
YY......
YYYYYYY.
YYYYYYYY
......YY
......YY
YY....YY
YYYYYYYY
.YYYYYY.
```

**6**
```
..YYYYY.
.YYYYYYY
YY......
YY......
YYYYYYY.
YYYYYYYY
YY....YY
YY....YY
YYYYYYYY
.YYYYYY.
```

**7**
```
YYYYYYYY
YYYYYYYY
......YY
.....YY.
....YY..
...YY...
..YY....
..YY....
..YY....
..YY....
```

**8**
```
.YYYYYY.
YYYYYYYY
YY....YY
YY....YY
.YYYYYY.
.YYYYYY.
YY....YY
YY....YY
YYYYYYYY
.YYYYYY.
```

**9**
```
.YYYYYY.
YYYYYYYY
YY....YY
YY....YY
YYYYYYYY
.YYYYYYY
......YY
......YY
YYYYYYY.
.YYYYY..
```

**! (exclamation — used on the score at 1,000,000)**
```
...YY...
...YY...
...YY...
...YY...
...YY...
...YY...
........
........
...YY...
...YY...
```

### 8.2 Mini font 3×5 (A–Z and 0–9)

Use: title (scaled), UI texts, `E`/`F` letters of the gauge, hi-score.
Format: 5 rows of 3 characters, separated by `/`. `X` = ink,
`.` = transparent. Horizontal advance: **4 px** (3 + 1) at scale 1.

| Ch | Rows                       | Ch | Rows                       |
|----|----------------------------|----|----------------------------|
| A  | `.X. / X.X / XXX / X.X / X.X` | N  | `XX. / X.X / X.X / X.X / X.X` |
| B  | `XX. / X.X / XX. / X.X / XX.` | O  | `XXX / X.X / X.X / X.X / XXX` |
| C  | `.XX / X.. / X.. / X.. / .XX` | P  | `XXX / X.X / XXX / X.. / X..` |
| D  | `XX. / X.X / X.X / X.X / XX.` | Q  | `XXX / X.X / X.X / XXX / ..X` |
| E  | `XXX / X.. / XX. / X.. / XXX` | R  | `XXX / X.X / XX. / X.X / X.X` |
| F  | `XXX / X.. / XX. / X.. / X..` | S  | `.XX / X.. / .X. / ..X / XX.` |
| G  | `.XX / X.. / X.X / X.X / .XX` | T  | `XXX / .X. / .X. / .X. / .X.` |
| H  | `X.X / X.X / XXX / X.X / X.X` | U  | `X.X / X.X / X.X / X.X / XXX` |
| I  | `XXX / .X. / .X. / .X. / XXX` | V  | `X.X / X.X / X.X / X.X / .X.` |
| J  | `..X / ..X / ..X / X.X / .X.` | W  | `X.X / X.X / XXX / XXX / X.X` |
| K  | `X.X / XX. / X.. / XX. / X.X` | X  | `X.X / X.X / .X. / X.X / X.X` |
| L  | `X.. / X.. / X.. / X.. / XXX` | Y  | `X.X / X.X / .X. / .X. / .X.` |
| M  | `X.X / XXX / XXX / X.X / X.X` | Z  | `XXX / ..X / .X. / X.. / XXX` |

| Ch | Rows                       | Ch | Rows                       |
|----|----------------------------|----|----------------------------|
| 0  | `XXX / X.X / X.X / X.X / XXX` | 5  | `XXX / X.. / XXX / ..X / XXX` |
| 1  | `.X. / XX. / .X. / .X. / XXX` | 6  | `XXX / X.. / XXX / X.X / XXX` |
| 2  | `XXX / ..X / XXX / X.. / XXX` | 7  | `XXX / ..X / .X. / .X. / .X.` |
| 3  | `XXX / ..X / XXX / ..X / XXX` | 8  | `XXX / X.X / XXX / X.X / XXX` |
| 4  | `X.X / X.X / XXX / ..X / ..X` | 9  | `XXX / X.X / XXX / ..X / XXX` |

Scales used (always integer, nearest-neighbor):
- ×1 (3×5): gauge, hi-score, mute indicator;
- ×2 (6×10, advance 8): "PAUSE", START button;
- ×3 (9×15, advance 12): "DELTA STRIKE" title.

### 8.3 Glyph "½" — 9×9, color `K` (used in the fuel gauge)

```
.K.......
KK....K..
.K...K...
.K..K....
KKKK..KKK
..K.....K
.K....KKK
......K..
......KKK
```

---

## 9. HUD (y=162..209) — normative detailing

Drawing order: background → score → gauge → lives → rainbow strip → mute.

### 9.1 Background

- `y=162..163`: black rectangle `#000000`, x=0..159 (separator).
- `y=164..209`: gray rectangle `#ABABAB`, x=0..159.

### 9.2 Score

- Yellow 8×10 digits (`Y`), font from Section 8.1, at `y=166..175`.
- **Right-aligned with a fixed edge at x=104** (the units digit occupies
  x=96..103). Advance 10 px per digit, growing to the left.
- No leading zeros; the initial score displays `0`.
- Maximum 6 digits (999999). On overflow: display `!!!!!!` (Section 10.5).

### 9.3 Fuel gauge

- **48×14 px** box at `x=56..103, y=178..191`:
  - 2 px black border (all edges);
  - gray interior `#ABABAB` (same as the background, as in the original);
  - black 2×2 "notches" at the two INNER top corners of the gauge
    (x=58..59 y=180..181 and x=100..101 y=180..181).
- Markings (black, drawn before the pointer):
  - letter `E` (mini font ×1) with anchor at `(61, 182)`;
  - glyph `½` (Section 8.3) with anchor at `(75, 180)`;
  - letter `F` (mini font ×1) with anchor at `(96, 182)`.
- **Pointer**: yellow rectangle `Y` of **2×10 px**, `y=180..189`;
  position: `x = 58 + round(fuel × 42)` with `fuel ∈ [0,1]`
  (E empty: x=58..59; F full: x=100..101). Drawn on top of the markings.

### 9.4 Lives

- Yellow 8×10 digit with the number of reserve lives (0–9), anchor
  `(8, 180)`.
- Mini-plane (Section 7.9) beside it, anchor `(20, 182)`.

### 9.5 Decorative rainbow strip (Delta Strike signature)

Our own original drawing (does NOT reproduce the Activision logo — it only
evokes a colored strip at the base, generic):

- **112×6 px** rectangle at `x=24..135, y=198..203`, made of 6 horizontal
  1 px rows, top to bottom:

| Row   | Color |
|-------|-----|
| y=198 | `R #B21D17` |
| y=199 | `C #C85F24` |
| y=200 | `G #FFC545` |
| y=201 | `Y #FFF456` |
| y=202 | `V #61D070` |
| y=203 | `Z #7382F7` |

### 9.6 Mute indicator

- When sound is muted: black letter `M` (mini font ×1), anchor
  `(148, 182)`. Absent when sound is active.

---

## 10. Effects and sequences

All timings in game frames at 60 fps.

### 10.1 Entity explosion

1. Freeze the entity and replace it with the 3 frames of the generic explosion
   (8 frames each, total 24), positioned per the table in Section 7.7.
2. Then, debris (7.8): 2 frames alternating every 8, for 60 frames,
   scrolling with the scenery.

### 10.2 Player death

1. Player replaced by explosion frames A/B (7.1), alternating every
   4 frames, for **48 frames**.
2. Player invisible for **30 frames** (scenery stays still; scroll stops).
3. Hard cut: decrement the lives digit, river repositioned on a straight
   stretch (gameplay spec), player reappears at `x=73, y=140`.
4. No invulnerability effect and no blinking after respawn (faithful to the
   original). No fade, no shake.

### 10.3 Fuel collection (flying over the depot)

No extra visual effect beyond the pointer rising (the feedback is auditory).
The depot stays drawn normally under the player.

### 10.4 Rendering flicker

Do NOT simulate the 2600's sprite flicker (a limitation, not an aesthetic). All
entities are drawn stably at 60 fps.

### 10.5 Score at 1,000,000

On passing 999999, the score permanently displays `!!!!!!` (six `!` glyphs
from Section 8.1, same metrics/position as the score) until the end of the
match — faithful to the signature behavior of the original.

---

## 11. Screens and states

### 11.1 Title screen

Background = static initial playfield (straight river, no moving entities, no
scroll) + normal HUD (score 0, initial lives, pointer at F). Over the
playfield:

| Element  | Specification |
|----------|---------------|
| Title    | `DELTA STRIKE` in yellow mini font ×3 `Y`, anchor `(10, 20)` (total width 141 px) |
| Prompt   | Desktop: `PRESS ENTER` · Touch: `TAP TO START` — yellow mini font ×1, horizontally centered, `y=100..104`; blinks: 30 frames visible, 30 invisible |
| Hi-score | `HI` + space (4 px) + value in white mini font ×1 `W`, centered, `y=112..116` |
| START button (touch only) | Rectangle `x=56..103, y=126..141`: black background, 1 px white border, text `START` in yellow mini font ×2 with anchor `(61, 129)` |

### 11.2 Pause

Playfield and HUD frozen (last image), without darkening. Text `PAUSE` in
yellow mini font ×2, centered (anchor x=61), `y=76..85`, blinking
30/30.

### 11.3 Game over

After the last life: screen frozen, the lives digit shows `0`, and the score
blinks (30 visible / 30 invisible) until ENTER/START, when it returns to the
title screen (hard cut). No additional text (faithful to the minimalism of the
original).

### 11.4 Match start / respawn

Always a hard cut (no animated transition). The first frame of the match
already shows the complete river and the player at the initial position.

---

## 12. PWA / icons / meta

- `manifest.webmanifest`: `"background_color": "#000000"`,
  `"theme_color": "#000000"`, `"display": "fullscreen"`,
  `"orientation": "portrait"`.
- **Icons** (`icon-192.png`, `icon-512.png`) — original drawing, generated
  once (outside the runtime) following this deterministic recipe:
  - full river-blue background `#584FDA`;
  - two olive-green side columns `#649228` with a width of 1/5 of the icon
    (192: 38 px; 512: 102 px), flush against the left/right edges;
  - player sprite (7.1) scaled nearest-neighbor, centered:
    ×8 on the 192 (112×96) and ×24 on the 512 (336×288);
  - no text, no border, straight corners (the OS applies the mask).
- Favicon: the same drawing as `icon-192.png`.

---

## 13. CANONICAL PALETTE (final table)

The "TIA approx." column is **informative** (approximate NTSC hue/luma); the
normative value is the hex.

| Name                          | Main use                                   | Hex       | TIA approx. |
|-------------------------------|--------------------------------------------|-----------|------------|
| Black                         | page background, separator, ship superstructure, windows, gauge markings | `#000000` | `$00` |
| HUD gray                      | HUD background and gauge interior          | `#ABABAB` | `$0A` |
| Light gray (road)             | road bed                                   | `#CDCDCD` | `$0C` |
| Dark gray (road)              | road shoulder                              | `#797979` | `$06` |
| White                         | houses, depot bands, hi-score              | `#F2F2F2` | `$0E` |
| Primary yellow                | player, missile, score, lives, road line, texts | `#FFF456` | `$1C` |
| Pale yellow                   | explosion core (flash)                     | `#FFFF98` | `$1E` |
| Gold                          | helicopter rotor, bridge line, explosions  | `#FFC545` | `$1A` |
| Magenta                       | FUEL depot bands                           | `#EA51EB` | `$5A` |
| Red                           | ship hull, shards, rainbow                 | `#B21D17` | `$42` |
| Brick-orange                  | light bridge stripes, explosion border     | `#C85F24` | `$38` |
| Dark brown                    | dark bridge stripes                        | `#833008` | `$34` |
| Shadow brown                  | bridge beams/pillars                       | `#451904` | `$32` |
| Trunk brown                   | tree trunk                                 | `#391701` | `$30` |
| Navy blue                     | helicopter fuselage                        | `#0C048B` | `$82` |
| Heli-green                    | helicopter cabin/skids                     | `#0A4108` | `$D0` |
| Light cyan                    | top row of the enemy jet                   | `#73CFEF` | `$AC` |
| Sky blue                      | middle row of the enemy jet                | `#73B6EF` | `$9C` |
| Blue-violet                   | bottom row of the enemy jet, rainbow       | `#7382F7` | `$88` |
| River blue                    | water                                      | `#584FDA` | `$86` |
| Olive green                   | banks (odd sections)                       | `#649228` | `$D6` |
| Forest green                  | banks (even sections)                      | `#0C4A1C` | `$D2` |
| Light green                   | ship waterline, rainbow                    | `#61D070` | `$C8` |
| Lime green                    | tree crown                                 | `#B2D241` | `$DA` |

Total: 24 colors + transparent. No other color is allowed on any surface of the
game, page or icon (single exception: the keyboard hint text `#666666` outside
the canvas, Section 2).

---

## 14. Fidelity checklist (final visual verification)

1. Flat purplish-blue river; green banks with a 4 px staircase outline.
2. Bank color alternates olive/forest at each bridge.
3. Horizontal gray road with a yellow line crossing the banks only at the
   height of the bridges; striped brown bridge with the line in gold.
4. FUEL depot with magenta/white bands and hollow letters.
5. Helicopter with a gold rotor alternating in 2 frames; long black/red/green
   ship; enemy jet in 3 blues.
6. Yellow player, no banking, single yellow missile.
7. HUD: gray strip, "chunky" yellow digits right-aligned, E ½ F gauge
   with a yellow pointer, lives digit + mini-plane, rainbow strip.
8. Explosions: flash → fireball → dispersion → debris in the water.
9. `!!!!!!` on exceeding 999999.
10. Zero anti-aliasing, zero gradients, zero alpha, integer scale with
    black letterbox.
