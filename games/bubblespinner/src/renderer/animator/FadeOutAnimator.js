import Renderer from "../Renderer.js";

export default class FadeOutAnimator extends Renderer {
    constructor(target) {
        super(target);
        this.factor = 1;
        this.step = 0.05;
    }

    render(ctx) {
        if (this.target.fadedOut) {
            return this.outOfSight = true;
        }

        this.factor -= this.step;
        this.factor = Math.max(0, this.factor);

        ctx.save();

        // a zoom out effect as fading out. Not visible for full-screen elements
        let scale = 2 - this.factor;
        ctx.translate(this.target.getX(), this.target.getY());
        ctx.scale(scale, scale);
        ctx.translate(-this.target.getX(), -this.target.getY());

        ctx.globalAlpha = this.factor;
        super.render(ctx);
        ctx.restore();

        if (this.factor == 0) {
            this.target.fadedOut = true;
        }
    }
}
