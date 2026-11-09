// Core events to sounds. DOM-free: `play(name, opts)` is passed in (audio.js play in the game), so
// the mapping is tested in node. Every event type the core emits is either sounded here or left
// silent on purpose (sounds.test.js lists those, with the reason).
//   eventSounds(events, world, play)   once per tick, with that tick's events
// Alien deaths sound through `kill` (by role, with the combo); their `explode` is the same moment, so
// only blasts with no kill of their own sound: the boss's death chain (swelling as it runs, k 0..1),
// the ship's wreck (size 2) and the final white-out blast (size 3).
import { CHAIN } from '../core/boss-phase.js';

const at = (e) => ({ x: e.x });
// The pickups swept up at the clear (R51) all land on one tick: each chimes this long after the last,
// a run of chimes rather than one blob.
const CHIME_GAP = 0.06;

export function eventSounds(events, world, play) {
  const dying = world.boss?.dying ?? null;
  for (const e of events) {
    switch (e.type) {
      case 'fire':
        if (e.side === 'ship') {
          if (e.power !== 'laser') play('shot', { power: e.power, x: e.x }); // the beam hums instead
        } else if (e.pattern === 'laser') play('laserWarn', at(e));
        else play('enemyShot', { pattern: e.pattern, boss: e.role === 'boss', x: e.x });
        break;
      case 'hit':
        if (e.role === 'boss') play('bossHit', { weak: e.weak, x: e.x });
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
      case 'waveClear': play('waveClear'); break; // the slow motion's swoop, the last wave's too
      case 'bossWarn': play('warn', { warn: e.warn, x: e.x }); break;
      case 'bossExpose': play('expose', at(e)); break;
      case 'partDown': play('partDown', at(e)); break;
      case 'bossPhase': play('phase', { phase: e.phase, x: e.x }); break;
      case 'bossDeath': play('bossDeath', at(e)); break;
      case 'bulletTime': play(e.on ? 'bulletOn' : 'bulletOff'); break;
      default: break; // silent on purpose
    }
  }
}
