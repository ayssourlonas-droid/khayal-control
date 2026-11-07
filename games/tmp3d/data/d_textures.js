/*
 *  d_textures.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-05-03.
 *
 *  SYNOPSIS:
 *      Lookup tables for "global" textures.
 */
(function () {
    var GLOB_TEXTURE_ID_TABLE = { TITLE_TMP3D: "TITLE_TMP3D" };
    function D_GlobTextureIdTable() {
        return GLOB_TEXTURE_ID_TABLE;
    }
    function D_GlobTextureFilenameTable() {
        var _a;
        return _a = {}, _a[GLOB_TEXTURE_ID_TABLE.TITLE_TMP3D] = "textures/tmp3d_2x.png", _a;
    }
    window.__import__D_GlobTextures = function () {
        return {
            D_GlobTextureIdTable: D_GlobTextureIdTable(),
            D_GlobTextureFilenameTable: D_GlobTextureFilenameTable(),
        };
    };
})();
