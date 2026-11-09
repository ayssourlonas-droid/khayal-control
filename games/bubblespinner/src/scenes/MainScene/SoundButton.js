import DataStore from "../../data/DataStore.js";
import Audio from "../../utils/Audio.js";
import UUID from "../../base/UUID.js";

export default class SoundButton {
    constructor(x, y, size) {
        this.id   = UUID.getUUID();
        this.imgOn  = DataStore.assets.get("sound-on");
        this.imgOff = DataStore.assets.get("sound-off");
        this.size = size;
        this.x    = x;
        this.y    = y;
    }

    isTouched(e) {
        const touch = (e.touches && e.touches[0]) || e.changedTouches[0];
        const half  = this.size / 2;
        return (
            touch.clientX >= this.x - half && touch.clientX <= this.x + half &&
            touch.clientY >= this.y - half && touch.clientY <= this.y + half
        );
    }

    toggle() {
        Audio.getInstance().toggleSoundEffect();
        // Play confirmation only when turning sound back on
        if (Audio.getInstance().seOn) {
            Audio.getInstance().play("button_next");
        }
    }

    render(ctx) {
        const img = Audio.getInstance().seOn ? this.imgOn : this.imgOff;
        ctx.drawImage(
            img,
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
    }
}
