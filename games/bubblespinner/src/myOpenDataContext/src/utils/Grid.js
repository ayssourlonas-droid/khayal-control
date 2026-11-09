import DataStore from "../data/DataStore";

export default class Grid {

    constructor(top, height, mr, pr, ml = mr, pl = pr, width) {
        this.top = top;
        this.height = height;
        this.mr = mr;
        this.ml = ml;
        this.pr = pr;
        this.pl = pl;
        this.width = width || DataStore.canvasWidth - this.mr - this.ml;
    }

    draw(ctx, ...args) {
        Grid.draw(ctx, this.ml, this.top, this.width, this.height, ...args);
    }

    /**
     * Ref: https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas#answer-3368118
     * 
     * Draws a rounded rectangle using the current state of the canvas.
     * If you omit the last three params, it will draw a rectangle
     * outline with a 5 pixel border radius
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} [radius = 5] The corner radius; It can also be an object 
     *                 to specify different radii for corners
     * @param {Number} [radius.tl = 0] Top left
     * @param {Number} [radius.tr = 0] Top right
     * @param {Number} [radius.br = 0] Bottom right
     * @param {Number} [radius.bl = 0] Bottom left
     * @param {Boolean} [fill = false] Whether to fill the rectangle.
     * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
     */
    static draw(ctx, x, y, width, height, radius = 0, fill = true, stroke = true) {

        radius = {
            tl: radius,
            tr: radius,
            br: radius,
            bl: radius
        };

        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }

    }
}
