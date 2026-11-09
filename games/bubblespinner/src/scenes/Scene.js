import DataStore from "../data/DataStore.js";

let _gt = 0;
let _cachedGrad = null;
let _lastHue = -999;

/** Convert HSL (h: 0-360, s/l: 0-100) to a '#rrggbb' hex string. */
function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
        const k = (n + h / 30) % 12;
        const val = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * val).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Oscillate gently within a blue-indigo band (hue 200–245).
// This complements every bubble colour in the palette and never clashes
// with yellow, red, pink or green bubbles the way a full hue sweep does.
const HUE_CENTRE = 222;
const HUE_SWING  = 22;   // ± degrees around the centre

export default class Scene {
    constructor() {
        this.ctx = DataStore.ctx;
    }

    update() {}

    render() {
        const ctx = this.ctx;
        const w = DataStore.screenWidth;
        const h = DataStore.screenHeight;

        _gt += 0.004;

        // Only rebuild the gradient when the hue has shifted by at least 1 degree
        const hue = HUE_CENTRE + Math.sin(_gt * 0.3) * HUE_SWING;
        if (Math.abs(hue - _lastHue) >= 1 || !_cachedGrad) {
            _lastHue = hue;
            // Top stop: slightly lighter/cooler; bottom stop: slightly deeper/warmer
            const color0 = hslToHex(hue,      32, 86);
            const color1 = hslToHex(hue + 20, 28, 80);

            _cachedGrad = ctx.createLinearGradient(0, 0, 0, h);
            _cachedGrad.addColorStop(0, color0);
            _cachedGrad.addColorStop(1, color1);
        }

        ctx.fillStyle = _cachedGrad;
        ctx.fillRect(0, 0, w, h);
    }
}
