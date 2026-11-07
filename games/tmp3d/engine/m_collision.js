/*
 *  m_collision.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-10-07.
 *
 *  SYNOPSIS:
 *      Routines for detecting various collisions in 2-D and 3-D.
 */
(function () {
    var _a = __import__M_Vec2(), M_Add2 = _a.M_Add2, M_Cross2 = _a.M_Cross2, M_Scale2 = _a.M_Scale2, M_Sub2 = _a.M_Sub2, Vec2 = _a.M_Vec2;
    var _b = __import__M_Vec3(), M_Add3 = _b.M_Add3, M_DistToPlane3 = _b.M_DistToPlane3, M_Scale3 = _b.M_Scale3, M_Sub3 = _b.M_Sub3;
    function M_LineVsLine2(ax, ay, bx, by, cx, cy, dx, dy, segment) {
        var a = Vec2(ax, ay), b = Vec2(bx, by);
        var c = Vec2(cx, cy), d = Vec2(dx, dy);
        var s = M_Sub2(b, a), t = M_Sub2(d, c);
        var c_a = M_Sub2(c, a);
        var denom = 1 / M_Cross2(s, t);
        var X = M_Cross2(c_a, t) * denom;
        if (segment) {
            var Y = M_Cross2(c_a, s) * denom;
            if (X < 0 || X > 1 || Y < 0 || Y > 1)
                return;
        }
        return M_Add2(a, M_Scale2(s, X));
    }
    function M_TimeBeforePlaneCollision3(lineSrc, lineDest, planeRef, planeNormal) {
        var distToPlaneSrc = M_DistToPlane3(lineSrc, planeRef, planeNormal);
        var distToPlaneDest = M_DistToPlane3(lineDest, planeRef, planeNormal);
        /* if both ends of the line segment are on the same side of the plane,
         * then they do not intersect--return immediately
         */
        if (distToPlaneSrc >= 0 && distToPlaneDest >= 0 ||
            distToPlaneSrc < 0 && distToPlaneDest < 0)
            return;
        var absDistToPlaneSrc = Math.abs(distToPlaneSrc);
        var absDistToPlaneDest = Math.abs(distToPlaneDest);
        // how far we should walk along the line segment, from its start, before
        // we get to the intersection with the plane
        return absDistToPlaneSrc / (absDistToPlaneSrc + absDistToPlaneDest);
    }
    function M_LineSegmentVsPlaneCollision3(lineSrc, lineDest, planeRef, planeNormal) {
        var scale = M_TimeBeforePlaneCollision3(lineSrc, lineDest, planeRef, planeNormal);
        if (scale === undefined)
            return; // early return if there's no collision
        return M_Add3(lineSrc, M_Scale3(M_Sub3(lineDest, lineSrc), scale));
    }
    function M_BoundingBoxVsBoundingBoxCollision3(aabb0, aabb1) {
        return aabb0[0] + aabb0[3] > aabb1[0] &&
            aabb1[0] + aabb1[3] >= aabb0[0] &&
            aabb0[1] + aabb0[4] > aabb1[1] &&
            aabb1[1] + aabb1[4] >= aabb0[1] &&
            aabb0[2] + aabb0[5] > aabb1[2] &&
            aabb1[2] + aabb1[5] >= aabb0[2];
    }
    window.__import__M_Collision = function () {
        return {
            M_LineVsLine2: M_LineVsLine2,
            M_TimeBeforePlaneCollision3: M_TimeBeforePlaneCollision3,
            M_LineSegmentVsPlaneCollision3: M_LineSegmentVsPlaneCollision3,
            M_BoundingBoxVsBoundingBoxCollision3: M_BoundingBoxVsBoundingBoxCollision3,
        };
    };
})();
