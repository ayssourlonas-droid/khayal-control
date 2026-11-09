import Health from "./Health";
import Spinner from "./Spinner";
import Bubble from "./Bubble";
import DataStore from "../../data/DataStore";
import RendererManager from "../../renderer/RendererManager";
import UUID from "../../base/UUID";


/**
 * NPC is responsible to emit bubbles when users have wasted
 * all the health and also to reset the health afterwards
 */
export default class NPC {
    static State = class {
        static UNSPAWNED = 1
        static SPAWNED = 2;
        static AIMED = 3;
    };

    constructor() {
        this.id = UUID.getUUID();
        this.spinner = Spinner.getInstance();
        this.health = Health.getInstance();
        this.rendererManager = new RendererManager();

        SpawnedBubble.speed = 0.7 * Bubble.size;
        this.minSpawns = 2;
        this.maxSpawns = 8;
        this.reset();
    }

    reset() {
        this.spawnedBubbles = [];
        this.state = NPC.State.UNSPAWNED;
    }

    spawn() {
        let numOfSpawns = this.minSpawns + Math.round(Math.random() * (this.maxSpawns - this.minSpawns));
        // console.assert(!this.spawnedBubbles.length);
        for (let i = 0, initAngle = Math.random() * Math.PI * 2, sepAngle = Math.PI * 2 / numOfSpawns; i < numOfSpawns; i++) {

            // Get the initial position of each NPC bubbles
            let x = Math.cos(initAngle + sepAngle * i) * DataStore.screenHeight;
            let y = Math.sin(initAngle + sepAngle * i) * DataStore.screenHeight;
            function mid(arr) {
                arr.sort((a, b) => { return a - b; });
                return arr[Math.floor(arr.length / 2)];
            }
            x = mid([-Bubble.size, x, DataStore.screenWidth + Bubble.size]);
            y = mid([-Bubble.size, y, DataStore.screenHeight + Bubble.size]);

            this.spawnedBubbles.push(new SpawnedBubble(this.spinner.controller.randomBubbleAsset(), x, y));
        }

        this.state = NPC.State.SPAWNED;
    }

    aim() {
        // console.assert(SpawnedBubble.speed);
        // find best destinations for NPC bubbles
        let bubbles = this.spinner.bubbles.slice();
        bubbles.sort((b1, b2) => {
            let d = (bubble) => {
                return Math.sqrt(
                    (bubble.getX() - this.spinner.pivot.getX()) ** 2 +
                    (bubble.getY() - this.spinner.pivot.getY()) ** 2);
            }
            return d(b2) - d(b1);
        });
        let aimedBubbles = bubbles.slice(0, Math.ceil(Math.random() * this.spawnedBubbles.length / 2));

        this.spawnedBubbles.forEach(bubble => {
            let aimedBubble = aimedBubbles[Math.floor(Math.random() * aimedBubbles.length)];
            let angle = Math.atan2(
                aimedBubble.getY() - bubble.getY(),
                aimedBubble.getX() - bubble.getX()
            );
            bubble.speedX = SpawnedBubble.speed * Math.cos(angle);
            bubble.speedY = SpawnedBubble.speed * Math.sin(angle);
        });

        this.state = NPC.State.AIMED;

        this.spawnedBubbles.forEach(bubble => {
            this.rendererManager.setRenderer(bubble);
        });
    }

    update() {
        if (this.health.currHealth || this.spinner.state != Spinner.State.STAND) {
            return;
        }

        if (this.state == NPC.State.UNSPAWNED) {
            return this.spawn();
        }

        if (this.state == NPC.State.SPAWNED) {
            this.aim();
        }

        this.spawnedBubbles.forEach(bubble => {
            if (bubble.inactive) {
                return;
            }

            bubble.setX(bubble.getX() + bubble.speedX);
            bubble.setY(bubble.getY() + bubble.speedY);

            if (this.spinner.collides(bubble)) {
                this.rendererManager.remove(bubble);
                bubble.inactive = true;
            }
        });

        if (this.spawnedBubbles.every(bubble => bubble.inactive)) {
            this.reset();
            this.health.resetHealth();
        }
    }

    render(ctx) {
        this.rendererManager.render(ctx);
    }

    static getInstance() {
        if (!NPC.instance) {
            NPC.instance = new NPC();
        }
        return NPC.instance;
    }
}

export class SpawnedBubble extends Bubble {
    constructor(img, x, y) {
        super(img, x, y);
        this.inactive = false;
        this.speedX = this.speedY = 0;
    }
}
