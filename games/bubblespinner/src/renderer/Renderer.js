// import Renderer from "./Renderer.js";

export default class Renderer {
    constructor(target) {
        this.target = target;
    }

    render(ctx) {
        this.target.render(ctx);
    }
}
