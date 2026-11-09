import './style.css';
import { Simulation, isFlightSave, type FlightSave } from './core/simulation';
import { FixedClock } from './core/clock';
import { direction, clamp } from './core/math';
import {
  groundHeight,
  sectorInfo,
  SECTOR_LENGTH,
  sectorEntities,
  MAX_SCORE,
  islandAt,
} from './core/world';
import { GameScene } from './render/scene';
import { Controls } from './platform/input';
import { AudioEngine } from './platform/audio';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const sim = new Simulation();
const clock = new FixedClock();
const audio = new AudioEngine();
let view: GameScene;
let ready = false;
let panel = '';
let previousPhase = '';
let best = 0;
let noticeTimer = 0;
let announcement = '';
let lastSector = 0;
let settingsReturn = '';
let focusReturn: HTMLElement | null = null;
const storage = {
  get(key: string, fallback: string) {
    try {
      return localStorage.getItem('ds3d.' + key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem('ds3d.' + key, value);
    } catch {
      /* Storage is optional. */
    }
  },
};
best = Number(storage.get('best', '0')) || 0;
audio.setMuted(storage.get('muted', 'false') === 'true');
let savedFlight: FlightSave | null = null;
try {
  const parsed: unknown = JSON.parse(storage.get('checkpoint', 'null'));
  if (isFlightSave(parsed)) savedFlight = parsed;
} catch {
  /* Ignore incomplete or old saves. */
}
function refreshContinue() {
  $('continue').hidden = !savedFlight || savedFlight.sector === 0;
  $('continue').textContent = savedFlight
    ? `Continue from bridge ${savedFlight.sector + 1}`
    : 'Continue expedition';
}
function saveRun() {
  savedFlight = sim.checkpoint();
  storage.set('checkpoint', JSON.stringify(savedFlight));
  refreshContinue();
}
refreshContinue();
function showPanel(name: string) {
  if (!panel)
    focusReturn = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  panel = name;
  $('overlay').hidden = !name;
  $('overlay').scrollTop = 0;
  for (const id of ['pause', 'result', 'briefing', 'settings', 'error'])
    $(id + '-panel').hidden = id !== name;
  if (name)
    requestAnimationFrame(() =>
      $(name + '-panel')
        .querySelector<HTMLButtonElement>('button')
        ?.focus({ preventScroll: true }),
    );
  else focusReturn?.focus({ preventScroll: true });
}
function updateSound() {
  $('sound').setAttribute('aria-label', audio.muted ? 'Enable sound' : 'Mute sound');
  $('sound').style.opacity = audio.muted ? '0.45' : '1';
  ($('sound-setting') as HTMLInputElement).checked = !audio.muted;
}
function toggleSound() {
  audio.setMuted(!audio.muted);
  storage.set('muted', String(audio.muted));
  updateSound();
  void audio.unlock();
}
function start() {
  if (!ready || panel === 'settings' || panel === 'briefing') return;
  sim.start();
  saveRun();
  lastSector = 0;
  clock.reset();
  controls.clear();
  showPanel('');
  void audio.unlock();
  announcement = 'Follow the river. Aim at a target to lock on.';
  noticeTimer = 7;
}
function pause() {
  if (!ready) return;
  if (panel === 'settings' || panel === 'briefing') {
    closeSecondary();
    return;
  }
  if (sim.phase === 'playing') {
    sim.pause();
    controls.clear();
    showPanel('pause');
  } else if (sim.phase === 'paused') {
    sim.resume();
    clock.reset();
    controls.clear();
    showPanel('');
  }
}
function home() {
  saveRun();
  sim.phase = 'title';
  sim.entities = sectorEntities(0, sim.seed);
  sim.bullets = [];
  controls.clear();
  showPanel('');
}
const controls = new Controls(
  pause,
  () => {
    if (sim.phase === 'title' && !panel) start();
    else if (sim.phase === 'paused') pause();
    else if (sim.phase === 'crashed') retry();
    else if (sim.phase === 'won' || sim.phase === 'lost') start();
  },
  toggleSound,
);
controls.attachTouch(
  $('stick'),
  $('stick-knob'),
  $('touch-fire'),
  $('touch-missile'),
  $('touch-boost'),
);
$('launch').onclick = start;
$('continue').onclick = () => {
  if (!ready || !savedFlight) return;
  if (sim.restore(savedFlight)) {
    clock.reset();
    controls.clear();
    showPanel('');
    lastSector = sim.sector;
    announcement = 'Checkpoint restored. The expedition continues.';
    noticeTimer = 5;
    void audio.unlock();
  }
};
$('versions-link').onclick = () => {
  if (ready && sim.phase !== 'title') saveRun();
};
$('sound').onclick = toggleSound;
$('pause-button').onclick = pause;
$('resume').onclick = pause;
$('restart').onclick = start;
$('return-menu').onclick = home;
$('result-menu').onclick = home;
document.querySelector<HTMLAnchorElement>('.brand')!.onclick = (e) => {
  e.preventDefault();
  if (sim.phase === 'title') return;
  home();
};
function retry() {
  if (sim.phase === 'crashed') {
    sim.retry();
    saveRun();
    clock.reset();
    controls.clear();
    showPanel('');
    void audio.unlock();
    announcement = 'Checkpoint restored. You have a fresh aircraft.';
    noticeTimer = 5;
  } else start();
}
$('retry').onclick = retry;
function secondary(name: string) {
  if (panel === name) return;
  settingsReturn = sim.phase === 'playing' ? 'pause' : panel;
  if (sim.phase === 'playing') sim.pause();
  controls.clear();
  showPanel(name);
}
function closeSecondary() {
  showPanel(settingsReturn);
  settingsReturn = '';
}
$('briefing-open').onclick = () => secondary('briefing');
$('instructions-open').onclick = () => secondary('briefing');
$('briefing-close').onclick = closeSecondary;
$('settings-open').onclick = () => secondary('settings');
$('settings-close').onclick = closeSecondary;
$('sound-setting').onchange = () => {
  audio.setMuted(!($('sound-setting') as HTMLInputElement).checked);
  storage.set('muted', String(audio.muted));
  updateSound();
  void audio.unlock();
};
$('quality-setting').onchange = () => {
  const high = ($('quality-setting') as HTMLInputElement).checked;
  view?.setQuality(high);
  storage.set('high', String(high));
};
$('motion-setting').onchange = () => {
  view.reducedMotion = ($('motion-setting') as HTMLInputElement).checked;
  storage.set('reduced', String(view.reducedMotion));
};
$('reload').onclick = () => location.reload();
window.addEventListener('resize', () => view?.resize());
function autoPause() {
  if (sim.phase === 'playing') {
    sim.pause();
    controls.clear();
    showPanel('pause');
  }
}
window.addEventListener('blur', autoPause);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) autoPause();
});
$('game').addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  sim.pause();
  $('error-message').textContent =
    'The graphics connection was interrupted. Reload to restore the game.';
  showPanel('error');
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab' || !panel) return;
  const buttons = Array.from($(panel + '-panel').querySelectorAll<HTMLElement>('button,input,a'));
  const first = buttons[0],
    last = buttons[buttons.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});
