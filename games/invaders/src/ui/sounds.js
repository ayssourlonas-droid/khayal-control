// Core events to sounds. DOM-free: `play(name, opts)` is passed in (audio.js play in the game), so
// the mapping is tested in node. Every event type the core emits is either sounded here or listed
// in SILENT with the reason.
//   eventSounds(events, world, play)   once per tick, with that tick's events
// Alien deaths sound through `kill` (by role, with the combo); their `explode` is the same moment, so
// only blasts with no kill of their own sound: the boss's death chain (swelling as it runs, k 0..1),
// the ship's wreck (size 2) and the final white-out blast (size 3). World 13's rules sound through their
// own events: the broadside's opening and closing, each side shot (a cannon, left or right), and the
// escorts' rattle with the ship's shot while the wingmen run (the fire event's power). World 14's firework
// shells sound through `burst`, pitched by where and how far down the chain it goes off (sfx-carnival.js).
// World 15's pearls sound where they wipe a bullet (`pearlBlock`) or strike an alien (`pearlHit`), and each
// trident shot adds a zip to the ship's own shot, which keeps the beat (sfx-deep.js). World 16's mirror twin
// pings with every shot of the ship, at the twin's x on the other side of the field (sfx-glass.js). World 17's
// help sounds when a wave of fresh air starts to rise (`breath`, as long as the rise) and ticks for each enemy bullet
// it wipes (`cleanse`, at the bullet's x, thinned hard in audio.js), sfx-breath.js. World 18's side guns sound through world 13's
// events (the patches branch on the world's sound style, sfx-storm.js), and a `backfire` (an enemy bullet turned on the first alien it
// crosses, or on a boss's part, at its x) sounds a crack and a struck-iron ring. The Squall Ray's roar, at each
// `bossPhase` and at its `bossDeath`, is a thunderclap in that style (sfx-storm.js squallRoar, picked by sfx-boss.js).
import { CHAIN } from '../core/boss-phase.js';
import { MID_X, WIDTH } from '../core/kinds.js';

export const SILENT = {
  failed: 'the failed screen plays the stinger',
  cleared: 'the results screen plays the stinger after the slow motion',
};

const at = (e) => ({ x: e.x });
// The pickups swept up at the clear (R51) all land on one tick: each chimes this long after the last,
// a run of chimes rather than one blob.
const CHIME_GAP = 0.06;
// A side shot sounds this far out from the muzzle toward the side it flies to, so the volley opens in stereo.
const SIDE_PAN = 240;

export function eventSounds(events, world, play) {
  const dying = world.boss?.dying ?? null;
  for (const e of events) {
    switch (e.type) {
      case 'fire':
        if (e.side === 'ship') {
          if (e.power !== 'laser') play('shot', { power: e.power, x: e.x }); // the beam hums instead
          if (e.power === 'wingmen') play('escortShot', { x: e.x }); // the two escorts fire with the ship
          if (e.power === 'trident') play('tridentZip', { x: e.x }); // the shot is still a drum hit: the zip rides on it
          if (e.power === 'mirror') play('mirrorShot', { x: WIDTH - e.x }); // the glass twin fires opposite the ship
        } else if (e.pattern === 'laser') play('laserWarn', at(e));
        else play('enemyShot', { pattern: e.pattern, boss: e.role === 'boss', x: e.x });
        break;
      case 'hit':
        if (e.role === 'boss') play('bossHit', { weak: e.weak, dmg: e.dmg, x: e.x });
        else play('hit', { role: e.role, x: e.x });
        break;
      case 'kill': play('kill', { role: e.role, mult: e.mult, x: e.x }); break;
      case 'explode':
        if (e.size >= 3) play('blast', at(e));
        else if (dying !== null) play('boom', { size: e.size, k: 1 - dying / CHAIN, x: e.x });
        else if (e.size === 2) play('boom', { size: 2, k: 0.5, x: e.x });
        break;
      case 'shipHit': play('shipHit', { lives: e.lives, x: e.x }); break;
      case 'shieldHit': play('shield', at(e)); break;
      case 'nearMiss': play('nearMiss', at(e)); break;
      case 'pickup': play('pickup', { kind: e.kind, x: e.x }); break;
      case 'sweep': play('pickup', { kind: e.kind, x: e.x, delay: CHIME_GAP * e.nth }); break;
      case 'power': play(e.on ? 'powerOn' : 'powerOff', { kind: e.kind }); break;
      case 'bomb': play('bomb', at(e)); break;
      case 'bunker': play('bunker', { laser: e.laser, x: e.x }); break;
      case 'waveClear': play('waveClear'); break; // the slow motion's swoop, the last wave's too
      case 'bossWarn': play('warn', { warn: e.warn, x: e.x }); break;
      case 'bossExpose': play('expose', at(e)); break;
      case 'partDown': play('partDown', at(e)); break;
      case 'bossPhase': play('phase', { phase: e.phase, open: e.open?.length > 0, x: e.x }); break;
      case 'bossDeath': play('bossDeath', at(e)); break;
      case 'lightning': play('thunder', { strength: e.strength, x: e.x }); break;
      case 'gust': if (e.wind) play('gust', { wind: e.wind, x: MID_X }); break;
      case 'cut': play('cut', at(e)); break;
      case 'acid': play('acid', at(e)); break;
      case 'teleport': play('teleport', at(e)); break;
      case 'bulletTime': play(e.on ? 'bulletOn' : 'bulletOff'); break;
      case 'wreck': play('wreck', at(e)); break;
      case 'wreckDown': play('wreckDown', at(e)); break;
      case 'reassemble': play('reassemble', at(e)); break;
      case 'absorb': play('absorb', at(e)); break;
      case 'saucer': play('saucer', { dir: e.dir, x: e.x }); break;
      case 'broadside': play(e.on ? 'broadsideOn' : 'broadsideOff', { x: e.x }); break;
      case 'sideShot': play(e.dir < 0 ? 'cannonL' : 'cannonR', { x: e.x + e.dir * SIDE_PAN }); break;
      case 'burst': play('burst', { x: e.x, depth: e.depth }); break;
      case 'pearlBlock': play('pearlBlock', at(e)); break;
      case 'pearlHit': play('pearlHit', at(e)); break;
      case 'breath': play('breath', { dur: e.dur }); break;
      case 'cleanse': play('cleanse', at(e)); break;
      case 'backfire': play('backfire', at(e)); break;
      default: break; // SILENT
    }
  }
}
