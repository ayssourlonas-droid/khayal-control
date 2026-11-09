import DataStore from "../../data/DataStore.js";
import BitmapFont from "../../utils/BitmapFont.js";
import BitmapText from "../../utils/BitmapText.js";
import DustyPro from "../../../assets/bmfonts/DustyPro.js";
import RendererManager from "../../renderer/RendererManager.js";
import UUID from "../../base/UUID.js";
import Bubble from "./Bubble.js";

export default class Score {
    constructor() {
        this.id = UUID.getUUID();
        this.bitmapText = new BitmapText(
            new BitmapFont(DataStore.assets.get("DustyPro"), DustyPro),
        );

        this.fontSize = 0.075 * DataStore.screenWidth;
        this.x = 0.055 * DataStore.screenWidth;
        this.y = DataStore.menuButtonCenterY + Bubble.size;

        this.bubbleScores = [];
        this.rendererManager = new RendererManager();
    }

    update() {
        for (let i = this.bubbleScores.length - 1; i >= 0; i--) {
            let bubbleScore = this.bubbleScores[i];
            if (bubbleScore.bubble.getY() > DataStore.screenHeight - 5 * Bubble.size) {
                this.bubbleScores.splice(i, 1);
                if (DataStore.currentScene === DataStore.MainScene.toString()) {
                    this.rendererManager.setRenderer(bubbleScore, "FadeOutUp");
                    DataStore.score += bubbleScore.score;
                }
            }
        }
    }

    render(ctx) {
        this.bitmapText.draw(ctx, DataStore.score, this.fontSize, this.x, this.y);
        this.rendererManager.render(ctx);
    }

    addBubbleScore(bubble) {
        this.bubbleScores.push(new BubbleScore(bubble, this.bitmapText, this.x, this.y));
    }

    static getInstance() {
        if (!Score.instance) {
            Score.instance = new Score();
        }
        return Score.instance;
    }
}

// Map bubble image-name prefix → the bubble's exact fill colour
const BUBBLE_TINT = {
    blue:   "rgba(36, 126, 178, 0.95)",
    cyan:   "rgba(1, 71, 101, 0.95)",
    red:    "rgba(177, 71, 1, 0.95)",
    yellow: "rgba(189, 156, 26, 0.95)",
    pink:   "rgba(211, 146, 186, 0.95)",
    green:  "rgba(1, 152, 106, 0.95)",
    gray:   "rgba(136, 136, 136, 0.95)",
};

function bubbleTint(bubble) {
    const src = bubble.texture.img.src || "";
    const match = src.match(/(blue|cyan|red|yellow|pink|green|gray)-bubble/);
    return match ? (BUBBLE_TINT[match[1]] || "rgba(255,255,255,0.95)") : "rgba(255,255,255,0.95)";
}

class BubbleScore {
    constructor(bubble, bitmapText, x, y) {
        this.id    = UUID.getUUID();
        this.bubble = bubble;
        this.bitmapText = bitmapText;
        this.x     = x;
        this.y     = y;
        this.score = DataStore.level + 1;
        this.fontSize = Bubble.size * 1.2;
        this.color = bubbleTint(bubble);
    }

    render(ctx) {
        this.bitmapText.drawTinted(ctx, `+${this.score}`, this.color, this.fontSize, this.x, this.y, "center");
    }
}
