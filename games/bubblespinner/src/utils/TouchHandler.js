export default class TouchHandler {
    constructor() { }

    onTouchStart(callback) {
        this.tsHandler = callback;
        wx.onTouchStart(this.tsHandler);
    }

    onTouchMove(callback) {
        this.tmHandler = callback;
        wx.onTouchMove(this.tmHandler);
    }

    onTouchEnd(callback) {
        this.teHandler = callback;
        wx.onTouchEnd(this.teHandler);
    }

    destroy() {
        if (this.tsHandler) {
            wx.offTouchStart(this.tsHandler);
        }
        if (this.tmHandler) {
            wx.offTouchMove(this.tmHandler);
        }
        if (this.teHandler) {
            wx.offTouchEnd(this.teHandler);
        }
    }
}

