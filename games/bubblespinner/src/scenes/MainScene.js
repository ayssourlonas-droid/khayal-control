import DataStore from "../data/DataStore.js";
import RendererManager from "../renderer/RendererManager.js";
import Spinner from "./MainScene/Spinner.js";
import Shooter from "./MainScene/Shooter.js";
import Scene from "./Scene.js";
import Health from "./MainScene/Health.js";
import Score from "./MainScene/Score.js";
import NPC from "./MainScene/NPC.js";
import Audio from "../utils/Audio.js";


export default class MainScene extends Scene {
    constructor() {
        super();
        this.spinner = Spinner.getInstance();
        this.shooter = Shooter.getInstance();
        this.health = Health.getInstance();
        this.score = Score.getInstance();
        this.npc = NPC.getInstance();

        this.rendererManager = new RendererManager();
        this.rendererManager.setRenderer(this.spinner, "RotateIn");
        this.rendererManager.setRenderer(this.shooter);
        this.rendererManager.setRenderer(this.health);
        this.rendererManager.setRenderer(this.score);
        this.rendererManager.setRenderer(this.npc);
    }

    update() {
        this.shooter.update();
        this.spinner.update();
        this.score.update();
        this.npc.update();
    }

    render() {
        super.render();
        this.rendererManager.render(this.ctx);

        if (DataStore.currentScene == DataStore.GameEnded.toString()) {
            DataStore.AdController.showInterstitialAdOnce();
            DataStore.GameEnded.render();
        }

        if (DataStore.currentScene == DataStore.RankScene.toString()) {
            DataStore.RankScene.render();
        }
    }

    restart() {
        DataStore.score = 0;
        DataStore.level = 0;

        Audio.getInstance().play("a_levelStart");
        this.health.resetHealth();
        this.spinner.reload();
        this.shooter.reload();
    }

    // loop all the frames
    run() {
        this.frameID = requestAnimationFrame(this.run.bind(this));
        this.update();
        this.render();
    }

    toString() {
        return "MainScene";
    }

    static getInstance() {
        if (!MainScene.instance) {
            MainScene.instance = new MainScene();
        }
        return MainScene.instance;
    }
}
