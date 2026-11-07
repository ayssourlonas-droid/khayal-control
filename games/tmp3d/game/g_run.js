/*
 *  g_run.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-02-13.
 *
 *  SYNOPSIS:
 *      The main module that houses the routines that are going to kickstart the
 *      engine and update both the game state and the frame buffer at each
 *      frame.
 */
(function () {
    var DEBUG_MODE = window.__DEBUG_MODE__;
    var A_Texture = __import__A_Assets().A_Texture;
    var AN_CancelAnimation = __import__AN_Animation().AN_CancelAnimation;
    var D_GlobTextureIdTable = __import__D_GlobTextures().D_GlobTextureIdTable;
    var FPS = __import__G_Const().FPS;
    var _a = __import__R_Camera(), R_DebugStats = _a.R_DebugStats, R_UpdateCamera = _a.R_UpdateCamera;
    var R_FlushFrame = __import__R_Draw().R_FlushFrame;
    var _b = __import__R_Drawers(), R_PrintOnScreenMessage = _b.R_PrintOnScreenMessage, R_TitleDrawer = _b.R_TitleDrawer;
    var _c = __import__R_Geometry(), R_RenderGeometries = _c.R_RenderGeometries, R_ToggleGlobalRotation = _c.R_ToggleGlobalRotation, R_UpdateWorld = _c.R_UpdateWorld;
    var _d = __import__R_Shader(), R_ChangeFillMode = _d.R_ChangeFillMode, R_ChangeLightingMode = _d.R_ChangeLightingMode, R_TogglePointLight = _d.R_TogglePointLight, R_ToggleWireframe = _d.R_ToggleWireframe, R_ToggleNormals = _d.R_ToggleNormals;
    var TICK_DELAY = 1000 / FPS;
    // the unix timestamp of the latest game tick
    var lastTick;
    var nTrisOnScreen = new Uint32Array(2);
    function G_UpdateScreen(deltaT) {
        R_RenderGeometries(nTrisOnScreen);
        R_FlushFrame();
        if (DEBUG_MODE)
            R_DebugStats(deltaT, nTrisOnScreen);
    }
    function G_UpdateGame(_deltaT) {
        R_UpdateCamera(1); // TODO: take `deltaT` into account
        R_ToggleGlobalRotation();
        R_ToggleWireframe(); // need these to be handled in their own
        R_ChangeFillMode(); // separate listeners so the key strokes
        R_ChangeLightingMode(); // associated with each event can be captured
        R_TogglePointLight(); // individually
        R_ToggleNormals(); //
        R_UpdateWorld();
    }
    function G_Tick(deltaT) {
        G_UpdateGame(deltaT); // update actors & game state
        G_UpdateScreen(deltaT); // update screen buffer
        R_PrintOnScreenMessage(); // print an on-screen message
    }
    function G_AdvanceTick(currentTick) {
        if (lastTick === undefined)
            lastTick = currentTick;
        var deltaT = currentTick - lastTick;
        if (deltaT >= TICK_DELAY) {
            // TODO: consider executing only the screen updates in the `RAF`
            // callback
            G_Tick(deltaT);
            lastTick = currentTick;
        }
        requestAnimationFrame(G_AdvanceTick);
    }
    function G_StartGame(titleId) {
        // first, clear the title screen animation that is running
        AN_CancelAnimation(titleId);
        requestAnimationFrame(G_AdvanceTick); // then, kickstart the game ticks
    }
    function G_Run(setupResolution) {
        if (!setupResolution)
            return; // exit with error
        // first, clear the frame buffer for any further drawing to take place
        R_FlushFrame();
        // then, clear the loading animation that is currently running
        AN_CancelAnimation(setupResolution.loadingId);
        /* finally, start the animation for the title screen */
        var titleId = R_TitleDrawer(A_Texture(D_GlobTextureIdTable.TITLE_TMP3D));
        document.addEventListener("keydown", G_StartGame.bind(undefined, titleId), { once: true });
    }
    window.__import__G_Run = function () {
        return { G_Run: G_Run };
    };
})();
