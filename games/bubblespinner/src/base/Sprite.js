import UUID from "./UUID.js";
import Texture from "../renderer/Texture.js";

export default class Sprite {
    constructor(img, x = 0, y = 0, width = 0, height = 0) {
        this.id = UUID.getUUID();
        this.texture = new Texture(img, width, height);
        this.setX(x);
        this.setY(y);
    }

    setX(x) {
        this.x = x;
        this.startX = x - this.texture.width / 2;
        this.endX = x + this.texture.width / 2;
    }

    setY(y) {
        this.y = y;
        this.startY = y - this.texture.height / 2;
        this.endY = y + this.texture.height / 2;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    collides(other) {
        return (
            other.startX < this.endX &&
            other.startY < this.endY &&
            other.endX > this.startX &&
            other.endY > this.startY
        );
    }

    isTouched(e) {
        let x = (e.touches[0] || e.changedTouches[0]).clientX;
        let y = (e.touches[0] || e.changedTouches[0]).clientY;
        return (
            x >= this.startX &&
            y >= this.startY &&
            x <= this.endX &&
            y <= this.endY
        );
    }

    render(ctx) {
        ctx.drawImage(
            this.texture.img,
            this.startX,
            this.startY,
            this.texture.width,
            this.texture.height
        );
    }
}
