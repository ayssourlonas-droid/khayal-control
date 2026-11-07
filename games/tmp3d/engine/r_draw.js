/*
 *  r_draw.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-02-13.
 *
 *  SYNOPSIS:
 *      The rendering backend.
 *
 *      The module that helps draw some graphics primitives, as well as other
 *      more advanced visual effects, directly onto the frame buffer.
 */
(function () {
    var _a = __import__G_Const(), SCREEN_W = _a.SCREEN_W, SCREEN_H = _a.SCREEN_H;
    var M_LineVsLine2 = __import__M_Collision().M_LineVsLine2;
    var _b = __import__M_Math(), M_Clamp = _b.M_Clamp, M_FastSign = _b.M_FastSign;
    var Vec2 = __import__M_Vec2().M_Vec2;
    var _c = __import__R_Screen(), R_Ctx = _c.R_Ctx, R_FlushBuffer = _c.R_FlushBuffer, R_InitBuffer = _c.R_InitBuffer;
    var N_PIXELS = SCREEN_W * SCREEN_H;
    /* double-buffering */
    var frameBuffer, cleanFrameBuffer;
    var zBuffer, cleanZBuffer;
    function R_InitFrameBuffer() {
        var frameBufferSize = N_PIXELS << 2;
        cleanFrameBuffer = new Uint8ClampedArray(frameBufferSize);
        for (var i = 3; i < frameBufferSize; i += 4)
            cleanFrameBuffer[i] = 255;
        frameBuffer = R_InitBuffer(SCREEN_W, SCREEN_H);
    }
    function R_InitZBuffer() {
        cleanZBuffer = new Float32Array(N_PIXELS);
        zBuffer = new Float32Array(N_PIXELS);
    }
    function R_FlushFrame() {
        R_FlushBuffer(frameBuffer);
        frameBuffer.data.set(cleanFrameBuffer);
        zBuffer.set(cleanZBuffer);
    }
    function R_FillRect(x, y, w, h, r, g, b, a) {
        var sX = M_Clamp(Math.ceil(x - 0.5), 0, SCREEN_W);
        var sY = M_Clamp(Math.ceil(y - 0.5), 0, SCREEN_H);
        var dX = M_Clamp(Math.ceil(x + w - 0.5), 0, SCREEN_W);
        var dY = M_Clamp(Math.ceil(y + h - 0.5), 0, SCREEN_H);
        if (sX === dX || sY === dY)
            return; // early return if not a rectangle
        for (var brushY = sY; brushY < dY; ++brushY) {
            for (var brushX = sX; brushX < dX; ++brushX) {
                var pixIndex = (SCREEN_W * brushY + brushX) << 2;
                var bufferRed = frameBuffer.data[pixIndex];
                var bufferGreen = frameBuffer.data[pixIndex + 1];
                var bufferBlue = frameBuffer.data[pixIndex + 2];
                var bufferAlpha = frameBuffer.data[pixIndex + 3] || 255;
                var blend = a / bufferAlpha, blendInv = 1 - blend;
                var newRed = blend * r + blendInv * bufferRed;
                var newGreen = blend * g + blendInv * bufferGreen;
                var newBlue = blend * b + blendInv * bufferBlue;
                frameBuffer.data[pixIndex] = newRed;
                frameBuffer.data[pixIndex + 1] = newGreen;
                frameBuffer.data[pixIndex + 2] = newBlue;
                frameBuffer.data[pixIndex + 3] = 255;
            }
        }
    }
    function R_ClampLine(sx, sy, dx, dy, sClamped, dClamped) {
        var nVerticesInside = 0;
        var inside = Array(2);
        // start with the assumption that both endpoints (vertices) are within
        // the bounds of the framebuffer
        sClamped[0] = sx;
        sClamped[1] = sy;
        dClamped[0] = dx;
        dClamped[1] = dy;
        /* if vertex `s` is already within the bounds of the framebuffer */
        if (sClamped[0] >= 0 && sClamped[0] < SCREEN_W &&
            sClamped[1] >= 0 && sClamped[1] < SCREEN_H)
            inside[nVerticesInside++] = sClamped;
        /* if vertex `d` is already within the bounds of the framebuffer */
        if (dClamped[0] >= 0 && dClamped[0] < SCREEN_W &&
            dClamped[1] >= 0 && dClamped[1] < SCREEN_H)
            inside[nVerticesInside++] = dClamped;
        // early return if both endpoints are indeed within the bounds of the
        // framebuffer
        if (nVerticesInside === 2)
            return 1;
        /* test to see whether the line intersects with any one or two edges of
         * the framebuffer
         */
        var top = M_LineVsLine2(0, 0, SCREEN_W, 0, sx, sy, dx, dy, 1);
        var right = M_LineVsLine2(SCREEN_W, 0, SCREEN_W, SCREEN_H, sx, sy, dx, dy, 1);
        var bottom = M_LineVsLine2(0, SCREEN_H, SCREEN_W, SCREEN_H, sx, sy, dx, dy, 1);
        var left = M_LineVsLine2(0, 0, 0, SCREEN_H, sx, sy, dx, dy, 1);
        if (top && !(isNaN(top[0]) || isNaN(top[1])))
            inside[nVerticesInside++] = top;
        if (right && !(isNaN(right[0]) || isNaN(right[1])))
            inside[nVerticesInside++] = right;
        if (bottom && !(isNaN(bottom[0]) || isNaN(bottom[1])))
            inside[nVerticesInside++] = bottom;
        if (left && !(isNaN(left[0]) || isNaN(left[1])))
            inside[nVerticesInside++] = left;
        // exit with a value of `0` indicating the line lies completely outside
        // the bounds of the framebuffer
        if (nVerticesInside !== 2)
            return 0;
        sClamped[0] = inside[0][0];
        sClamped[1] = inside[0][1];
        dClamped[0] = inside[1][0];
        dClamped[1] = inside[1][1];
        // exit with a value of `1` indicating the clamped line is contained
        // within the bounds of the framebuffer
        return 1;
    }
    function R_Bresenham_HorizontalSweep(sx, sy, dx, dy, r, g, b, a, stroke) {
        var deltaX = dx - sx, deltaY = dy - sy;
        var dirY = M_FastSign(deltaY), strokeY = dirY * stroke;
        // need to fix the signs in the formulae
        var deltaYAbs = deltaY * dirY;
        // the increment for Pk+1, if Pk < 0
        var pIncrementForSameRow = deltaYAbs + deltaYAbs;
        // the increment for Pk+1, if Pk >= 0
        var pIncrementForNextRow = 0 - deltaX - deltaX;
        // the initial value for the decision parameter, P0
        var p0 = pIncrementForSameRow + pIncrementForNextRow + deltaX;
        for (var x = sx, y = sy, pK = p0; x < dx; x += stroke) {
            R_FillRect(x, y, stroke, stroke, r, g, b, a);
            var decision = ~(pK >> 31);
            pK += pIncrementForSameRow;
            pK += pIncrementForNextRow & decision;
            y += strokeY & decision;
        }
    }
    function R_Bresenham_VerticalSweep(sx, sy, dx, dy, r, g, b, a, stroke) {
        var deltaX = dx - sx, deltaY = dy - sy;
        var dirX = M_FastSign(deltaX), strokeX = dirX * stroke;
        // need to fix the signs in the formulae
        var deltaXAbs = deltaX * dirX;
        // the increment for Pk+1, if Pk < 0
        var pIncrementForSameCol = deltaXAbs + deltaXAbs;
        // the increment for Pk+1, if Pk >= 0
        var pIncrementForNextCol = 0 - deltaY - deltaY;
        // the initial value for the decision parameter, P0
        var p0 = pIncrementForSameCol + pIncrementForNextCol + deltaY;
        for (var x = sx, y = sy, pK = p0; y < dy; y += stroke) {
            R_FillRect(x, y, stroke, stroke, r, g, b, a);
            var decision = ~(pK >> 31);
            pK += pIncrementForSameCol;
            pK += pIncrementForNextCol & decision;
            x += strokeX & decision;
        }
    }
    //
    // R_DrawLine
    // Employs Bresenham's algorithm for drawing lines
    //
    function R_DrawLine(sx, sy, dx, dy, r, g, b, a, stroke) {
        /* clip those portions of the line that extend beyond the bounds of the
         * framebuffer
         */
        var sClamped = Vec2(0, 0), dClamped = Vec2(0, 0);
        if (!R_ClampLine(sx, sy, dx, dy, sClamped, dClamped))
            return;
        var cSX = Math.floor(sClamped[0]), cSY = Math.floor(sClamped[1]);
        var cDX = Math.floor(dClamped[0]), cDY = Math.floor(dClamped[1]);
        // early return if nothing to draw
        if (cSX === cDX && cSY === cDY)
            return;
        /* branch out based on the octant the line falls in */
        var isVerticalSweep = Math.abs(cDX - cSX) < Math.abs(cDY - cSY);
        if (isVerticalSweep && cDY > cSY) // should always grow in y-direction
            R_Bresenham_VerticalSweep(cSX, cSY, cDX, cDY, r, g, b, a, stroke);
        else if (isVerticalSweep)
            R_Bresenham_VerticalSweep(cDX, cDY, cSX, cSY, r, g, b, a, stroke);
        else if (cDX > cSX) // should always grow in x-direction
            R_Bresenham_HorizontalSweep(cSX, cSY, cDX, cDY, r, g, b, a, stroke);
        else
            R_Bresenham_HorizontalSweep(cDX, cDY, cSX, cSY, r, g, b, a, stroke);
    }
    //
    // R_DrawLine_DDA
    // Interpolates a line between given endpoints by accumulating constant step
    // variables akin to a DDA
    //
    function R_DrawLine_DDA(sx, sy, dx, dy, r, g, b, a, stroke) {
        /* clip those portions of the line that extend beyond the bounds of the
         * framebuffer
         */
        var sClamped = Vec2(0, 0), dClamped = Vec2(0, 0);
        if (!R_ClampLine(sx, sy, dx, dy, sClamped, dClamped))
            return;
        var cSX = Math.floor(sClamped[0]), cSY = Math.floor(sClamped[1]);
        var cDX = Math.floor(dClamped[0]), cDY = Math.floor(dClamped[1]);
        // early return if nothing to draw
        if (cSX === cDX && cSY === cDY)
            return;
        /* calculate step variables */
        var deltaX = cDX - cSX, deltaY = cDY - cSY;
        var dirX = Math.sign(deltaX), dirY = Math.sign(deltaY);
        var slope = deltaY / deltaX, slopeInverse = deltaX / deltaY;
        var strokeInXHorizontal = stroke * dirX;
        var stepInYHorizontal = slope * dirX;
        var strokeInYVertical = stroke * dirY;
        var stepInXVertical = slopeInverse * dirY;
        if (strokeInXHorizontal) {
            for (var x = cSX, y = cSY; (cDX - x) * dirX > 0; x += strokeInXHorizontal) {
                var Y = cSY + Math.floor(y - cSY) * stroke;
                R_FillRect(x, Y, stroke, stroke, r, g, b, a);
                y += stepInYHorizontal;
            }
        }
        if (strokeInYVertical) {
            for (var x = cSX, y = cSY; (cDY - y) * dirY > 0; y += strokeInYVertical) {
                var X = cSX + Math.floor(x - cSX) * stroke;
                R_FillRect(X, y, stroke, stroke, r, g, b, a);
                x += stepInXVertical;
            }
        }
    }
    //
    // R_DrawLine_RayCast
    // Interpolates a line between given endpoints by casting a ray
    //
    function R_DrawLine_RayCast(sx, sy, dx, dy, r, g, b, a, stroke) {
        /* clip those portions of the line that extend beyond the bounds of the
         * framebuffer
         */
        var sClamped = Vec2(0, 0), dClamped = Vec2(0, 0);
        if (!R_ClampLine(sx, sy, dx, dy, sClamped, dClamped))
            return;
        var cSX = Math.floor(sClamped[0]), cSY = Math.floor(sClamped[1]);
        var cDX = Math.floor(dClamped[0]), cDY = Math.floor(dClamped[1]);
        // early return if nothing to draw
        if (cSX === cDX && cSY === cDY)
            return;
        var deltaX = cDX - cSX, deltaY = cDY - cSY;
        var dirX = Math.sign(deltaX), dirY = Math.sign(deltaY);
        var slope = deltaY / deltaX, slopeInverse = deltaX / deltaY;
        var stepVerticalY = dirX * slope;
        var stepHorizontalX = dirY * slopeInverse;
        var strokeXVertical = dirX * stroke;
        var strokeYVertical = stepVerticalY * stroke;
        var strokeXHorizontal = stepHorizontalX * stroke;
        var strokeYHorizontal = dirY * stroke;
        var lineLength = deltaX * deltaX + deltaY * deltaY;
        var currentLength = 0;
        var x = cSX, y = cSY;
        var traceVerticalX = dirX > 0 ? cSX + 1 : cSX;
        var traceVerticalY = cSY + (traceVerticalX - cSX) * slope;
        var traceHorizontalY = dirY > 0 ? cSY + 1 : cSY;
        var traceHorizontalX = cSX + (traceHorizontalY - cSY) * slopeInverse;
        var advanceVertically;
        while (currentLength < lineLength) {
            R_FillRect(x, y, stroke, stroke, r, g, b, a);
            var verticalDistInX = traceVerticalX - cSX;
            var verticalDistInY = traceVerticalY - cSY;
            var horizontalDistInX = traceHorizontalX - cSX;
            var horizontalDistInY = traceHorizontalY - cSY;
            var distVertical = verticalDistInX * verticalDistInX +
                verticalDistInY * verticalDistInY;
            var distHorizontal = horizontalDistInX * horizontalDistInX +
                horizontalDistInY * horizontalDistInY;
            advanceVertically = Number.isNaN(distVertical) ||
                distVertical > distHorizontal
                ? 0 : distVertical === distHorizontal
                ? advanceVertically : 1;
            currentLength = advanceVertically ? distVertical : distHorizontal;
            if (advanceVertically) {
                x += strokeXVertical;
                traceVerticalX += strokeXVertical;
                traceVerticalY += strokeYVertical;
            }
            else {
                y += strokeYHorizontal;
                traceHorizontalX += strokeXHorizontal;
                traceHorizontalY += strokeYHorizontal;
            }
        }
    }
    //
    // R_DrawCircle
    // Employs Bresenham's algorithm for drawing circles
    //
    function R_DrawCircle(x, y, radius, r, g, b, a) {
        var ox = Math.floor(x), oy = Math.floor(y); // center of the circle
        var diam = radius + radius;
        var px = 4 - diam - diam, py = 2, p = 1 - diam; // decision parameters
        var cx = radius, cy = 0; // where we're currently sitting on the circle
        /* iterate through a single octant of the circle */
        while (cx >= cy) {
            var rx0 = void 0, rx1 = void 0, ry = // endpoints of the current scanline
             void 0; // endpoints of the current scanline
            /* fill in a scanline that stretches over the 1st and 4th octants */
            rx0 = ox - cx;
            rx1 = ox + cx;
            ry = oy + cy;
            for (var rxi = rx0; rxi <= rx1; ++rxi)
                R_FillRect(rxi, ry, 1, 1, r, g, b, a);
            /* fill in a scanline that stretches over the 2nd and 3rd octants */
            rx0 = ox - cy;
            rx1 = ox + cy;
            ry = oy + cx;
            for (var rxi = rx0; rxi <= rx1; ++rxi)
                R_FillRect(rxi, ry, 1, 1, r, g, b, a);
            /* fill in a scanline that stretches over the 5th and 8th octants */
            rx0 = ox - cx;
            rx1 = ox + cx;
            ry = oy - cy;
            for (var rxi = rx0; rxi <= rx1; ++rxi)
                R_FillRect(rxi, ry, 1, 1, r, g, b, a);
            /* fill in a scanline that stretches over the 6th and 7th octants */
            rx0 = ox - cy;
            rx1 = ox + cy;
            ry = oy - cx;
            for (var rxi = rx0; rxi <= rx1; ++rxi)
                R_FillRect(rxi, ry, 1, 1, r, g, b, a);
            var decision = ~(p >> 31); // should we decrement `cx` by 1?
            /* first, update the individual deltas that contribute to the main
             * decision parameter...
             */
            px += 4 & decision;
            py += 4;
            /* ...then, advance the point on the circle... */
            cx += decision;
            ++cy;
            // ...and finally, update the main decision parameter
            p += (px & decision) + py;
        }
    }
    function R_DrawTriangle_Wireframe(ax, ay, bx, by, cx, cy, r, g, b, a, stroke) {
        R_DrawLine(ax, ay, bx, by, r, g, b, a, stroke);
        R_DrawLine(ax, ay, cx, cy, r, g, b, a, stroke);
        R_DrawLine(bx, by, cx, cy, r, g, b, a, stroke);
    }
    //
    // R_LerpScanline_Colored
    // Lerp a single color-filled scanline
    //
    function R_LerpScanline_Colored(_a) {
        var dy = _a.dy, dx0 = _a.dx0, dx1 = _a.dx1, z0 = _a.z0, z1 = _a.z1, r0 = _a.r0, g0 = _a.g0, b0 = _a.b0, r1 = _a.r1, g1 = _a.g1, b1 = _a.b1, nx0 = _a.nx0, ny0 = _a.ny0, nz0 = _a.nz0, nx1 = _a.nx1, ny1 = _a.ny1, nz1 = _a.nz1, wx0 = _a.wx0, wy0 = _a.wy0, wz0 = _a.wz0, wx1 = _a.wx1, wy1 = _a.wy1, wz1 = _a.wz1, normalX = _a.normalX, normalY = _a.normalY, normalZ = _a.normalZ, lightX = _a.lightX, lightY = _a.lightY, lightZ = _a.lightZ, isPointLight = _a.isPointLight, alpha = _a.alpha;
        var shouldShade = lightX !== undefined &&
            lightY !== undefined &&
            lightZ !== undefined;
        // raster clipping: clip the scanline if it goes out-of-bounds of screen
        // coordinates
        var clipLeft = Math.max(-dx0, 0);
        // bias the start and end endpoints in screen space by -0.5 horizontally
        // as per the top-left pixel coverage rules
        var dX0 = Math.ceil(dx0 + clipLeft - 0.5), dX1 = Math.ceil(dx1 - 0.5);
        var deltaX = dx1 - dx0, deltaX_ = 1 / deltaX;
        // pre-step from start by 0.5 as pixel centers are the actual sampling
        // points
        var preStepX = dX0 + 0.5 - dx0;
        // 1 step in `+x` equals how many steps in `z`
        var gradZ = (z1 - z0) * deltaX_;
        // 1 step in `+x` equals how many steps in `r`
        var gradR = (r1 - r0) * deltaX_;
        // 1 step in `+x` equals how many steps in `g`
        var gradG = (g1 - g0) * deltaX_;
        // 1 step in `+x` equals how many steps in `b`
        var gradB = (b1 - b0) * deltaX_;
        /* 1 step in `+x` equals how many steps along the vertex normal */
        var gradNX = (nx1 - nx0) * deltaX_;
        var gradNY = (ny1 - ny0) * deltaX_;
        var gradNZ = (nz1 - nz0) * deltaX_;
        /* 1 step in `+x` equals how many in the world space coordinates */
        var gradWX = (wx1 - wx0) * deltaX_;
        var gradWY = (wy1 - wy0) * deltaX_;
        var gradWZ = (wz1 - wz0) * deltaX_;
        // current z-coordinate in the perspective-correct space
        var z = preStepX * gradZ + z0;
        /* the coordinates in the perspective-correct RGB space of the color to
         * fill the current pixel with
         */
        var r = preStepX * gradR + r0;
        var g = preStepX * gradG + g0;
        var b = preStepX * gradB + b0;
        /* current vertex normal in the perspective-correct space */
        var nx = preStepX * gradNX + nx0;
        var ny = preStepX * gradNY + ny0;
        var nz = preStepX * gradNZ + nz0;
        /* current world space coordinates in the perspective-correct space */
        var wx = preStepX * gradWX + wx0;
        var wy = preStepX * gradWY + wy0;
        var wz = preStepX * gradWZ + wz0;
        // alpha blending — how much we should sample from the new color
        var sampleAlpha = 255 * alpha;
        /* rasterize current scanline */
        for (var x = dX0; x < dX1 && x < SCREEN_W; ++x) {
            var bufferIndex = dy * SCREEN_W + x;
            /* skip filling in the pixel unless the current pixel in the raster
             * triangle is closer (1 / zRaster > 1 / zBuffer) than what's
             * already in the z-buffer at the position we want to draw
             */
            if (z <= zBuffer[bufferIndex]) {
                z += gradZ;
                r += gradR;
                g += gradG;
                b += gradB;
                nx += gradNX;
                ny += gradNY;
                nz += gradNZ;
                wx += gradWX;
                wy += gradWY;
                wz += gradWZ;
                continue;
            }
            zBuffer[bufferIndex] = z; // update the z-buffer
            // get the original coordinates back from the perspective-corrected
            // space by dehomogenizing
            var z_ = 1 / z;
            /* calculate light intensity on the current pixel */
            var lightLevel = 1;
            if (shouldShade) {
                // start with the assumption that the given light is a
                // directional light...
                var lX = lightX, lY = lightY, lZ = lightZ;
                /* ...and adjust accordingly if it turns out to be a point light
                 * instead
                 */
                if (isPointLight) {
                    lX -= wx * z_;
                    lY -= wy * z_;
                    lZ -= wz * z_;
                }
                var magL_ = 1 / Math.sqrt(lX * lX + lY * lY + lZ * lZ);
                var lXUnit = lX * magL_;
                var lYUnit = lY * magL_;
                var lZUnit = lZ * magL_;
                /* flat shading */
                if (normalX !== undefined &&
                    normalY !== undefined &&
                    normalZ !== undefined) {
                    lightLevel =
                        lXUnit * normalX + lYUnit * normalY + lZUnit * normalZ;
                    lightLevel = (lightLevel + 1) * 0.5;
                }
                /* smooth shading */
                else {
                    var NX = nx * z_, NY = ny * z_, NZ = nz * z_;
                    var magN_ = 1 / Math.sqrt(NX * NX + NY * NY + NZ * NZ);
                    var nXUnit = NX * magN_;
                    var nYUnit = NY * magN_;
                    var nZUnit = NZ * magN_;
                    lightLevel =
                        lXUnit * nXUnit + lYUnit * nYUnit + lZUnit * nZUnit;
                }
            }
            /* fill a single pixel in screen space with the color defined by
             * parameters `r`, `g`, `b`, and `alpha`.
             */
            var paintIndex = bufferIndex << 2;
            var bufferRed = frameBuffer.data[paintIndex];
            var bufferGreen = frameBuffer.data[paintIndex + 1];
            var bufferBlue = frameBuffer.data[paintIndex + 2];
            var bufferAlpha = frameBuffer.data[paintIndex + 3] || 255;
            var blendRatio = sampleAlpha / bufferAlpha;
            var blendRatio_ = 1 - blendRatio;
            var newBlend = lightLevel * blendRatio * z_;
            var newRed = newBlend * r + blendRatio_ * bufferRed;
            var newGreen = newBlend * g + blendRatio_ * bufferGreen;
            var newBlue = newBlend * b + blendRatio_ * bufferBlue;
            frameBuffer.data[paintIndex] = newRed;
            frameBuffer.data[paintIndex + 1] = newGreen;
            frameBuffer.data[paintIndex + 2] = newBlue;
            frameBuffer.data[paintIndex + 3] = 255;
            z += gradZ;
            r += gradR;
            g += gradG;
            b += gradB;
            nx += gradNX;
            ny += gradNY;
            nz += gradNZ;
            wx += gradWX;
            wy += gradWY;
            wz += gradWZ;
        }
    }
    //
    // R_FillTriangle_Colored
    // Fill the triangle with color
    //
    function R_FillTriangle_Colored(_a, pso) {
        var ax = _a.ax, ay = _a.ay, az = _a.az, bx = _a.bx, by = _a.by, bz = _a.bz, cx = _a.cx, cy = _a.cy, cz = _a.cz, ar = _a.ar, ag = _a.ag, ab = _a.ab, br = _a.br, bg = _a.bg, bb = _a.bb, cr = _a.cr, cg = _a.cg, cb = _a.cb, nax = _a.nax, nay = _a.nay, naz = _a.naz, nbx = _a.nbx, nby = _a.nby, nbz = _a.nbz, ncx = _a.ncx, ncy = _a.ncy, ncz = _a.ncz, wax = _a.wax, way = _a.way, waz = _a.waz, wbx = _a.wbx, wby = _a.wby, wbz = _a.wbz, wcx = _a.wcx, wcy = _a.wcy, wcz = _a.wcz;
        /* coordinates of the triangle in screen space */
        var topX = ax, midX = bx, bottomX = cx;
        var topY = ay, midY = by, bottomY = cy;
        // z-coordinates in the perspective-correct space
        var topZ = az, midZ = bz, bottomZ = cz;
        /* the color coordinates at each triangle vertex in the
         * perspective-corrected RGB space to interpolate across the triangle
         */
        var topR = ar * topZ, midR = br * midZ, bottomR = cr * bottomZ;
        var topG = ag * topZ, midG = bg * midZ, bottomG = cg * bottomZ;
        var topB = ab * topZ, midB = bb * midZ, bottomB = cb * bottomZ;
        /* vertex normals in perspective-corrected (1/z) world space */
        var topNX = nax * topZ, midNX = nbx * midZ, bottomNX = ncx * bottomZ;
        var topNY = nay * topZ, midNY = nby * midZ, bottomNY = ncy * bottomZ;
        var topNZ = naz * topZ, midNZ = nbz * midZ, bottomNZ = ncz * bottomZ;
        /* world space coordinates of the triangle vertices in
         * perspective-corrected (1/z) space
         */
        var topWX = wax * topZ, midWX = wbx * midZ, bottomWX = wcx * bottomZ;
        var topWY = way * topZ, midWY = wby * midZ, bottomWY = wcy * bottomZ;
        var topWZ = waz * topZ, midWZ = wbz * midZ, bottomWZ = wcz * bottomZ;
        /* sort vertices of the triangle so that their y-coordinates are in
         * ascending order
         */
        if (topY > midY) {
            /* swap in screen space */
            var auxX = topX;
            topX = midX;
            midX = auxX;
            var auxY = topY;
            topY = midY;
            midY = auxY;
            // swap in perspective-correct (1/z) space
            var auxZ = topZ;
            topZ = midZ;
            midZ = auxZ;
            /* swap in perspective-correct (1/z) RGB space */
            var auxR = topR;
            topR = midR;
            midR = auxR;
            var auxG = topG;
            topG = midG;
            midG = auxG;
            var auxB = topB;
            topB = midB;
            midB = auxB;
            /* swap vertex normals */
            var auxNX = topNX;
            topNX = midNX;
            midNX = auxNX;
            var auxNY = topNY;
            topNY = midNY;
            midNY = auxNY;
            var auxNZ = topNZ;
            topNZ = midNZ;
            midNZ = auxNZ;
            /* swap world space coordinates */
            var auxWX = topWX;
            topWX = midWX;
            midWX = auxWX;
            var auxWY = topWY;
            topWY = midWY;
            midWY = auxWY;
            var auxWZ = topWZ;
            topWZ = midWZ;
            midWZ = auxWZ;
        }
        if (midY > bottomY) {
            /* swap in screen space */
            var auxX = midX;
            midX = bottomX;
            bottomX = auxX;
            var auxY = midY;
            midY = bottomY;
            bottomY = auxY;
            // swap in perspective-correct (1/z) space
            var auxZ = midZ;
            midZ = bottomZ;
            bottomZ = auxZ;
            /* swap in perspective-correct (1/z) RGB space */
            var auxR = midR;
            midR = bottomR;
            bottomR = auxR;
            var auxG = midG;
            midG = bottomG;
            bottomG = auxG;
            var auxB = midB;
            midB = bottomB;
            bottomB = auxB;
            /* swap vertex normals */
            var auxNX = midNX;
            midNX = bottomNX;
            bottomNX = auxNX;
            var auxNY = midNY;
            midNY = bottomNY;
            bottomNY = auxNY;
            var auxNZ = midNZ;
            midNZ = bottomNZ;
            bottomNZ = auxNZ;
            /* swap world space coordinates */
            var auxWX = midWX;
            midWX = bottomWX;
            bottomWX = auxWX;
            var auxWY = midWY;
            midWY = bottomWY;
            bottomWY = auxWY;
            var auxWZ = midWZ;
            midWZ = bottomWZ;
            bottomWZ = auxWZ;
        }
        if (topY > midY) {
            /* swap in screen space */
            var auxX = topX;
            topX = midX;
            midX = auxX;
            var auxY = topY;
            topY = midY;
            midY = auxY;
            // swap in perspective-correct (1/z) space
            var auxZ = topZ;
            topZ = midZ;
            midZ = auxZ;
            /* swap in perspective-correct (1/z) RGB space */
            var auxR = topR;
            topR = midR;
            midR = auxR;
            var auxG = topG;
            topG = midG;
            midG = auxG;
            var auxB = topB;
            topB = midB;
            midB = auxB;
            /* swap vertex normals */
            var auxNX = topNX;
            topNX = midNX;
            midNX = auxNX;
            var auxNY = topNY;
            topNY = midNY;
            midNY = auxNY;
            var auxNZ = topNZ;
            topNZ = midNZ;
            midNZ = auxNZ;
            /* swap world space coordinates */
            var auxWX = topWX;
            topWX = midWX;
            midWX = auxWX;
            var auxWY = topWY;
            topWY = midWY;
            midWY = auxWY;
            var auxWZ = topWZ;
            topWZ = midWZ;
            midWZ = auxWZ;
        }
        var deltaUpper = midY - topY, deltaUpper_ = 1 / deltaUpper;
        var deltaLower = bottomY - midY, deltaLower_ = 1 / deltaLower;
        var deltaMajor = bottomY - topY, deltaMajor_ = 1 / deltaMajor;
        /* 1 step in `+y` equals how many steps in `x` */
        var stepXAlongUpper = (midX - topX) * deltaUpper_;
        var stepXAlongLower = (bottomX - midX) * deltaLower_;
        var stepXAlongMajor = (bottomX - topX) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `z` */
        var stepZAlongUpper = (midZ - topZ) * deltaUpper_;
        var stepZAlongLower = (bottomZ - midZ) * deltaLower_;
        var stepZAlongMajor = (bottomZ - topZ) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `r` */
        var stepRAlongUpper = (midR - topR) * deltaUpper_;
        var stepRAlongLower = (bottomR - midR) * deltaLower_;
        var stepRAlongMajor = (bottomR - topR) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `g` */
        var stepGAlongUpper = (midG - topG) * deltaUpper_;
        var stepGAlongLower = (bottomG - midG) * deltaLower_;
        var stepGAlongMajor = (bottomG - topG) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `b` */
        var stepBAlongUpper = (midB - topB) * deltaUpper_;
        var stepBAlongLower = (bottomB - midB) * deltaLower_;
        var stepBAlongMajor = (bottomB - topB) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `nx` */
        var stepNXAlongUpper = (midNX - topNX) * deltaUpper_;
        var stepNXAlongLower = (bottomNX - midNX) * deltaLower_;
        var stepNXAlongMajor = (bottomNX - topNX) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `ny` */
        var stepNYAlongUpper = (midNY - topNY) * deltaUpper_;
        var stepNYAlongLower = (bottomNY - midNY) * deltaLower_;
        var stepNYAlongMajor = (bottomNY - topNY) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `nz` */
        var stepNZAlongUpper = (midNZ - topNZ) * deltaUpper_;
        var stepNZAlongLower = (bottomNZ - midNZ) * deltaLower_;
        var stepNZAlongMajor = (bottomNZ - topNZ) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `wx` */
        var stepWXAlongUpper = (midWX - topWX) * deltaUpper_;
        var stepWXAlongLower = (bottomWX - midWX) * deltaLower_;
        var stepWXAlongMajor = (bottomWX - topWX) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `wy` */
        var stepWYAlongUpper = (midWY - topWY) * deltaUpper_;
        var stepWYAlongLower = (bottomWY - midWY) * deltaLower_;
        var stepWYAlongMajor = (bottomWY - topWY) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `wz` */
        var stepWZAlongUpper = (midWZ - topWZ) * deltaUpper_;
        var stepWZAlongLower = (bottomWZ - midWZ) * deltaLower_;
        var stepWZAlongMajor = (bottomWZ - topWZ) * deltaMajor_;
        // raster clipping: clip the triangle if it goes out-of-bounds of screen
        // coordinates
        var clipTop = Math.max(-topY, 0), clipMid = Math.max(-midY, 0);
        /* vertical endpoints of the rasterization in screen space, biased by
         * -0.5 as per the top-left pixel coverage rules
         */
        var startY = Math.ceil(topY + clipTop - 0.5);
        var midStopY = Math.ceil(midY + clipMid - 0.5);
        var endY = Math.ceil(bottomY - 0.5);
        /* pre-step from top and mid endpoints bu 0.5 as pixel centers are the
         * actual sampling points
         */
        var preStepFromTop = startY + 0.5 - topY;
        var preStepFromMid = midStopY + 0.5 - midY;
        /* current `x` coordinates in screen space */
        var xUpper = preStepFromTop * stepXAlongUpper + topX;
        var xLower = preStepFromMid * stepXAlongLower + midX;
        var xMajor = preStepFromTop * stepXAlongMajor + topX;
        /* current `z` coordinates in perspective-correct (1/z) space */
        var zUpper = preStepFromTop * stepZAlongUpper + topZ;
        var zLower = preStepFromMid * stepZAlongLower + midZ;
        var zMajor = preStepFromTop * stepZAlongMajor + topZ;
        /* current `r` channels of the color in perspective-correct (1/z) space
         */
        var rUpper = preStepFromTop * stepRAlongUpper + topR;
        var rLower = preStepFromMid * stepRAlongLower + midR;
        var rMajor = preStepFromTop * stepRAlongMajor + topR;
        /* current `g` channels of the color in perspective-correct (1/z) space
         */
        var gUpper = preStepFromTop * stepGAlongUpper + topG;
        var gLower = preStepFromMid * stepGAlongLower + midG;
        var gMajor = preStepFromTop * stepGAlongMajor + topG;
        /* current `b` channels of the color in perspective-correct (1/z) space
         */
        var bUpper = preStepFromTop * stepBAlongUpper + topB;
        var bLower = preStepFromMid * stepBAlongLower + midB;
        var bMajor = preStepFromTop * stepBAlongMajor + topB;
        /* current `nx` coordinates in perspective-correct (1/z) world space */
        var nXUpper = preStepFromTop * stepNXAlongUpper + topNX;
        var nXLower = preStepFromMid * stepNXAlongLower + midNX;
        var nXMajor = preStepFromTop * stepNXAlongMajor + topNX;
        /* current `ny` coordinates in perspective-correct (1/z) world space */
        var nYUpper = preStepFromTop * stepNYAlongUpper + topNY;
        var nYLower = preStepFromMid * stepNYAlongLower + midNY;
        var nYMajor = preStepFromTop * stepNYAlongMajor + topNY;
        /* current `nz` coordinates in perspective-correct (1/z) world space */
        var nZUpper = preStepFromTop * stepNZAlongUpper + topNZ;
        var nZLower = preStepFromMid * stepNZAlongLower + midNZ;
        var nZMajor = preStepFromTop * stepNZAlongMajor + topNZ;
        /* current `wx` coordinates in perspective-correct (1/z) world space */
        var wXUpper = preStepFromTop * stepWXAlongUpper + topWX;
        var wXLower = preStepFromMid * stepWXAlongLower + midWX;
        var wXMajor = preStepFromTop * stepWXAlongMajor + topWX;
        /* current `wy` coordinates in perspective-correct (1/z) world space */
        var wYUpper = preStepFromTop * stepWYAlongUpper + topWY;
        var wYLower = preStepFromMid * stepWYAlongLower + midWY;
        var wYMajor = preStepFromTop * stepWYAlongMajor + topWY;
        /* current `wz` coordinates in perspective-correct (1/z) world space */
        var wZUpper = preStepFromTop * stepWZAlongUpper + topWZ;
        var wZLower = preStepFromMid * stepWZAlongLower + midWZ;
        var wZMajor = preStepFromTop * stepWZAlongMajor + topWZ;
        // whether the lefmost edge of the triangle is the longest
        var isLeftMajor = stepXAlongMajor < stepXAlongUpper;
        if (isLeftMajor) {
            /* lerp based on `y` in screen space for the upper half of the
             * triangle
             */
            for (var y = startY; y < midStopY && y < SCREEN_H; ++y) {
                /* configure the pixel shader object for the draw call */
                pso.dy = y;
                pso.dx0 = xMajor;
                pso.dx1 = xUpper;
                pso.z0 = zMajor;
                pso.z1 = zUpper;
                pso.r0 = rMajor;
                pso.r1 = rUpper;
                pso.g0 = gMajor;
                pso.g1 = gUpper;
                pso.b0 = bMajor;
                pso.b1 = bUpper;
                pso.nx0 = nXMajor;
                pso.nx1 = nXUpper;
                pso.ny0 = nYMajor;
                pso.ny1 = nYUpper;
                pso.nz0 = nZMajor;
                pso.nz1 = nZUpper;
                pso.wx0 = wXMajor;
                pso.wx1 = wXUpper;
                pso.wy0 = wYMajor;
                pso.wy1 = wYUpper;
                pso.wz0 = wZMajor;
                pso.wz1 = wZUpper;
                R_LerpScanline_Colored(pso);
                /* step forward along all vectors */
                xUpper += stepXAlongUpper;
                xMajor += stepXAlongMajor;
                zUpper += stepZAlongUpper;
                zMajor += stepZAlongMajor;
                rUpper += stepRAlongUpper;
                rMajor += stepRAlongMajor;
                gUpper += stepGAlongUpper;
                gMajor += stepGAlongMajor;
                bUpper += stepBAlongUpper;
                bMajor += stepBAlongMajor;
                nXUpper += stepNXAlongUpper;
                nXMajor += stepNXAlongMajor;
                nYUpper += stepNYAlongUpper;
                nYMajor += stepNYAlongMajor;
                nZUpper += stepNZAlongUpper;
                nZMajor += stepNZAlongMajor;
                wXUpper += stepWXAlongUpper;
                wXMajor += stepWXAlongMajor;
                wYUpper += stepWYAlongUpper;
                wYMajor += stepWYAlongMajor;
                wZUpper += stepWZAlongUpper;
                wZMajor += stepWZAlongMajor;
            }
            /* lerp based on `y` in screen space for the lower half of the
             * triangle
             */
            for (var y = midStopY; y < endY && y < SCREEN_H; ++y) {
                /* configure the pixel shader object for the draw call */
                pso.dy = y;
                pso.dx0 = xMajor;
                pso.dx1 = xLower;
                pso.z0 = zMajor;
                pso.z1 = zLower;
                pso.r0 = rMajor;
                pso.r1 = rLower;
                pso.g0 = gMajor;
                pso.g1 = gLower;
                pso.b0 = bMajor;
                pso.b1 = bLower;
                pso.nx0 = nXMajor;
                pso.nx1 = nXLower;
                pso.ny0 = nYMajor;
                pso.ny1 = nYLower;
                pso.nz0 = nZMajor;
                pso.nz1 = nZLower;
                pso.wx0 = wXMajor;
                pso.wx1 = wXLower;
                pso.wy0 = wYMajor;
                pso.wy1 = wYLower;
                pso.wz0 = wZMajor;
                pso.wz1 = wZLower;
                R_LerpScanline_Colored(pso);
                /* step forward along all vectors */
                xLower += stepXAlongLower;
                xMajor += stepXAlongMajor;
                zLower += stepZAlongLower;
                zMajor += stepZAlongMajor;
                rLower += stepRAlongLower;
                rMajor += stepRAlongMajor;
                gLower += stepGAlongLower;
                gMajor += stepGAlongMajor;
                bLower += stepBAlongLower;
                bMajor += stepBAlongMajor;
                nXLower += stepNXAlongLower;
                nXMajor += stepNXAlongMajor;
                nYLower += stepNYAlongLower;
                nYMajor += stepNYAlongMajor;
                nZLower += stepNZAlongLower;
                nZMajor += stepNZAlongMajor;
                wXLower += stepWXAlongLower;
                wXMajor += stepWXAlongMajor;
                wYLower += stepWYAlongLower;
                wYMajor += stepWYAlongMajor;
                wZLower += stepWZAlongLower;
                wZMajor += stepWZAlongMajor;
            }
        }
        else {
            /* lerp based on `y` in screen space for the upper half of the
             * triangle
             */
            for (var y = startY; y < midStopY && y < SCREEN_H; ++y) {
                /* configure the pixel shader object for the draw call */
                pso.dy = y;
                pso.dx0 = xUpper;
                pso.dx1 = xMajor;
                pso.z0 = zUpper;
                pso.z1 = zMajor;
                pso.r0 = rUpper;
                pso.r1 = rMajor;
                pso.g0 = gUpper;
                pso.g1 = gMajor;
                pso.b0 = bUpper;
                pso.b1 = bMajor;
                pso.nx0 = nXUpper;
                pso.nx1 = nXMajor;
                pso.ny0 = nYUpper;
                pso.ny1 = nYMajor;
                pso.nz0 = nZUpper;
                pso.nz1 = nZMajor;
                pso.wx0 = wXUpper;
                pso.wx1 = wXMajor;
                pso.wy0 = wYUpper;
                pso.wy1 = wYMajor;
                pso.wz0 = wZUpper;
                pso.wz1 = wZMajor;
                R_LerpScanline_Colored(pso);
                /* step forward along all vectors */
                xUpper += stepXAlongUpper;
                xMajor += stepXAlongMajor;
                zUpper += stepZAlongUpper;
                zMajor += stepZAlongMajor;
                rUpper += stepRAlongUpper;
                rMajor += stepRAlongMajor;
                gUpper += stepGAlongUpper;
                gMajor += stepGAlongMajor;
                bUpper += stepBAlongUpper;
                bMajor += stepBAlongMajor;
                nXUpper += stepNXAlongUpper;
                nXMajor += stepNXAlongMajor;
                nYUpper += stepNYAlongUpper;
                nYMajor += stepNYAlongMajor;
                nZUpper += stepNZAlongUpper;
                nZMajor += stepNZAlongMajor;
                wXUpper += stepWXAlongUpper;
                wXMajor += stepWXAlongMajor;
                wYUpper += stepWYAlongUpper;
                wYMajor += stepWYAlongMajor;
                wZUpper += stepWZAlongUpper;
                wZMajor += stepWZAlongMajor;
            }
            /* lerp based on `y` in screen space for the lower half of the
             * triangle
             */
            for (var y = midStopY; y < endY && y < SCREEN_H; ++y) {
                /* configure the pixel shader object for the draw call */
                pso.dy = y;
                pso.dx0 = xLower;
                pso.dx1 = xMajor;
                pso.z0 = zLower;
                pso.z1 = zMajor;
                pso.r0 = rLower;
                pso.r1 = rMajor;
                pso.g0 = gLower;
                pso.g1 = gMajor;
                pso.b0 = bLower;
                pso.b1 = bMajor;
                pso.nx0 = nXLower;
                pso.nx1 = nXMajor;
                pso.ny0 = nYLower;
                pso.ny1 = nYMajor;
                pso.nz0 = nZLower;
                pso.nz1 = nZMajor;
                pso.wx0 = wXLower;
                pso.wx1 = wXMajor;
                pso.wy0 = wYLower;
                pso.wy1 = wYMajor;
                pso.wz0 = wZLower;
                pso.wz1 = wZMajor;
                R_LerpScanline_Colored(pso);
                /* step forward along all vectors */
                xLower += stepXAlongLower;
                xMajor += stepXAlongMajor;
                zLower += stepZAlongLower;
                zMajor += stepZAlongMajor;
                rLower += stepRAlongLower;
                rMajor += stepRAlongMajor;
                gLower += stepGAlongLower;
                gMajor += stepGAlongMajor;
                bLower += stepBAlongLower;
                bMajor += stepBAlongMajor;
                nXLower += stepNXAlongLower;
                nXMajor += stepNXAlongMajor;
                nYLower += stepNYAlongLower;
                nYMajor += stepNYAlongMajor;
                nZLower += stepNZAlongLower;
                nZMajor += stepNZAlongMajor;
                wXLower += stepWXAlongLower;
                wXMajor += stepWXAlongMajor;
                wYLower += stepWYAlongLower;
                wYMajor += stepWYAlongMajor;
                wZLower += stepWZAlongLower;
                wZMajor += stepWZAlongMajor;
            }
        }
    }
    /*
    function
    R_FillTriangle_Colored_Bresenham
    ( ax: number, ay: number,
      bx: number, by: number,
      cx: number, cy: number,
      r: number, g: number, b: number, a: number ): void
    {
        // TODO: implement, inspired by:
        // https://mcejp.github.io/2020/11/06/bresenham.html
    }

    function
    R_LerpScanline_Textured_Affine
    ( tex: texture_t,
      dx0: number, dx1: number, dy: number,
      u0: number, v0: number,
      u1: number, v1: number,
      alpha: number,
      lightLevel: number ): void
    {
        // TODO: implement affine texture-mapping
    }

    function
    R_FillTriangle_Textured_Affine
    ( tex: texture_t,
      ax: number, ay: number,
      bx: number, by: number,
      cx: number, cy: number,
      au: number, av: number,
      bu: number, bv: number,
      cu: number, cv: number,
      alpha: number,
      lightLevel: number ): void
    {
        // TODO: implement affine texture-mapping
    }
    */
    //
    // R_LerpScanline_Textured_Perspective
    // Lerp a single texture-mapped scanline
    //
    /* FIXME: remove redundant lighting associated branches in this function */
    function R_LerpScanline_Textured_Perspective(_a) {
        var tex = _a.tex, dy = _a.dy, dx0 = _a.dx0, dx1 = _a.dx1, z0 = _a.z0, z1 = _a.z1, u0 = _a.u0, v0 = _a.v0, u1 = _a.u1, v1 = _a.v1, nx0 = _a.nx0, ny0 = _a.ny0, nz0 = _a.nz0, nx1 = _a.nx1, ny1 = _a.ny1, nz1 = _a.nz1, wx0 = _a.wx0, wy0 = _a.wy0, wz0 = _a.wz0, wx1 = _a.wx1, wy1 = _a.wy1, wz1 = _a.wz1, normalX = _a.normalX, normalY = _a.normalY, normalZ = _a.normalZ, lightX = _a.lightX, lightY = _a.lightY, lightZ = _a.lightZ, isPointLight = _a.isPointLight, alpha = _a.alpha;
        var shouldShade = lightX !== undefined &&
            lightY !== undefined &&
            lightZ !== undefined;
        tex = tex;
        var texWidth = tex.width, texHeight = tex.height, bitmap = tex.bitmap;
        // raster clipping: clip the scanline if it goes out-of-bounds of screen
        // coordinates
        var clipLeft = Math.max(-dx0, 0);
        // bias the start and end endpoints in screen space by -0.5 horizontally
        // as per the top-left pixel coverage rules
        var dX0 = Math.ceil(dx0 + clipLeft - 0.5), dX1 = Math.ceil(dx1 - 0.5);
        var deltaX = dx1 - dx0, deltaX_ = 1 / deltaX;
        // pre-step from start by 0.5 as pixel centers are the actual sampling
        // points
        var preStepX = dX0 + 0.5 - dx0;
        // 1 step in `+x` equals how many steps in `z`
        var gradZ = (z1 - z0) * deltaX_;
        /* 1 step in `+x` equals how many steps in `u` and `v` */
        var gradU = (u1 - u0) * deltaX_;
        var gradV = (v1 - v0) * deltaX_;
        /* 1 step in `+x` equals how many steps along the vertex normal */
        var gradNX = (nx1 - nx0) * deltaX_;
        var gradNY = (ny1 - ny0) * deltaX_;
        var gradNZ = (nz1 - nz0) * deltaX_;
        /* 1 step in `+x` equals how many in the world space coordinates */
        var gradWX = (wx1 - wx0) * deltaX_;
        var gradWY = (wy1 - wy0) * deltaX_;
        var gradWZ = (wz1 - wz0) * deltaX_;
        // current z-coordinate in the perspective-correct space
        var z = preStepX * gradZ + z0;
        /* current uv coordinates in the perspective-correct space */
        var u = preStepX * gradU + u0;
        var v = preStepX * gradV + v0;
        /* current vertex normal in the perspective-correct space */
        var nx = preStepX * gradNX + nx0;
        var ny = preStepX * gradNY + ny0;
        var nz = preStepX * gradNZ + nz0;
        /* current world space coordinates in the perspective-correct space */
        var wx = preStepX * gradWX + wx0;
        var wy = preStepX * gradWY + wy0;
        var wz = preStepX * gradWZ + wz0;
        /* rasterize current scanline */
        for (var x = dX0; x < dX1 && x < SCREEN_W; ++x) {
            var bufferIndex = dy * SCREEN_W + x;
            /* skip drawing the pixel unless the current pixel in the raster
             * triangle is closer (1 / zRaster > 1 / zBuffer) than what's
             * already in the z-buffer at the position we want to draw
             */
            if (z <= zBuffer[bufferIndex]) {
                z += gradZ;
                u += gradU;
                v += gradV;
                nx += gradNX;
                ny += gradNY;
                nz += gradNZ;
                wx += gradWX;
                wy += gradWY;
                wz += gradWZ;
                continue;
            }
            zBuffer[bufferIndex] = z; // update the z-buffer
            /* get the original coordinates back from the perspective-corrected
             * space by dehomogenizing
             */
            var z_ = 1 / z;
            var sX = u * z_, sY = v * z_;
            /* wrap-around the texture if the sampling point is out-of-bounds */
            sX = Math.floor((((sX % 1) + 1) % 1) * texWidth);
            sY = Math.floor((((sY % 1) + 1) % 1) * texHeight);
            /* calculate light intensity on the current pixel */
            var lightLevel = 1;
            if (shouldShade) {
                // start with the assumption that the given light is a
                // directional light...
                var lX = lightX, lY = lightY, lZ = lightZ;
                /* ...and adjust accordingly if it turns out to be a point light
                 * instead
                 */
                if (isPointLight) {
                    lX -= wx * z_;
                    lY -= wy * z_;
                    lZ -= wz * z_;
                }
                /* TODO: maybe use `Q_rsqrt` here??? */
                var magL_ = 1 / Math.sqrt(lX * lX + lY * lY + lZ * lZ);
                var lXUnit = lX * magL_;
                var lYUnit = lY * magL_;
                var lZUnit = lZ * magL_;
                /* flat shading */
                if (normalX !== undefined &&
                    normalY !== undefined &&
                    normalZ !== undefined) {
                    lightLevel =
                        lXUnit * normalX + lYUnit * normalY + lZUnit * normalZ;
                    lightLevel = (lightLevel + 1) * 0.5;
                }
                /* smooth shading */
                else {
                    var NX = nx * z_, NY = ny * z_, NZ = nz * z_;
                    /* TODO: maybe use `Q_rsqrt` here??? */
                    var magN_ = 1 / Math.sqrt(NX * NX + NY * NY + NZ * NZ);
                    var nXUnit = NX * magN_;
                    var nYUnit = NY * magN_;
                    var nZUnit = NZ * magN_;
                    lightLevel =
                        lXUnit * nXUnit + lYUnit * nYUnit + lZUnit * nZUnit;
                }
            }
            /* draw a single pixel in screen space sampled from the
             * perspective-corrected texture space
             */
            var sampleIndex = (sY * texWidth + sX) << 2;
            var sampleRed = bitmap[sampleIndex];
            var sampleGreen = bitmap[sampleIndex + 1];
            var sampleBlue = bitmap[sampleIndex + 2];
            var sampleAlpha = bitmap[sampleIndex + 3] * alpha;
            var paintIndex = bufferIndex << 2;
            var bufferRed = frameBuffer.data[paintIndex];
            var bufferGreen = frameBuffer.data[paintIndex + 1];
            var bufferBlue = frameBuffer.data[paintIndex + 2];
            var bufferAlpha = frameBuffer.data[paintIndex + 3] || 255;
            var blendRatio = sampleAlpha / bufferAlpha;
            var blendRatio_ = 1 - blendRatio;
            var newBlend = lightLevel * blendRatio;
            var newRed = newBlend * sampleRed + blendRatio_ * bufferRed;
            var newGreen = newBlend * sampleGreen + blendRatio_ * bufferGreen;
            var newBlue = newBlend * sampleBlue + blendRatio_ * bufferBlue;
            frameBuffer.data[paintIndex] = newRed;
            frameBuffer.data[paintIndex + 1] = newGreen;
            frameBuffer.data[paintIndex + 2] = newBlue;
            frameBuffer.data[paintIndex + 3] = 255;
            z += gradZ;
            u += gradU;
            v += gradV;
            nx += gradNX;
            ny += gradNY;
            nz += gradNZ;
            wx += gradWX;
            wy += gradWY;
            wz += gradWZ;
        }
    }
    //
    // R_FillTriangle_Textured_Perspective
    // Fill the triangle with a texture
    //
    function R_FillTriangle_Textured_Perspective(_a, pso) {
        var ax = _a.ax, ay = _a.ay, az = _a.az, bx = _a.bx, by = _a.by, bz = _a.bz, cx = _a.cx, cy = _a.cy, cz = _a.cz, au = _a.au, av = _a.av, bu = _a.bu, bv = _a.bv, cu = _a.cu, cv = _a.cv, nax = _a.nax, nay = _a.nay, naz = _a.naz, nbx = _a.nbx, nby = _a.nby, nbz = _a.nbz, ncx = _a.ncx, ncy = _a.ncy, ncz = _a.ncz, wax = _a.wax, way = _a.way, waz = _a.waz, wbx = _a.wbx, wby = _a.wby, wbz = _a.wbz, wcx = _a.wcx, wcy = _a.wcy, wcz = _a.wcz;
        /* coordinates of the triangle in screen space */
        var topX = ax, midX = bx, bottomX = cx;
        var topY = ay, midY = by, bottomY = cy;
        // z-coordinates in the perspective-correct space
        var topZ = az, midZ = bz, bottomZ = cz;
        /* UV coordinates in perspective-corrected (1/z) texture space */
        var topU = au * topZ, midU = bu * midZ, bottomU = cu * bottomZ;
        var topV = av * topZ, midV = bv * midZ, bottomV = cv * bottomZ;
        /* vertex normals in perspective-corrected (1/z) world space */
        var topNX = nax * topZ, midNX = nbx * midZ, bottomNX = ncx * bottomZ;
        var topNY = nay * topZ, midNY = nby * midZ, bottomNY = ncy * bottomZ;
        var topNZ = naz * topZ, midNZ = nbz * midZ, bottomNZ = ncz * bottomZ;
        /* world space coordinates of the triangle vertices in
         * perspective-corrected (1/z) space
         */
        var topWX = wax * topZ, midWX = wbx * midZ, bottomWX = wcx * bottomZ;
        var topWY = way * topZ, midWY = wby * midZ, bottomWY = wcy * bottomZ;
        var topWZ = waz * topZ, midWZ = wbz * midZ, bottomWZ = wcz * bottomZ;
        /* sort vertices of the triangle so that their y-coordinates are in
         * ascending order
         */
        if (topY > midY) {
            /* swap vertices in screen space */
            var auxX = topX;
            topX = midX;
            midX = auxX;
            var auxY = topY;
            topY = midY;
            midY = auxY;
            // swap in perspective-correct (1/z) space
            var auxZ = topZ;
            topZ = midZ;
            midZ = auxZ;
            /* swap uv coordinates */
            var auxU = topU;
            topU = midU;
            midU = auxU;
            var auxV = topV;
            topV = midV;
            midV = auxV;
            /* swap vertex normals */
            var auxNX = topNX;
            topNX = midNX;
            midNX = auxNX;
            var auxNY = topNY;
            topNY = midNY;
            midNY = auxNY;
            var auxNZ = topNZ;
            topNZ = midNZ;
            midNZ = auxNZ;
            /* swap world space coordinates */
            var auxWX = topWX;
            topWX = midWX;
            midWX = auxWX;
            var auxWY = topWY;
            topWY = midWY;
            midWY = auxWY;
            var auxWZ = topWZ;
            topWZ = midWZ;
            midWZ = auxWZ;
        }
        if (midY > bottomY) {
            /* swap vertices in screen space */
            var auxX = midX;
            midX = bottomX;
            bottomX = auxX;
            var auxY = midY;
            midY = bottomY;
            bottomY = auxY;
            // swap in perspective-correct (1/z) space
            var auxZ = midZ;
            midZ = bottomZ;
            bottomZ = auxZ;
            /* swap uv coordinates */
            var auxU = midU;
            midU = bottomU;
            bottomU = auxU;
            var auxV = midV;
            midV = bottomV;
            bottomV = auxV;
            /* swap vertex normals */
            var auxNX = midNX;
            midNX = bottomNX;
            bottomNX = auxNX;
            var auxNY = midNY;
            midNY = bottomNY;
            bottomNY = auxNY;
            var auxNZ = midNZ;
            midNZ = bottomNZ;
            bottomNZ = auxNZ;
            /* swap world space coordinates */
            var auxWX = midWX;
            midWX = bottomWX;
            bottomWX = auxWX;
            var auxWY = midWY;
            midWY = bottomWY;
            bottomWY = auxWY;
            var auxWZ = midWZ;
            midWZ = bottomWZ;
            bottomWZ = auxWZ;
        }
        if (topY > midY) {
            /* swap vertices in screen space */
            var auxX = topX;
            topX = midX;
            midX = auxX;
            var auxY = topY;
            topY = midY;
            midY = auxY;
            // swap in perspective-correct (1/z) space
            var auxZ = topZ;
            topZ = midZ;
            midZ = auxZ;
            /* swap uv coordinates */
            var auxU = topU;
            topU = midU;
            midU = auxU;
            var auxV = topV;
            topV = midV;
            midV = auxV;
            /* swap vertex normals */
            var auxNX = topNX;
            topNX = midNX;
            midNX = auxNX;
            var auxNY = topNY;
            topNY = midNY;
            midNY = auxNY;
            var auxNZ = topNZ;
            topNZ = midNZ;
            midNZ = auxNZ;
            /* swap world space coordinates */
            var auxWX = topWX;
            topWX = midWX;
            midWX = auxWX;
            var auxWY = topWY;
            topWY = midWY;
            midWY = auxWY;
            var auxWZ = topWZ;
            topWZ = midWZ;
            midWZ = auxWZ;
        }
        var deltaUpper = midY - topY, deltaUpper_ = 1 / deltaUpper;
        var deltaLower = bottomY - midY, deltaLower_ = 1 / deltaLower;
        var deltaMajor = bottomY - topY, deltaMajor_ = 1 / deltaMajor;
        /* 1 step in `+y` equals how many steps in `x` */
        var stepXAlongUpper = (midX - topX) * deltaUpper_;
        var stepXAlongLower = (bottomX - midX) * deltaLower_;
        var stepXAlongMajor = (bottomX - topX) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `z` */
        var stepZAlongUpper = (midZ - topZ) * deltaUpper_;
        var stepZAlongLower = (bottomZ - midZ) * deltaLower_;
        var stepZAlongMajor = (bottomZ - topZ) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `u` */
        var stepUAlongUpper = (midU - topU) * deltaUpper_;
        var stepUAlongLower = (bottomU - midU) * deltaLower_;
        var stepUAlongMajor = (bottomU - topU) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `v` */
        var stepVAlongUpper = (midV - topV) * deltaUpper_;
        var stepVAlongLower = (bottomV - midV) * deltaLower_;
        var stepVAlongMajor = (bottomV - topV) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `nx` */
        var stepNXAlongUpper = (midNX - topNX) * deltaUpper_;
        var stepNXAlongLower = (bottomNX - midNX) * deltaLower_;
        var stepNXAlongMajor = (bottomNX - topNX) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `ny` */
        var stepNYAlongUpper = (midNY - topNY) * deltaUpper_;
        var stepNYAlongLower = (bottomNY - midNY) * deltaLower_;
        var stepNYAlongMajor = (bottomNY - topNY) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `nz` */
        var stepNZAlongUpper = (midNZ - topNZ) * deltaUpper_;
        var stepNZAlongLower = (bottomNZ - midNZ) * deltaLower_;
        var stepNZAlongMajor = (bottomNZ - topNZ) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `wx` */
        var stepWXAlongUpper = (midWX - topWX) * deltaUpper_;
        var stepWXAlongLower = (bottomWX - midWX) * deltaLower_;
        var stepWXAlongMajor = (bottomWX - topWX) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `wy` */
        var stepWYAlongUpper = (midWY - topWY) * deltaUpper_;
        var stepWYAlongLower = (bottomWY - midWY) * deltaLower_;
        var stepWYAlongMajor = (bottomWY - topWY) * deltaMajor_;
        /* 1 step in `+y` equals how many steps in `wz` */
        var stepWZAlongUpper = (midWZ - topWZ) * deltaUpper_;
        var stepWZAlongLower = (bottomWZ - midWZ) * deltaLower_;
        var stepWZAlongMajor = (bottomWZ - topWZ) * deltaMajor_;
        // raster clipping: clip the triangle if it goes out-of-bounds of screen
        // coordinates
        var clipTop = Math.max(-topY, 0), clipMid = Math.max(-midY, 0);
        /* vertical endpoints of the rasterization in screen space, biased by
         * -0.5 as per the top-left pixel coverage rules
         */
        var startY = Math.ceil(topY + clipTop - 0.5);
        var midStopY = Math.ceil(midY + clipMid - 0.5);
        var endY = Math.ceil(bottomY - 0.5);
        /* pre-step from top and mid endpoints by 0.5 as pixel centers are the
         * actual sampling points
         */
        var preStepFromTop = startY + 0.5 - topY;
        var preStepFromMid = midStopY + 0.5 - midY;
        /* current `x` coordinates in screen space */
        var xUpper = preStepFromTop * stepXAlongUpper + topX;
        var xLower = preStepFromMid * stepXAlongLower + midX;
        var xMajor = preStepFromTop * stepXAlongMajor + topX;
        /* current `z` coordinates in perspective-correct (1/z) space */
        var zUpper = preStepFromTop * stepZAlongUpper + topZ;
        var zLower = preStepFromMid * stepZAlongLower + midZ;
        var zMajor = preStepFromTop * stepZAlongMajor + topZ;
        /* current `u` coordinates in perspective-correct (1/z) texture space */
        var uUpper = preStepFromTop * stepUAlongUpper + topU;
        var uLower = preStepFromMid * stepUAlongLower + midU;
        var uMajor = preStepFromTop * stepUAlongMajor + topU;
        /* current `v` coordinates in perspective-correct (1/z) texture space */
        var vUpper = preStepFromTop * stepVAlongUpper + topV;
        var vLower = preStepFromMid * stepVAlongLower + midV;
        var vMajor = preStepFromTop * stepVAlongMajor + topV;
        /* current `nx` coordinates in perspective-correct (1/z) world space */
        var nXUpper = preStepFromTop * stepNXAlongUpper + topNX;
        var nXLower = preStepFromMid * stepNXAlongLower + midNX;
        var nXMajor = preStepFromTop * stepNXAlongMajor + topNX;
        /* current `ny` coordinates in perspective-correct (1/z) world space */
        var nYUpper = preStepFromTop * stepNYAlongUpper + topNY;
        var nYLower = preStepFromMid * stepNYAlongLower + midNY;
        var nYMajor = preStepFromTop * stepNYAlongMajor + topNY;
        /* current `nz` coordinates in perspective-correct (1/z) world space */
        var nZUpper = preStepFromTop * stepNZAlongUpper + topNZ;
        var nZLower = preStepFromMid * stepNZAlongLower + midNZ;
        var nZMajor = preStepFromTop * stepNZAlongMajor + topNZ;
        /* current `wx` coordinates in perspective-correct (1/z) world space */
        var wXUpper = preStepFromTop * stepWXAlongUpper + topWX;
        var wXLower = preStepFromMid * stepWXAlongLower + midWX;
        var wXMajor = preStepFromTop * stepWXAlongMajor + topWX;
        /* current `wy` coordinates in perspective-correct (1/z) world space */
        var wYUpper = preStepFromTop * stepWYAlongUpper + topWY;
        var wYLower = preStepFromMid * stepWYAlongLower + midWY;
        var wYMajor = preStepFromTop * stepWYAlongMajor + topWY;
        /* current `wz` coordinates in perspective-correct (1/z) world space */
        var wZUpper = preStepFromTop * stepWZAlongUpper + topWZ;
        var wZLower = preStepFromMid * stepWZAlongLower + midWZ;
        var wZMajor = preStepFromTop * stepWZAlongMajor + topWZ;
        // whether the lefmost edge of the raster triangle is the longest
        var isLeftMajor = stepXAlongMajor < stepXAlongUpper;
        if (isLeftMajor) {
            /* lerp based on `y` in screen space for the upper half of the
             * triangle
             */
            for (var y = startY; y < midStopY && y < SCREEN_H; ++y) {
                /* configure the pixel shader object for the draw call */
                pso.dy = y;
                pso.dx0 = xMajor;
                pso.dx1 = xUpper;
                pso.z0 = zMajor;
                pso.z1 = zUpper;
                pso.u0 = uMajor;
                pso.u1 = uUpper;
                pso.v0 = vMajor;
                pso.v1 = vUpper;
                pso.nx0 = nXMajor;
                pso.nx1 = nXUpper;
                pso.ny0 = nYMajor;
                pso.ny1 = nYUpper;
                pso.nz0 = nZMajor;
                pso.nz1 = nZUpper;
                pso.wx0 = wXMajor;
                pso.wx1 = wXUpper;
                pso.wy0 = wYMajor;
                pso.wy1 = wYUpper;
                pso.wz0 = wZMajor;
                pso.wz1 = wZUpper;
                R_LerpScanline_Textured_Perspective(pso);
                /* step forward along all vectors */
                xUpper += stepXAlongUpper;
                xMajor += stepXAlongMajor;
                zUpper += stepZAlongUpper;
                zMajor += stepZAlongMajor;
                uUpper += stepUAlongUpper;
                uMajor += stepUAlongMajor;
                vUpper += stepVAlongUpper;
                vMajor += stepVAlongMajor;
                nXUpper += stepNXAlongUpper;
                nXMajor += stepNXAlongMajor;
                nYUpper += stepNYAlongUpper;
                nYMajor += stepNYAlongMajor;
                nZUpper += stepNZAlongUpper;
                nZMajor += stepNZAlongMajor;
                wXUpper += stepWXAlongUpper;
                wXMajor += stepWXAlongMajor;
                wYUpper += stepWYAlongUpper;
                wYMajor += stepWYAlongMajor;
                wZUpper += stepWZAlongUpper;
                wZMajor += stepWZAlongMajor;
            }
            /* lerp based on `y` in screen space for the lower half of the
             * triangle
             */
            for (var y = midStopY; y < endY && y < SCREEN_H; ++y) {
                /* configure the pixel shader object for the draw call */
                pso.dy = y;
                pso.dx0 = xMajor;
                pso.dx1 = xLower;
                pso.z0 = zMajor;
                pso.z1 = zLower;
                pso.u0 = uMajor;
                pso.u1 = uLower;
                pso.v0 = vMajor;
                pso.v1 = vLower;
                pso.nx0 = nXMajor;
                pso.nx1 = nXLower;
                pso.ny0 = nYMajor;
                pso.ny1 = nYLower;
                pso.nz0 = nZMajor;
                pso.nz1 = nZLower;
                pso.wx0 = wXMajor;
                pso.wx1 = wXLower;
                pso.wy0 = wYMajor;
                pso.wy1 = wYLower;
                pso.wz0 = wZMajor;
                pso.wz1 = wZLower;
                R_LerpScanline_Textured_Perspective(pso);
                /* step forward along all vectors */
                xLower += stepXAlongLower;
                xMajor += stepXAlongMajor;
                zLower += stepZAlongLower;
                zMajor += stepZAlongMajor;
                uLower += stepUAlongLower;
                uMajor += stepUAlongMajor;
                vLower += stepVAlongLower;
                vMajor += stepVAlongMajor;
                nXLower += stepNXAlongLower;
                nXMajor += stepNXAlongMajor;
                nYLower += stepNYAlongLower;
                nYMajor += stepNYAlongMajor;
                nZLower += stepNZAlongLower;
                nZMajor += stepNZAlongMajor;
                wXLower += stepWXAlongLower;
                wXMajor += stepWXAlongMajor;
                wYLower += stepWYAlongLower;
                wYMajor += stepWYAlongMajor;
                wZLower += stepWZAlongLower;
                wZMajor += stepWZAlongMajor;
            }
        }
        else {
            /* lerp based on `y` in screen space for the upper half of the
             * triangle
             */
            for (var y = startY; y < midStopY && y < SCREEN_H; ++y) {
                /* configure the pixel shader object for the draw call */
                pso.dy = y;
                pso.dx0 = xUpper;
                pso.dx1 = xMajor;
                pso.z0 = zUpper;
                pso.z1 = zMajor;
                pso.u0 = uUpper;
                pso.u1 = uMajor;
                pso.v0 = vUpper;
                pso.v1 = vMajor;
                pso.nx0 = nXUpper;
                pso.nx1 = nXMajor;
                pso.ny0 = nYUpper;
                pso.ny1 = nYMajor;
                pso.nz0 = nZUpper;
                pso.nz1 = nZMajor;
                pso.wx0 = wXUpper;
                pso.wx1 = wXMajor;
                pso.wy0 = wYUpper;
                pso.wy1 = wYMajor;
                pso.wz0 = wZUpper;
                pso.wz1 = wZMajor;
                R_LerpScanline_Textured_Perspective(pso);
                /* step forward along all vectors */
                xUpper += stepXAlongUpper;
                xMajor += stepXAlongMajor;
                zUpper += stepZAlongUpper;
                zMajor += stepZAlongMajor;
                uUpper += stepUAlongUpper;
                uMajor += stepUAlongMajor;
                vUpper += stepVAlongUpper;
                vMajor += stepVAlongMajor;
                nXUpper += stepNXAlongUpper;
                nXMajor += stepNXAlongMajor;
                nYUpper += stepNYAlongUpper;
                nYMajor += stepNYAlongMajor;
                nZUpper += stepNZAlongUpper;
                nZMajor += stepNZAlongMajor;
                wXUpper += stepWXAlongUpper;
                wXMajor += stepWXAlongMajor;
                wYUpper += stepWYAlongUpper;
                wYMajor += stepWYAlongMajor;
                wZUpper += stepWZAlongUpper;
                wZMajor += stepWZAlongMajor;
            }
            /* lerp based on `y` in screen space for the lower half of the
             * triangle
             */
            for (var y = midStopY; y < endY && y < SCREEN_H; ++y) {
                /* configure the pixel shader object for the draw call */
                pso.dy = y;
                pso.dx0 = xLower;
                pso.dx1 = xMajor;
                pso.z0 = zLower;
                pso.z1 = zMajor;
                pso.u0 = uLower;
                pso.u1 = uMajor;
                pso.v0 = vLower;
                pso.v1 = vMajor;
                pso.nx0 = nXLower;
                pso.nx1 = nXMajor;
                pso.ny0 = nYLower;
                pso.ny1 = nYMajor;
                pso.nz0 = nZLower;
                pso.nz1 = nZMajor;
                pso.wx0 = wXLower;
                pso.wx1 = wXMajor;
                pso.wy0 = wYLower;
                pso.wy1 = wYMajor;
                pso.wz0 = wZLower;
                pso.wz1 = wZMajor;
                R_LerpScanline_Textured_Perspective(pso);
                /* step forward along all vectors */
                xLower += stepXAlongLower;
                xMajor += stepXAlongMajor;
                zLower += stepZAlongLower;
                zMajor += stepZAlongMajor;
                uLower += stepUAlongLower;
                uMajor += stepUAlongMajor;
                vLower += stepVAlongLower;
                vMajor += stepVAlongMajor;
                nXLower += stepNXAlongLower;
                nXMajor += stepNXAlongMajor;
                nYLower += stepNYAlongLower;
                nYMajor += stepNYAlongMajor;
                nZLower += stepNZAlongLower;
                nZMajor += stepNZAlongMajor;
                wXLower += stepWXAlongLower;
                wXMajor += stepWXAlongMajor;
                wYLower += stepWYAlongLower;
                wYMajor += stepWYAlongMajor;
                wZLower += stepWZAlongLower;
                wZMajor += stepWZAlongMajor;
            }
        }
    }
    function R_DrawImage(img, sx, sy, sw, sh, dx, dy, dw, dh, alpha, lightLevel) {
        var imgWidth = img.width, imgHeight = img.height, bitmap = img.bitmap;
        /* early return if either the source or the destination is out-of-bounds
         */
        if (sx + sw <= 0 || sy + sh <= 0 || sx >= imgWidth || sy >= imgHeight ||
            dx + dw <= 0 || dy + dh <= 0 || dx >= SCREEN_W || dy >= SCREEN_H)
            return;
        /* determine how bright & translucent the image is going to be drawn */
        var ALPHA = alpha !== undefined ? alpha : 1;
        var LIGHT_LEVEL = lightLevel !== undefined ? lightLevel : 1;
        // 1 step in screen space equals how many steps in texture space
        var scaleX = sw / dw, scaleY = sh / dh;
        // raster clipping: clip the screen coordinates against the bounds of
        // the buffer
        var clipLeft = Math.max(-dx, 0), clipTop = Math.max(-dy, 0);
        /* draw endpoints in screen space, biased by -0.5 as per the top-left
         * pixel coverage rules
         */
        var dStartX = Math.ceil(dx + clipLeft - 0.5);
        var dStartY = Math.ceil(dy + clipTop - 0.5);
        var dEndX = Math.ceil(dx + dw - 0.5);
        var dEndY = Math.ceil(dy + dh - 0.5);
        /* pre-step from left and top endpoints by 0.5 as pixel centers are the
         * actual sampling points
         */
        var preStepFromLeft = dStartX + 0.5 - dx;
        var preStepFromTop = dStartY + 0.5 - dy;
        /* where to start sampling in the texture space */
        var sampleStartX = preStepFromLeft * scaleX + sx;
        var sampleStartY = preStepFromTop * scaleY + sy;
        var sampleY = sampleStartY; // current `y` coordinate in texture space
        for (var y = dStartY; y < dEndY && y < SCREEN_H; ++y) {
            var imgY = Math.floor(sampleY);
            // skip drawing this scanline if we're not yet within the bounds of
            // the texture space along the y-axis
            if (imgY < 0) {
                sampleY += scaleY;
                continue;
            }
            // stop drawing any further scanlines if we've gone out-of-bounds in
            // the texture space along the y-axis
            else if (imgY >= imgHeight)
                break;
            // current `x` coordinate in texture space
            var sampleX = sampleStartX;
            for (var x = dStartX; x < dEndX && x < SCREEN_W; ++x) {
                var imgX = Math.floor(sampleX);
                // skip drawing this pixel if we're not yet within the bounds of
                // the texture space along the x-axis
                if (imgX < 0) {
                    sampleX += scaleX;
                    continue;
                }
                // stop drawing any further pixels if we've gone out-of-bounds
                // in the texture space along the x-axis
                else if (imgX >= imgWidth)
                    break;
                var sampleIndex = (imgY * imgWidth + imgX) << 2;
                var sampleRed = bitmap[sampleIndex];
                var sampleGreen = bitmap[sampleIndex + 1];
                var sampleBlue = bitmap[sampleIndex + 2];
                var sampleAlpha = bitmap[sampleIndex + 3] * ALPHA;
                var paintIndex = (y * SCREEN_W + x) << 2;
                var bufferRed = frameBuffer.data[paintIndex];
                var bufferGreen = frameBuffer.data[paintIndex + 1];
                var bufferBlue = frameBuffer.data[paintIndex + 2];
                var bufferAlpha = frameBuffer.data[paintIndex + 3] || 255;
                var blendRatio = sampleAlpha / bufferAlpha;
                var blendRatio_ = 1 - blendRatio;
                var blendWithLightLevel = LIGHT_LEVEL * blendRatio;
                var newRed = blendWithLightLevel * sampleRed +
                    blendRatio_ * bufferRed;
                var newGreen = blendWithLightLevel * sampleGreen +
                    blendRatio_ * bufferGreen;
                var newBlue = blendWithLightLevel * sampleBlue +
                    blendRatio_ * bufferBlue;
                frameBuffer.data[paintIndex] = newRed;
                frameBuffer.data[paintIndex + 1] = newGreen;
                frameBuffer.data[paintIndex + 2] = newBlue;
                frameBuffer.data[paintIndex + 3] = 255;
                sampleX += scaleX;
            }
            sampleY += scaleY;
        }
    }
    function R_Print(chars, x, y, color, size, fontFamily, style) {
        R_Ctx.font = (style ? style + " " : "") +
            (size ? size : 10).toString() + "px " +
            (fontFamily ? fontFamily : "Courier, monospace");
        R_Ctx.fillStyle = color || "#000000";
        R_Ctx.fillText(chars, x, y);
    }
    window.__import__R_Draw = function () {
        return {
            R_InitFrameBuffer: R_InitFrameBuffer,
            R_InitZBuffer: R_InitZBuffer,
            R_FlushFrame: R_FlushFrame,
            R_FillRect: R_FillRect,
            R_DrawLine: R_DrawLine,
            R_DrawLine_DDA: R_DrawLine_DDA,
            R_DrawLine_RayCast: R_DrawLine_RayCast,
            R_DrawCircle: R_DrawCircle,
            R_DrawTriangle_Wireframe: R_DrawTriangle_Wireframe,
            R_FillTriangle_Colored: R_FillTriangle_Colored,
            /* TODO: uncomment these once implemented */
            // R_FillTriangle_Colored_Bresenham,
            // R_FillTriangle_Textured_Affine,
            R_FillTriangle_Textured_Perspective: R_FillTriangle_Textured_Perspective,
            R_DrawImage: R_DrawImage,
            R_Print: R_Print,
        };
    };
})();
