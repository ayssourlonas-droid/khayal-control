// Stand-ins for WebAudio under node.
//   param(value)   an AudioParam that records its automation in `calls` ([kind, value, time, ...])
//   node(extra)    any node: connect, start, stop, and every param a real node has
//   installAudio({ currentTime, onNode })   globalThis.AudioContext = a fake whose create<Kind>()
//                  makes a node and hands it to onNode(kind, node) first
export function param(value = 0) {
  return {
    value, calls: [],
    setValueAtTime(v, t) { this.calls.push(['set', v, t]); },
    exponentialRampToValueAtTime(v, t) { this.calls.push(['exp', v, t]); },
    linearRampToValueAtTime(v, t) { this.calls.push(['lin', v, t]); },
    setTargetAtTime(v, t, k) { this.calls.push(['target', v, t, k]); },
    cancelScheduledValues(t) { this.calls.push(['cancel', t]); },
  };
}

export const node = (extra = {}) => ({
  connect: (t) => t, disconnect() {}, start() {}, stop() {},
  gain: param(1), frequency: param(), detune: param(), Q: param(), playbackRate: param(1), pan: param(),
  delayTime: param(), threshold: param(), knee: param(), ratio: param(), attack: param(), release: param(), ...extra,
});

const KINDS = ['Gain', 'DynamicsCompressor', 'Convolver', 'StereoPanner', 'Oscillator', 'BiquadFilter', 'BufferSource', 'WaveShaper', 'Delay'];

export function installAudio({ currentTime = 0, onNode = () => {} } = {}) {
  class FakeContext {
    constructor() {
      this.state = 'running';
      this.currentTime = currentTime;
      this.sampleRate = 8000;
      this.destination = node();
    }
    resume() {}
    suspend() {}
    createBuffer(ch, n) { const d = Array.from({ length: ch }, () => new Float32Array(n)); return { getChannelData: (i) => d[i] }; }
  }
  for (const kind of KINDS) {
    FakeContext.prototype[`create${kind}`] = () => {
      const n = node();
      onNode(kind, n);
      return n;
    };
  }
  globalThis.AudioContext = FakeContext;
}
