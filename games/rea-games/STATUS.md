# Status

What works today and how it was checked. Numbers are what `node bin/rea-games.mjs verify all` printed on the day this
was written (Linux container, Node 22, Chromium from Playwright). Nothing here was run on macOS or Windows.

## Verified

| Game | Port | Cases | Inputs / frames | Result |
|---|---|---|---|---|
| 2048 | web (JS) | 19 | 24,044 inputs | all identical |
| 2048 | Rust (`game2048-core` through `game2048-runner`) | 19 | 24,044 inputs | all identical |
| 2048 | Godot 4.4.1 (GDScript, headless) | 19 | 24,044 inputs | all identical |
| Dino | web (JS) | 29 | 63,000 frames | all identical, exact comparison |
| Dino | Godot 4.4.1 (GDScript, headless) | 29 | 63,000 frames | all identical, exact comparison |
| Dino | Rust (`dino-core` through `dino-runner`) | 29 | 63,000 frames | all identical, exact comparison |
| Canvas Bird | web (JS) | 30 | 68,409 frames | all identical, exact comparison |
| Canvas Bird | Godot 4.4.1 (GDScript, headless) | 30 | 68,409 frames | all identical, exact comparison |
| Canvas Bird | Rust (`bird-core` through `bird-runner`) | 30 | 68,409 frames | all identical, exact comparison |

Comparison is exact (no rounding, no tolerance) and also requires the port to use exactly the recorded random numbers.

**The check was shown to fail** when a port is broken: 2048 (spawn odds 0.9 to 0.8: 3 of 19 pass; win threshold changed:
3 cases fail), Canvas Bird (jump speed, collision window, 30 fps gate: 6, 16, 5 of 30 pass), Dino (gravity, head-box
width, gap factor, flying-obstacle speed, an extra acceleration on the crash frame: 28, 3, 28, 7 and 21 cases fail).

**Dino cosmetic randomness cannot change the trace**: `node games/dino/record.mjs --visual` replays every case with two
other seeds for clouds, stars and blinking; traces and tapes were identical.

## Playable pages

`docs/play/*.html` are single files made by `node scripts/bundle.mjs`. 2048 was opened from `file://` in headless
Chromium without console errors and played a few moves. Dino and Canvas Bird pages were loaded at desktop and phone width
by their authors with no errors; they have not been played by a person.

## 2048 Bevy port

`game2048-core` through `game2048-runner` is verified (spawn odds 0.9 to 0.8: 3 of 19 pass; win threshold 2048 to 4096: 16 of 19 pass). The Bevy window (0.19, 2D) compiles, and a screenshot taken under Xvfb with software rendering shows the board and tile numbers. Keys, swipe, restart and keep-playing were not tried; only the starting board was seen. The tile colours are the web port's own dark palette, not the original's. This port replaced the earlier plain-Rust 2048 runner, which had the same logic and no window.

## Dino engine ports: what is and is not proven

- Godot: logic and runner verified. Godot's JSON parser is off by one digit on some decimals, so the runner reads the case text itself. Breaking gravity failed every case. Replacing the JS-style `round` with Godot's own still passed 29/29: the recordings never hit a negative `.5` tie, so that rounding is correct by construction but not covered. The scene was run headless only; nobody looked at it.
- Rust/Bevy: `dino-core` through `dino-runner` verified (gravity, pterodactyl speed and rounding breaks all failed). The Bevy front end (`dino-bevy`, Bevy 0.19.1, 2D only, score in the window title) compiles and ran 25 s under Xvfb with software rendering without a panic; frames were not looked at and keys, jump, duck and restart were not tried. Bevy 0.20.1 needs a newer rustc than the build machine had. Building `dino-runner` does not compile Bevy; running or checking `dino-bevy` needs system packages (Wayland, udev, xkbcommon, Vulkan drivers on Linux).

## Canvas Bird engine ports: what is and is not proven

- Godot: verified. Breaking force, jump speed and the hit-box offset made 2, 6 and 16 of 30 cases pass. Narrowing the hit window by one pixel still passed: pipes always sit at x = 1 mod 3, so that boundary is never reached by any recording (an equivalent mutant, not a check failure). The runner rebuilds JavaScript's shortest-digit number text; one tiny exponent-form value in the recording relies on Godot's own `to_float`, and it matches. The scene was smoke-tested headless only.
- Rust/Bevy: `bird-core` through `bird-runner` verified (force, fall limit and gap breaks all failed; the same hit-window mutant survives for the same reason). The Bevy window (0.19.1) compiles and ran 20 s under Xvfb without a crash; nobody looked at it or played it. Score is shown in the window title.

## Blocks (falling blocks)

| Game | Port | Cases | Frames | Result |
|---|---|---|---|---|
| Blocks | web (JS) | 36 | 104,208 | all identical, exact comparison |
| Blocks | Godot 4.4.1 (GDScript, headless) | 36 | 104,208 | all identical, exact comparison |
| Blocks | Rust (`blocks-core` through `blocks-runner`) | 36 | 104,208 | all identical, exact comparison |

Recorded from the unmodified original (MIT) with a fake clock and its random piece bag taped: 142 games, 109 losses, 3,271 locked pieces, line clears of 1, 2, 3 and 4 rows (461, 79, 23, 20), all 28 piece/rotation pairs, 993 blocked rotations. Breaking a piece shape, the speed formula, a rotation rule or the 4-line score made `verify` fail each time on every port (for example 26, 17, 11 and 6 of 36 cases failed on the web port). The demo GIF shows 152 of 152 frames identical, and a separate run matched all 3,500 steps of a case.

