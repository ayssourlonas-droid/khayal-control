export default class BitmapFont {
    constructor(bitmap, bitmapFont) {
        this.bitmap = bitmap;
        this.defaultSize = Math.abs(parseInt(bitmapFont.info.size));
        this.chars = {};
        bitmapFont.chars.char.forEach(ch => {
            this.chars[String.fromCharCode(ch.id)] = ch;
        });
    }
}
