// The voice: the core's events, said with the pack's approved clips on a bus of their own, every
// line shown as it is said (show(pack entry)/hide: word-moment.js).
//   createVoice(pack, { nodes, duck, fetch, decode, show, hide }) -> { hear(events), queue(entry),
//   update(dt), clear(), saying() }   queue(entry): the parade's way in, one entry, said in turn like
//   the rest (it replaces the backlog, so the caller spaces its lines further apart than a line is long)
//   saying(): sayingOf the queue (voice-queue.js), the species whose name is being said
// Every clip is fetched and decoded once, at creation, on an offline context: the game's context
// waits for a gesture, and wave 1 is said on the first frame of play. A failed fetch or decode is
// silence. A line whose clip is not decoded when it starts is skipped, never played late; its word
// still shows, and so it does with the sound locked or muted. A playing line ducks the music and
// effects until the queue's line ends.
import { audioNodes, duckSpeech } from './audio.js';
import { voiceLines, createQueue, enqueue, stepQueue, clearQueue, sayingOf, LINE_GAP, spoken } from './voice-queue.js';

const UNDER_SPEECH = 0.45; // the music and effects level while a line plays

let offline = null; // an AudioBuffer plays on any context, so one offline context decodes them all
const decodeOffline = (bytes) => (offline ??= new OfflineAudioContext(1, 1, 48000)).decodeAudioData(bytes);

export function createVoice(pack, { nodes = audioNodes, duck = duckSpeech, fetch = globalThis.fetch, decode = decodeOffline, show, hide }) {
  const buffers = new Map();
  for (const { clip } of spoken(pack)) {
    fetch(clip).then((r) => (r.ok ? r.arrayBuffer() : null)).then((bytes) => bytes && decode(bytes))
      .then((buffer) => buffer && buffers.set(clip, buffer))
      .catch(() => {});
  }
  const q = createQueue();
  let playing = null; // the source of the line holding the duck, until the queue's line ends

  function speak(entry) {
    show(entry);
    const n = nodes();
    const buffer = buffers.get(entry.clip);
    if (!n || !buffer) return;
    playing = n.ctx.createBufferSource();
    playing.buffer = buffer;
    playing.connect(n.voice);
    playing.start();
    duck(UNDER_SPEECH);
  }

  return {
    hear(events) {
      const lines = voiceLines(events, pack);
      if (lines.length) enqueue(q, lines); // a tick with nothing to say keeps the backlog
    },
    queue(entry) {
      enqueue(q, [entry]);
    },
    update(dt) {
      const entry = stepQueue(q, dt);
      if (playing && (entry || q.wait <= LINE_GAP)) { // the line holding the duck has ended
        playing = null;
        duck(1);
      }
      if (entry) speak(entry);
    },
    clear() {
      clearQueue(q);
      playing?.stop();
      playing = null;
      duck(1);
      hide();
    },
    saying: () => sayingOf(q),
  };
}
