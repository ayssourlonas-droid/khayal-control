// Starlit Archive's bunker skin (bunker-skins.js, 'tomes'): stacks of old books spines out, laid in courses
// of different heights, some courses of books laid flat and some of books stood on end. Each spine is
// leather rounded to the light, banded in gilt near its ends with a title plate lettered in gold, worn
// pale at the corners; a few books stand proud of the stack and show their pages' edge. The gaps between
// books are dark. Pure per-pixel, like every skin: skin(x, y, w, h, P) -> [rgb, k].
import { hash2 } from './sprites.js';

const grain = (x, y, a) => (hash2(x >> 1, y >> 1) - 0.5) * a;

// The courses from the top down, built once: { y, h, upright, segs }, each seg one book { x, w, tone,
// base: which leather (0 brown, 1 near black, 2 tan), edge: which end shows pages (-1 left, 1 right, 0 none), plate }. Courses stagger so no joint lines up.
const COURSES = (() => {
  const out = [];
  for (let i = 0, y = 0; y < 80; i++) {
    const h = 9 + Math.floor(hash2(i, 7) * 4);
    const upright = i > 0 && hash2(i, 3) > 0.8;
    const segs = [];
    for (let x = -Math.floor(hash2(i, 5) * 30), j = 0; x < 240; j++) {
      const k = i * 17 + j;
      const w = upright ? 6 + Math.floor(hash2(k, 11) * 6) : 30 + Math.floor(hash2(k, 11) * 36);
      segs.push({ x, w, base: Math.floor(hash2(k, 29) * 3), tone: (hash2(k, 13) - 0.5) * 0.4, edge: hash2(k, 17) > 0.62 ? (hash2(k, 19) > 0.5 ? 1 : -1) : 0, plate: hash2(k, 23) > 0.35 });
      x += w;
    }
    out.push({ y, h, upright, segs });
    y += h;
  }
  return out;
})();

export function tomes(x, y, w, h, P) {
  const c = COURSES.find((r) => y < r.y + r.h);
  const s = c.segs.find((q) => x < q.x + q.w);
  const [rx, ry] = [x - s.x, y - c.y];
  if (ry === 0 || rx === 0) return [P.dark, 0]; // the gap between one book and the next
  const worn = (rx <= 2 || rx >= s.w - 3) && (ry <= 2 || ry >= c.h - 3);
  if (worn) return [P.light, -0.28 + grain(x, y, 0.1)]; // the leather rubbed through to pale at the corners
  if (!c.upright && s.edge && (s.edge > 0 ? rx >= s.w - 4 : rx <= 3)) return [P.accent, ry % 2 ? -0.2 : 0.06]; // leaves, edge on
  if (hash2(x, y) > 0.988) return [P.light, 0.12]; // a scuff
  const round = c.upright ? 0.3 - 0.6 * (rx / s.w) : 0.32 - 0.64 * (ry / c.h); // the spine curves away from the light
  const hide = [[P.fill, 0], [P.dark, 0.34], [P.fill, 0.2]][s.base]; // the book's leather: brown, near black or tan
  const leather = [hide[0], round + hide[1] + s.tone + grain(x, y, 0.2)];
  if (c.upright) {
    if (ry === 2 || ry === c.h - 3) return [P.light, 0.1 + round * 0.4]; // bands at head and foot
    if (s.plate && rx > 2 && rx < s.w - 3 && ry >= 5 && ry < c.h - 5) return hash2(rx, ry >> 1) > 0.5 ? [P.light, 0.08] : [P.dark, 0.2]; // a gilt title running down it
    return leather;
  }
  if (rx === 6 || rx === 7 || rx === s.w - 8 || rx === s.w - 7) return [P.light, rx & 1 ? 0.2 : -0.04]; // the bands near either end
  const mid = s.w / 2;
  if (s.plate && Math.abs(rx - mid) < 10 && ry >= 3 && ry < c.h - 3) { // the title plate
    return ry % 3 === 1 && hash2(rx >> 1, ry) > 0.4 ? [P.light, 0.12] : [P.dark, 0.18];
  }
  return leather;
}
