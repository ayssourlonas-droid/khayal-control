/* DELTA STRIKE — audio.js
 * Runtime Web Audio synthesis of every game sound (Atari 2600 / TIA flavor).
 * Zero audio files, zero network. Only square waves + one reusable white-noise
 * buffer, mixed through a fixed master chain.
 *
 * Synthesis (graphs, envelopes, gains, frequencies, voice policy) is transcribed
 * literally from docs/plan/audio-spec.md. Public API + mute-key are the overrides
 * from docs/plan/interfaces.md §5 (mute key = DS.C.MUTED_KEY = 'ds.muted';
 * public idempotent unlock(); silent no-op before the first user gesture).
 *
 * Deviation from audio-spec §2.3: the white-noise buffer is filled with
 * DS.U.mulberry32 instead of Math.random(), because Math.random() is banned
 * project-wide (interfaces.md §1.5). Perceptually identical white noise.
 */
(function () {
  'use strict';
  window.DS = window.DS || {};

  var C = DS.C;

  // Fixed seed for the reusable white-noise buffer (see header note).
  var NOISE_SEED = 0x51A3F00D;

  // One-shot polyphony ceiling (audio-spec §2.4).
  var VOICE_CAP = 8;

  // --- Private state (audio-spec §3) ------------------------------------------
  var ctx = null;            // the single AudioContext, or null before unlock
  var _ready = false;        // true once the context + master chain exist
  var _initDone = false;     // guards init() idempotency
  var _muted = false;        // mirrors persisted mute; applied to muteGain
  var _paused = false;       // mirrors setPaused(); gates visibility resume

  var noiseBuffer = null;    // 1 s mono white noise, reused by every noise voice

  // Master chain nodes (audio-spec §2.2).
  var sfxBus = null;
  var compressor = null;
  var muteGain = null;
  var masterGain = null;

  var _engine = null;        // engine singleton nodes, or null when off
  var _refuelVoice = null;   // retriggerable refuel blip, or null
  var _alarm = null;         // low-fuel alarm singleton, or null
  var _voices = [];          // active one-shot voices (SHOT/EXPLOSION/etc.)
  var _lastShot = -1;        // ctx time of the last accepted shoot() (50 ms guard)

  // --- Node hygiene helpers ---------------------------------------------------

  function disconnectAll(nodes) {
    for (var i = 0; i < nodes.length; i++) {
      try { nodes[i].disconnect(); } catch (e) { /* already detached */ }
    }
  }

  function stopSafe(src, when) {
    try { src.stop(when); } catch (e) { /* already stopped */ }
  }

  // Kill a one-shot voice immediately (audio-spec §2.4 ceiling eviction).
  function killVoice(voice) {
    var now = ctx.currentTime;
    var i;
    for (i = 0; i < voice.gains.length; i++) {
      voice.gains[i].gain.cancelScheduledValues(now);
      voice.gains[i].gain.setValueAtTime(0, now);
    }
    for (i = 0; i < voice.srcs.length; i++) stopSafe(voice.srcs[i], now + 0.001);
    var idx = _voices.indexOf(voice);
    if (idx >= 0) _voices.splice(idx, 1);
  }

  // Register a one-shot voice, enforcing the 8-voice ceiling and wiring the
  // onended cleanup that disconnects every node and drops the voice.
  function registerVoice(voice) {
    while (_voices.length >= VOICE_CAP) killVoice(_voices[0]);
    _voices.push(voice);
    voice.primary.onended = function () {
      disconnectAll(voice.nodes);
      var idx = _voices.indexOf(voice);
      if (idx >= 0) _voices.splice(idx, 1);
    };
  }

  // --- Boot / unlock (audio-spec §2.1–2.3, interfaces §3 step 4) --------------

  function buildMaster() {
    sfxBus = ctx.createGain();
    sfxBus.gain.value = 1.0;

    compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -12;
    compressor.knee.value = 20;
    compressor.ratio.value = 6;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    muteGain = ctx.createGain();
    muteGain.gain.value = _muted ? 0 : 1;

    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;

    sfxBus.connect(compressor);
    compressor.connect(muteGain);
    muteGain.connect(masterGain);
    masterGain.connect(ctx.destination);
  }

  function buildNoise() {
    noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 1), ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    var rng = DS.U.mulberry32(NOISE_SEED);
    for (var i = 0; i < data.length; i++) data[i] = rng() * 2 - 1;
  }

  function onGesture() {
    unlock();
  }

  function unlock() {
    if (_ready) return;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    try {
      ctx = new Ctor({ latencyHint: 'interactive' });
    } catch (e) {
      try { ctx = new Ctor(); } catch (e2) { ctx = null; }
    }
    if (!ctx) return;
    buildMaster();
    buildNoise();
    if (ctx.state === 'suspended') { ctx.resume().catch(function () {}); }
    _ready = true;
    window.removeEventListener('pointerdown', onGesture, true);
    window.removeEventListener('touchend', onGesture, true);
    window.removeEventListener('keydown', onGesture, true);
  }

  function onVisibility() {
    if (!document.hidden && _ready && !_paused) {
      ctx.resume().catch(function () {});
    }
  }

  function init() {
    if (_initDone) return;
    _initDone = true;
    try {
      _muted = (window.localStorage.getItem(C.MUTED_KEY) === '1');
    } catch (e) {
      _muted = false;
    }
    window.addEventListener('pointerdown', onGesture, true);
    window.addEventListener('touchend', onGesture, true);
    window.addEventListener('keydown', onGesture, true);
    document.addEventListener('visibilitychange', onVisibility);
  }

  // --- ENGINE (audio-spec §4) -------------------------------------------------

  function startEngine() {
    if (!_ready || _engine) return;
    var now = ctx.currentTime;

    var oscA = ctx.createOscillator();
    oscA.type = 'square';
    var oscB = ctx.createOscillator();
    oscB.type = 'square';
    var f0 = 65;                      // f(1) = cruise
    oscA.frequency.setValueAtTime(f0, now);
    oscB.frequency.setValueAtTime(f0 * 2, now);

    var gA = ctx.createGain(); gA.gain.value = 1.0;
    var gB = ctx.createGain(); gB.gain.value = 0.5;

    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    var bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 400;
    bp.Q.value = 0.5;
    var gN = ctx.createGain(); gN.gain.value = 0.25;

    var engineBus = ctx.createGain();
    engineBus.gain.setValueAtTime(0, now);
    engineBus.gain.linearRampToValueAtTime(0.22, now + 0.12);

    var lfo = ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 27;
    var lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.03;

    oscA.connect(gA); gA.connect(engineBus);
    oscB.connect(gB); gB.connect(engineBus);
    noise.connect(bp); bp.connect(gN); gN.connect(engineBus);
    lfo.connect(lfoDepth); lfoDepth.connect(engineBus.gain);
    engineBus.connect(sfxBus);

    oscA.start(now);
    oscB.start(now);
    noise.start(now);
    lfo.start(now);

    _engine = {
      oscA: oscA, oscB: oscB, gA: gA, gB: gB,
      noise: noise, bp: bp, gN: gN,
      engineBus: engineBus, lfo: lfo, lfoDepth: lfoDepth
    };
  }

  function setEngineSpeed(v) {
    if (!_ready || !_engine) return;
    v = DS.U.clamp(v, 0, 2);
    var f = Math.round(40 + 25 * v);          // TIA-style quantized pitch
    var now = ctx.currentTime;
    _engine.oscA.frequency.setTargetAtTime(f, now, 0.06);
    _engine.oscB.frequency.setTargetAtTime(f * 2, now, 0.06);
  }

  function stopEngine() {
    if (!_ready || !_engine) return;
    var e = _engine;
    _engine = null;
    var now = ctx.currentTime;
    var cur = e.engineBus.gain.value;
    e.engineBus.gain.cancelScheduledValues(now);
    e.engineBus.gain.setValueAtTime(cur, now);
    e.engineBus.gain.linearRampToValueAtTime(0, now + 0.08);
    stopSafe(e.oscA, now + 0.1);
    stopSafe(e.oscB, now + 0.1);
    stopSafe(e.noise, now + 0.1);
    stopSafe(e.lfo, now + 0.1);
    e.oscA.onended = function () {
      disconnectAll([e.oscA, e.oscB, e.gA, e.gB, e.noise, e.bp, e.gN,
                     e.engineBus, e.lfo, e.lfoDepth]);
    };
  }

  // --- SHOT (audio-spec §5) ---------------------------------------------------

  function shoot() {
    if (!_ready) return;
    var t0 = ctx.currentTime;
    if (t0 - _lastShot < 0.05) return;        // 50 ms retrigger guard
    _lastShot = t0;

    var osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, t0);
    osc.frequency.exponentialRampToValueAtTime(400, t0 + 0.090);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.30, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.090);
    g.gain.setValueAtTime(0, t0 + 0.090);

    osc.connect(g); g.connect(sfxBus);
    osc.start(t0); osc.stop(t0 + 0.10);

    registerVoice({ srcs: [osc], gains: [g], nodes: [osc, g], primary: osc });
  }

  // --- EXPLOSION_SMALL (audio-spec §6) ---------------------------------------

  function explosionSmall() {
    if (!_ready) return;
    var t0 = ctx.currentTime;

    var noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 0.7;
    lp.frequency.setValueAtTime(4500, t0);
    lp.frequency.exponentialRampToValueAtTime(400, t0 + 0.350);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.62, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.350);
    g.gain.setValueAtTime(0, t0 + 0.350);

    noiseSrc.connect(lp); lp.connect(g); g.connect(sfxBus);
    noiseSrc.start(t0); noiseSrc.stop(t0 + 0.40);

    registerVoice({
      srcs: [noiseSrc], gains: [g],
      nodes: [noiseSrc, lp, g], primary: noiseSrc
    });
  }

  // --- EXPLOSION_BIG (audio-spec §7) -----------------------------------------

  function explosionBig() {
    if (!_ready) return;
    var t0 = ctx.currentTime;

    // Noise layer.
    var noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    var lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 0.7;
    lp.frequency.setValueAtTime(2400, t0);
    lp.frequency.exponentialRampToValueAtTime(200, t0 + 0.700);

    var gNoise = ctx.createGain();
    gNoise.gain.setValueAtTime(0, t0);
    gNoise.gain.linearRampToValueAtTime(0.65, t0 + 0.008);
    gNoise.gain.exponentialRampToValueAtTime(0.001, t0 + 0.700);
    gNoise.gain.setValueAtTime(0, t0 + 0.700);

    noiseSrc.connect(lp); lp.connect(gNoise); gNoise.connect(sfxBus);
    noiseSrc.start(t0); noiseSrc.stop(t0 + 0.75);

    // Sub-bass body layer.
    var body = ctx.createOscillator();
    body.type = 'square';
    body.frequency.setValueAtTime(60, t0);
    body.frequency.exponentialRampToValueAtTime(40, t0 + 0.400);

    var gBody = ctx.createGain();
    gBody.gain.setValueAtTime(0, t0);
    gBody.gain.linearRampToValueAtTime(0.35, t0 + 0.008);
    gBody.gain.exponentialRampToValueAtTime(0.001, t0 + 0.450);
    gBody.gain.setValueAtTime(0, t0 + 0.450);

    body.connect(gBody); gBody.connect(sfxBus);
    body.start(t0); body.stop(t0 + 0.50);

    registerVoice({
      srcs: [noiseSrc, body],
      gains: [gNoise, gBody],
      nodes: [noiseSrc, lp, gNoise, body, gBody],
      primary: noiseSrc
    });
  }

  // --- REFUEL (audio-spec §8) -------------------------------------------------

  function refuelTick(level01) {
    if (!_ready) return;
    var now = ctx.currentTime;

    // Cut any still-playing blip before starting the new one.
    if (_refuelVoice) {
      _refuelVoice.g.gain.cancelScheduledValues(now);
      _refuelVoice.g.gain.setValueAtTime(0, now);
      stopSafe(_refuelVoice.osc, now + 0.001);
    }

    var t0 = now;
    var lvl = DS.U.clamp(level01, 0, 1);
    var fBlip = 200 + 500 * lvl;

    var osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(fBlip, t0);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.22, t0 + 0.004);
    g.gain.setValueAtTime(0.22, t0 + 0.040);
    g.gain.linearRampToValueAtTime(0, t0 + 0.060);

    osc.connect(g); g.connect(sfxBus);
    osc.start(t0); osc.stop(t0 + 0.07);

    var voice = { osc: osc, g: g };
    _refuelVoice = voice;
    osc.onended = function () {
      disconnectAll([osc, g]);
      if (_refuelVoice === voice) _refuelVoice = null;
    };
  }

  // --- FUEL LOW ALARM (audio-spec §9) ----------------------------------------

  function lowFuelAlarm(on) {
    if (!_ready) return;
    var now = ctx.currentTime;

    if (on) {
      if (_alarm) return;
      var osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = 800;

      var g = ctx.createGain();
      g.gain.setValueAtTime(0.09, now);

      var lfo = ctx.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 2.7778;       // 360 ms period => 180 on / 180 off
      var lfoDepth = ctx.createGain();
      lfoDepth.gain.value = 0.09;

      osc.connect(g); g.connect(sfxBus);
      lfo.connect(lfoDepth); lfoDepth.connect(g.gain);

      osc.start(now); lfo.start(now);
      _alarm = { osc: osc, g: g, lfo: lfo, lfoDepth: lfoDepth };
    } else {
      if (!_alarm) return;
      var a = _alarm;
      _alarm = null;
      a.lfoDepth.disconnect(a.g.gain);
      a.g.gain.cancelScheduledValues(now);
      a.g.gain.setValueAtTime(a.g.gain.value, now);
      a.g.gain.linearRampToValueAtTime(0, now + 0.03);
      stopSafe(a.osc, now + 0.05);
      stopSafe(a.lfo, now + 0.05);
      a.osc.onended = function () {
        disconnectAll([a.osc, a.g, a.lfo, a.lfoDepth]);
      };
    }
  }

  // --- EXTRA_LIFE (audio-spec §10) -------------------------------------------

  function extraLife() {
    if (!_ready) return;
    var t0 = ctx.currentTime;
    var notes = [
      { f: 523, start: 0.000 },
      { f: 659, start: 0.080 },
      { f: 784, start: 0.160 }
    ];
    for (var i = 0; i < notes.length; i++) {
      var tn = t0 + notes[i].start;
      var osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(notes[i].f, tn);

      var g = ctx.createGain();
      g.gain.setValueAtTime(0, tn);
      g.gain.linearRampToValueAtTime(0.25, tn + 0.004);
      g.gain.linearRampToValueAtTime(0, tn + 0.070);

      osc.connect(g); g.connect(sfxBus);
      osc.start(tn); osc.stop(tn + 0.08);

      registerVoice({ srcs: [osc], gains: [g], nodes: [osc, g], primary: osc });
    }
  }

  // --- UI_START (audio-spec §11) ---------------------------------------------

  function uiStart() {
    if (!_ready) return;
    var t0 = ctx.currentTime;

    var osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, t0);

    var g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.20, t0 + 0.003);
    g.gain.linearRampToValueAtTime(0, t0 + 0.060);

    osc.connect(g); g.connect(sfxBus);
    osc.start(t0); osc.stop(t0 + 0.07);

    registerVoice({ srcs: [osc], gains: [g], nodes: [osc, g], primary: osc });
  }

  // --- Mute / pause (audio-spec §3.1, §3 API; interfaces §5.1) ----------------

  function setMuted(m) {
    m = !!m;
    _muted = m;
    try {
      window.localStorage.setItem(C.MUTED_KEY, m ? '1' : '0');
    } catch (e) { /* private mode: mute stays in memory only */ }
    if (!_ready) return;
    var now = ctx.currentTime;
    var target = m ? 0 : 1;
    muteGain.gain.cancelScheduledValues(now);
    muteGain.gain.setValueAtTime(muteGain.gain.value, now);
    muteGain.gain.linearRampToValueAtTime(target, now + 0.015);
  }

  function isMuted() {
    return _muted;
  }

  function setPaused(p) {
    p = !!p;
    _paused = p;
    if (!_ready) return;
    if (p) { ctx.suspend().catch(function () {}); }
    else { ctx.resume().catch(function () {}); }
  }

  // --- Public API (interfaces §5.1 — exact signatures) ------------------------

  DS.Audio = {
    init: init,
    unlock: unlock,
    startEngine: startEngine,
    setEngineSpeed: setEngineSpeed,
    stopEngine: stopEngine,
    shoot: shoot,
    explosionSmall: explosionSmall,
    explosionBig: explosionBig,
    refuelTick: refuelTick,
    lowFuelAlarm: lowFuelAlarm,
    extraLife: extraLife,
    uiStart: uiStart,
    setMuted: setMuted,
    isMuted: isMuted,
    setPaused: setPaused
  };
})();
