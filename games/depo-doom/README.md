# DEPO DOOM

**A deposition-training arcade game.** Choose your litigator. Pick your witness. Control the record.

![License](https://img.shields.io/badge/license-Apache--2.0-blue) ![Status](https://img.shields.io/badge/version-1.1.0-red) ![Runtime](https://img.shields.io/badge/runtime-single%20HTML%20file-black)

Depo Doom borrows the readable structure of a classic arcade fighter — rounds, health bars, momentum, counters, and instant feedback — but nobody throws a punch. The "fight" is over control of the record: witness answers, objections, exhibits, and usable testimony. Every round, a coin flip decides your side of the table. **Taking:** you examine — the witness evades, opposing counsel objects, every question is a tactical move. **Defending:** opposing counsel examines your witness — you make the objection calls: preserve the form defect, guard the privilege line, make a record on the bully, and know when the right objection is none at all.

> **TRAINING SIMULATION — NOT LEGAL ADVICE.** All characters, cases, exhibits, and testimony are fictional. Mechanics are a simplified training abstraction loosely based on federal-baseline deposition concepts; real rules vary by forum and a court's orders control. See [NOTICE](NOTICE).

## Play

- **In your browser:** open [`index.html`](index.html) — no build step, no dependencies, no network calls. Double-clicking the file works.
- **Hosted:** once GitHub Pages is enabled (see the [publication plan](docs/GITHUB_PUBLICATION_PLAN.md)), the game lives at `https://joelakaufmann-lgtm.github.io/depo-doom/`.
- **In VR:** designed to run as an arcade-cabinet minigame inside the LQAI Spire. See [docs/LQAI_PLUGIN_SPEC.md](docs/LQAI_PLUGIN_SPEC.md).

![Title screen](docs/screenshots/01-title.png)

## How it plays

1. **CHOOSE YOUR LITIGATOR** — five playable attorneys, each with a signature perk. One of the others sits across the table as opposing counsel.
2. **PICK YOUR WITNESS** — twelve fictional deponents across three circuits: **Meet & Confer** (control the rambler), **Hostile Depos** (pin the executives), and **Paper Trail** (listen for the contradiction, then impeach), plus two bonus cases.
3. **THE COIN FLIP** — each round randomly deals you a side. **TAKING:** build foundation, use exhibits, pin the witness down, handle objections, impeach with a record basis — secure every line of attack before the seven-hour clock runs out. **DEFENDING:** opposing counsel examines your witness; call each question as it comes — no objection, form (name the basis), foundation, privilege with a proper instruction, or make a record on harassment — and keep both the record and your witness intact.
4. **READ THE REVIEW** — a replay-style debrief explains what worked, what you missed, and (taking) the one question you should have asked better or (defending) the defects you let through.

![Deposition — taking](docs/screenshots/03-depo.png)

![Deposition — defending](docs/screenshots/12-defense.png)

## The roster

| Circuit | Witnesses | Skills trained |
|---|---|---|
| Meet & Confer | Gina Goodman, Bobby "Big Rig" Benson, Calvin Cross | Foundation, witness control, nonresponsive answers |
| Hostile Depos | Jim Hardsell, Tiffany Truesdale, Victor Vance | Leading an adverse witness, exhibits, privilege boundaries |
| Paper Trail | Miranda Mayhem, Kayla Click, Frankie Files, Roxanne Rake | Documents, refreshing recollection, impeachment |
| Bonus | Dr. Elliot Evers, Darla Deeds | Expert basis and compensation; disclosure spin |

Full character cards: [docs/WITNESS_ROSTER.md](docs/WITNESS_ROSTER.md).

## Project structure

```
depo-doom/
├── index.html                 # the entire game (engine, data, art, sound)
├── lqai.plugin.json           # proposed LQAI arcade-cabinet manifest
├── LICENSE / NOTICE           # Apache 2.0 + attribution and disclaimer
├── docs/
│   ├── GITHUB_PUBLICATION_PLAN.md
│   ├── GAME_DESIGN.md         # mechanics, scoring, engine data model
│   ├── WITNESS_ROSTER.md      # character cards + authoring guide
│   ├── LQAI_PLUGIN_SPEC.md    # VR embed contract (proposed)
│   ├── ROADMAP.md
│   ├── screenshots/
│   └── reference/             # original design memos
└── .github/                   # Pages deploy workflow, issue templates
```

v1 is deliberately a single self-contained HTML file — the "arcade cartridge" philosophy. Everything (pixel-font renderer, portrait painter, synth SFX, witness data, engine) is inline so the game can be dropped onto any static host or cabinet unchanged. Splitting into modules is on the [roadmap](docs/ROADMAP.md).

## Contributing

Bug reports, balance notes, and new fictional witnesses are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the witness-proposal issue template. Every contribution must keep all characters and cases fictional and pass the content QA checklist.

## License

Apache License 2.0 — see [LICENSE](LICENSE) and [NOTICE](NOTICE). Copyright 2026 Joel A. Kaufmann.
