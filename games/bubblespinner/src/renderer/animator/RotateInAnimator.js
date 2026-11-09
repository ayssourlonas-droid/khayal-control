import Renderer from "../Renderer.js";

export default class RotateInAnimator extends Renderer {
    constructor(target) {
        super(target);
        this.factor = 0;
        this.step = 0.02;
    }

    render(ctx) {
        if (this.target.rotatedIn) {
            return super.render(ctx);
        }
        this.factor += this.step;
        this.factor = Math.min(Math.PI / 2, this.factor);

        let scale = Math.sin(this.factor);
        ctx.save();
        ctx.translate(this.target.getX(), this.target.getY());
        ctx.scale(scale, scale);
        ctx.rotate(Math.PI * 2 * scale);
        ctx.translate(-this.target.getX(), -this.target.getY());
        super.render(ctx);
        ctx.restore();

        if (this.factor >= Math.PI / 2) {
            this.target.rotatedIn = true;
        }
    }
}
