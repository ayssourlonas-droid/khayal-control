import Renderer from "../Renderer.js";
import DataStore from "../../data/DataStore.js";

export default class GravityAndBounceAnimator extends Renderer {
    constructor(target) {
        super(target);
        this.target.speedX = 2.5 * (this.target.speedX > 0 ? 1 : -1);
        this.target.landed = false;
    }

    render(ctx) {
        if (this.target.landed) {
            return super.render(ctx);
        }

        if (this.target.collideXBounds()) {
            this.target.speedX *= (-1);
        }
        if (this.target.collideYBounds()) {
            this.target.speedY *= (-1);
            this.target.speedY *= 0.7;
        }

        this.target.speedY += 1;
        this.target.speedX *= 0.998;
        this.target.update();

        if (Math.abs(this.target.getX() - DataStore.screenWidth / 2) < 1 &&
            Math.abs(this.target.getY() - DataStore.bottomBound) < 0.001) {
            this.target.setX(DataStore.screenWidth / 2);
            this.target.setY(DataStore.bottomBound);

            this.target.landed = true;
        }

        super.render(ctx);
    }
}