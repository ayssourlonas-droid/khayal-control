// What the voice says, and when. DOM-free, so the timing is tested in node; voice.js plays it.
// A line is its pack entry: { clip, ms } is played, { word, say } shown meanwhile, a species' also has
// an id.
//   voiceLines(events, pack) -> entries   a wave says its number in the world, then each of its species,
//   then the weather's word if the weather begins with it; a boss its species, and each animal a
//   boss sends out (a 'minion' event) its own, every time. A tick with no events says nothing and
//   allocates nothing.
//   createQueue() -> { lines, wait, now }   entries not started yet; wait = s until the next may start;
//   now = the last entry started
//   enqueue(q, lines)   replaces the unstarted backlog (a wave cleared before its lines were said);
//   the queue keeps `lines`, so pass an array nobody else holds
//   stepQueue(q, dt) -> the entry that starts now, or null. Stepped only while the scene steps, so
//   the pause menu holds it.
//   sayingOf(q) -> the species id whose line is under way (for its ms), else null; a number names none
//   spoken(pack) -> every line the pack can say: the species', the numbers' and the weathers' entries
export const LINE_GAP = 0.15; // s of silence between lines

const NONE = Object.freeze([]);

export const spoken = (pack) => [...pack.species, ...pack.numbers, ...Object.values(pack.weather)];
const speciesOf = (pack, id) => pack.species.find((s) => s.id === id);

export function voiceLines(events, pack) {
  if (!events.length) return NONE;
  const lines = [];
  for (const e of events) {
    if (e.type === 'wave') {
      lines.push(pack.numbers.find((x) => x.n === e.n));
      for (const id of e.species) lines.push(speciesOf(pack, id));
      if (e.weather) lines.push(pack.weather[e.weather]);
    } else if (e.type === 'boss' || e.type === 'minion') {
      lines.push(speciesOf(pack, e.species));
    }
  }
  return lines;
}

export const createQueue = () => ({ lines: [], wait: 0, now: null });

export function enqueue(q, lines) {
  q.lines = lines;
}

export function stepQueue(q, dt) {
  q.wait = Math.max(0, q.wait - dt);
  if (q.wait > 0 || !q.lines.length) return null;
  const line = q.lines.shift();
  q.wait = line.ms / 1000 + LINE_GAP;
  q.now = line;
  return line;
}

export const sayingOf = (q) => (q.wait > LINE_GAP ? q.now?.id ?? null : null);

export function clearQueue(q) {
  q.lines = [];
  q.wait = 0;
}
