/*
 *  r_drawers.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-05-03.
 *
 *  SYNOPSIS:
 *     Module that houses some static drawer routines that render various
 *     menus, screens, etc.
 */
(function () {
    var AN_StartAnimation = __import__AN_Animation().AN_StartAnimation;
    var _a = __import__G_Const(), SCREEN_W = _a.SCREEN_W, SCREEN_H = _a.SCREEN_H, SCREEN_W_2 = _a.SCREEN_W_2, SCREEN_H_2 = _a.SCREEN_H_2;
    var _b = __import__R_Draw(), R_DrawImage = _b.R_DrawImage, R_FillRect = _b.R_FillRect, R_FlushFrame = _b.R_FlushFrame, R_Print = _b.R_Print;
    var R_Ctx = __import__R_Screen().R_Ctx;
    var N_LOADING_STATES = 4, LOADING_INTERVAL = 375;
    var LOADING_FONT_COLOR = "#FFFFFF";
    var LOADING_FONT_SIZE = 36;
    var TITLE_INTERVAL = 375;
    var TITLE_FONT_COLOR = "#FFFFFF";
    var TITLE_PRIMARY_FONT_SIZE = 32, TITLE_SECONDARY_FONT_SIZE = 16;
    var ERROR_PREFIX = "fatal error: ";
    var ERROR_FONT_COLOR = "#FF0000";
    var ERROR_FONT_SIZE = 16;
    var remainingOnScreenMsgTicks = 0;
    var onScreenMsg;
    function R_DrawLoadingFrame(index) {
        var dots = Array(index % N_LOADING_STATES).fill(".").join("");
        R_Ctx.fillStyle = "#000000";
        R_Ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        R_Print("Loading" + dots, SCREEN_W_2 - 75, SCREEN_H_2, LOADING_FONT_COLOR, LOADING_FONT_SIZE);
    }
    function R_LoadingDrawer(onEnd) {
        return AN_StartAnimation(R_DrawLoadingFrame, LOADING_INTERVAL, undefined, onEnd);
    }
    function R_DrawTitleFrame(index, decor) {
        R_FillRect(0, 0, SCREEN_W, SCREEN_H, 0, 0, 0, 255);
        R_DrawImage(decor, 0, 0, decor.width, decor.height, SCREEN_W_2 - 100, SCREEN_H_2 - 217, decor.width, decor.height);
        R_FlushFrame();
        R_Print("Tmp3D Engine", SCREEN_W_2 - 117, SCREEN_H_2 + 20, TITLE_FONT_COLOR, TITLE_PRIMARY_FONT_SIZE);
        R_Print("v" + __VERSION__, SCREEN_W_2 - 30, SCREEN_H_2 + 44, TITLE_FONT_COLOR, TITLE_SECONDARY_FONT_SIZE);
        R_Print("by Emre Akı, 2022.", SCREEN_W_2 - 86, SCREEN_H_2 + 87, TITLE_FONT_COLOR, TITLE_SECONDARY_FONT_SIZE);
        if (index & 1)
            R_Print("Press any key to start", SCREEN_W_2 - 106, SCREEN_H - 50, TITLE_FONT_COLOR, TITLE_SECONDARY_FONT_SIZE);
    }
    function R_TitleDrawer(decor, onEnd) {
        return AN_StartAnimation(function R_OnTitleFrame(index) {
            R_DrawTitleFrame(index, decor);
        }, TITLE_INTERVAL, undefined, onEnd);
    }
    function R_ErrorDrawer(reason) {
        R_Ctx.fillStyle = "#000000";
        R_Ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
        R_Print(ERROR_PREFIX + reason, 50, SCREEN_H - 50, ERROR_FONT_COLOR, ERROR_FONT_SIZE);
    }
    function R_PrintOnScreenMessage() {
        if (!remainingOnScreenMsgTicks)
            return;
        R_Print(onScreenMsg, 5, SCREEN_H - 5, "#FF0000", 14);
        --remainingOnScreenMsgTicks;
    }
    function R_SetOnScreenMessage(msg, ticks) {
        remainingOnScreenMsgTicks = ticks;
        onScreenMsg = msg;
    }
    window.__import__R_Drawers = function () {
        return {
            R_LoadingDrawer: R_LoadingDrawer,
            R_TitleDrawer: R_TitleDrawer,
            R_ErrorDrawer: R_ErrorDrawer,
            R_PrintOnScreenMessage: R_PrintOnScreenMessage,
            R_SetOnScreenMessage: R_SetOnScreenMessage,
        };
    };
})();