function syncPhase() {
  if (previousPhase === sim.phase) return;
  previousPhase = sim.phase;
  const title = sim.phase === 'title';
  $('menu').hidden = !title;
  $('hud').hidden = title;
  document.body.classList.toggle('flying', !title);
  $('pause-button').hidden = title;
  if (sim.phase === 'paused' && !panel) showPanel('pause');
  if (['crashed', 'lost', 'won'].includes(sim.phase)) {
    saveRun();
    const won = sim.phase === 'won',
      retrying = sim.phase === 'crashed';
    $('result-title').textContent = won
      ? 'The river is yours.'
      : retrying
        ? 'Aircraft lost.'
        : 'Sortie ended.';
    $('result-kicker').textContent = won
      ? 'MISSION COMPLETE'
      : retrying
        ? 'CHECKPOINT AVAILABLE'
        : 'MISSION REPORT';
    $('result-description').textContent = won
      ? `1,000,000 points. ${sim.sector + 1} bridges into the delta. You reached the end of the expedition.`
      : sim.message +
        (retrying
          ? ` ${sim.player.lives} aircraft remaining.`
          : ' Return to base and try another approach.');
    $('result-score').textContent = won ? '!!!!!!' : sim.score.toLocaleString();
    $('result-kills').textContent = String(sim.kills);
    $('result-time').textContent =
      `${Math.floor(sim.elapsed / 60)}:${String(Math.floor(sim.elapsed % 60)).padStart(2, '0')}`;
    $('retry').textContent = retrying ? 'Retry from checkpoint' : 'Fly again';
    showPanel('result');
    if (sim.score > best) {
      best = sim.score;
      storage.set('best', String(best));
    }
  }
}
function hud(dt: number) {
  const p = sim.player;
  const sector = sectorInfo(sim.sector);
  $('sector-code').textContent = sector.code;
  $('sector-name').textContent = sector.name;
  $('objective').textContent = sim.bridgeDestroyed
    ? 'Crossing cleared. Continue downriver.'
    : 'Destroy the bridge control tower';
  $('sector-progress').style.width =
    `${clamp(((-p.pos.z - sim.sector * SECTOR_LENGTH) / SECTOR_LENGTH) * 100, 0, 100)}%`;
  $('score').textContent = sim.score === MAX_SCORE ? '!!!!!!' : String(sim.score).padStart(6, '0');
  $('best').textContent = String(Math.max(sim.score, best));
  $('speed').textContent = String(Math.round(p.speed * 3.6));
  $('altitude').textContent = String(
    Math.max(0, Math.round(p.pos.y - groundHeight(p.pos.x, -p.pos.z))),
  );
  for (const [key, value] of [
    ['health', p.health],
    ['fuel', p.fuel],
    ['boost', p.boost],
  ] as const) {
    $(key + '-fill').style.width = `${value}%`;
    if (key !== 'boost') $(key + '-value').textContent = `${Math.ceil(value)}%`;
  }
  $('lives').textContent = p.lives <= 3 ? '▲ '.repeat(p.lives) : `▲ × ${p.lives}`;
  $('missiles').textContent = String(p.missiles);
  document.body.classList.toggle('low-fuel', p.fuel < 25);
  if (sim.sector !== lastSector) {
    announcement = `Checkpoint secured — ${sector.name}`;
    noticeTimer = 5;
    lastSector = sim.sector;
  }
  if (sim.phase === 'playing') noticeTimer = Math.max(0, noticeTimer - dt);
  const bridge = sim.entities.find((e) => e.kind === 'bridge' && e.active);
  const bridgeDistance = bridge ? -bridge.pos.z + p.pos.z : Infinity;
  const crossing = sim.entities.find(
    (e) => e.kind === 'jet' && e.active && p.pos.z - e.pos.z > 0 && p.pos.z - e.pos.z < 250,
  );
  const fork = islandAt(-p.pos.z + 180);
  $('notice').textContent = sim.refueling
    ? 'REFUELING + HULL REPAIR'
    : p.fuel < 25
      ? 'LOW FUEL — FLY THROUGH A GREEN RING'
      : noticeTimer > 0
        ? announcement
        : crossing
          ? `FAST MOVER — FROM THE ${crossing.travelDirection === 1 ? 'LEFT' : 'RIGHT'}`
          : fork
            ? 'RIVER FORK — CHOOSE LEFT OR RIGHT'
            : bridgeDistance < 450 && bridgeDistance > 0
              ? 'BRIDGE CONTROL — DESTROY THE MARKED TOWER'
              : p.pos.y < 8
                ? 'PULL UP — LOW ALTITUDE'
                : '';
  const forward = direction(p.yaw, p.pitch),
    aim = view.project({
      x: p.pos.x + forward.x * 160,
      y: p.pos.y + forward.y * 160,
      z: p.pos.z + forward.z * 160,
    });
  $('crosshair').style.left = aim.x + 'px';
  $('crosshair').style.top = aim.y + 'px';
  $('crosshair').classList.toggle('locked', sim.lockId !== null);
  const target =
    sim.entities.find((e) => e.id === sim.lockId && e.active) ??
    (bridgeDistance < 650 && bridgeDistance > 0 ? bridge : undefined);
  if (target) {
    const point = view.project(target.pos);
    $('target-marker').hidden = !point.visible;
    $('target-marker').style.left = point.x + 'px';
    $('target-marker').style.top = point.y + 'px';
    $('target-label').textContent =
      (sim.lockId === target.id ? 'LOCK / ' : '') +
      (target.kind === 'bridge' ? 'CONTROL' : target.kind.toUpperCase());
  } else $('target-marker').hidden = true;
  const fuel = sim.entities.find(
    (e) => e.active && e.kind === 'fuel' && e.pos.z < p.pos.z - 5 && e.pos.z > p.pos.z - 450,
  );
  if (fuel) {
    const point = view.project(fuel.pos);
    $('fuel-marker').hidden = !point.visible;
    $('fuel-marker').style.left = point.x + 'px';
    $('fuel-marker').style.top = point.y + 'px';
    $('fuel-distance').textContent = `FUEL / ${Math.round(p.pos.z - fuel.pos.z)} m`;
  } else $('fuel-marker').hidden = true;
  $('controls-hint').style.opacity = sim.elapsed < 16 ? '1' : '0.35';
}
updateSound();
async function boot() {
  try {
    view = new GameScene($<HTMLCanvasElement>('game'));
    const high = storage.get('high', 'true') === 'true';
    ($('quality-setting') as HTMLInputElement).checked = high;
    view.setQuality(high);
    view.reducedMotion =
      storage.get('reduced', String(matchMedia('(prefers-reduced-motion: reduce)').matches)) ===
      'true';
    ($('motion-setting') as HTMLInputElement).checked = view.reducedMotion;
    await view.load(
      (progress) =>
        ($('launch-label').textContent = `Preparing aircraft… ${Math.round(progress * 100)}%`),
    );
    sim.entities = sectorEntities(0, sim.seed);
    ready = true;
    ($('launch') as HTMLButtonElement).disabled = false;
    $('launch-label').textContent = 'Launch mission';
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const alpha = clock.advance(dt, (step) => {
        if (sim.phase === 'playing') {
          sim.step(step, controls.read());
          view.effects(sim.events);
          audio.events(sim.events);
          if (sim.events.some((e) => e.kind === 'checkpoint')) saveRun();
        }
      });
      syncPhase();
      view.render(sim, dt, alpha);
      if (sim.phase !== 'title') hud(dt);
      audio.update(sim.player.speed, sim.phase === 'playing');
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    if (import.meta.env.DEV) {
      Object.defineProperty(window, '__delta', {
        value: {
          sim,
          get stats() {
            return view.stats;
          },
        },
        configurable: true,
      });
    }
  } catch (error) {
    console.error(error);
    $('error-message').textContent =
      'The aircraft or 3D graphics could not load. Check that hardware acceleration is enabled, then reload.';
    showPanel('error');
  }
}
void boot();
