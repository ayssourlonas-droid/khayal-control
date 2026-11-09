// One finger of the Craving's hand (World 17, Ash to Air; see craving-claw.js): a thick, smooth, tapering body of dark smoke, a
// single bezier ribbon from the knuckle to the claw's root so that it counts as a finger at a glance, smoke flowing along it (streaks of
// lighter and darker smoke and a sprinkle of embers, craving-psmoke.js, clipped to the ribbon so the outline stays clean), a pale cold
// light down its outer edge, a dark edge down the other and a soft cloud where it grows out of the palm. Claw coordinates (the part's
// centre is the origin). Bake-time only.
import { cloud, streaksAlong } from './craving-psmoke.js';
import { embers, line, lin, path, rgba, ribbon, rng, SOOT, IRON, ASH } from './craving-pkit.js';

export function finger(b, curve, w0, w1, seed) {
  const rb = ribbon(b, curve, w0, w1, 18, 0.9);
  b.fillStyle = lin(b, curve[0][0], curve[0][1], curve[3][0], curve[3][1], [[0, IRON[2]], [1, IRON[1]]]);
  b.fill();
  b.save();
  ribbon(b, curve, w0, w1, 18, 0.9);
  b.clip();
  streaksAlong(b, curve, (w0 + w1) / 2, 6, seed);
  embers(b, rng(seed + 60), -90, -110, 180, 120, 40, 0.5);
  b.restore();
  path(b, rb.left, true);
  line(b, rgba(ASH[3], 0.55), 1.8); // the pale edge light, outer side
  path(b, rb.right, true);
  line(b, rgba(SOOT, 0.7), 1.8);
  cloud(b, curve[0][0], curve[0][1], w0 * 0.7, w0 * 0.6, seed + 3); // the root grows out of the palm
}
