# Persia

Persia is an arcade shooter for a laptop, played with keyboard and mouse in your browser. There is nothing to install and no account to make.

[![Persia: a formation of angry pixel cats and dogs under a blood-red moon, the ruins of Persepolis below them, a Persian word in four colours between its Latin spelling and the cat's face, and the PERSIA logo](og.png)](https://persia.cocode.dk)

## What it is

You fly a ship along the bottom of the screen and shoot angry pixel animals. There are ten levels of five waves each, and a wave is a group of enemies that flies in together. Level 1 plays over the ruins of Persepolis. There you meet a dog, a cow, a rabbit, a bird, a cat, a horse and a fish, and after wave 5 a giant cat arrives as the boss. Level 2 plays at night over Si-o-se-pol, the bridge of thirty-three arches in Isfahan. Its waves count on from 6 to 10, a mouse joins the animals, and the boss is a giant mouse. Level 3 plays at the Tomb of Hafez in Shiraz, among cypresses and orange trees. Its waves count on from 11 to 15, all eight animals fly, and the boss is a giant fish. Level 4 plays at the Azadi Tower in Tehran. Its waves count on from 16 to 20, birds fill the sky, rain starts falling at wave 18, and the boss is a giant bird. Level 5 plays at the Tomb of Cyrus at Pasargadae, at night. Its waves count on from 21 to 25, cows fill more rows, stars start falling at wave 23, and the boss is a giant cow. Level 6 plays among the windcatchers of Yazd at night. Its waves count on from 26 to 30, dogs fill more rows than in any level before, flower petals start falling at wave 28, and the boss is a giant dog. Level 7 plays under the Milad Tower in Tehran at night. Its waves count on from 31 to 35, horses fill more rows than in any level before, the blood moon turns white at wave 33, and the boss is a giant horse. Level 8 plays on Naqsh-e Jahan Square in Isfahan at night. Its waves count on from 36 to 40, a lion joins the animals and dives at your ship, dawn starts to colour the sky at wave 38, and the boss is a giant lion. Level 9 plays at Gonbad-e Qabus, the brick tomb tower in Golestan, at night. Its waves count on from 41 to 45, a camel joins the animals and spits at your ship, the sun rises at wave 43, and the boss is a giant camel. Level 10 plays at the Tomb of Ferdowsi in Tus, at night. Its waves count on from 46 to 50, a fox joins the animals and dives at your ship, a rainbow rises behind the tomb at wave 48, and the boss is a giant fox. All ten levels are open from the start. The title screen shows them as cards in two rows of five, each with a small picture of its place and the place's name.

You have three lives. Lose all three and the level starts again from its first wave. Beat the boss and that level's animals parade past, each named once. Then you see your score, with Next (after levels 1 to 9), Again and Title.

The first time you start a level after the page loads, a short film-style opening runs. Press any key after the first second to skip it. Reloading the page brings it back.

A voice speaks Persian as things happen. It says each wave's number as the wave starts and each animal's name the first time that animal appears in a wave. In a boss fight it names every animal the giant sends out, every time one comes. In level 4 it also says باران (baran, rain) when the rain starts, in level 5 ستاره (setare, star) when the stars start, in level 6 گل (gol, flower) when the petals start, in level 7 ماه (mah, moon) when the moon turns white, in level 8 آسمان (aseman, sky) when dawn starts, in level 9 خورشید (khorshid, sun) when the sun rises, and in level 10 رنگین‌کمان (rangin-kaman, rainbow) when the rainbow rises. Whatever it says also shows on screen for about a second:

- the Persian word, each letter in its own colour (for a wave number, its Persian digits);
- the same word in Latin letters beside it while it is said, so the cat shows گربه next to "gorbe";
- for an animal, its face drawn big.

There are no captions or translations. The menus are in English, and so is the score in levels 1 and 2. In levels 2 to 10 the wave count at the top of the screen is in Persian digits, in levels 3 to 10 so is the score, and in levels 4 to 10 the combo and the level's own number are too. In levels 5 to 10 the giant's name bar at the top reads its Persian name, گاو (gav) for the cow, سگ (sag) for the dog, اسب (asb) for the horse, شیر (shir) for the lion, شتر (shotor) for the camel and روباه (rubah) for the fox, instead of GIANT COW, GIANT DOG, GIANT HORSE, GIANT LION, GIANT CAMEL or GIANT FOX. In levels 6 to 10 the wave line itself is Persian: it reads موج (mowj, wave) and the count, right to left. In levels 7 to 10 the label over the score reads امتیاز (emtiyaz, score) instead of SCORE, in levels 8 to 10 the label over the bombs reads بمب (bomb) instead of BOMBS, in levels 9 and 10 the label over the lives reads جان (jan, life) instead of LIVES, and in level 10 the label over the combo reads پیاپی (payapey, one after another) instead of COMBO.

Persia is forked from [Invaders](https://github.com/cocodedk/invaders), Babak Bandpey's own arcade shooter, and cut down to what these ten levels run.

## How to play

Open [persia.cocode.dk](https://persia.cocode.dk) and pick Level 1, or press Enter. Play with the sound on, because the names are spoken. Sound starts after your first key press or click, because browsers keep pages silent until then.

| Action | Keyboard | Mouse |
|---|---|---|
| Move | Arrow keys or W A S D | Move the pointer; the ship follows it |
| Fire | Space (hold to keep firing) | Left button |
| Bomb | B or Shift | Right button |
| Pause | P or Esc | |
| Sound on or off | M | |
| Menus | Arrow keys to move, Enter or Space to choose | Click |

Shoot a rabbit and it drops a power-up (spread shot, laser, rapid fire or shield) or a bomb. Fly into it to pick it up. A bomb removes every enemy bullet and hits everything on screen. You start with one and can hold three. The bombs panel at the top right shows how to drop one, with key caps for B and the right mouse button. On a touch screen, tapping the bombs panel drops a bomb.

The pause menu offers Resume, Restart and Title. Switching to another tab pauses the game too.

## Run it locally

You need Python 3, or any other static file server.

1. Open a terminal in the project folder (`git clone https://github.com/cocodedk/persia-game.git` if you don't have it yet).
2. Run `python3 -m http.server 8000`. It prints that it is serving on port 8000.
3. Open http://localhost:8000/ in your browser. You should see the PERSIA title screen with ten level cards, Level 1 to Level 10.

Browsers do not run module scripts from a `file://` address, so double-clicking `index.html` will not work. There are no dependencies, no build step and no network requests while you play.

## Tests and code layout

Run `npm test`. It uses Node's built-in test runner, so there is nothing to install first. You need Node.js 22 or newer. A passing run ends with a summary that shows `fail 0`.

- `src/core/` holds the game rules. It never touches the browser, `Math.random` or the clock. Randomness comes from a seeded generator and time from the step size, so tests replay a game exactly.
- `src/fx/` holds particles and camera effects, under the same rules.
- `src/ui/` is everything that touches the page: drawing, screens, input and sound. `voice.js` plays the clips and `word-moment.js` draws the word on screen as real text, so the letters stay joined.
- `src/data/pack.js` is the word pack and the only place a Persian word appears. It lists the words, their Latin spellings, the clip files and the letter colours. Another language would be a separate fork with its own pack.
- `src/main.js` starts the game and runs the frame loop.
- `test/` mirrors `core`, `fx` and `ui`. It also checks the repo itself: every code file stays under 200 lines, the game loads nothing from other sites, every Persian character stays inside `src/data/pack.js`, and every export is used.
- `public/` holds the voice clips and the font.

The design spec and the build plan are in `docs/superpowers/`.

## Voice clips

There are sixty-eight clips, in `public/audio/`: the eleven animal names, the numbers one to fifty, and the words for rain, star, flower, moon, sky, sun and rainbow. They come from the [Danish-Persian-Lessons](https://github.com/cocodedk/Danish-Persian-Lessons) repository. Nothing is generated while you play. Each clip was made ahead of time with the Piper voice model `fa_IR-ganji-medium`, and a native Persian reviewer approved it before it was added. A new clip needs a new review.

`public/audio/manifest.json` records, for every clip, the text it speaks, the voice model and its checksum, the engine version, the reviewer and the clip's own SHA-256 checksum. The script that copied the clips in, `scripts/lift-clips.mjs`, refuses any clip with no reviewer on record.

## Licences

- The code is under the Apache License 2.0, copyright 2026 Babak Bandpey / Cocode. See [LICENSE](LICENSE).
- The font is Vazirmatn Bold by Saber Rastikerdar, under the SIL Open Font License 1.1. The full text is in [public/fonts/OFL.txt](public/fonts/OFL.txt).
- For the voice clips, the manifest records the voice model as MIT-licensed and its dataset as CC0.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Security reports go through [SECURITY.md](SECURITY.md).

## Author

**Babak Bandpey**: [cocode.dk](https://cocode.dk) | [LinkedIn](https://linkedin.com/in/babakbandpey) | [GitHub](https://github.com/cocodedk)

© 2026 [Cocode](https://cocode.dk)
