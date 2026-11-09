export default class BitmapText {
    constructor(bitmapFont) {
        this.bitmapFont = bitmapFont;
    }

    // Only for drawing a single line of numbers and not support the font colour option
    draw(ctx, text, fontSize = 0, x = 0, y = 0, textAlign = "left") {
        if (!text) return;

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

        return x;
    }
}
