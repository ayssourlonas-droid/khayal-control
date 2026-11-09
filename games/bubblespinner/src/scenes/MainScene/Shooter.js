import ShooterController from "./utils/ShooterController.js";
import TouchHandler from "../../utils/TouchHandler.js";
import UUID from "../../base/UUID.js";
import RendererManager from "../../renderer/RendererManager.js";
import DataStore from "../../data/DataStore.js";
import Audio from "../../utils/Audio.js";


export default class Shooter {
    static State = class {
        static LOADING = 1;
        static LOADED = 2;
        static AIMING = 3;
        static SHOOTING = 4;
        static RESTORING = 5;
    }

    constructor() {
        this.id = UUID.getUUID();
        this.controller = new ShooterController(this);
        this.maxBounces = 8;

        this.touchHandler = new TouchHandler();
        wx.onTouchStart((e) => {
            if (DataStore.currentScene != DataStore.MainScene.toString()) {
                return;
            }

            if (this.state == Shooter.State.LOADED && this.controller.permit()) {
                this.state = Shooter.State.AIMING;
                this.touchX = e.touches[0].clientX;
                this.touchY = e.touches[0].clientY;
            }
        });
        this.touchHandler.onTouchMove((e) => {
            if (this.state == Shooter.State.AIMING) {
                this.touchX = e.touches[0].clientX;
                this.touchY = e.touches[0].clientY;
            }
        });
        this.touchHandler.onTouchEnd(() => {
            if (this.state == Shooter.State.AIMING) {
                this.state = Shooter.State.SHOOTING;
                Audio.getInstance().play("a_shoot");

                let angle = Math.atan2(
                    this.touchY - this.currShot.getY(),
                    this.touchX - this.currShot.getX());
                this.currShot.speedX = this.currShot.speed * Math.cos(angle);
                this.currShot.speedY = this.currShot.speed * Math.sin(angle);
            }
        });

        this.rendererManager = new RendererManager();
        this.rendererManager.setRenderer(this, "Trace");
        this.reload();
    }

    reload() {
        if (this.currShot) this.rendererManager.remove(this.currShot);
        if (this.nextShot) this.rendererManager.remove(this.nextShot);
        this.currShot = this.controller.createCurrShot();
        this.nextShot = this.controller.createNextShot();
        this.rendererManager.setRenderer(this.nextShot, "ZoomIn");
        this.rendererManager.setRenderer(this.currShot, "ZoomInUp");

        // Reset current bounces
        this.curbounces = 0;
        return this.state = Shooter.State.LOADING;
    }

    update() {
        if ((this.state == Shooter.State.LOADING && this.currShot.zoomedInUp) ||
            (this.state == Shooter.State.RESTORING && this.currShot.landed)) {
            return this.state = Shooter.State.LOADED;
        }

        if (this.state != Shooter.State.SHOOTING) {
            return;
        }

        // Collision detection with the spinner
        if (this.controller.spinner.collides(this.currShot)) {
            return this.reload();
        }

        if ((this.currShot.collideXBounds() ? (this.currShot.speedX *= (-1), true) : false) ||
            (this.currShot.collideYBounds() ? (this.currShot.speedY *= (-1), true) : false)) {
            this.curbounces++;
        }

        if (this.curbounces >= this.maxBounces && this.currShot.speedY < 0) {
            this.rendererManager.setRenderer(this.currShot, "GravityAndBounce");
            // Reset current bounces
            this.curbounces = 0;
            return this.state = Shooter.State.RESTORING;
        }

        this.currShot.update();
    }

    render(ctx) {
        this.rendererManager.render(ctx);
    }

    static getInstance() {
        if (!Shooter.instance) {
            Shooter.instance = new Shooter();
        }
        return Shooter.instance;
    }
}