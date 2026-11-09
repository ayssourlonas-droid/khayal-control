import Renderer from "./Renderer.js";
import Bubble from "../scenes/MainScene/Bubble.js";
import DataStore from "../data/DataStore.js";
import Shooter from "../scenes/MainScene/Shooter.js";

export default class AimingBarRenderer extends Renderer {
    constructor(target) {
        super(target);
    }

    render(ctx) {
        if (this.target.state != Shooter.State.AIMING) {
            return;
        }

        const startX = DataStore.screenWidth * 0.5;
        const startY = DataStore.bottomBound;
        const endX = this.target.touchX;
        const endY = this.target.touchY;

        const dx = endX - startX;
        const dy = endY - startY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;

        const nx = dx / len;
        const ny = dy / len;

        // Only draw when aiming upward
        if (ny >= 0) return;

        const leftBound  = Bubble.size / 2;
        const rightBound = DataStore.screenWidth - Bubble.size / 2;

        // Geometrically compute wall bounce point
        let bounceDist = Infinity;
        if (nx > 0)       bounceDist = (rightBound - startX) / nx;
        else if (nx < 0)  bounceDist = (leftBound  - startX) / nx;

        const hasBounce  = isFinite(bounceDist) && bounceDist > 0;
        const bounceX    = hasBounce ? startX + nx * bounceDist : null;
        const bounceY    = hasBounce ? startY + ny * bounceDist : null;

        // Fixed physical spacing so dots look consistent at every angle
        const spacing    = Bubble.size * 0.85;
        // Total visual reach: enough to always pass the bounce point or reach top
        const maxDist    = hasBounce ? bounceDist + DataStore.screenHeight * 0.55
                                     : DataStore.screenHeight;

        // Taper helpers — t is 0 (near shooter) → 1 (far)
        const alphaAt   = t => 0.72 * Math.pow(1 - t, 1.4) + 0.08;
        const radiusAt  = t => Bubble.size * (0.21 - 0.10 * t);

        ctx.save();

        let d = spacing * 0.5; // first dot starts half a step out (avoids overlap with bubble)
        while (d <= maxDist) {
            let px, py, tGlobal;

            if (!hasBounce || d <= bounceDist) {
                // Pre-bounce (or no bounce): straight segment
                px = startX + nx * d;
                py = startY + ny * d;
                tGlobal = d / maxDist;
            } else {
                // Post-bounce: reflected x-direction
                const dAfter = d - bounceDist;
                px = bounceX - nx * dAfter;
                py = bounceY + ny * dAfter;
                tGlobal = d / maxDist;
            }

            // Clip to screen
            if (py < 0 || py > DataStore.screenHeight) { d += spacing; continue; }

            // Suppress the dot that would land right on top of the bounce marker
            const isNearBounce = hasBounce && Math.abs(d - bounceDist) < spacing * 0.45;

            if (!isNearBounce) {
                const alpha  = alphaAt(tGlobal);
                const radius = radiusAt(tGlobal);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(px, py, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            d += spacing;
        }

        // Bounce marker: filled inner dot + faint outer ring
        if (hasBounce) {
            const r = Bubble.size * 0.22;
            // outer glow ring
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth   = Bubble.size * 0.06;
            ctx.beginPath();
            ctx.arc(bounceX, bounceY, r * 1.6, 0, Math.PI * 2);
            ctx.stroke();
            // inner solid dot
            ctx.fillStyle = "rgba(255, 255, 255, 0.90)";
            ctx.beginPath();
            ctx.arc(bounceX, bounceY, r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}
