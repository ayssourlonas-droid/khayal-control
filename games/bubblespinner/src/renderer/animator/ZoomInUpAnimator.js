import Renderer from "../Renderer.js";
import DataStore from "../../data/DataStore.js";

export default class ZoomInUpAnimator extends Renderer {
    constructor(target) {
        super(target);
        this.target.zoomedInUp = false;
        this.factor = 0.5;
        this.step = 0.05;
    }

    render(ctx) {
        if (this.target.zoomedInUp) {
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

        // translate up
        ctx.translate(0, (1 - scale) * (DataStore.screenHeight - this.target.getY()));

        super.render(ctx);
        ctx.restore();

        if (this.factor >= Math.PI / 2) {
            this.target.zoomedInUp = true;
        }
    }
}
