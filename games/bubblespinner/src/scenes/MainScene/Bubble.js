import Sprite from "../../base/Sprite.js";

export default class Bubble extends Sprite {
    constructor(img, x, y) {
        super(img, x, y, Bubble.size);
    }
}