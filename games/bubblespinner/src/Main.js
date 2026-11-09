import AssetsLoader from "./data/AssetsLoader.js";
import DataStore from "./data/DataStore.js";
import Sprite from "./base/Sprite.js";

import MainMenu from "./scenes/MainMenu.js";
import MainScene from "./scenes/MainScene.js";
import RankScene from "./scenes/RankScene.js";
import GameEnded from "./scenes/GameEnded.js";
import AdController from "./utils/AdController.js";

// The entry class of the game
export default class Main {
    constructor() {
        const loader = AssetsLoader.getInstance();
        loader.onLoaded(assets => this.onAssetsLoaded(assets));
    }

    onAssetsLoaded(assets) {
        DataStore.assets = assets;

        // Ref: https://developers.weixin.qq.com/community/develop/doc/0008ecb3280ac8a3c908282cf56401
        // scale the onscreen canvas
        const { screenWidth, screenHeight, pixelRatio } = wx.getSystemInfoSync();
        canvas.width = screenWidth * pixelRatio;
        canvas.height = screenHeight * pixelRatio;

        DataStore.screenWidth = screenWidth;
        DataStore.screenHeight = screenHeight;
        DataStore.pixelRatio = pixelRatio;
        DataStore.ctx = canvas.getContext("2d");
        DataStore.ctx.fillStyle = "#ffffff";
        DataStore.ctx.scale(pixelRatio, pixelRatio);

        // setup the offscreen canvas for the ranking
        let openDataContext = wx.getOpenDataContext();
        let sharedCanvas = openDataContext.canvas;
        sharedCanvas.width = canvas.width;
        sharedCanvas.height = canvas.height;
        DataStore.sharedCanvas = new Sprite(
            sharedCanvas,
            0.5 * screenWidth,
            0.5 * screenHeight,
            screenWidth,
            screenHeight
        );
        DataStore.openDataContext = openDataContext;
        DataStore.openDataContext.postMessage({
            action: "LoadAssets"
        });

        DataStore.fps = 60;
        wx.setPreferredFramesPerSecond(DataStore.fps);

        // Vertical centre of the WeChat capsule button — safe zone below the camera cutout
        const menuButtonRect = wx.getMenuButtonBoundingClientRect();
        DataStore.menuButtonCenterY = 0.5 * (menuButtonRect.top + menuButtonRect.bottom);

        // init shared (used in more than one scenes) game data
        DataStore.score = 0;
        DataStore.level = 0;

        // init scenes
        DataStore.MainMenu = MainMenu.getInstance();
        DataStore.MainScene = MainScene.getInstance();
        DataStore.RankScene = RankScene.getInstance();
        DataStore.GameEnded = GameEnded.getInstance();

        // init ad controller
        DataStore.AdController = AdController.getInstance();

        // start MainMenu scene
        DataStore.MainMenu.run();
    }
}

wx.showShareMenu({
    withShareTicket: true,
});

wx.onShareAppMessage(() => {
    return {
        title: '即刻畅玩，战豆到底！',
        imageUrl: DataStore.assets.get("share-img").src
    }
});

// show group rank
wx.onShow(res => {
    let shareTicket = res.shareTicket;
    if (shareTicket) {
        DataStore.openDataContext.postMessage({
            action: "RankScene",
            shareTicket: shareTicket
        });
        if (DataStore.currentScene != DataStore.RankScene.toString()) DataStore.lastScene = DataStore.currentScene;
        DataStore.currentScene = DataStore.RankScene.toString();
    }
});
