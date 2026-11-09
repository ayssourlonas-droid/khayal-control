import Hex from "./Hex.js";

export default class HexMap {
    constructor() {
        // the number of rings for the entire map
        // console.assert(HexMap.radius);

        this.data = new Array(2 * HexMap.radius + 1);
        for (let r = 0; r < this.data.length; r++) {
            this.data[r] = new Array(2 * HexMap.radius + 1 - Math.abs(HexMap.radius - r));
        }

        // Ref: https://www.redblobgames.com/grids/hexagons/implementation.html#shape-hexagon
        for (let q = -HexMap.radius; q <= HexMap.radius; q++) {
            let r1 = Math.max(-HexMap.radius, -q - HexMap.radius);
            let r2 = Math.min(HexMap.radius, -q + HexMap.radius);
            for (let r = r1; r <= r2; r++) {
                let Q = q + HexMap.radius;
                let R = r + HexMap.radius;
                this.data[R][Q - Math.max(0, HexMap.radius - R)] = new Hex(Q, R, -Q - R);
            }
        }
    }

    map(hex) {
        return this.data[hex.r][hex.q - Math.max(0, HexMap.radius - hex.r)];
    }

    centre() {
        return this.data[HexMap.radius][HexMap.radius];
    }

    // Ref: https://www.redblobgames.com/grids/hexagons/#rings
    cubeRing(center, radius) {
        let results = [];
        let cube = this.map(Hex.add(center, Hex.scale(Hex.direction(4), radius)));
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < radius; j++) {
                if (cube) {
                    results.push(cube);
                    cube = this.map(Hex.neighbor(cube, i));
                }
            }
        }
        return results;
    }

    cubeSpiral(center, radius) {
        let results = [center];
        for (let k = 1; k <= radius; k++) {
            results = results.concat(this.cubeRing(center, k));
        }
        return results;
    }

    getAdjacentHexes(center) {
        return this.cubeRing(center, 1);
    }

    static getInstance() {
        if (!HexMap.instance) {
            HexMap.instance = new HexMap();
        }
        return HexMap.instance;
    }
}