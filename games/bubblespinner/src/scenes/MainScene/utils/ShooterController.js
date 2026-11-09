import DataStore from "../../../data/DataStore.js";
import Sprite from "../../../base/Sprite.js";
import Spinner from "../Spinner.js";
import Bubble from "../Bubble.js";
import Health from "../Health.js";

export default class ShooterController {
    constructor(shooter) {
        this.shooter = shooter;
        this.spinner = Spinner.getInstance();
        DataStore.bottomBound = DataStore.screenHeight - Bubble.size;

        // Scale the speed based on the bubble size to prevent from tunneling
        this.shootingSpeed = 0.75 * Bubble.size;

        // Scale the fiction of rotation by the shooting speed
        this.spinner.frictionOfRotation = this.shootingSpeed * 0.0001;
    }

    createCurrShot() {
        return new Shot(this.shooter.nextShot ? this.shooter.nextShot.texture.img : this.createNextShot().texture.img, this.shootingSpeed);
    }

    // get the next shot whose asset is more likely to be the least frequent one on the spinner
    createNextShot() {
        // all possible bubble assets at current level
        let a = this.spinner.controller.getBubbleAssets();

        // bubble assets on the spinner, concat with `a`
        let b = this.spinner.bubbles.map(bubble => bubble.texture.img).concat(a);

        // filter out invalid bubbles which may appear when restarting
        b = b.filter(asset => this.spinner.controller.getBubbleAssets().includes(asset));

        // the least frequent bubble in `b`
        let c = [...b.reduce((f, b) => f.set(b, (f.get(b) || 0) + 1), new Map())].reduce((a, b) => b[1] < a[1] ? b : a)[0];

        // all possible bubble assets, concat with array of `c` of the same length
        // Exploration vs exploitation
        let d = a.concat((new Array(a.length)).fill(c));

        let t = d[Math.floor(Math.random() * d.length)];

        // Prevent the case that the shooter continuously produces one color of bubble
        // when the spinner is largely biased
        if (t == c && this.shooter.currShot && t == this.shooter.currShot.texture.img) {
            t = a[Math.floor(Math.random() * a.length)];
        }

        // return a random choice from `d`
        return new Sprite(
            t,
            0.5 * DataStore.screenWidth,
            DataStore.screenHeight - 0.5 * Bubble.size,
            0.5 * Bubble.size,
            0.5 * Bubble.size
        );
    }

    permit() {
        return Health.getInstance().currHealth && (this.spinner.state == Spinner.State.STAND || this.spinner.state == Spinner.State.ROTATING);
    }
}

class Shot extends Bubble {
    constructor(img, speed) {
        super(img, 0.5 * DataStore.screenWidth, DataStore.bottomBound);
        this.speed = speed;
    }
    collideXBounds() {
        return (
            this.speedX > 0 && (this.getX() + Bubble.size / 2) >= DataStore.screenWidth ||
            this.speedX < 0 && (this.getX() - Bubble.size / 2) <= 0
        );
    }
    collideYBounds() {
        return (
            this.speedY > 0 && this.getY() >= DataStore.bottomBound ||
            this.speedY < 0 && (this.getY() - Bubble.size / 2) <= 0
        )
    }
    update() {
        this.setX(this.getX() + this.speedX);
        this.setY(this.getY() + this.speedY);
        this.setY(Math.min(this.getY(), DataStore.bottomBound));
    }
}