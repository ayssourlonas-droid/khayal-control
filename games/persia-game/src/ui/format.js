// The number formats shared by the screens and the HUD (DOM-free).
//   fmt(n)                          12,345 (rounded)
//   localDigits(n, digits)          n written in `digits`, which maps each digit 0 to 9 (the pack's
//                                   ten, or those and the thousands mark); any other character as it is
//   showsPersian(level, part)       whether the level shows that part ('wave', 'waveWord', 'score',
//                                   'scoreWord', 'bombsWord', 'livesWord', 'comboWord', 'combo', 'level',
//                                   'boss') in Persian
//   localText(level, part, s)       s with its digits and thousands marks in the pack's when the
//                                   level shows that part in Persian
//   levelName(level)                the level's name where play shows it (the HUD, its card, pause
//                                   and the end cards), its number in the pack's digits when the
//                                   level shows its own number in Persian; the title keeps level.name
//   waveText(level, wave)           the HUD's wave line in the world's numbers, 'WAVE 6 / 10', the count
//                                   in the pack's digits when the level shows its 'wave' in Persian, and
//                                   the pack's word in place of 'WAVE' when it shows its 'waveWord' (the
//                                   line then reads right to left: the word, then the count)
//   scoreText(level, score)         a score, '146,800', in the pack's digits and grouping when the
//                                   level shows its score in Persian (the HUD and the end cards)
//   hudLabel(level, key)            a HUD panel's label, key 'score', 'bombs', 'lives' or 'combo', as
//                                   { text, persian }:
//                                   the pack's word when the level shows its `${key}Word` in Persian,
//                                   else the key in capitals
//   bossName(level, def)            the giant's name on the HUD bar: its species' word in the pack when
//                                   the level shows its 'boss' in Persian, else 'GIANT BIRD'
import { waveNumber } from '../core/levels.js';
import { PACK } from '../data/pack.js';

export const fmt = (n) => Math.round(n).toLocaleString('en-US');

export const localDigits = (n, digits) => [...String(n)].map((d) => digits[d] ?? d).join('');

const PERSIAN = { ...PACK.digits, ',': PACK.group };
export const showsPersian = (level, part) => level.persian.includes(part);
export const localText = (level, part, s) => (showsPersian(level, part) ? localDigits(s, PERSIAN) : s);

export function waveText(level, wave) {
  const show = (n) => localText(level, 'wave', String(n));
  const count = `${show(waveNumber(level, Math.max(1, wave)))} / ${show(waveNumber(level, level.waves.length))}`;
  return showsPersian(level, 'waveWord') ? `${PACK.hud.wave} ${count}` : `WAVE ${count}`;
}

export const scoreText = (level, score) => localText(level, 'score', fmt(score));

export function hudLabel(level, key) {
  const persian = showsPersian(level, `${key}Word`);
  return { text: persian ? PACK.hud[key] : key.toUpperCase(), persian };
}

export const levelName = (level) => localText(level, 'level', level.name);

export const bossName = (level, def) =>
  showsPersian(level, 'boss') ? PACK.species.find((s) => s.id === def.species).word : def.name.toUpperCase();
