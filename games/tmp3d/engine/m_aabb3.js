/*
 *  m_aabb3.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-11-20.
 *
 *  SYNOPSIS:
 *      3-D axis-aligned bounding-box.
 */
(function () {
    function M_AABB3(origin3, dimensions3) {
        return Float32Array.from([
            origin3[0], origin3[1], origin3[2],
            dimensions3[0], dimensions3[1], dimensions3[2]
        ]);
    }
    window.__import__M_AABB3 = function () {
        return { M_AABB3: M_AABB3 };
    };
})();
