import Renderer from "../Renderer.js";


export default class RotateOutAnimator extends Renderer {
    constructor(target) {
        super(target);
        this.factor = 1;
        this.step = 0.02;
    }

    render(ctx) {
        if (this.target.rotatedOut) {
            return this.outOfSight = true;
        }
        this.factor -= this.step;

        let scale = Math.sin(this.factor);
        ctx.save();
        ctx.translate(this.target.getX(), this.target.getY());
        ctx.scale(scale, scale);
        ctx.rotate(Math.PI * 2 * scale);
        ctx.translate(-this.target.getX(), -this.target.getY());
        super.render(ctx);
        ctx.restore();

        if (this.factor <= 0) {
            this.target.rotatedOut = true;
        }
    }
}
