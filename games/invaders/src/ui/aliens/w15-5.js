// World 15, Lantern Deep, the carrier (see w15.js): a sea turtle paddling along with a small treasure chest
// strapped to its shell and a lit lantern swinging from a pole over its back, a gentle present for the ship.
// Its flippers stroke in turn (left front up and right front down on one beat, the other way on the next,
// the rear pair opposite), its head glances from side to side, the lantern swings and the chest lid lifts
// a sliver to let out a thread of light. The shell and ropes are in w15-9.js, flippers, tail and head in
// w15-flip.js, the chest, pole and lantern in w15-chest.js.
import { bloom, shade } from './w15-kit-2.js';
import { carapace, ropes } from './w15-9.js';
import { flipper, tail, neck, head } from './w15-flip.js';
import { chest, pole } from './w15-chest.js';

const STROKE = [0.95, -0.5]; // a front flipper's angle at the bottom and at the top of its stroke (down is positive)
const REAR = [-1.15, -0.6]; // a rear flipper's: it is on its upstroke while the front one on its side is down

// This side's front flipper (m -1 left, 1 right) on beat f: the left is up on beat 0 and the right on beat 1.
export const frontAngle = (m, f) => ((m < 0) === !!f ? STROKE[0] : STROKE[1]);
export const rearAngle = (m, f) => ((m < 0) === !!f ? REAR[0] : REAR[1]);

// A sea turtle with a chest and a lantern: tail and flippers behind, then shell, ropes, chest, pole and head.
export function carrier(b, l, f, c) {
  const skin = shade(c, 0.05);
  tail(b, skin);
  for (const m of [-1, 1]) {
    flipper(b, m * 14, -17, m, rearAngle(m, f), 15, 0.9, skin);
    flipper(b, m * 19, 4, m, frontAngle(m, f), 27, 1, skin, l);
  }
  neck(b, f, skin);
  carapace(b, c, l);
  ropes(b);
  for (const g of [b, l]) {
    g.save();
    g.translate(0, -9);
    g.scale(1.15, 1.15);
  }
  chest(b, l, f);
  for (const g of [b, l]) g.restore();
  pole(b, l, f);
  head(b, l, f, skin);
  bloom(l, 0, 0, 38, c, 0.1);
}
