import Renderer from "../Renderer.js";
import DataStore from "../../data/DataStore.js";
import Bubble from "../../scenes/MainScene/Bubble.js";

export default class FadeOutUpAnimator extends Renderer {
    constructor(target) {
        super(target);
        // console.assert(target.bubble);

        this.target.x = (() => { let a = [Bubble.size, this.target.bubble.getX(), DataStore.screenWidth - Bubble.size]; a.sort((a, b) => { return a - b; }); return a; })()[1];
        this.target.y = this.y = this.target.bubble.getY();

        this.factor = 0;
        this.step = 0.035;
    }

    render(ctx) {
        if (this.factor >= Math.PI / 2) {
            return this.outOfSight = true;
        }

        ctx.save();
        ctx.globalAlpha = 1 - Math.sin(this.factor);
        this.target.y = this.y - Math.sin(this.factor) * 30;
        this.target.render(ctx);
        ctx.restore();

        this.factor += this.step;
    }
}
