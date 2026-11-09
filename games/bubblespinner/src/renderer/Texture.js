export default class Texture {
    constructor(img, width, height) {
        this.img = img;
        this.width = width;
        this.height = height ? height : img.height / img.width * width;
    }
}
