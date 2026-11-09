import Renderer from "../Renderer.js";

export default class RotateAnimator extends Renderer {
    constructor(target) {
        super(target);
        this.startAngle = 0;
        this.stepSize = 0.01;
    }

    render(ctx) {
        this.startAngle += this.stepSize;
        ctx.save();
        ctx.translate(this.target.getX(), this.target.getY());
        ctx.rotate(this.startAngle);
        ctx.translate(-this.target.getX(), -this.target.getY());
        super.render(ctx);
        ctx.restore();
    }
}