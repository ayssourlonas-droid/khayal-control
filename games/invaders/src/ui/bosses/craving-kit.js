// What the Craving's painters share (bosses/craving*.js): its palette and its geometry, read from the core's data so the art
// follows the hit boxes. Coordinates are boss-local: the origin is the boss's centre, x right, y down; the hull canvas is the
// boss's size (740 x 340) plus a pad of 60 each side; nothing may be drawn above y = TOP (the HUD's edge: the crown's top).
//   PAL    charcoal smoke (lit from below by embers), ash and paper white, ember orange .. white-hot, cold ash for a dead part
//   PART   { [id]: { x, y, w, h } } the parts' rects (centre and size) from bossDef('craving')
import { bossDef } from '../../core/bosses-data.js';

export const TOP = -158; // no art above this y, the crown included
export const PAL = {
  smoke: ['#14100f', '#2a2321', '#3d3431', '#554a44', '#756961', '#968a80'], // deepest shadow .. lit edge of a smoke mass
  ash: '#b8aea4', ashLight: '#e0d8cc', ashDark: '#6c635b', paper: '#efe8da', paperShade: '#b9ae9a', filter: '#c99a5e',
  ember: '#ff7a1a', emberHot: '#ffb347', emberWhite: '#ffe9b8', coal: '#ff4a12', cold: '#4a423d',
  tray: '#2c2623', trayRim: '#6a5d54', trayLight: '#a0917f', soot: '#0e0b0a',
};

export const PART = Object.fromEntries(bossDef('craving').parts.map((p) => [p.id, { x: p.dx, y: p.dy, w: p.w, h: p.h }]));
