import { clamp } from '../core/math';
import { NEUTRAL, type InputFrame } from '../core/simulation';
export class Controls {
  private keys = new Set<string>();
  private touch = { x: 0, y: 0, fire: false, missile: false, boost: false };
  private stickId: number | null = null;
  private origin = { x: 0, y: 0 };
  constructor(
    private onPause: () => void,
    private onStart: () => void,
    private onMute: () => void,
  ) {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code))
        e.preventDefault();
      this.keys.add(e.code);
      if (e.repeat) return;
      if (e.code === 'Escape' || e.code === 'KeyP') this.onPause();
      if (e.code === 'Enter' && !(e.target instanceof HTMLButtonElement)) this.onStart();
      if (e.code === 'KeyM') this.onMute();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.clear());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clear();
    });
  }
  attachTouch(
    stick: HTMLElement,
    knob: HTMLElement,
    fire: HTMLElement,
    missile: HTMLElement,
    boost: HTMLElement,
  ) {
    for (const element of [stick, fire, missile, boost]) {
      for (const event of ['contextmenu', 'selectstart'])
        element.addEventListener(event, (e) => e.preventDefault());
    }
    const reset = () => {
      this.touch.x = 0;
      this.touch.y = 0;
      this.stickId = null;
      knob.style.transform = 'translate(-50%, -50%)';
    };
    stick.addEventListener('pointerdown', (e) => {
      if (this.stickId !== null) return;
      this.stickId = e.pointerId;
      this.origin = { x: e.clientX, y: e.clientY };
      stick.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    stick.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.stickId) return;
      const dx = clamp(e.clientX - this.origin.x, -45, 45),
        dy = clamp(e.clientY - this.origin.y, -45, 45);
      this.touch.x = dx / 45;
      this.touch.y = dy / 45;
      knob.style.transform = `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;
    });
    stick.addEventListener('pointerup', reset);
    stick.addEventListener('pointercancel', reset);
    stick.addEventListener('lostpointercapture', reset);
    for (const [element, key] of [
      [fire, 'fire'],
      [missile, 'missile'],
      [boost, 'boost'],
    ] as const) {
      element.addEventListener('pointerdown', (e) => {
        this.touch[key] = true;
        element.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      for (const event of ['pointerup', 'pointercancel', 'lostpointercapture'])
        element.addEventListener(event, () => (this.touch[key] = false));
    }
  }
  read(): InputFrame {
    const down = (...codes: string[]) => (codes.some((code) => this.keys.has(code)) ? 1 : 0);
    const input = {
      ...NEUTRAL,
      roll: down('KeyD', 'ArrowRight') - down('KeyA', 'ArrowLeft') + this.touch.x,
      pitch: down('KeyW', 'ArrowDown') - down('KeyS', 'ArrowUp') + this.touch.y,
      throttle: down('KeyE') - down('KeyQ'),
      fire: !!down('Space') || this.touch.fire,
      missile: !!down('KeyF') || this.touch.missile,
      boost: !!down('ShiftLeft', 'ShiftRight') || this.touch.boost,
    };
    const gamepad = navigator.getGamepads?.()[0];
    if (gamepad) {
      const dead = (v: number) => (Math.abs(v) > 0.15 ? v : 0);
      input.roll += dead(gamepad.axes[0] ?? 0);
      input.pitch -= dead(gamepad.axes[1] ?? 0);
      input.fire ||= gamepad.buttons[7]?.pressed ?? false;
      input.missile ||= gamepad.buttons[0]?.pressed ?? false;
      input.boost ||= gamepad.buttons[6]?.pressed ?? false;
    }
    return input;
  }
  clear() {
    this.keys.clear();
    this.touch = { x: 0, y: 0, fire: false, missile: false, boost: false };
    this.stickId = null;
    const knob = document.getElementById('stick-knob');
    if (knob) knob.style.transform = 'translate(-50%, -50%)';
  }
}
