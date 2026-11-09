import Renderer from "../Renderer.js";


export default class ZoomInAnimator extends Renderer {
    constructor(target) {
        super(target);
        this.target.zoomedIn = false;
        this.factor = 0;
        this.step = 0.05;
    }

    render(ctx) {
        if (this.target.zoomedIn) {
            return super.render(ctx);
        }
        this.factor += this.step;
        this.factor = Math.min(Math.PI / 2, this.factor);

        let scale = Math.sin(this.factor);
        ctx.save();

        // scale from the target cantre
        ctx.translate(this.target.getX(), this.target.getY());
        ctx.scale(scale, scale);
        ctx.translate(-this.target.getX(), -this.target.getY());

        super.render(ctx);
        ctx.restore();

        if (this.factor >= Math.PI / 2) {
            this.target.zoomedIn = true;
        }
    }
}
