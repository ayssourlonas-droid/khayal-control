// The windows of World 17's older blocks (parallax-smog-mid-house.js and the church): a sash window of four panes with a
// lintel, a sill and a shadowed reveal, in one of four conditions: plain glass, a blind half drawn, a pane gone (a dark
// shard and cracks), or boarded up (three planks nailed across). `lit` fills the glass with the palette's lamp (a dim amber in
// the smog, a cream curtain in the morning); which windows are lit, blind, broken or boarded is the rng's, so the smog and
// the clean pass choose alike. Glass is a gradient of sky and room, with a pale glint across it. Nothing is bright: the
// brightest thing here is a lit pane at about 0.6 alpha. Painters put back what they change.
import { box, poly, strokes } from './parallax-smog-kit.js';
import { rgba, lin } from './sprites.js';

export const GLASS = 0;
export const BLIND = 1;
export const BROKEN = 2;
export const BOARDED = 3;

function planks(g, P, x, y, w, h) {
  box(g, P.boardDark, x - 1, y - 1, w + 2, h + 2);
  for (let k = 0; k < 3; k++) {
    const py = y + k * (h / 3) + 0.5;
    poly(g, [[x - 2, py + (k - 1) * 0.8], [x + w + 2, py - (k - 1) * 0.8], [x + w + 2, py + h / 3 - 1.5 - (k - 1) * 0.8], [x - 2, py + h / 3 - 1.5 + (k - 1) * 0.8]]);
    g.fillStyle = P.board;
    g.fill();
    box(g, '#ffffff', x - 2, py + 0.4, w + 4, 0.8, 0.08);
    box(g, P.iron, x, py + 2, 1.4, 1.4, 0.7);
    box(g, P.iron, x + w - 1.4, py + 2, 1.4, 1.4, 0.7);
  }
}

// The round head of an arched window: the glass carried up in a half circle, a ring of stone round it and a keystone.
function arched(g, P, x, y, w) {
  g.save();
  g.beginPath();
  g.arc(x + w / 2, y, w / 2, Math.PI, 0);
  g.closePath();
  g.fillStyle = P.glassTop;
  g.fill();
  g.strokeStyle = rgba(P.trim, 0.9);
  g.lineWidth = 2.6;
  g.beginPath();
  g.arc(x + w / 2, y, w / 2 + 1.3, Math.PI, 0);
  g.stroke();
  g.strokeStyle = rgba(P.edge, P.edgeA * 0.7);
  g.lineWidth = 0.9;
  g.beginPath();
  g.arc(x + w / 2, y, w / 2 + 2.2, Math.PI * 1.45, Math.PI * 1.95);
  g.stroke();
  g.restore();
  box(g, P.trim, x + w / 2 - 1.8, y - w / 2 - 4, 3.6, 4);
  strokes(g, rgba(P.frame, 0.85), 1, [[x + w / 2, y - w / 2, x + w / 2, y]]);
}

// A sash window at (x, y), w x h: its lintel (or, `arch`, a round head), glass, bars, sill; `kind` is GLASS, BLIND, BROKEN or BOARDED.
export function sash(g, P, x, y, w, h, kind, lit, arch = false) {
  box(g, P.shade, x - 1.5, y - 1.5, w + 3, h + 3, 0.55); // the reveal
  g.fillStyle = lin(g, 0, y, 0, y + h, [[0, P.glassTop], [1, P.glassBot]]);
  g.fillRect(x, y, w, h);
  if (kind === BOARDED) {
    planks(g, P, x, y, w, h);
  } else {
    if (lit) box(g, P.lit, x, y, w, h, P.litA);
    poly(g, [[x + 1, y + h], [x + w * 0.5, y], [x + w * 0.8, y], [x + w * 0.3 + 1, y + h]]);
    g.fillStyle = rgba(P.glint, P.glintA);
    g.fill();
    strokes(g, rgba(P.frame, 0.85), 1, [[x + w / 2, y, x + w / 2, y + h], [x, y + h * 0.46, x + w, y + h * 0.46]]);
    if (kind === BLIND) {
      box(g, P.sill, x + 1, y + 1, w - 2, h * 0.42, 0.62);
      box(g, P.shade, x + 1, y + 1 + h * 0.42, w - 2, 1.2, 0.3);
      box(g, P.sill, x + w * 0.62, y + 1 + h * 0.42, 0.9, 4, 0.7);
    }
    if (kind === BROKEN) {
      poly(g, [[x + w * 0.45, y + 1], [x + w - 1, y + h * 0.18], [x + w - 1, y + h * 0.7], [x + w * 0.62, y + h * 0.5], [x + w * 0.5, y + h * 0.28]]);
      g.fillStyle = rgba(P.shade, 0.88);
      g.fill();
      strokes(g, rgba(P.glint, 0.4), 0.7, [[x + w * 0.5, y + h * 0.28, x + w * 0.1, y + h * 0.1], [x + w * 0.5, y + h * 0.28, x + w * 0.2, y + h * 0.75]]);
    }
  }
  if (arch) {
    arched(g, P, x, y, w);
  } else {
    box(g, P.trim, x - 2.5, y - 3.4, w + 5, 2.6, 0.85); // lintel
    box(g, P.edge, x - 2.5, y - 3.4, w + 5, 0.9, P.edgeA * 0.6);
  }
  box(g, P.sill, x - 2.5, y + h, w + 5, 2.6, 0.95); // sill
  box(g, P.dust, x - 2.5, y + h, w + 5, 1, P.dustA); // dust (the morning's dew) on the ledge
  box(g, P.shade, x - 2, y + h + 2.6, w + 4, 1.6, 0.34);
}

// A pointed window of a church: a lancet of dark glass with a cross of lead, a pale stone surround. Its sides rise h from y + h
// (the sill) to the point.
export function lancet(g, P, x, y, w, h) {
  const [hw, sp] = [w / 2, y + w * 0.9];
  poly(g, [[x - hw - 2, y + h], [x - hw - 2, sp], [x, y - 3], [x + hw + 2, sp], [x + hw + 2, y + h]]);
  g.fillStyle = rgba(P.trim, 0.9);
  g.fill();
  g.beginPath();
  g.moveTo(x - hw, y + h);
  g.lineTo(x - hw, sp);
  g.quadraticCurveTo(x - hw, y + 1, x, y);
  g.quadraticCurveTo(x + hw, y + 1, x + hw, sp);
  g.lineTo(x + hw, y + h);
  g.closePath();
  g.fillStyle = lin(g, 0, y, 0, y + h, [[0, P.glassTop], [1, P.glassBot]]);
  g.fill();
  g.save();
  g.clip();
  box(g, P.lit, x - hw, y, w, h, P.litA * 0.35);
  g.restore();
  strokes(g, rgba(P.iron, 0.8), 1, [[x, y, x, y + h], [x - hw, y + h * 0.5, x + hw, y + h * 0.5]]);
}
