import Renderer from "./Renderer.js";
import RotateAnimator from "./animator/RotateAnimator.js";
import RotateOutAnimator from "./animator/RotateOutAnimator.js";
import RotateInAnimator from "./animator/RotateInAnimator.js";
import FadeOutAnimator from "./animator/FadeOutAnimator.js";
import ZoomInAnimator from "./animator/ZoomInAnimator.js";
import ZoomInUpAnimator from "./animator/ZoomInUpAnimator.js";
import AimingBarRenderer from "./AimingBarRenderer.js";
import GravityAndBounceAnimator from "./animator/GravityAndBounceAnimator.js";
import CollisionAndGravityAnimator from "./animator/CollisionAndGravityAnimator.js";
import FadeOutUpAnimator from "./animator/FadeOutUpAnimator.js";

const RENDERER_REGISTRY = {
    "Rotate":              (t)          => new RotateAnimator(t),
    "RotateOut":          (t)          => new RotateOutAnimator(t),
    "RotateIn":           (t)          => new RotateInAnimator(t),
    "FadeOut":            (t)          => new FadeOutAnimator(t),
    "ZoomIn":             (t)          => new ZoomInAnimator(t),
    "ZoomInUp":           (t)          => new ZoomInUpAnimator(t),
    "Trace":              (t)          => new AimingBarRenderer(t),
    "GravityAndBounce":   (t)          => new GravityAndBounceAnimator(t),
    "CollisionAndGravity":(t, ...args) => new CollisionAndGravityAnimator(t, ...args),
    "FadeOutUp":          (t)          => new FadeOutUpAnimator(t),
};

export default class RendererManager {
    constructor() {
        this.targets = [];
        this.renderers = {};
    }

    setRenderer(target, animation = null, ...args) {
        // console.assert(target.id);
        const factory = animation && RENDERER_REGISTRY[animation];
        const renderer = factory ? factory(target, ...args) : new Renderer(target);

        this.renderers[target.id] = renderer;

        if (!(this.targets.includes(target.id))) {
            // Prepend the new target as we are gonna render the targets in reverse order
            this.targets.unshift(target.id);
        }
    }

    remove(target) {
        this.targets.splice(this.targets.findIndex(tid => tid === target.id), 1);
        this.renderers[target.id] = null;
    }

    render(ctx) {
        for (let i = this.targets.length - 1; i >= 0; i--) {
            let renderer = this.renderers[this.targets[i]];
            if (renderer.outOfSight) {
                this.remove(renderer.target);
            } else {
                renderer.render(ctx);
            }
        }
    }
}