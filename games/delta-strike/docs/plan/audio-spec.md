# DELTA STRIKE — Audio Specification (js/audio.js)

Planning document. Language: en-US. Code identifiers: English.
Scope: 100% of the game's audio. The implementer must NOT make any design
decision while coding this document — all the numbers are settled.

---

## 1. Principles and sonic reference

The aesthetic target is the sound of the **Atari 2600 TIA chip** as used in
River Raid (Activision, 1982), reproduced with our own synthesis in **Web Audio API**.
Reference facts from the original that shape this spec (absorbed and rewritten,
nothing copied):

- The TIA has **only 2 audio channels**, each with a square wave / "poly noise"
  (LFSR), a few-bit frequency divider and volume in 16 steps. Result:
  harsh timbres, "stepped" pitch, no analog smoothness.
- River Raid **has no music** — only effects. The engine is a **continuous low drone**
  whose pitch follows the speed (braking = lower, accelerating = higher).
- The shot is a very short "tsiu" with falling pitch. **Only 1 player missile
  exists on screen at a time** (a hardware limit of the original that the game design keeps);
  so the real firing rate of the shot sound is limited by the game (~4–6/s), not by the audio.
- Explosions are bursts of noise with decay; the **bridge** one (and the player's
  death) is longer and lower than the enemy one.
- Refueling emits a **repeated beep ("glug-glug") whose pitch rises**
  as the tank fills, and stops when leaving the depot or when full.
- **Extra life every 10,000 points.**
- The original **had no audible low-fuel alarm** (the player watched the
  gauge). Delta Strike deliberately ADDS this alarm, as a usability
  concession (small phone screen), at low volume so as not to break the aesthetic.
  This is a closed decision, not to be re-discussed during implementation.

General fidelity rules adopted:

1. **Runtime synthesis only.** Zero audio files, zero fetch, zero CDN.
2. **Square waves + filtered white noise** as the only timbres. Using
   `sine`/`triangle`/`sawtooth` is forbidden except where this spec explicitly requires it
   (no sound uses them; the alarm's and the engine's LFO is `square` too).
3. **No reverb, no delay, no stereo panning.** The TIA was mono and dry. The entire
   graph is mono all the way to the destination.
4. Short, "hard" envelopes (attacks of 3–8 ms), exponential decays.

---

## 2. General architecture

### 2.1 Context and unlock (mandatory for mobile)

- **A single `AudioContext`** for the whole game, created with
  `new AudioContext({ latencyHint: 'interactive' })` (with a
  `webkitAudioContext` fallback for old Safari).
- The context is **not** created on load. `DS.Audio.init()` (called once, at boot,
  from `game.js`) only registers unlock listeners on `window`,
  with `capture: true`: `pointerdown`, `touchend` and `keydown` events.
- On the user's **first gesture**: create the context, build the master chain
  (§2.2), generate the noise buffer (§2.3), call `ctx.resume()` if
  `ctx.state === 'suspended'`, set `_ready = true` and remove the three listeners.
- **Every public sound function is a silent no-op while `_ready === false`**
  (returns without error). Since starting the match requires Enter/tap, the engine will always
  find the context ready.
- An additional permanent listener on `document.visibilitychange`: when becoming
  visible again and the game is NOT paused, call `ctx.resume()`.

### 2.2 Master chain

```
[all voices] → sfxBus (GainNode, gain = 1.0)
             → compressor (DynamicsCompressorNode)
             → muteGain (GainNode, gain = 1.0 | 0.0)
             → masterGain (GainNode, gain = 0.5)
             → ctx.destination
```

| Node         | Parameter   | Fixed value |
|--------------|-------------|-----------|
| `sfxBus`     | gain        | 1.0 (never automated) |
| `compressor` | threshold   | −12 dB |
| `compressor` | knee        | 20 |
| `compressor` | ratio       | 6 |
| `compressor` | attack      | 0.003 s |
| `compressor` | release     | 0.25 s |
| `muteGain`   | gain        | 1.0 (unmuted) / 0.0 (muted) |
| `masterGain` | gain        | **0.5** (mix ceiling; never automated) |

