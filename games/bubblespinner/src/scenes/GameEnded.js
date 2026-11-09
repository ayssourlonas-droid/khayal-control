import DataStore from "../data/DataStore.js";
import Sprite from "../base/Sprite.js";
import RendererManager from "../renderer/RendererManager.js";
import TouchHandler from "../utils/TouchHandler.js";
import Scene from "./Scene.js";
import Audio from "../utils/Audio.js";

const _tap = () => Audio.getInstance().play("button_next");

/**
 * This scene is static (no animation)
 */
export default class GameEnded extends Scene {
    constructor() {
        super();

        let mask = wx.createCanvas();
        let maskCtx = mask.getContext("2d");
        maskCtx.fillStyle = "rgba(30, 30, 30, 0.9)";
        maskCtx.fillRect(0, 0, mask.width, mask.height);
        this.mask = new Sprite(
            mask,
            0.5 * DataStore.screenWidth,
            0.5 * DataStore.screenHeight,
            DataStore.screenWidth,
            DataStore.screenHeight
        );

        this.restartBtn = new Sprite(
            DataStore.assets.get("restart-btn"),
            0.5 * DataStore.screenWidth,
            0.75 * DataStore.screenHeight,
            0.45 * DataStore.screenWidth
        );

        // Fill the background outside the open data context to provide the visual feedback for the touch event
        let leaderboardThumbnailBackground = wx.createCanvas();
        let leaderboardThumbnailBackgroundCtx = leaderboardThumbnailBackground.getContext("2d");
        leaderboardThumbnailBackgroundCtx.fillStyle = "rgba(0, 0, 0, 0.5)";
        leaderboardThumbnailBackgroundCtx.fillRect(0, 0, leaderboardThumbnailBackground.width, leaderboardThumbnailBackground.height);
        this.leaderboardThumbnailBackground = new Sprite(
            leaderboardThumbnailBackground,
            0.5 * DataStore.screenWidth,
            0.43 * DataStore.screenHeight,
            0.85 * DataStore.screenWidth,
            0.26 * DataStore.screenHeight
        );


        this.touchHandler = new TouchHandler;
        this.touchHandler.onTouchEnd(e => {
            if (DataStore.currentScene !== this.toString()) return;

            if (this.leaderboardThumbnailBackground.isTouched(e)) {
                _tap();
                DataStore.openDataContext.postMessage({
                    action: "RankScene"
                });
                DataStore.lastScene = DataStore.currentScene;
                DataStore.currentScene = DataStore.RankScene.toString();
            }

            if (this.restartBtn.isTouched(e)) {
                DataStore.AdController.resetInterstitialAdShownOnce();

                DataStore.openDataContext.postMessage({
                    action: "Restart"
                });
                DataStore.currentScene = DataStore.MainScene.toString();
                DataStore.lastScene = this.toString();

                DataStore.MainScene.restart();
            }
        });

        this.rendererManager = new RendererManager();
        this.rendererManager.setRenderer(this.mask);
        this.rendererManager.setRenderer(this.restartBtn);
        this.rendererManager.setRenderer(this.leaderboardThumbnailBackground);
        this.rendererManager.setRenderer(DataStore.sharedCanvas);
    }

    render() {
        this.rendererManager.render(this.ctx);
    }

    toString() {
        return "GameEnded";
    }

    static getInstance() {
        if (!GameEnded.instance) {
            GameEnded.instance = new GameEnded();
        }
        return GameEnded.instance;
    }
}