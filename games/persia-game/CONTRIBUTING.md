# Contributing to Persia

## Local setup

1. Install Node 22 or newer (for the tests) and Python 3 (or any static file server).
2. Clone the repository and install the git hooks:

   ```sh
   ./scripts/install-hooks.sh
   ```

3. Serve the folder and open http://localhost:8000/:

   ```sh
   python3 -m http.server 8000
   ```

There is nothing to install: no npm dependencies, no bundler, no build step.

## Commands

```sh
npm test                       # all tests
python3 -m http.server 8000    # play locally
```

Two URL switches help when checking the game by hand: `?debug&boss` starts straight at the giant,
and `?debug&auto` lets the autopilot fly the level.

## Git hooks

`./scripts/install-hooks.sh` sets `core.hooksPath` to `.githooks/`:

- **pre-commit** runs `npm test`.
- **commit-msg** requires [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `ci:`, `perf:` ...).
- **pre-push** refuses push URLs outside `github.com/cocodedk/` and blocks force-pushes to, or
  deletion of, `main`.

`core.hooksPath` is per-clone config, so a fresh clone has no hooks until the script runs.
Don't skip them with `--no-verify`; if a hook fails, fix the cause. CI runs the same tests anyway.

## House rules

- Plain HTML, CSS and JavaScript ES modules. No dependencies and no network at runtime; every
  URL is relative, so the game also works offline and under a sub-path.
- Every code file stays under 200 lines. Split by responsibility when one gets close.
- `src/core/` and `src/fx/` stay pure: no `window`, `document`, canvas, `Math.random` or
  `Date.now`. Randomness comes from a seeded `rng`, time from `dt`.
- No dead code. If the game no longer runs something, delete it; git keeps the history. A repo
  test fails on any export nothing uses.
- Every Persian word lives in `src/data/pack.js`, and nowhere else in `src/` or `test/` (a test
  checks). Pack words use Persian code points (ک U+06A9, ی U+06CC) and no diacritics, and they
  render as DOM text so the letters stay joined.
- Voice clips come only from the approved set in `public/audio/manifest.json`. No new clips
  without a native speaker's review, and no speech synthesis at runtime.
- Every behaviour has a test. Pixels are not tested; the state that drives them is.
- Keep it at 60 fps on a modest laptop: no per-frame `shadowBlur`, at most 600 particles and 400
  enemy bullets.
- Names and lines are original: no film titles, characters or quoted lines.

## Pull requests

Branch from `main` with a prefix that matches the commit type (`feature/`, `fix/`, `docs/`,
`refactor/`, `chore/`, `ci/`), in kebab-case.

- [ ] `npm test` passes.
- [ ] Played the change in a browser.
- [ ] Docs updated if behaviour or controls changed.
