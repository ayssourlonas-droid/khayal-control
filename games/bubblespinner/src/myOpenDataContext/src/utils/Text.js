export default class Text {
    constructor(text, fontSize, lineHeight, mr = 0, ml = 0) {
        this.text = text;
        this.fontSize = fontSize;
        this.lineHeight = lineHeight;
        this.mr = mr;
        this.ml = ml;
    }

    draw(ctx, x, y, font) {
        ctx.font = font || `${this.fontSize}px Arial`;
        ctx.fillText(this.text, x, y);
    }

    // draw text with a fixed width by omitting the overflow part
    drawOverflowEllipsis(ctx, x, y, w) {

        ctx.font = `${this.fontSize}px Arial`;

        if (ctx.measureText(this.text).width < w) {
            ctx.fillText(this.text, x, y);
            return;
        }

        let chars = this.text.split("");
        let txt = "";

        for (let i = 0; i < chars.length; i++) {
            if (ctx.measureText(`${txt}...`).width < w) {
                txt += chars[i];
            } else {
                break;
            }
        }

        ctx.fillText(`${txt}...`, x, y);
    }
}
