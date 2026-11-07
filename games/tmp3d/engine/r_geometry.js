/*
 *  r_geometry.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-02-20.
 *
 *  SYNOPSIS:
 *      The module that helps load, update and render 3-D geometry data in
 *      memory.
 */
(function () {
    var DEBUG_MODE = window.__DEBUG_MODE__;
    var A_Texture = __import__A_Assets().A_Texture;
    var _a = __import__G_Const(), FRUSTUM_AABB3 = _a.FRUSTUM_AABB3, SCREEN_W_2 = _a.SCREEN_W_2, SCREEN_H_2 = _a.SCREEN_H_2, Z_NEAR = _a.Z_NEAR;
    var _b = __import__I_Input(), I_GetKeyState = _b.I_GetKeyState, I_Keys = _b.I_Keys;
    var _c = __import__M_Collision(), M_BoundingBoxVsBoundingBoxCollision3 = _c.M_BoundingBoxVsBoundingBoxCollision3, M_LineSegmentVsPlaneCollision3 = _c.M_LineSegmentVsPlaneCollision3, M_TimeBeforePlaneCollision3 = _c.M_TimeBeforePlaneCollision3;
    var _d = __import__M_Tri3(), M_AABB3FromTri3 = _d.M_AABB3FromTri3, M_RotateTriAroundAxis3 = _d.M_RotateTriAroundAxis3, Tri3 = _d.M_Tri3, M_TriNormal3 = _d.M_TriNormal3;
    var _e = __import__M_Vec3(), M_Add3 = _e.M_Add3, M_IsInFrontOfPlane3 = _e.M_IsInFrontOfPlane3, M_Norm3 = _e.M_Norm3, M_Scale3 = _e.M_Scale3, M_Sub3 = _e.M_Sub3, Vec3 = _e.M_Vec3;
    var _f = __import__R_Camera(), R_GetProjectionOrigin = _f.R_GetProjectionOrigin, R_TriToClipSpace = _f.R_TriToClipSpace, R_TriToViewSpace = _f.R_TriToViewSpace, R_TriToWorldSpace = _f.R_TriToWorldSpace, R_VecToClipSpace = _f.R_VecToClipSpace, R_VecToViewSpace = _f.R_VecToViewSpace, 
    /* base vectors in world space */
    ORIGIN = _f.R_Origin, RIGHT = _f.R_Right, DOWN = _f.R_Down, FWD = _f.R_Fwd;
    var _g = __import__R_Draw(), R_DrawLine = _g.R_DrawLine, R_DrawTriangle_Wireframe = _g.R_DrawTriangle_Wireframe, R_FillTriangle_Colored = _g.R_FillTriangle_Colored, R_FillTriangle_Textured_Perspective = _g.R_FillTriangle_Textured_Perspective;
    var R_UpdateLight = __import__R_Light().R_UpdateLight;
    var _h = __import__R_Shader(), R_ShaderMode_Fill = _h.R_ShaderMode_Fill, R_ShaderMode_Smooth = _h.R_ShaderMode_Smooth, R_ShaderMode_Texture = _h.R_ShaderMode_Texture, R_ShaderMode_Wireframe = _h.R_ShaderMode_Wireframe, R_ShaderMode_Normals = _h.R_ShaderMode_Normals, pso = _h.R_PixelShaderObj, vso = _h.R_VertexShaderObj;
    // the center of the projection (near-clipping) plane
    var projectionOrigin;
    var nTris; // total number of triangles in the model
    var tris3; // a pool of raw triangle data
    var transformedTris3; // triangles after transformation
    // normal vectors associated with vertices of each triangle in the pool,
    // used in smooth shading
    var triVertexNormals3;
    // vertex normals after transformation
    var transformedTriVertexNormals3;
    // respective uv-coordinates of each triangle in the pool
    var uvTable3;
    // respective texture ids of each triangle in the pool
    var textureTable;
    var culledBuffer; // buffer of triangles who survived culling
    var nCulledBuffer; // number of triangles who survived culling
    /* TODO: find a more suitable spot for managing global transformations?
     * a separate tranform controller, maybe???
     */
    var globalRotationAxis = Vec3(0, -1, 0);
    var globalRotationSwitchDebounce = 250;
    var lastGlobalRotationSwitch = Date.now();
    var doGlobalRotation = false;
    var globalRotation = 0;
    function R_ToggleGlobalRotation() {
        var now = Date.now();
        if (I_GetKeyState(I_Keys.G) &&
            now - lastGlobalRotationSwitch > globalRotationSwitchDebounce) {
            doGlobalRotation = !doGlobalRotation;
            lastGlobalRotationSwitch = now;
        }
    }
    function R_LoadGeometry(vertices, nVertices, triangles, nTriangles) {
        projectionOrigin = R_GetProjectionOrigin();
        nTris = nTriangles;
        tris3 = Array(nTriangles);
        transformedTris3 = Array(nTriangles);
        triVertexNormals3 = Array(nTriangles);
        transformedTriVertexNormals3 = Array(nTriangles);
        culledBuffer = new Uint32Array(nTriangles); // TODO: maybe 16??
        // temporary buffer to compute vertex normals
        var vertexNormals3 = Array(nVertices);
        /* go over each triangle to collect their vertices and vertex normals */
        for (var i = 0; i < nTriangles; ++i) {
            var tri3Data = triangles[i];
            var idxA = tri3Data[0], idxB = tri3Data[1], idxC = tri3Data[2];
            var triA3 = vertices[idxA];
            var triB3 = vertices[idxB];
            var triC3 = vertices[idxC];
            var tri = Tri3(Vec3(triA3[0], triA3[1], triA3[2]), Vec3(triB3[0], triB3[1], triB3[2]), Vec3(triC3[0], triC3[1], triC3[2]));
            tris3[i] = tri;
            // the surface normal of the triangle
            var triNormal3 = M_TriNormal3(tri);
            /* adding the surface normal to each respective vertex that makes up
             * the triangle
             */
            if (vertexNormals3[idxA])
                vertexNormals3[idxA] = M_Add3(vertexNormals3[idxA], triNormal3);
            else
                vertexNormals3[idxA] = triNormal3;
            if (vertexNormals3[idxB])
                vertexNormals3[idxB] = M_Add3(vertexNormals3[idxB], triNormal3);
            else
                vertexNormals3[idxB] = triNormal3;
            if (vertexNormals3[idxC])
                vertexNormals3[idxC] = M_Add3(vertexNormals3[idxC], triNormal3);
            else
                vertexNormals3[idxC] = triNormal3;
        }
        /* group individual vertex normals into triangles */
        for (var i = 0; i < nTriangles; ++i) {
            var tri3Data = triangles[i];
            triVertexNormals3[i] = Tri3(vertexNormals3[tri3Data[0]], vertexNormals3[tri3Data[1]], vertexNormals3[tri3Data[2]]);
        }
    }
    function R_InitUVTable(vertices, triangles, nTriangles) {
        uvTable3 = Array(nTriangles);
        textureTable = Array(nTriangles);
        for (var i = 0; i < nTriangles; ++i) {
            var uvFace = triangles[i];
            var texUVA2 = vertices[uvFace.a];
            var texUVB2 = vertices[uvFace.b];
            var texUVC2 = vertices[uvFace.c];
            /* FIXME: add `Tri2` & `Vec2` */
            uvTable3[i] = Tri3(Vec3(texUVA2[0], texUVA2[1], 1), Vec3(texUVB2[0], texUVB2[1], 1), Vec3(texUVC2[0], texUVC2[1], 1));
            textureTable[i] = uvFace.textureId;
        }
    }
    /* TODO: add functionality here to allow updating parts of the geometry as
     * opposed to the entire model (you mean animation?)
     */
    function R_UpdateWorld() {
        R_UpdateLight(pso);
        if (doGlobalRotation) {
            globalRotation += 0.1;
            for (var i = 0; i < nTris; ++i) {
                transformedTris3[i] = M_RotateTriAroundAxis3(tris3[i], globalRotationAxis, globalRotation);
                transformedTriVertexNormals3[i] = M_RotateTriAroundAxis3(triVertexNormals3[i], globalRotationAxis, globalRotation);
            }
        }
        else {
            globalRotation = 0;
            for (var i = 0; i < nTris; ++i) {
                transformedTris3[i] = tris3[i];
                transformedTriVertexNormals3[i] = triVertexNormals3[i];
            }
        }
    }
    /* TODO: improve the crude frustum-culling technique used here */
    function R_FrustumCull(triView) {
        var triAABB3 = M_AABB3FromTri3(triView);
        return M_BoundingBoxVsBoundingBoxCollision3(FRUSTUM_AABB3, triAABB3);
    }
    function R_CullGeometry() {
        var nTrianglesAfterCulling = 0;
        for (var i = 0; i < nTris; ++i) {
            var triView = R_TriToViewSpace(transformedTris3[i]);
            var aView = triView[0];
            if (
            // frustum-culling: is the triangle at least partially within
            // the view frustum?
            R_FrustumCull(triView) &&
                // backface-culling: is the triangle facing the camera?
                M_IsInFrontOfPlane3(ORIGIN, aView, M_TriNormal3(triView))
            // TODO: implement occlusion-culling
            )
                culledBuffer[nTrianglesAfterCulling++] = i;
        }
        nCulledBuffer = nTrianglesAfterCulling;
    }
    /* TODO: make a generic function that takes in as arguments the `planeRef` &
     * `planeNormal` to clip the geometry against, possibly, maybe??
     */
    //
    // R_ClipGeometryAgainstNearPlane
    // Clip the given triangle against the near-clipping plane of the view
    // frustum
    //
    // Expects the input triangle `triView` to be in view space.
    //
    function R_ClipGeometryAgainstNearPlane(triView, clippedTriQueue, triVertexNormals, clippedTriVertexNormalQueue) {
        var nVerticesInside = 0;
        var inside = Array(4), nInside = Array(4);
        /* test each vertex in the original triangle against the near-clipping
         * plane to see whether they fall inside of the plane or not
         */
        for (var i = 0; i < 3; ++i) {
            var iNext = i === 2 ? 0 : i + 1;
            var v = triView[i], vNext = triView[iNext];
            var n = triVertexNormals[i], nNext = triVertexNormals[iNext];
            var vInside = v[2] >= Z_NEAR, vNextInside = vNext[2] >= Z_NEAR;
            if (vInside) {
                inside[nVerticesInside] = v;
                nInside[nVerticesInside++] = n;
            }
            /* if the edge of the triangle formed by vertices `v` & `vNext`
             * intersects the near-clipping plane, store the point of
             * intersection as an "inside" vertex
             */
            // @ts-ignore >:[
            if (vInside ^ vNextInside) {
                var t = M_TimeBeforePlaneCollision3(v, vNext, projectionOrigin, FWD);
                var intersect = M_Add3(M_Scale3(M_Sub3(vNext, v), t), v);
                var intersectN = M_Add3(M_Scale3(M_Sub3(nNext, n), t), n);
                inside[nVerticesInside] = intersect;
                nInside[nVerticesInside++] = intersectN;
            }
        }
        // early return: no vertices lie inside/in front of the near-clipping
        // plane, should cull the entire triangle
        if (!nVerticesInside)
            return 0;
        /* the vertices that fall inside the near-clipping plane form a
         * triangle, add it to the clip-buffer
         */
        clippedTriQueue[0] = Tri3(inside[0], inside[1], inside[2]);
        /* ...the same goes for the vertex normals */
        clippedTriVertexNormalQueue[0] =
            Tri3(nInside[0], nInside[1], nInside[2]);
        /* the vertices that fall inside the near-clipping plane form a quad,
         * triangulate it by forming an additional triangle and save that in the
         * clip-buffer
         */
        if (nVerticesInside === 4) {
            clippedTriQueue[1] = Tri3(inside[2], inside[3], inside[0]);
            /* ...the same goes for the vertex normals */
            clippedTriVertexNormalQueue[1] =
                Tri3(nInside[2], nInside[3], nInside[0]);
        }
        return nVerticesInside - 2; // triangulation of an n-gon
    }
    /* TODO: make a generic function that takes in as arguments the `planeRef` &
     * `planeNormal` to clip the geometry against, possibly, maybe??
     */
    //
    // R_ClipGeometryAgainstNearPlane_Textured
    // Clip the given triangle, along with the UV-map and the vertex normals
    // associated with each of its vertices, against the near-clipping plane of
    // the view frustum
    //
    // Expects the input triangle `triView` to be in view space — UV-map and
    // vertex normals can be in any arbitrary space.
    //
    function R_ClipGeometryAgainstNearPlane_Textured(triView, clippedTriQueue, triVertexNormals, clippedTriVertexNormalQueue, uvMap, clippedUvMapQueue) {
        var nVerticesInside = 0;
        var inside = Array(4);
        var nInside = Array(4);
        var uvInside = Array(4);
        /* test each vertex in the original triangle against the near-clipping
         * plane to see whether they fall inside of the plane or not
         */
        for (var i = 0; i < 3; ++i) {
            var iNext = i === 2 ? 0 : i + 1;
            var v = triView[i], vNext = triView[iNext];
            var n = triVertexNormals[i], nNext = triVertexNormals[iNext];
            var uv = uvMap[i], uvNext = uvMap[iNext];
            var vInside = v[2] >= Z_NEAR, vNextInside = vNext[2] >= Z_NEAR;
            if (vInside) {
                inside[nVerticesInside] = v;
                nInside[nVerticesInside] = n;
                uvInside[nVerticesInside++] = uv;
            }
            /* if the edge of the triangle formed by vertices `v` & `vNext`
             * intersects the near-clipping plane, store the point of
             * intersection as an "inside" vertex
             */
            // @ts-ignore >:[
            if (vInside ^ vNextInside) {
                var t = M_TimeBeforePlaneCollision3(v, vNext, projectionOrigin, FWD);
                var intersect = M_Add3(M_Scale3(M_Sub3(vNext, v), t), v);
                var intersectN = M_Add3(M_Scale3(M_Sub3(nNext, n), t), n);
                var intersectUV = M_Add3(M_Scale3(M_Sub3(uvNext, uv), t), uv);
                inside[nVerticesInside] = intersect;
                nInside[nVerticesInside] = intersectN;
                uvInside[nVerticesInside++] = intersectUV;
            }
        }
        // early return: no vertices lie inside/in front of the near-clipping
        // plane, should cull the entire triangle
        if (!nVerticesInside)
            return 0;
        /* the vertices that fall inside the near-clipping plane form a
         * triangle, add it to the clip-buffer...
         */
        clippedTriQueue[0] = Tri3(inside[0], inside[1], inside[2]);
        /* ...the same goes for the vertex normals */
        clippedTriVertexNormalQueue[0] =
            Tri3(nInside[0], nInside[1], nInside[2]);
        // ...the same goes for the vertices in the texture space
        clippedUvMapQueue[0] = Tri3(uvInside[0], uvInside[1], uvInside[2]);
        /* the vertices that fall inside the near-clipping plane form a quad,
         * triangulate it by forming an additional triangle and save that in the
         * clip-buffer...
         */
        if (nVerticesInside === 4) {
            clippedTriQueue[1] = Tri3(inside[2], inside[3], inside[0]);
            /* ...the same goes for the vertex normals */
            clippedTriVertexNormalQueue[1] =
                Tri3(nInside[2], nInside[3], nInside[0]);
            // ...the same goes for the vertices in the texture space
            clippedUvMapQueue[1] = Tri3(uvInside[2], uvInside[3], uvInside[0]);
        }
        return nVerticesInside - 2; // triangulation of an n-gon
    }
    function R_SortTwoTrianglesInCulledBuffer(tri0, tri1) {
        var tri0View = R_TriToViewSpace(transformedTris3[tri0]);
        var tri1View = R_TriToViewSpace(transformedTris3[tri1]);
        return tri1View[0][2] + tri1View[1][2] + tri1View[2][2] -
            tri0View[0][2] - tri0View[1][2] - tri0View[2][2];
    }
    /* TODO: unused for the time being, going to be useful once more advanced
     * features like translucency are implemented
     */
    // @ts-ignore
    function R_SortGeometry() {
        var sorted = culledBuffer
            .slice(0, nCulledBuffer)
            .sort(R_SortTwoTrianglesInCulledBuffer);
        culledBuffer = new Uint32Array(Array.from(sorted).concat(Array(nTris - nCulledBuffer).fill(0)));
    }
    function R_RenderGeomeries_Wireframe(nTrisOnScreen) {
        var trisRendered = 0;
        /* go over and render all of the triangles that survived culling */
        for (var i = 0; i < nCulledBuffer; ++i) {
            var triIndex = culledBuffer[i];
            var triWorld = transformedTris3[triIndex];
            var triView = R_TriToViewSpace(triWorld);
            // keep a buffer of clipped triangles for drawing
            var clippedTriQueue = Array(2);
            var clippedTriVertexNormalQueue = Array(2);
            var nClipResult = R_ClipGeometryAgainstNearPlane(triView, clippedTriQueue, transformedTriVertexNormals3[triIndex], clippedTriVertexNormalQueue);
            for (var j = 0; j < nClipResult; ++j) {
                var triViewClipped = clippedTriQueue[j];
                var triClip = R_TriToClipSpace(triViewClipped);
                var aClip3 = triClip[0];
                var bClip3 = triClip[1];
                var cClip3 = triClip[2];
                var ax = aClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var ay = aClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                var bx = bClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var by = bClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                var cx = cClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var cy = cClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                R_DrawTriangle_Wireframe(ax, ay, bx, by, cx, cy, 255, 255, 255, 255, 2);
                if (pso.mode & R_ShaderMode_Normals)
                    R_RenderNormals(R_TriToWorldSpace(triViewClipped), clippedTriVertexNormalQueue[j]);
                ++trisRendered;
            }
        }
        nTrisOnScreen[0] = trisRendered;
        nTrisOnScreen[1] = nCulledBuffer;
    }
    function R_RenderGeomeries_ColorFill(nTrisOnScreen) {
        var trisRendered = 0;
        /* go over and render all of the triangles that survived culling */
        for (var i = 0; i < nCulledBuffer; ++i) {
            var triIndex = culledBuffer[i];
            var triWorld = transformedTris3[triIndex];
            var triView = R_TriToViewSpace(triWorld);
            // the original triangle after having clipped against the near-plane
            var clippedTriQueue = Array(2);
            // the vertex normals after having clipped against the near-plane
            var clippedTriVertexNormalQueue = Array(2);
            var nClipResult = R_ClipGeometryAgainstNearPlane(triView, clippedTriQueue, transformedTriVertexNormals3[triIndex], clippedTriVertexNormalQueue);
            /* calculate the surface normal if the shader mode is set to
             * flat-shading
             */
            if (nClipResult && !(pso.mode & R_ShaderMode_Smooth)) {
                var triNormal = M_TriNormal3(triWorld);
                pso.normalX = triNormal[0];
                pso.normalY = triNormal[1];
                pso.normalZ = triNormal[2];
            }
            else {
                pso.normalX = undefined;
                pso.normalY = undefined;
                pso.normalZ = undefined;
            }
            for (var j = 0; j < nClipResult; ++j) {
                var triViewClipped = clippedTriQueue[j];
                var triWorldClipped = R_TriToWorldSpace(triViewClipped);
                var triVertexNormals = clippedTriVertexNormalQueue[j];
                var triClip = R_TriToClipSpace(triViewClipped);
                var aClip3 = triClip[0];
                var bClip3 = triClip[1];
                var cClip3 = triClip[2];
                var ax = aClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var ay = aClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                var bx = bClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var by = bClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                var cx = cClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var cy = cClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                /* TODO: consider using the actual non-linear depth values,
                 * `triClip[i][2]`, i.e., the `z` in `gl_FragCoord`, in the
                 * depth-buffering (and in depth-buffering only, not in
                 * perspective-correction) instead
                 */
                var az = 1 / triViewClipped[0][2];
                var bz = 1 / triViewClipped[1][2];
                var cz = 1 / triViewClipped[2][2];
                /* configure the vertex shader object for the draw call */
                vso.ax = ax;
                vso.ay = ay;
                vso.az = az;
                vso.bx = bx;
                vso.by = by;
                vso.bz = bz;
                vso.cx = cx;
                vso.cy = cy;
                vso.cz = cz;
                /* vertex normals used in smooth shading */
                var aNormal3 = triVertexNormals[0];
                var bNormal3 = triVertexNormals[1];
                var cNormal3 = triVertexNormals[2];
                var nAX = aNormal3[0], nAY = aNormal3[1], nAZ = aNormal3[2];
                var nBX = bNormal3[0], nBY = bNormal3[1], nBZ = bNormal3[2];
                var nCX = cNormal3[0], nCY = cNormal3[1], nCZ = cNormal3[2];
                vso.nax = nAX;
                vso.nay = nAY;
                vso.naz = nAZ;
                vso.nbx = nBX;
                vso.nby = nBY;
                vso.nbz = nBZ;
                vso.ncx = nCX;
                vso.ncy = nCY;
                vso.ncz = nCZ;
                /* world space vertex coordinates used in point lighting */
                var a3 = triWorldClipped[0];
                var b3 = triWorldClipped[1];
                var c3 = triWorldClipped[2];
                var wAX = a3[0], wAY = a3[1], wAZ = a3[2];
                var wBX = b3[0], wBY = b3[1], wBZ = b3[2];
                var wCX = c3[0], wCY = c3[1], wCZ = c3[2];
                vso.wax = wAX;
                vso.way = wAY;
                vso.waz = wAZ;
                vso.wbx = wBX;
                vso.wby = wBY;
                vso.wbz = wBZ;
                vso.wcx = wCX;
                vso.wcy = wCY;
                vso.wcz = wCZ;
                /* FIXME: clip these color coordinates as well, along with the
                 * vertices of the triangle, maybe??
                 */
                // assign each vertex a specific color to be interpolated across
                // the entire triangle
                vso.ar = 255;
                vso.ag = 255;
                vso.ab = 255;
                vso.br = 255;
                vso.bg = 255;
                vso.bb = 255;
                vso.cr = 255;
                vso.cg = 255;
                vso.cb = 255;
                R_FillTriangle_Colored(vso, pso);
                if (pso.mode & R_ShaderMode_Wireframe)
                    R_DrawTriangle_Wireframe(ax, ay, bx, by, cx, cy, 0, 0, 0, 255, 2);
                if (pso.mode & R_ShaderMode_Normals)
                    R_RenderNormals(triWorldClipped, triVertexNormals);
                ++trisRendered;
            }
        }
        nTrisOnScreen[0] = trisRendered;
        nTrisOnScreen[1] = nCulledBuffer;
    }
    function R_RenderGeometries_TextureFill(nTrisOnScreen) {
        var trisRendered = 0;
        // early return if the mesh does not have texture-mapping
        if (!uvTable3)
            return;
        /* go over and render all of the triangles that survived culling */
        for (var i = 0; i < nCulledBuffer; ++i) {
            var triIndex = culledBuffer[i];
            var triWorld = transformedTris3[triIndex];
            var triView = R_TriToViewSpace(triWorld);
            var uvMap = uvTable3[triIndex];
            // the original triangle after having clipped against the near-plane
            var clippedTriQueue = Array(2);
            // the vertex normals after having clipped against the near-plane
            var clippedTriVertexNormalQueue = Array(2);
            // the uv-map after having clipped against the near-plane
            var clippedUvMapQueue = Array(2);
            var nClipResult = R_ClipGeometryAgainstNearPlane_Textured(triView, clippedTriQueue, transformedTriVertexNormals3[triIndex], clippedTriVertexNormalQueue, uvMap, clippedUvMapQueue);
            /* calculate the surface normal if the shader mode is set to
             * flat-shading
             */
            if (nClipResult && !(pso.mode & R_ShaderMode_Smooth)) {
                var triNormal = M_TriNormal3(triWorld);
                pso.normalX = triNormal[0];
                pso.normalY = triNormal[1];
                pso.normalZ = triNormal[2];
            }
            else {
                pso.normalX = undefined;
                pso.normalY = undefined;
                pso.normalZ = undefined;
            }
            // grab the texture and pass it along to the pixel shader object
            pso.tex = A_Texture(textureTable[triIndex]);
            for (var j = 0; j < nClipResult; ++j) {
                var triViewClipped = clippedTriQueue[j];
                var triWorldClipped = R_TriToWorldSpace(triViewClipped);
                var triVertexNormals = clippedTriVertexNormalQueue[j];
                var uvClipped = clippedUvMapQueue[j];
                var triClip = R_TriToClipSpace(triViewClipped);
                var aClip3 = triClip[0];
                var bClip3 = triClip[1];
                var cClip3 = triClip[2];
                var ax = aClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var ay = aClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                var bx = bClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var by = bClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                var cx = cClip3[0] * SCREEN_W_2 + SCREEN_W_2;
                var cy = cClip3[1] * SCREEN_H_2 + SCREEN_H_2;
                /* TODO: consider using the actual non-linear depth values,
                 * `triClip[i][2]`, i.e., the `z` in `gl_FragCoord`, in the
                 * depth-buffering (and in depth-buffering only, not in
                 * perspective-correction) instead
                 */
                var az = 1 / triViewClipped[0][2];
                var bz = 1 / triViewClipped[1][2];
                var cz = 1 / triViewClipped[2][2];
                /* configure the vertex shader object for the draw call */
                vso.ax = ax;
                vso.ay = ay;
                vso.az = az;
                vso.bx = bx;
                vso.by = by;
                vso.bz = bz;
                vso.cx = cx;
                vso.cy = cy;
                vso.cz = cz;
                /* UV coordinates for texture-mapping */
                var aUV = uvClipped[0];
                var bUV = uvClipped[1];
                var cUV = uvClipped[2];
                var au = aUV[0], av = aUV[1];
                var bu = bUV[0], bv = bUV[1];
                var cu = cUV[0], cv = cUV[1];
                vso.au = au;
                vso.av = av;
                vso.bu = bu;
                vso.bv = bv;
                vso.cu = cu;
                vso.cv = cv;
                /* vertex normals used in smooth shading */
                var aNormal3 = triVertexNormals[0];
                var bNormal3 = triVertexNormals[1];
                var cNormal3 = triVertexNormals[2];
                var nAX = aNormal3[0], nAY = aNormal3[1], nAZ = aNormal3[2];
                var nBX = bNormal3[0], nBY = bNormal3[1], nBZ = bNormal3[2];
                var nCX = cNormal3[0], nCY = cNormal3[1], nCZ = cNormal3[2];
                vso.nax = nAX;
                vso.nay = nAY;
                vso.naz = nAZ;
                vso.nbx = nBX;
                vso.nby = nBY;
                vso.nbz = nBZ;
                vso.ncx = nCX;
                vso.ncy = nCY;
                vso.ncz = nCZ;
                /* world space vertex coordinates used in point lighting */
                var a3 = triWorldClipped[0];
                var b3 = triWorldClipped[1];
                var c3 = triWorldClipped[2];
                var wAX = a3[0], wAY = a3[1], wAZ = a3[2];
                var wBX = b3[0], wBY = b3[1], wBZ = b3[2];
                var wCX = c3[0], wCY = c3[1], wCZ = c3[2];
                vso.wax = wAX;
                vso.way = wAY;
                vso.waz = wAZ;
                vso.wbx = wBX;
                vso.wby = wBY;
                vso.wbz = wBZ;
                vso.wcx = wCX;
                vso.wcy = wCY;
                vso.wcz = wCZ;
                R_FillTriangle_Textured_Perspective(vso, pso);
                if (pso.mode & R_ShaderMode_Wireframe)
                    R_DrawTriangle_Wireframe(ax, ay, bx, by, cx, cy, 255, 255, 255, 255, 2);
                if (pso.mode & R_ShaderMode_Normals)
                    R_RenderNormals(triWorldClipped, triVertexNormals);
                ++trisRendered;
            }
        }
        nTrisOnScreen[0] = trisRendered;
        nTrisOnScreen[1] = nCulledBuffer;
    }
    //
    // R_RenderLine
    // Render a 3-D line
    //
    // Vertices `src` and `dest` are in world space
    //
    function R_RenderLine(src, dest, r, g, b, a, stroke) {
        var srcView = R_VecToViewSpace(src);
        var destView = R_VecToViewSpace(dest);
        var zNear = projectionOrigin[2];
        var zSrc = srcView[2], zDest = destView[2];
        var srcClip, destClip;
        // both ends of the line are behind the near-clipping plane, nothing to
        // draw, exit early
        if (zSrc < zNear && zDest < zNear)
            return;
        // both ends of the line are in front of the near-clipping plane, no
        // need to clip
        if (zSrc >= zNear && zDest >= zNear) {
            srcClip = R_VecToClipSpace(srcView);
            destClip = R_VecToClipSpace(destView);
        }
        /* one end of the line is behind, while the other is in front: it has to
         * be clipped against the near-clipping plane
         */
        else {
            var intersect = M_LineSegmentVsPlaneCollision3(srcView, destView, projectionOrigin, FWD);
            if (!intersect)
                return; // how would this ever happen!?
            /* clip the `src` endpoint */
            if (zDest > zSrc) {
                srcClip = R_VecToClipSpace(intersect);
                destClip = R_VecToClipSpace(destView);
            }
            /* clip the `dest` endpoint */
            else {
                srcClip = R_VecToClipSpace(srcView);
                destClip = R_VecToClipSpace(intersect);
            }
        }
        R_DrawLine(srcClip[0] * SCREEN_W_2 + SCREEN_W_2, srcClip[1] * SCREEN_H_2 + SCREEN_H_2, destClip[0] * SCREEN_W_2 + SCREEN_W_2, destClip[1] * SCREEN_H_2 + SCREEN_H_2, r, g, b, a, stroke);
    }
    function R_RenderDebugAxes(length) {
        R_RenderLine(ORIGIN, M_Scale3(RIGHT, length), 255, 0, 0, 255, 2);
        R_RenderLine(ORIGIN, M_Scale3(DOWN, length), 0, 255, 0, 255, 2);
        R_RenderLine(ORIGIN, M_Scale3(FWD, length), 0, 0, 255, 255, 2);
    }
    function R_RenderNormals(triWorldClipped, vertexNormals) {
        /* draw vertex normals */
        R_RenderLine(triWorldClipped[0], M_Add3(triWorldClipped[0], M_Norm3(vertexNormals[0])), 255, 255, 255, 255, 2);
        R_RenderLine(triWorldClipped[1], M_Add3(triWorldClipped[1], M_Norm3(vertexNormals[1])), 255, 255, 255, 255, 2);
        R_RenderLine(triWorldClipped[2], M_Add3(triWorldClipped[2], M_Norm3(vertexNormals[2])), 255, 255, 255, 255, 2);
        /* draw surface normals */
        var triNormal = M_TriNormal3(triWorldClipped);
        var m = M_Add3(triWorldClipped[0], triWorldClipped[1]);
        m = M_Scale3(M_Add3(m, triWorldClipped[2]), 1 / 3);
        R_RenderLine(m, M_Add3(m, triNormal), 255, 0, 255, 255, 2);
    }
    function R_RenderGeometries(nTrisOnScreen) {
        R_CullGeometry();
        if (pso.mode & R_ShaderMode_Fill) {
            if (pso.mode & R_ShaderMode_Texture)
                R_RenderGeometries_TextureFill(nTrisOnScreen);
            else
                R_RenderGeomeries_ColorFill(nTrisOnScreen);
        }
        else
            R_RenderGeomeries_Wireframe(nTrisOnScreen);
        if (DEBUG_MODE)
            R_RenderDebugAxes(1000);
    }
    function R_Tris() {
        return tris3;
    }
    window.__import__R_Geometry = function () {
        return {
            R_ToggleGlobalRotation: R_ToggleGlobalRotation,
            R_LoadGeometry: R_LoadGeometry,
            R_InitUVTable: R_InitUVTable,
            R_UpdateWorld: R_UpdateWorld,
            R_RenderLine: R_RenderLine,
            R_RenderGeometries: R_RenderGeometries,
            R_Tris: R_Tris,
        };
    };
})();