The compressor exists so that the worst case (engine + alarm + big explosion + jingle
simultaneously) does not clip. It is not an aesthetic effect; with the gains in this spec it acts
rarely.

### 2.3 Noise buffer (generated once, always reused)

- Created right after the context, in `init`/unlock:
  `ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate)` — **1 second, mono**.
- Filled with `data[i] = Math.random() * 2 - 1` for every `i`.
- Stored in a private variable `noiseBuffer` and **reused by all** noise
  sounds. Each trigger creates a new `AudioBufferSourceNode` pointing to the
  same buffer, always with `loop = true` and `start(t0)` (offset 0). The end of the sound is
  always via an explicit `stop()`, never via the end of the buffer.

### 2.4 Voice policy

| Group | Sounds | Policy |
|-------|------|----------|
| Engine | ENGINE | **Singleton.** A single set of nodes, created in `startEngine()` and destroyed in `stopEngine()`. Calling `startEngine()` with the engine already on is a no-op. |
| Retriggerable singletons | REFUEL (blip), LOW FUEL (alarm) | One voice per type. A new trigger **cuts** the previous voice (cancel + gain 0 + stop) before creating the new one. The alarm is turned on/off, not retriggered by a blip. |
| Polyphonic (one-shots) | SHOT, EXPLOSION_SMALL, EXPLOSION_BIG, EXTRA_LIFE, UI_START | Each trigger creates new independent voices. **Ceiling of 8 simultaneous one-shot voices**: kept in an array; when the ceiling is exceeded, the oldest voice is killed immediately (`cancelScheduledValues(now)`, `gain.setValueAtTime(0, now)`, `stop(now + 0.001)`). |

