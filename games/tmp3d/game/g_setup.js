/*
 *  g_setup.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-02-13.
 *
 *  SYNOPSIS:
 *      The module for setting up various controllers, including I/O, static
 *      game data, and 3-D meshes for the engine to run off of.
 */
(function () {
    var A_LoadTextures = __import__A_Assets().A_LoadTextures;
    var AN_CancelAnimation = __import__AN_Animation().AN_CancelAnimation;
    var _a = __import__D_Mesh(), D_TextureAtlas = _a.D_TextureAtlas, D_Triangles = _a.D_Triangles, D_UV = _a.D_UV, D_UVMap = _a.D_UVMap, D_Vertices = _a.D_Vertices;
    var _b = __import__D_Player(), D_Eye = _b.D_Eye, D_Velocity = _b.D_Velocity;
    var _c = __import__D_GlobTextures(), D_GlobTextureFilenameTable = _c.D_GlobTextureFilenameTable, D_GlobTextureIdTable = _c.D_GlobTextureIdTable;
    var _d = __import__G_Const(), ASPECT = _d.ASPECT, FOV_Y = _d.FOV_Y, Z_NEAR = _d.Z_NEAR, Z_FAR = _d.Z_FAR;
    var _e = __import__I_Input(), I_InitKeyboard = _e.I_InitKeyboard, I_InitMouse = _e.I_InitMouse;
    var R_InitCamera = __import__R_Camera().R_InitCamera;
    var _f = __import__R_Draw(), R_InitFrameBuffer = _f.R_InitFrameBuffer, R_InitZBuffer = _f.R_InitZBuffer;
    var _g = __import__R_Drawers(), R_ErrorDrawer = _g.R_ErrorDrawer, R_LoadingDrawer = _g.R_LoadingDrawer;
    var _h = __import__R_Geometry(), R_InitUVTable = _h.R_InitUVTable, R_LoadGeometry = _h.R_LoadGeometry;
    var R_ScreenElement = __import__R_Screen().R_ScreenElement;
    var eye = D_Eye();
    var vertices = D_Vertices(), triangles = D_Triangles();
    var uvs = D_UV(), uvMap = D_UVMap(), textureAtlas = D_TextureAtlas();
    function G_LoadTextures() {
        var meshTextureIds = Object.keys(textureAtlas);
        var globTextureIds = Object.keys(D_GlobTextureIdTable);
        var textureIds = meshTextureIds.concat(globTextureIds);
        var meshTextureFilenames = Object.values(textureAtlas);
        var globTextureFilenames = Object.values(D_GlobTextureFilenameTable);
        var textureFilenames = meshTextureFilenames
            .concat(globTextureFilenames);
        var numTextures = textureFilenames.length;
        return A_LoadTextures(textureIds, textureFilenames, numTextures);
    }
    function G_SetupPromise() {
        return G_LoadTextures();
        // TODO: other async operations will go here, chained by `.then`s
    }
    function G_Setup() {
        // initialize the frame buffer first, before anything could be drawn on
        // the screen
        R_InitFrameBuffer();
        // play a loading animation during the setup procedure
        var resolution = { loadingId: R_LoadingDrawer() };
        /* sync operations */
        try {
            I_InitKeyboard(document);
            I_InitMouse(R_ScreenElement);
            R_InitZBuffer();
            R_InitCamera(FOV_Y, ASPECT, Z_NEAR, Z_FAR, eye, D_Velocity);
            R_LoadGeometry(vertices, vertices.length, triangles, triangles.length);
            /* initialize the uv table if the mesh data have texture-mapping */
            if (uvs.length && uvMap.length)
                R_InitUVTable(uvs, uvMap, uvMap.length);
        }
        catch (error) {
            AN_CancelAnimation(resolution.loadingId);
            R_ErrorDrawer("setup error");
            throw error;
        }
        /* async operations */
        return G_SetupPromise()
            .then(function G_SetupResolver() {
            return resolution;
        })
            .catch(function G_SetupRejector() {
            AN_CancelAnimation(resolution.loadingId);
            R_ErrorDrawer("setup error");
            return undefined;
        });
    }
    window.__import__G_Setup = function () {
        return { G_Setup: G_Setup };
    };
})();
