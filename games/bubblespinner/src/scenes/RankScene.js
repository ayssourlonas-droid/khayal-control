import DataStore from "../data/DataStore.js";
import Sprite from "../base/Sprite.js";
import RendererManager from "../renderer/RendererManager.js";
import TouchHandler from "../utils/TouchHandler.js";
import Scene from "./Scene.js";
import Audio from "../utils/Audio.js";

const _tap  = () => Audio.getInstance().play("button_next");
const _back = () => Audio.getInstance().play("button_back");

/**
 * This scene is static (no animation). It composes of two parts. One part is
 * the sharedCanvas, the other is the return btn and the group rank btn. The
 * reason not to draw the btns on the sharedCanvas is as following:
 *   - Their events are bound in the primary domain;
 *   - The assets are garanteed to be loaded in the primary domain so the
 *     return btn can be shown immediately in concern of ux.
 */

export default class RankScene extends Scene {
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

        this.returnBtn = new Sprite(
            DataStore.assets.get("return-btn"),
            0.12 * DataStore.screenWidth,
            0.9 * DataStore.screenHeight,
            0.06 * DataStore.screenWidth
        );
        this.groupRankBtn = new Sprite(
            DataStore.assets.get("group-rank-btn"),
            0.75 * DataStore.screenWidth,
            0.9 * DataStore.screenHeight,
            0.3 * DataStore.screenWidth
        );

        this.touchHandler = new TouchHandler;
        this.touchHandler.onTouchEnd(e => {
            if (DataStore.currentScene !== this.toString()) return;

            if (this.groupRankBtn.isTouched(e)) {
                _tap();
                wx.shareAppMessage({
                    title: "查看群排行",
                    imageUrl: DataStore.assets.get("share-img").src
                });
            }

            if (this.returnBtn.isTouched(e)) {
                _back();
                DataStore.currentScene = DataStore.lastScene;
                DataStore.lastScene = this.toString();
                DataStore.openDataContext.postMessage({
                    action: DataStore.currentScene,
                    lastScene: DataStore.lastScene
                });
            }
        });

        this.rendererManager = new RendererManager();
        this.rendererManager.setRenderer(this.mask);
        this.rendererManager.setRenderer(this.returnBtn);
        this.rendererManager.setRenderer(this.groupRankBtn);
        this.rendererManager.setRenderer(DataStore.sharedCanvas);
    }

    render() {
        this.rendererManager.render(this.ctx);
    }

    toString() {
        return "RankScene";
    }

    static getInstance() {
        if (!RankScene.instance) {
            RankScene.instance = new RankScene();
        }
        return RankScene.instance;
    }
}