// Ref: https://www.redblobgames.com/grids/hexagons/codegen/output/lib.js
const SQRT3 = Math.sqrt(3);

export default class Hex {
    constructor(q, r, s) {
        this.q = q;
        this.r = r;
        this.s = s;
        if (Math.round(q + r + s) !== 0) {
            throw "q + r + s must be 0";
        }
    }
    static add(a, b) {
        return new Hex(a.q + b.q, a.r + b.r, a.s + b.s);
    }
    static subtract(a, b) {
        return new Hex(a.q - b.q, a.r - b.r, a.s - b.s);
    }
    static scale(a, k) {
        return new Hex(a.q * k, a.r * k, a.s * k);
    }
    static direction(direction) {
        return Hex.directions[direction];
    }
    static neighbor(a, direction) {
        return Hex.add(a, Hex.direction(direction));
    }
    // Ref: https://www.redblobgames.com/grids/hexagons/#hex-to-pixel
    toPixel() {
        // console.assert(Hex.size != undefined);
        let x = Hex.size * (SQRT3 * this.q + SQRT3 / 2 * this.r);
        let y = Hex.size * (3. / 2 * this.r);
        return { x: x, y: y };
    }
    len() {
        return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
    }
    distance(b) {
        return Hex.subtract(this, b).len();
    }
    round() {
        var qi = Math.round(this.q);
        var ri = Math.round(this.r);
        var si = Math.round(this.s);
        var q_diff = Math.abs(qi - this.q);
        var r_diff = Math.abs(ri - this.r);
        var s_diff = Math.abs(si - this.s);
        if (q_diff > r_diff && q_diff > s_diff) {
            qi = -ri - si;
        }
        else if (r_diff > s_diff) {
            ri = -qi - si;
        }
        else {
            si = -qi - ri;
        }
        return new Hex(qi, ri, si);
    }

    /**
     * Keep track of the object at this hex
     * @param {*} obj Object at this hex
     */
    setObj(obj) {
        obj.hex = this;
        this.obj = obj;
    }

    unsetObj() {
        this.obj.hex = null;
        this.obj = null;
    }
}

Hex.directions = [new Hex(1, 0, -1), new Hex(1, -1, 0), new Hex(0, -1, 1), new Hex(-1, 0, 1), new Hex(-1, 1, 0), new Hex(0, 1, -1)];
