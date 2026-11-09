import DataStore from "../data/DataStore.js";

export default class BitmapText {
    constructor(bitmapFont) {
        this.bitmapFont = bitmapFont;
    }

    /**
     * Draw text tinted with the given CSS colour string.
     * Uses a shared off-screen canvas so only one extra canvas is ever allocated.
     */
    drawTinted(ctx, text, color, fontSize = 0, x = 0, y = 0, textAlign = "left") {
        BitmapText._oc = BitmapText._oc || wx.createCanvas();
        const oc  = BitmapText._oc;
        const pr  = DataStore.pixelRatio || 1;

        // Measure text width
        const fontScale = fontSize / this.bitmapFont.defaultSize;
        let totalW = 0, totalH = 0;
        text.toString().split("").forEach(n => {
            const ch = this.bitmapFont.chars[n];
            if (ch) {
                totalW += fontScale * parseInt(ch.xadvance);
                totalH  = Math.max(totalH, fontScale * (parseInt(ch.yoffset) + parseInt(ch.height)));
            }
        });
        const cw = Math.ceil(totalW  + fontSize);
        const ch = Math.ceil(totalH  + fontSize * 0.4);

        // Size in device pixels, draw in CSS pixels via scale
        oc.width  = cw * pr;
        oc.height = ch * pr;
        const octx = oc.getContext("2d");
        octx.scale(pr, pr);

        // Draw text centred inside the offscreen canvas
        this.draw(octx, text, fontSize, cw / 2, 0, "center");

        // Tint: flood-fill with colour over only drawn pixels
        octx.globalCompositeOperation = "source-atop";
        octx.fillStyle = color;
        octx.fillRect(0, 0, cw, ch);

        // Blit to main context at the requested position
        let drawX = x;
        if (textAlign === "center") drawX -= cw / 2;
        else if (textAlign === "right")  drawX -= cw;
        ctx.drawImage(oc, drawX, y, cw, ch);
    }

    // Only for drawing a single line of numbers and not support the font colour option
    draw(ctx, text, fontSize = 0, x = 0, y = 0, textAlign = "left") {

        let fontScale = fontSize / this.bitmapFont.defaultSize;
        let charArr = text.toString().split("");

        if (textAlign == "center") {
            let textWidth = 0;
            charArr.forEach(n => {
                let ch = this.bitmapFont.chars[n];
                textWidth += fontScale * parseInt(ch.xadvance);
            });
            x -= 0.5 * textWidth;
        }

        if (textAlign == "right") {
            charArr = charArr.reverse();
        }

        charArr.map(n => {
            let ch = this.bitmapFont.chars[n];
            let xadvance = fontScale * parseInt(ch.xadvance);
            ctx.drawImage(
                this.bitmapFont.bitmap,
                parseInt(ch.x),
                parseInt(ch.y),
                parseInt(ch.width),
                parseInt(ch.height),
                fontScale * parseInt(ch.xoffset) + (textAlign == "right" ? -xadvance : 0) + x,
                fontScale * parseInt(ch.yoffset) + y,
                fontScale * parseInt(ch.width),
                fontScale * parseInt(ch.height)
            );
            x += xadvance * (textAlign == "right" ? -1 : 1);
        });
    }
}
