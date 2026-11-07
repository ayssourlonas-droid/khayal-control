/*
 *  g_const.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-02-13.
 *
 *  SYNOPSIS:
 *       Some common constant values that will not change during the entire
 *       lifetime of the engine.
 */
(function () {
    var Vec3 = __import__M_Vec3().M_Vec3;
    var AABB3 = __import__M_AABB3().M_AABB3;
    var SCREEN_W = 640, SCREEN_H = 480;
    var SCREEN_W_2 = SCREEN_W * 0.5, SCREEN_H_2 = SCREEN_H * 0.5;
    var ASPECT = SCREEN_W / SCREEN_H;
    var FOV_Y = Math.PI / 3, TAN_FOV_Y_2 = Math.tan(FOV_Y * 0.5);
    var FOV_X = 2 * Math.atan(ASPECT * TAN_FOV_Y_2);
    var MAX_MOV_TILT = Math.PI / 90;
    var NEAR_H = 2, NEAR_W = ASPECT * NEAR_H;
    var Z_NEAR = NEAR_H / (2 * TAN_FOV_Y_2), Z_FAR = 500 * Z_NEAR;
    var FAR_W = Z_FAR / Z_NEAR * NEAR_W, FAR_W_2 = FAR_W * 0.5;
    var FAR_H = FAR_W / ASPECT, FAR_H_2 = FAR_H * 0.5;
    var FPS = 30;
    var FRUSTUM_AABB3 = AABB3(Vec3(-FAR_W_2, -FAR_H_2, Z_NEAR), Vec3(FAR_W, FAR_H, Z_FAR - Z_NEAR));
    window.__import__G_Const = function () {
        return {
            FPS: FPS,
            FOV_X: FOV_X,
            FOV_Y: FOV_Y,
            MAX_MOV_TILT: MAX_MOV_TILT,
            SCREEN_W: SCREEN_W,
            SCREEN_H: SCREEN_H,
            SCREEN_W_2: SCREEN_W_2,
            SCREEN_H_2: SCREEN_H_2,
            ASPECT: ASPECT,
            Z_NEAR: Z_NEAR,
            Z_FAR: Z_FAR,
            FRUSTUM_AABB3: FRUSTUM_AABB3,
        };
    };
})();
