import DataStore from "../../../data/DataStore.js";
import Sprite from "../../../base/Sprite.js";
import Hex from "./Hex.js";
import HexMap from "./HexMap.js";
import Bubble from "../Bubble.js";

/**
 * SpinnerController shares some of the responsibilities of Spinner
 * to make it cleaner
 */
export default class SpinnerController {
    constructor(spinner) {
        this.spinner = spinner;
        this.bubbleAssets = shuffle([
            DataStore.assets.get("blue-bubble"),
            DataStore.assets.get("cyan-bubble"),
            DataStore.assets.get("red-bubble"),
            DataStore.assets.get("yellow-bubble"),
            DataStore.assets.get("pink-bubble"),
            DataStore.assets.get("green-bubble"),
        ]);

        // init spinner data
        // distance between each corner to the center in a single hex
        Hex.size = Math.ceil(0.065 * DataStore.screenWidth) / 2;

        // bubbleSize = (hexSize * 2 / √3 + hexSize * 2) / 1.9
        Bubble.size = Hex.size * (1 / Math.sqrt(3) + 1) * 2 / 1.9;

        // the number of rings for the entire map
        HexMap.radius = Math.ceil(Math.max(DataStore.screenWidth, 0.5 * DataStore.screenHeight) / Bubble.size);

        // create the hex map which covers the entire screen
        this.hexMap = HexMap.getInstance();

        this.screenCentre = {
            x: 0.5 * DataStore.screenWidth,
            y: 0.5 * DataStore.screenHeight
        };

        let hexCentre = this.hexMap.centre().toPixel();
        this.xOffset = this.screenCentre.x - hexCentre.x;
        this.yOffset = this.screenCentre.y - hexCentre.y;
    }

    createPivot() {
        let pivot = new Sprite(
            DataStore.assets.get("pivot"),
            this.screenCentre.x,
            this.screenCentre.y,
            Bubble.size,
            Math.sqrt((Bubble.size / 2) ** 2 - (Bubble.size / 4) ** 2) * 2
        );
        this.hexMap.centre().setObj(pivot);
        return pivot;
    }

    getSpinnerRadius() {
        let r = [2, 3, 4, 5, 6];
        return DataStore.level < r.length ? r[DataStore.level] : r[r.length - 1];
    }

    getBubbleAssets() {
        return this.bubbleAssets.slice(0, this.getSpinnerRadius() + 1);
    }

    randomBubbleAsset() {
        let bubbleAssets = this.getBubbleAssets();
        return bubbleAssets[Math.floor(Math.random() * bubbleAssets.length)];
    }

    createBubbles() {
        let spinner = this.hexMap.cubeSpiral(this.hexMap.centre(), this.getSpinnerRadius());

        // remove the first hex which is in the poisiton of the pivot
        spinner.shift();

        let bubbleAssets = this.getBubbleAssets();
        let bubbles = new Array(spinner.length);
        spinner.forEach((hex, i) => {
            let j = i % bubbleAssets.length;
            if (!j) bubbleAssets = shuffle(bubbleAssets);
            let { x, y } = this.hexToCoordinates(hex);
            let bubble = new Bubble(bubbleAssets[j], x, y);
            hex.setObj(bubble);
            bubbles[i] = bubble;
        });

        return bubbles;
    }

    hexToCoordinates(hex) {
        let { x, y } = hex.toPixel();
        x += this.xOffset;
        y += this.yOffset;

        let pivotX = this.spinner.getX();
        let pivotY = this.spinner.getY();
        let toPivotX = x - pivotX;
        let toPivotY = y - pivotY;
        let radius = Math.sqrt(toPivotX ** 2 + toPivotY ** 2)
        let angleOffset = Math.atan2(toPivotY, toPivotX) - this.spinner.angleOfRotation;

        return {
            x: pivotX + Math.cos(angleOffset) * radius,
            y: pivotY + Math.sin(angleOffset) * radius
        }
    };

    getAdjacentHexes(center) {
        return this.hexMap.getAdjacentHexes(center);
    }
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}