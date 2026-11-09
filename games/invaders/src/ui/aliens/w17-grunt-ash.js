// World 17, Ash to Air, the grunt's ash (w17-grunt.js): the crumbling cone of grey ash at the lit end of THE LIT
// CIGARETTE. Grey, chunky and flared past the paper, cut by fissures that glow faintly from inside, its ragged
// lower lip letting the ember (a crater of coal under it) show through the gaps and catching its light. The coal flares
// and dims with the beat. Lights: the coal, a rim of fire on the lip, the glow in the fissures.
import { path, lin, rad, rgba, line, ellipse, INK, ASH, ASH_D, CHAR, EMBER, cyl, glint, grime, blocked } from './w17-kit.js';
import { coal } from './w17-fx.js';

const ASH_OUT = [[-10.6, 14.5], [-11.8, 18], [-12.4, 22.5], [-11.4, 26], [-12.2, 28.4], [-8.6, 29.4], [-7.4, 33], [-4.6, 29.6], [-2.4, 34], [0.8, 29.8], [3, 33], [5.4, 29.4], [8.4, 31.4], [9.8, 28.4], [12.4, 27.4], [12.4, 22.5], [11.8, 18], [10.6, 14.5]];
const FISSURES = [[[-12, 20], [-6, 21.5], [1, 19.8], [8, 22], [12.6, 20.5]], [[-12, 25.6], [-4, 27], [4, 25.6], [12.6, 26.6]], [[-1, 15], [1.6, 18.6], [-0.6, 22]]];

// The ash cone: grey, chunky, flared past the paper, fissured, its ragged lip letting the ember glow through.
export function ash(b, l, f) {
  const trace = (g) => path(g, ASH_OUT);
  l.save();
  coal(l, 0.5, 31.4, 9, 4.6, f);
  blocked(l, trace);
  l.restore();
  ellipse(b, 0.5, 31.4, 9.8, 4.8);
  b.fillStyle = CHAR;
  b.fill();
  trace(b);
  b.fillStyle = cyl(b, -12.4, 12.4, ASH, 0.6);
  b.fill();
  b.save();
  trace(b);
  b.clip();
  grime(b, 40, 11, 0, 23, 12, 10, 0.55, ASH_D);
  grime(b, 16, 12, -3, 21, 10, 7, 0.34, '#fffaf0');
  b.fillStyle = lin(b, 0, 24, 0, 35, [[0, rgba(EMBER, 0)], [1, rgba(EMBER, 0.34)]]);
  b.fillRect(-14, 24, 28, 12);
  for (const pts of FISSURES) {
    path(b, pts, true);
    line(b, rgba(ASH_D, 0.95), 1.3);
    path(b, pts.map(([x, y]) => [x + 0.6, y + 1.2]), true);
    line(b, rgba('#ffffff', 0.35), 0.9);
  }
  b.restore();
  trace(b);
  line(b, INK, 2.6);
  glint(b, -10.4, 17, -11, 24, 1.4, 0.5, '#fffaf0');
  l.save(); // ember light catching the lower lip of the ash and glowing in its fissures
  l.globalCompositeOperation = 'lighter';
  trace(l);
  l.clip();
  l.fillStyle = rad(l, 0.5, 34, 0, 15, [[0, rgba(EMBER, 0.55 + f * 0.1)], [1, rgba(EMBER, 0)]]);
  l.fillRect(-14, 18, 28, 18);
  for (const pts of FISSURES) {
    path(l, pts, true);
    line(l, rgba(EMBER, 0.13 + f * 0.07), 0.9);
  }
  l.restore();
}