Gaps: the original's "second drop in the frame that loses" appears in only 3 recorded frames, and a full top row is never reached. The original has no pause. The Godot scene was smoke-tested headless only; the Bevy window compiled and one software-rendered screenshot shows the court, a piece, the next-piece preview and the score text, but no keys were sent. The game is called "blocks" because Tetris is a registered trademark; see `NOTICE`.

## Bricks (brick breaking)

| Game | Port | Cases | Steps | Result |
|---|---|---|---|---|
| Bricks | web (JS) | 37 | 209,600 | all identical, exact comparison |

Recorded from the unmodified original (MIT) with a fake clock that also runs its `setInterval` frame loop and its
one-second launch countdown, the paddle's random start taped, and "Abandon game?" answered by the case: 101 games, 166 balls
lost, 47 games lost, 19 abandoned and 14 abandons declined, 14 levels won (one wrap from the last level to the first),
3,212 bricks hit, all 10 levels played, ball speed up to 314.66 of its 315 cap, 321 late steps of 40 to 500 ms. Breaking
the speed gained per brick, the state a key acts in and the paddle's centre made 35, 35 and 33 of 37 cases fail. These
numbers were measured on Windows (Node 24, Chromium from Playwright 1.65.1), not in the Linux container above.

The play page (`docs/play/bricks.html`) has its own art and six levels of its own; it was played in headless Chromium for
20 s (keys, countdown, bricks, a lost ball) with no console errors. Gaps: touch (dragging the paddle) and window
resizing are not recorded, the canvas is only ever 640 x 480, and no Godot or Bevy port exists yet. The game is called
"bricks" because Breakout is a trademark; see `NOTICE`.

## Paddles (two-paddle ball game)

| Game | Port | Cases | Steps | Result |
|---|---|---|---|---|
| Paddles | web (JS) | 19 | 198,300 | all identical, exact comparison |

Recorded from the unmodified original (MIT) with the same fake clock as Bricks (its frame loop is a `setInterval`),
every serve and every computer prediction taped, and "abandon?" answered by the case: 59 games with 0, 1 and 2 people
(15, 22, 22), 21 played to 9 points, 24 abandoned and 6 abandons declined, 337 points, 1,457 paddle hits (362 with spin),
2,865 computer predictions over levels 1 to 16, 661 late steps. Breaking the acceleration, the spin rule and the
computer's dead zone made 16, 15 and 14 of 19 cases fail. Measured on Windows (Node 24, Chromium from Playwright
1.65.1).

The play page (`docs/play/paddles.html`) has its own art; it was played in headless Chromium (one player, 18 s, keys)
with no console errors. Gaps: the computer's level 0 (behind by 8 points) never happened, and there is no Godot or
Bevy port yet. The game is called "paddles" because Pong is a trademark; see `NOTICE`.

## Mines (mine-finding grid)

| Game | Port | Cases | Inputs | Result |
|---|---|---|---|---|
| Mines | web (JS) | 14 | 628 | all identical, exact comparison |

Recorded from the unmodified original (MIT) with a fake clock and a taped `Math.random`; jQuery 1.8.3 is served from a
local copy and its two start-up draws are cleared from the tape. The 14 cases cover all three difficulties: 25 first
clicks drew 32 mine maps (7 rejected because the clicked cell was a mine), 4 games won and 15 lost, 133 left and 466
right clicks (flags and chords). Breaking the easy difficulty constant, the chord flag check and a neighbour offset made
8, 1 and 14 of 14 cases fail.

The play page (`docs/play/mines.html`) draws its own tiles, numbers and flags; it was played in Chromium (easy board,
a reveal with a flood fill, a flag) with no console errors. Gaps: the original's animations, its image drawing and the
saved high scores are not recorded, and there is no Godot or Bevy port yet. The game is called "mines" because
Minesweeper is a trademark; see `NOTICE`.

## Gaps (read before quoting any number)

- **Coverage is what the cases hit.** Dino: only 7 crashes into the flying obstacle, none while speed-dropping; no
  touch/mouse input, blur/focus, other canvas widths, or a restart in the frame right after a crash. Canvas Bird: 11 hits on
  the bottom pipe, no hit where the pipe in range is not the "next" one, at most one click per frame, dt between 8 and
  100 ms. 2048: sizes other than 4x4 and animations are not modelled.
- Dino cap-speed runs are rare (3 of 29 cases) because they need about 3,500 frames without a crash.
- The Dino and Canvas Bird originals are small copies of open-source projects (see `NOTICE`), not the commercial games.
- Dino's first key press starts a second update chain in the original (two updates per frame); the port reproduces it.
  It was found by comparing, and is written up in `games/dino/GAME.md`.
- Unity and Bevy ports do not exist yet. The Godot port covers 2048 only. Its playable scene (`main.tscn`) was loaded
  headless and fed key presses without errors; nobody has looked at it on screen. Godot 4.4.1 was downloaded from the
  official release and checked against the published SHA-512 before use. Breaking the GDScript port (spawn odds, win
  threshold) made 16 and 3 of 19 cases pass, so the check bites there too.
- The repository has not been pushed anywhere. Cases are stored gzipped (`rea-games pack`).
- Agent plugin manifests: `.claude-plugin` (Claude), `.codex-plugin` (Codex), and `.agents/plugins/marketplace.json`
  (agent-agnostic marketplace). `test/plugin.test.mjs` keeps both `plugin.json` versions equal to `package.json`.
  They have not been installed end-to-end here.
- `node games/dino/record.mjs --visual` reads unpacked `cases/*.json`; run `rea-games record dino` first (it also clears packed copies).
- CI (`.github/workflows/verify.yml`) has never run.
