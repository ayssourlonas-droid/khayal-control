export class FixedClock {
  private accumulator = 0;
  readonly dt = 1 / 60;
  advance(seconds: number, step: (dt: number) => void) {
    this.accumulator += Math.min(Math.max(0, seconds), 0.15);
    let count = 0;
    while (this.accumulator + 1e-10 >= this.dt && count < 8) {
      step(this.dt);
      this.accumulator -= this.dt;
      count++;
    }
    if (count === 8) this.accumulator = 0;
    return Math.max(0, this.accumulator / this.dt);
  }
  reset() {
    this.accumulator = 0;
  }
}
