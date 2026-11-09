// A world's card in the lobby: its poster (the boss fight the game rendered, the kicker, the name, the
// tagline, the boss billed), a strip with the world's difficulty, and its five reels. Every world gets the
// same card; a free-flight world only adds a small flag in the foot of its poster.
//   cardOf(world, best, start) -> { el, art, reels, world, pick }
// A reel shows the level's number (the medal mark pinned to it when the level holds its medal), its
// best stars and best score. The poster develops in once posters.js has baked it (the screen's update).
// pick() is the reel the poster stands for (the first not played yet, else the first): the poster has no
// reel of its own, so a click on it plays that one, and the lobby focuses it when the pointer moves over it.
import { LEVELS, reelName, worldName } from '../../core/levels.js';
import { bossDef } from '../../core/bosses-data.js';
import { RATINGS } from '../../core/ratings.js';
import { clamp } from '../../core/math.js';
import { lookFor } from '../looks/index.js';
import { play } from '../audio.js';
import { h, starRow, skyCss } from './dom.js';
import { fmt } from '../format.js';
import { TAGLINES, posterFor } from './posters.js';

export const SEGMENTS = 10;

// A reel focuses on a pointer that moves over it (lobby.js), not on the one the page scrolls under: it has no
// pointerenter focus of its own, which dom.js's button() would give it.
function reel(level, best, start) {
  const b = best[level.id];
  const r = h('button', `reel${level.boss ? ' finale' : ''}${b ? ' played' : ''}`);
  r.type = 'button';
  r.addEventListener('click', () => { play('select'); start(level); });
  r.dataset.id = level.id;
  const n = h('span', 'reel-n', String(level.index));
  if (b?.medal) n.append(h('i', 'medal')); // pinned to the number badge: it takes no width from the score
  r.append(n, starRow(b?.stars ?? 0), h('span', 'reel-best', b ? fmt(b.score) : '—'));
  r.setAttribute('aria-label', `${worldName(level)}, ${reelName(level).toLowerCase()}`);
  return r;
}

// The difficulty score out of 10 (ratings.js) as a strip between the poster and the reels, on one line: its caption,
// a bar of ten segments, each lit ('on'), half lit ('half') or dark by how much of it the score covers, and the
// number. It stands outside the poster so no type lies over the boss; the strip says the whole of it to a screen reader.
function rating(score) {
  const say = `Difficulty ${score.toFixed(1)} out of ${SEGMENTS}`;
  const bar = h('span', 'rating-bar', ...Array.from({ length: SEGMENTS }, (_, i) => {
    const f = clamp(score - i, 0, 1);
    return h('i', f >= 0.75 ? 'on' : f >= 0.25 ? 'half' : null);
  }));
  const strip = h('div', 'rating', h('span', 'rating-cap', 'Difficulty'), bar, h('b', 'rating-n', score.toFixed(1)));
  strip.title = say;
  strip.setAttribute('role', 'img');
  strip.setAttribute('aria-label', say);
  return strip;
}

// A name with a word of more than LONG letters gets the smaller size (.poster-name.long), or the word would run
// past the poster's edge and be cut off: "Cathedral" at the full size is wider than the poster.
export const LONG = 8;
export const isLong = (name) => name.split(' ').some((w) => w.length > LONG);

export function cardOf(world, best, start) {
  const look = lookFor({ world: world.id });
  const art = h('div', 'poster-art');
  art.style.background = skyCss(look);
  const canvas = posterFor(world.id);
  if (canvas) art.append(canvas);
  art.append(
    h('div', 'poster-head', h('span', 'poster-world', `World ${world.id}`)),
    h('div', 'poster-type',
      h('h3', `poster-name${isLong(world.name) ? ' long' : ''}`, world.name),
      h('p', 'poster-tag', TAGLINES[world.id - 1]),
      h('p', 'poster-bill', 'Featuring ', h('b', null, bossDef(world.boss).name))));
  if (world.free) art.append(h('span', 'poster-flag', 'Free flight'));
  const reels = LEVELS.filter((l) => l.world === world.id).map((l) => reel(l, best, start));
  const el = h('article', 'poster', art, rating(RATINGS[world.id - 1]), h('div', 'reels', ...reels));
  el.dataset.world = String(world.id);
  el.style.setProperty('--accent', look.palette.accent);
  const pick = () => reels.find((r) => !r.classList.contains('played')) ?? reels[0];
  art.addEventListener('click', () => pick()?.click());
  return { el, art, reels, world: world.id, pick };
}
