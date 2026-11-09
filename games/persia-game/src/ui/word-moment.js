// The word moment: what the voice says (a species' word, a wave's digit), large over the play for
// about a second as it is said, each letter its own colour from the pack's palette. A DOM overlay,
// never canvas text, so the letters stay joined: one plain inline span per letter, which the browser
// shapes as one word. Left of it, the name in Latin letters for as long as it is said (ms); right of
// it, for a species, its face: the enemy's own sprite, big.
//   letterRuns(word, colours) -> [{ text, colour }]   one run per letter; a ZWNJ stays with the letter before it
//   createWordMoment(root, canvas, pack) -> { show(entry), hide() }   entry: a pack line { word, say,
//   ms, id? }; word.css times it
// It is placed on the world as drawn: the canvas box holds the 1920 x 1080 world letterboxed (view.js).
import { WIDTH, HEIGHT } from '../core/kinds.js';
import { h } from './screens/dom.js';
import { LOOK } from './looks/index.js';
import { portrait } from './aliens/bake.js';

const ZWNJ = '\u200c';
const MIDDLE = 0.34; // the word's middle, as a share of the world's height from its top
const SIZE = 0.15; // the font size, as a share of the world's height
const FACE_SCALE = 3; // the face is painted at 3x, about its size on a 1080 p screen (word.css)

export function letterRuns(word, colours) {
  const runs = [];
  for (const ch of word) {
    if (ch === ZWNJ && runs.length) runs[runs.length - 1].text += ch;
    else runs.push({ text: ch, colour: colours[runs.length % colours.length] });
  }
  return runs;
}

export function createWordMoment(root, canvas, pack) {
  const { family, digits, file, weight } = pack.font;
  // The same face kept to the pack's digits and thousands mark: first in the HUD's and the screens'
  // fonts, it sets their Persian numbers and leaves every other character to the faces after it.
  const unicodeRange = [...pack.digits, pack.group].map((c) => `U+${c.codePointAt(0).toString(16)}`).join(', ');
  const src = `url("${file}")`;
  for (const face of [new FontFace(family, src, { weight }), new FontFace(digits, src, { weight, unicodeRange })]) {
    document.fonts.add(face);
    face.load().catch(() => {}); // ready before the first word; a face that fails falls back
  }
  const el = h('div', 'word-moment');
  el.lang = pack.lang;
  el.dir = pack.dir;
  el.style.fontFamily = `"${family}", sans-serif`;
  el.style.fontWeight = weight;
  root.append(el);
  // Every species' face, painted now so nothing is painted mid-play.
  const faces = new Map(pack.species.map(({ id }) => {
    const c = portrait(LOOK, id, FACE_SCALE);
    c.className = 'face';
    return [id, c];
  }));

  return {
    show({ word, say, ms, id }) {
      el.replaceChildren(...letterRuns(word, pack.letterColours).map(({ text, colour }) => {
        const span = h('span', null, text);
        span.style.color = colour;
        return span;
      }), h('span', 'say', say), ...(id ? [faces.get(id)] : []));
      el.style.setProperty('--said', `${ms}ms`);
      const r = canvas.getBoundingClientRect();
      const worldH = Math.min(r.height, (r.width * HEIGHT) / WIDTH);
      el.style.left = `${r.left + r.width / 2}px`;
      el.style.top = `${r.top + (r.height - worldH) / 2 + MIDDLE * worldH}px`;
      el.style.fontSize = `${SIZE * worldH}px`;
      el.classList.remove('show');
      void el.offsetWidth; // commit the restart so the animation runs again
      el.classList.add('show');
    },
    hide() {
      el.classList.remove('show');
    },
  };
}