Mandatory hygiene for every one-shot voice: register `source.onended` (or the
main oscillator's `onended`) to `disconnect()` all of the voice's nodes and
remove it from the active-voices array. No node may leak.

### 2.5 Scheduling rules (apply to ALL sounds)

- Every scheduling uses `t0 = ctx.currentTime` captured once at the start
  of the trigger; the times below are **relative to t0** (in seconds).
- Envelopes **never** use `setTimeout`; only the automation API
  (`setValueAtTime` / `linearRampToValueAtTime` / `exponentialRampToValueAtTime`
  / `setTargetAtTime`). `setTimeout` is allowed only for redundant cleanup.
- `exponentialRampToValueAtTime` does not accept 0: exponential decays end
  at **0.001** followed by `setValueAtTime(0, sameInstant)`.
- Every voice's gain starts with `gain.setValueAtTime(0, t0)` before the attack
  (avoids a click).
- Every oscillator/source is finalized with an explicit `stop(t0 + totalDuration)`.

### 2.6 Relative mix gains (peak of each voice, before the master 0.5)

| Sound | Peak gain |
|-----|---------------|
| ENGINE (composite bus) | 0.22 (±0.03 from the LFO) |
| SHOT | 0.30 |
| EXPLOSION_SMALL | 0.62 (rev. 2026-07-11; was 0.50) |
| EXPLOSION_BIG (noise) | 0.65 (rev. 2026-07-11; was 0.60) |
| EXPLOSION_BIG (60 Hz body) | 0.35 |
| REFUEL (blip) | 0.22 |
| LOW FUEL (alarm) | 0.18 |
| EXTRA_LIFE (each note) | 0.25 |
| UI_START | 0.20 |

---

## 3. Public API (`DS.Audio` contract)

Global object `DS.Audio` (namespace `DS` already created in `constants.js`).
All functions are safe to call at any time (no-op if `!_ready`).

| Function | Signature | Semantics |
|--------|-----------|-----------|
| `init` | `init()` | Idempotent. Registers the unlock listeners (§2.1) and reads the persisted mute state (§3.1). Called once at boot by `game.js`. |
| `startEngine` | `startEngine()` | Starts the engine loop (§4). No-op if already on. |
| `setEngineSpeed` | `setEngineSpeed(v)` | `v` ∈ [0..2] (0 = braking, 1 = cruise, 2 = maximum). Clamps and updates the engine pitch (§4.3). No-op if the engine is off. |
| `stopEngine` | `stopEngine()` | Stops the engine with an 80 ms fade (§4.4). |
| `shoot` | `shoot()` | Shot one-shot (§5). |
| `explosionSmall` | `explosionSmall()` | Small explosion one-shot (§6). |
| `explosionBig` | `explosionBig()` | Big explosion one-shot (§7). |
| `refuelTick` | `refuelTick(level01)` | `level01` ∈ [0..1] = current tank level. Emits a blip (§8). Called by the game every 100 ms while refueling. |
| `lowFuelAlarm` | `lowFuelAlarm(on)` | `true` turns on the intermittent alarm (singleton), `false` turns it off (§9). Redundant calls are no-op. |
| `extraLife` | `extraLife()` | 3-note jingle (§10). |
| `uiStart` | `uiStart()` | Start confirmation blip (§11). |
| `setMuted` | `setMuted(bool)` | Toggles `muteGain` 1↔0 with a 15 ms linear ramp; persists (§3.1). |
| `setPaused` | `setPaused(bool)` | `true` → `ctx.suspend()`; `false` → `ctx.resume()`. Freezes EVERYTHING (engine, alarm, scheduling) without losing state — it is the official pause mechanism (P key). |

Minimal internal state: `_ready`, `_muted`, `_engine` (object with the nodes or
`null`), `_refuelVoice`, `_alarm` (nodes or `null`), `_voices` (array of one-shots).

### 3.1 Mute persistence

- `localStorage` key: `"ds_muted"`, values `"1"` / `"0"`.
- Read in `init()`; applied when creating `muteGain` at unlock.
- Written on every `setMuted` call. A `localStorage` failure (private mode)
  is swallowed with try/catch — the mute works in memory only.

### 3.2 Game-event → audio-call matrix (contract with `game.js`)

| Game event | Call(s), in this order |
|----------------|------------------------|
| Title screen → start (Enter/touch button) | `uiStart()`; `startEngine()` |
| Player speed changed (every frame, only if it changed) | `setEngineSpeed(v)` |
| Shot actually fired (respecting 1 missile on screen) | `shoot()` |
| Enemy (ship/heli/jet) or depot destroyed by a shot | `explosionSmall()` |
| Bridge destroyed | `explosionBig()` |
| Player death (collision or fuel 0) | `lowFuelAlarm(false)`; `stopEngine()`; `explosionBig()` |
| Respawn after death (with lives remaining) | `startEngine()` (the game re-evaluates and turns the alarm back on if still `fuel01 < 0.25`) |
| Over a depot, tank filling — every **100 ms** | `refuelTick(fuel01)` |
| `fuel01` crossed to **< 0.25** | `lowFuelAlarm(true)` |
| `fuel01` crossed to **≥ 0.25** (refueled) | `lowFuelAlarm(false)` |
| Score crossed a multiple of 10,000 (extra life) | `extraLife()` |
| P key / focus loss with the game active | `setPaused(true)` / `setPaused(false)` |
| M key / mute button | `setMuted(!muted)` |
| Game over (last life) | `lowFuelAlarm(false)`; `stopEngine()`; `explosionBig()` |

Note: when the bridge explodes and at the same time the score crosses 10,000,
`explosionBig()` and `extraLife()` play overlapping — desired behavior
(polyphonic voices).

---

## 4. ENGINE — continuous engine drone

Singleton in a loop. Turns on at start, dies on death; freezes on pause via
`setPaused`. It is the game's permanent sonic "bed".

### 4.1 Node graph

```
oscA (square, f)      → gA (1.0)  ─┐
oscB (square, 2·f)    → gB (0.5)  ─┼→ engineBus (0.22) → sfxBus
noise (buffer, loop)  → bp → gN (0.25) ─┘        ↑
lfo (square, 27 Hz) → lfoDepth (0.03) ───────────┘ (connected to engineBus.gain)
```

### 4.2 Parameters

| Node | Type | Parameter | Value |
|----|------|-----------|-------|
| `oscA` | OscillatorNode | type | `'square'` |
| `oscA` | | frequency | `f(v)` — see §4.3; initial `f(1) = 65 Hz` |
| `oscB` | OscillatorNode | type | `'square'` |
| `oscB` | | frequency | always `2·f(v)`; initial 130 Hz (ensures the drone is audible on a phone speaker, which does not reproduce 40 Hz) |
| `gA` | GainNode | gain | 1.0 fixed |
| `gB` | GainNode | gain | 0.5 fixed |
| `noise` | AudioBufferSourceNode | buffer / loop | `noiseBuffer` / `true` |
| `bp` | BiquadFilterNode | type / frequency / Q | `'bandpass'` / 400 Hz / 0.5 (fixed) |
| `gN` | GainNode | gain | 0.25 fixed |
| `engineBus` | GainNode | gain | target 0.22 (with fade-in/out, §4.4) |
| `lfo` | OscillatorNode | type / frequency | `'square'` / 27 Hz (fixed — TIA "graininess" via amplitude modulation) |
| `lfoDepth` | GainNode | gain | 0.03 fixed (`lfo → lfoDepth → engineBus.gain`; the bus gain oscillates 0.19–0.25) |

### 4.3 Speed → frequency map

`f(v) = 40 + 25 · clamp(v, 0, 2)` Hz, with the target **rounded to an integer**
(quantization that mimics the TIA's pitch steps):

| v | State | `oscA` | `oscB` |
|---|--------|--------|--------|
| 0.0 | braking | 40 Hz | 80 Hz |
| 1.0 | cruise | 65 Hz | 130 Hz |
| 2.0 | accelerating | 90 Hz | 180 Hz |

Applied in `setEngineSpeed(v)` — short glide, no click and no long "analog"
portamento:

```
oscA.frequency.setTargetAtTime(round(f), now, 0.06)
oscB.frequency.setTargetAtTime(round(f) * 2, now, 0.06)
```

Intermediate `v` is allowed (the game may interpolate acceleration); the formula is
continuous.

### 4.4 Life cycle

- **`startEngine()`**: if `_engine != null`, return. Creates all nodes, calls
  `start(now)` on `oscA`, `oscB`, `noise`, `lfo`; entry envelope:
  `engineBus.gain.setValueAtTime(0, now)` →
  `linearRampToValueAtTime(0.22, now + 0.12)`.
- **`stopEngine()`**: if `_engine == null`, return. Exit envelope:
  `cancelScheduledValues(now)` → `setValueAtTime(currentValue, now)` →
  `linearRampToValueAtTime(0, now + 0.08)`; `stop(now + 0.1)` on the four sources;
  `disconnect()` of everything in `oscA`'s `onended`; `_engine = null`.
- **Pause**: nothing engine-specific — `setPaused(true)` suspends the context.
- Duration: infinite (until `stopEngine`). The noise uses `loop = true`, so the
  1 s buffer never ends.

---

## 5. SHOT — shot ("tsiu")

Polyphonic one-shot (in practice almost mono, since the game allows only 1 missile on
screen; the audio still imposes a minimum retrigger guard of **50 ms**:
`shoot()` calls less than 50 ms since the previous one are ignored).

### 5.1 Graph

```
osc (square) → g → sfxBus
```

### 5.2 Parameters and automation (t0 = ctx.currentTime)

| Node | Parameter | Initial value |
|----|-----------|---------------|
| `osc` | type | `'square'` |
| `osc` | frequency | 1400 Hz at t0 |
| `g` | gain | 0 at t0 |

| Time (rel. t0) | Target | Method | Value |
|------------------|------|--------|-------|
| 0 | osc.frequency | setValueAtTime | 1400 |
| +0.090 | osc.frequency | exponentialRampToValueAtTime | 400 |
| 0 | g.gain | setValueAtTime | 0 |
| +0.005 | g.gain | linearRampToValueAtTime | 0.30 |
| +0.090 | g.gain | exponentialRampToValueAtTime | 0.001 |
| +0.090 | g.gain | setValueAtTime | 0 |

- `osc.start(t0)`, `osc.stop(t0 + 0.10)`.
- **Total duration: 100 ms.**

---

## 6. EXPLOSION_SMALL — enemy/depot destroyed

Polyphonic one-shot. Burst of noise with the filter closing (the TIA "crunch" —
harsh and bright on the attack, closing toward the low end on the decay).

> Revision 2026-07-11 (mobile playtest: "inaudible explosions"): the original
> 800→200 Hz lowpass discarded ~96% of the noise's power and left the rest
> below the response of a phone speaker (measured: RMS 4× smaller than the
> shot after a 700 Hz highpass). Filter reopened to 3200→350 Hz and peak
> 0.50→0.55 — also more faithful to the TIA's harsh noise on a TV.

### 6.1 Graph

```
noiseSrc (buffer, loop) → lp (lowpass) → g → sfxBus
```

### 6.2 Parameters and automation

| Node | Parameter | Initial value |
|----|-----------|---------------|
| `noiseSrc` | buffer / loop | `noiseBuffer` / `true` |
| `lp` | type / Q | `'lowpass'` / 0.7 |
| `lp` | frequency | 4500 Hz at t0 |
| `g` | gain | 0 at t0 |

| Time (rel. t0) | Target | Method | Value |
|------------------|------|--------|-------|
| 0 | lp.frequency | setValueAtTime | 4500 |
| +0.350 | lp.frequency | exponentialRampToValueAtTime | 400 |
| 0 | g.gain | setValueAtTime | 0 |
| +0.005 | g.gain | linearRampToValueAtTime | 0.62 |
| +0.350 | g.gain | exponentialRampToValueAtTime | 0.001 |
| +0.350 | g.gain | setValueAtTime | 0 |

- `noiseSrc.start(t0)`, `noiseSrc.stop(t0 + 0.40)`.
- **Total duration: 400 ms** (audible decay of 350 ms).
- Acceptance criterion (offline render, full master chain, double 700 Hz
  highpass simulating a phone; metric = RMS of the **strongest 120 ms
  window**, comparable across sounds of different durations): ≥ 1.0× the SHOT.
  Measured in the 2026-07-11 calibration: 1.18× ✓ (values 4500→400 / 0.62 come
  from an offline sweep; 3200→350 / 0.55 landed at 0.94× and was revoked).

---

## 7. EXPLOSION_BIG — bridge destroyed and player death

Polyphonic one-shot. Two summed layers: long low noise + a sub-bass square-wave
"body" with falling pitch (gives the weight that the noise alone lacks).

### 7.1 Graph

```
noiseSrc (buffer, loop) → lp (lowpass) → gNoise ─┐
body (square)           → gBody         ─┼→ sfxBus
```

### 7.2 Noise layer

| Node | Parameter | Initial value |
|----|-----------|---------------|
| `noiseSrc` | buffer / loop | `noiseBuffer` / `true` |
| `lp` | type / Q | `'lowpass'` / 0.7 |
| `lp` | frequency | 2400 Hz at t0 |
| `gNoise` | gain | 0 at t0 |

| Time (rel. t0) | Target | Method | Value |
|------------------|------|--------|-------|
| 0 | lp.frequency | setValueAtTime | 2400 |
| +0.700 | lp.frequency | exponentialRampToValueAtTime | 200 |
| 0 | gNoise.gain | setValueAtTime | 0 |
| +0.008 | gNoise.gain | linearRampToValueAtTime | 0.65 |
| +0.700 | gNoise.gain | exponentialRampToValueAtTime | 0.001 |
| +0.700 | gNoise.gain | setValueAtTime | 0 |

> Revision 2026-07-11 (same motivation as §6): lowpass 600→100 Hz reopened to
> 2400→200 Hz and peak 0.60→0.65. The body layer (§7.3) stays UNCHANGED — the
> sub-bass keeps giving weight on capable speakers. Acceptance criterion
> (same metric as §6, 120 ms window post-highpass): ≥ 1.2× the SHOT.
> Measured in the 2026-07-11 calibration: 1.44× ✓ (these values already pass).

- `noiseSrc.start(t0)`, `noiseSrc.stop(t0 + 0.75)`.

### 7.3 Body layer

| Node | Parameter | Initial value |
|----|-----------|---------------|
| `body` | type | `'square'` |
| `body` | frequency | 60 Hz at t0 |
| `gBody` | gain | 0 at t0 |

| Time (rel. t0) | Target | Method | Value |
|------------------|------|--------|-------|
| 0 | body.frequency | setValueAtTime | 60 |
| +0.400 | body.frequency | exponentialRampToValueAtTime | 40 |
| 0 | gBody.gain | setValueAtTime | 0 |
| +0.008 | gBody.gain | linearRampToValueAtTime | 0.35 |
| +0.450 | gBody.gain | exponentialRampToValueAtTime | 0.001 |
| +0.450 | gBody.gain | setValueAtTime | 0 |

- `body.start(t0)`, `body.stop(t0 + 0.50)`.
- **Total sound duration: 750 ms.**
- On player death the order is `stopEngine()` (80 ms fade) and then
  `explosionBig()` on the same frame — the overlap is intentional.

---

## 8. REFUEL — refueling "glug-glug"

Retriggerable singleton. The **game** calls `refuelTick(fuel01)` every **100 ms**
while the plane is over the depot and `fuel01 < 1`. Each call emits ONE
blip; the pitch rises with the tank level, producing the characteristic rise.
On leaving the depot or filling up, the game simply stops calling — there is no
stop function.

### 8.1 Graph (per blip)

```
osc (square) → g → sfxBus
```

### 8.2 Parameters and automation (per blip)

Blip frequency: `fBlip = 200 + 500 · clamp(level01, 0, 1)` Hz
(empty tank 200 Hz → full 700 Hz; value used without quantization).

| Time (rel. t0) | Target | Method | Value |
|------------------|------|--------|-------|
| 0 | osc.frequency | setValueAtTime | `fBlip` |
| 0 | g.gain | setValueAtTime | 0 |
| +0.004 | g.gain | linearRampToValueAtTime | 0.22 |
| +0.040 | g.gain | setValueAtTime | 0.22 |
| +0.060 | g.gain | linearRampToValueAtTime | 0 |

- `osc.start(t0)`, `osc.stop(t0 + 0.07)`. **Blip duration: 70 ms**
  (60 ms audible + margin), fitting comfortably within the 100 ms period.
- **Retrigger**: if `_refuelVoice` still exists when a new tick arrives
  (game calling faster than 70 ms), kill the previous voice:
  `g.gain.cancelScheduledValues(now)`, `g.gain.setValueAtTime(0, now)`,
  `osc.stop(now + 0.001)`; then create the new blip. `_refuelVoice = null` in
  `onended`.

---

## 9. LOW FUEL — intermittent alarm

Singleton turned on/off by `lowFuelAlarm(on)`. Trigger defined by the game:
turns on when `fuel01 < 0.25`, turns off when `fuel01 ≥ 0.25`, on death and on game
over. Built entirely from nodes (the on/off gate is a square LFO — no JS
timer involved, so pausing via `ctx.suspend()` freezes the alarm for free).

### 9.1 Graph

```
osc (square, 800 Hz) → g (base 0.09) → sfxBus
lfo (square, 2.7778 Hz) → lfoDepth (0.09) → g.gain
```

### 9.2 Parameters

| Node | Parameter | Value |
|----|-----------|-------|
| `osc` | type / frequency | `'square'` / 800 Hz fixed |
| `g` | gain (base) | 0.09 |
| `lfo` | type / frequency | `'square'` / **2.7778 Hz** (360 ms period; square wave = 50% duty ⇒ **180 ms on / 180 ms off**) |
| `lfoDepth` | gain | 0.09 |

Sum at `g.gain`: base 0.09 + LFO(±1)·0.09 ⇒ alternates exactly between
**0.18 (on)** and **0 (off)**. Since a square `OscillatorNode` starts its phase in the
positive half-cycle, the alarm starts SOUNDING at the instant of the trigger — deterministic.

### 9.3 Life cycle

- **Turn on** (`lowFuelAlarm(true)` with `_alarm == null`): create nodes,
  `g.gain.setValueAtTime(0.09, now)`, `osc.start(now)`, `lfo.start(now)`.
  If `_alarm != null`, no-op.
- **Turn off** (`lowFuelAlarm(false)` with `_alarm != null`): disconnect
  `lfoDepth` from `g.gain`, `g.gain.cancelScheduledValues(now)`,
  `g.gain.setValueAtTime(g.gain.value, now)`,
  `g.gain.linearRampToValueAtTime(0, now + 0.03)`, `osc.stop(now + 0.05)`,
  `lfo.stop(now + 0.05)`, disconnect in `onended`, `_alarm = null`.
  If `_alarm == null`, no-op.
- Duration: indefinite while on.

---

## 10. EXTRA_LIFE — extra-life jingle (every 10,000 pts)

Polyphonic one-shot: ascending major arpeggio of 3 square notes, very short.

### 10.1 Graph

One voice per note (3 `osc → g → sfxBus` pairs created in the same trigger, all
scheduled from the same `t0`).

### 10.2 Notes

| Note | Frequency | Start (rel. t0) | Envelope end | `stop()` |
|------|-----------|-------------------|-----------------|----------|
| 1 | 523 Hz | 0.000 | +0.070 | +0.080 |
| 2 | 659 Hz | 0.080 | +0.150 | +0.160 |
| 3 | 784 Hz | 0.160 | +0.230 | +0.240 |

Identical envelope per note (times relative to the note's start `tn`):

| Time (rel. tn) | Target | Method | Value |
|------------------|------|--------|-------|
| 0 | osc.frequency | setValueAtTime | (note freq) |
| 0 | g.gain | setValueAtTime | 0 |
| +0.004 | g.gain | linearRampToValueAtTime | 0.25 |
| +0.070 | g.gain | linearRampToValueAtTime | 0 |

- Each `osc.start(tn)`, `osc.stop(tn + 0.08)`. All type `'square'`.
- **Total duration: 240 ms.**

---

## 11. UI_START — start confirmation blip

Simple polyphonic one-shot, played when starting the match (before `startEngine`).

### 11.1 Graph

```
osc (square, 880 Hz) → g → sfxBus
```

### 11.2 Automation

| Time (rel. t0) | Target | Method | Value |
|------------------|------|--------|-------|
| 0 | osc.frequency | setValueAtTime | 880 |
| 0 | g.gain | setValueAtTime | 0 |
| +0.003 | g.gain | linearRampToValueAtTime | 0.20 |
| +0.060 | g.gain | linearRampToValueAtTime | 0 |

- `osc.start(t0)`, `osc.stop(t0 + 0.07)`. **Duration: 70 ms.**

---

## 12. Executable summary (master table)

| # | Sound | Sources | Filter | Pitch | Peak | Duration | Voice |
|---|-----|--------|--------|-------|------|---------|-----|
| 1 | ENGINE | 2× square + noise loop + LFO 27 Hz | bandpass 400 Hz Q0.5 (noise only) | 40→90 Hz (f=40+25v), 2nd osc at 2f | 0.22 ±0.03 | ∞ | singleton |
| 2 | SHOT | square | — | 1400→400 Hz exp in 90 ms | 0.30 | 100 ms | poly (50 ms guard) |
| 3 | EXPLOSION_SMALL | noise | lowpass 4500→400 Hz Q0.7 (rev. 2026-07-11) | — | 0.62 | 400 ms | poly |
| 4 | EXPLOSION_BIG | noise + square | lowpass 2400→200 Hz Q0.7 (rev. 2026-07-11) | body 60→40 Hz | 0.65 + 0.35 | 750 ms | poly |
| 5 | REFUEL | square | — | 200+500·level Hz per blip | 0.22 | 70 ms/blip, tick 100 ms | retriggerable singleton |
| 6 | LOW FUEL | square + LFO 2.7778 Hz | — | 800 Hz fixed, gate 180/180 ms | 0.18 | ∞ while on | singleton on/off |
| 7 | EXTRA_LIFE | 3× square | — | 523 / 659 / 784 Hz | 0.25/note | 240 ms | poly |
| 8 | UI_START | square | — | 880 Hz | 0.20 | 70 ms | poly |

Master: `sfxBus(1.0) → compressor(−12 dB, 6:1) → muteGain(1|0) → masterGain(0.5) → destination`.

---

## 13. Acceptance criteria (manual verification checklist)

1. No network requests for audio; DevTools → Network empty of media.
2. First tap/key on iOS Safari and Android Chrome unlocks the sound; the
   game start already plays `uiStart` + engine with no additional gesture.
3. Engine: continuous low drone; holding ↑ raises the pitch audibly and
   spans ~1 octave (40→90 Hz); releasing returns to cruise; ↓ lowers it.
   On a phone speaker the drone stays audible (2f harmonic).
4. Shot: short, dry "tsiu"; machine-gunning Space produces no clicks or
   chaotic overlap (50 ms guard + the game's 1-missile limit).
5. Enemy explosion clearly shorter/higher than the bridge/death one;
   the big one has sub-bass "weight".
6. Refueling: blips at 10 Hz with pitch rising from ~200 to ~700 Hz as
   the gauge goes E→F; they stop immediately on leaving the depot.
7. Fuel alarm: 800 Hz beeps, regular rhythm 180 ms on / 180 ms off;
   disappears when refueling above 25% and on death.
8. Extra life at 10,000 pts: ascending 3-note arpeggio, ~¼ s.
9. P key freezes ALL audio instantly (including alarm and engine) and
   resumes from the same point; M key mutes/unmutes in <20 ms without a click and the
   state survives a reload (localStorage).
10. Death: the engine fades out over ~80 ms under the big explosion; after respawn the
    engine restarts on its own.
11. Long session (5+ min with many shots/explosions): no accumulation of nodes
    (verifiable via `about:tracing`/heap — stable AudioNodes count),
    no distortion from clipping even with engine + alarm + explosion + jingle
    simultaneously.

---

## 14. Out of scope (decisions closed by omission)

- **No music** — background, title, or game over — fidelity to the original.
- **No per-enemy sounds** (heli/jet/ship emit no sound of their own when moving).
- **No dedicated riverbank-collision sound** — a fatal collision uses `explosionBig`.
- **No stereo panning, reverb, delay, or random pitch** per trigger.
- The list of sounds in this document is **closed**: any new sound requires
  a revision of this spec, not improvisation in the implementation.
