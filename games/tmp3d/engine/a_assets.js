/*
 *  a_assets.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-05-03.
 *
 *  SYNOPSIS:
 *      The module that allows loading game assets into the memory and accessing
 *      them on-the-fly.
 */
(function () {
    var TEXTURES_LUT = {};
    function A_ToBitmap(texture) {
        var textureWidth = texture.width, textureHeight = texture.height;
        var tmpCanvas = document.createElement("canvas");
        var tmpCtx = tmpCanvas.getContext("2d");
        tmpCanvas.width = textureWidth;
        tmpCanvas.height = textureHeight;
        tmpCtx.drawImage(texture, 0, 0);
        return tmpCtx.getImageData(0, 0, textureWidth, textureHeight).data;
    }
    function A_OnTextureLoad(resolve, texture, id) {
        TEXTURES_LUT[id] = {
            id: id,
            bitmap: A_ToBitmap(texture),
            width: texture.width,
            height: texture.height,
        };
        resolve();
    }
    function A_TexturePromise(id, filename) {
        return new Promise(function A_TexturePromiseExecutor(resolve, reject) {
            var texture = new Image();
            texture.onload = A_OnTextureLoad.bind(texture, resolve, texture, id);
            texture.onerror = reject;
            texture.src = filename;
        });
    }
    function A_LoadTextures(ids, filenames, numTextures) {
        // TODO: throw an error should the `filenames` and `ids` have different
        // lengths, maybe??
        var texturePromises = Array(numTextures);
        for (var i = 0; i < numTextures; ++i)
            texturePromises[i] = A_TexturePromise(ids[i], filenames[i]);
        return Promise.all(texturePromises);
    }
    function A_Texture(id) {
        return TEXTURES_LUT[id];
    }
    window.__import__A_Assets = function () {
        return { A_LoadTextures: A_LoadTextures, A_Texture: A_Texture };
    };
})();
