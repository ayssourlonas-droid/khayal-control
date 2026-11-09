import Renderer from "../Renderer.js";
import DataStore from "../../data/DataStore.js";
import Bubble from "../../scenes/MainScene/Bubble.js";

export default class CollisionAndGravityAnimator extends Renderer {
    constructor(target, other) {
        // console.assert(other.speed);
        // console.assert(other.speedX);
        // console.assert(other.speedY);
        // console.assert(other.getX);
        // console.assert(other.getY);
        super(target);

        // Init collision animation
        // Angle between the horizontal and other's velocity
        let angleOfAppliedForce = Math.atan2(other.speedY, other.speedX);
        // Angle between the horizontal and the joint line between the two bubbles on collision
        let angleOfResistance = Math.atan2(this.target.getY() - other.getY(), this.target.getX() - other.getX());
        // Difference between two angles
        let angleOfAcceleration = angleOfAppliedForce - angleOfResistance;

        let velocityGained = other.speed * Math.cos(angleOfAcceleration) / 2;
        this.target.speedX = velocityGained * Math.cos(angleOfResistance);
        this.target.speedY = velocityGained * Math.sin(angleOfResistance);
    }

    render(ctx) {
        if (this.target.getX() <= -Bubble.size ||
            this.target.getX() >= DataStore.screenWidth + Bubble.size ||
            this.target.getY() >= DataStore.screenHeight + Bubble.size) {
            return this.outOfSight = true;
        }

        this.target.speedX *= 0.998;
        this.target.speedY += 0.98;

        this.target.setY(this.target.getY() + this.target.speedY);
        this.target.setX(this.target.getX() + this.target.speedX);

        super.render(ctx);
    }
}
