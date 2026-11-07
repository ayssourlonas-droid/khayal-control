/*
 *  i_input.ts
 *  tmp3d
 *
 *  Created by Emre Akı on 2022-02-13.
 *
 *  SYNOPSIS:
 *      Manage player input on keyboard and mouse.
 */
(function () {
    var _a, _b;
    var KEY = {
        /* special keys */
        RTN: "RTN",
        SPC: "SPC",
        /* arrow keys */
        ARW_DOWN: "ARW_DOWN",
        ARW_LEFT: "ARW_LEFT",
        ARW_RIGHT: "ARW_RIGHT",
        ARW_UP: "ARW_UP",
        /* standard keys */
        A: "A",
        D: "D",
        E: "E",
        F: "F",
        G: "G",
        L: "L",
        N: "N",
        P: "P",
        Q: "Q",
        R: "R",
        S: "S",
        W: "W",
    };
    var KEY_CODES = {
        Enter: KEY.RTN,
        Space: KEY.SPC,
        ArrowLeft: KEY.ARW_LEFT,
        ArrowUp: KEY.ARW_UP,
        ArrowRight: KEY.ARW_RIGHT,
        ArrowDown: KEY.ARW_DOWN,
        KeyA: KEY.A,
        KeyD: KEY.D,
        KeyE: KEY.E,
        KeyF: KEY.F,
        KeyG: KEY.G,
        KeyL: KEY.L,
        KeyN: KEY.N,
        KeyP: KEY.P,
        KeyQ: KEY.Q,
        KeyR: KEY.R,
        KeyS: KEY.S,
        KeyW: KEY.W,
    };
    var MOUSE = {
        LEFT: "LEFT",
        MIDDLE: "MIDDLE",
        RIGHT: "RIGHT",
        BRWS_BWD: "BRWS_BWD",
        BRWS_FWD: "BRWS_FWD",
        MOVING: "MOVING",
        MOVEMENT_X: "MOVEMENT_X",
        MOVEMENT_Y: "MOVEMENT_Y",
        WHEELING: "WHEELING",
        DELTA_WHEEL: "DELTA_WHEEL",
    };
    var MOUSE_CODES = [
        MOUSE.LEFT,
        MOUSE.MIDDLE,
        MOUSE.RIGHT,
        MOUSE.BRWS_BWD,
        MOUSE.BRWS_FWD,
    ];
    var keyState = (_a = {},
        _a[KEY.RTN] = 0,
        _a[KEY.SPC] = 0,
        _a[KEY.ARW_DOWN] = 0,
        _a[KEY.ARW_LEFT] = 0,
        _a[KEY.ARW_RIGHT] = 0,
        _a[KEY.ARW_UP] = 0,
        _a[KEY.A] = 0,
        _a[KEY.D] = 0,
        _a[KEY.E] = 0,
        _a[KEY.F] = 0,
        _a[KEY.G] = 0,
        _a[KEY.L] = 0,
        _a[KEY.N] = 0,
        _a[KEY.P] = 0,
        _a[KEY.Q] = 0,
        _a[KEY.R] = 0,
        _a[KEY.S] = 0,
        _a[KEY.W] = 0,
        _a);
    var mouseState = (_b = {},
        _b[MOUSE.LEFT] = 0,
        _b[MOUSE.MIDDLE] = 0,
        _b[MOUSE.RIGHT] = 0,
        _b[MOUSE.BRWS_BWD] = 0,
        _b[MOUSE.BRWS_FWD] = 0,
        _b[MOUSE.MOVING] = 0,
        _b[MOUSE.MOVEMENT_X] = 0,
        _b[MOUSE.MOVEMENT_Y] = 0,
        _b[MOUSE.WHEELING] = 0,
        _b[MOUSE.DELTA_WHEEL] = 0,
        _b);
    var MOUSE_RESET_DELAY = 100;
    var mouseStopTimeout, mouseWheelTimeout;
    function I_KeyDown(event) {
        var code = event.code;
        if (code in KEY_CODES)
            keyState[KEY_CODES[code]] = 1;
    }
    function I_KeyUp(event) {
        var code = event.code;
        if (code in KEY_CODES)
            keyState[KEY_CODES[code]] = 0;
    }
    function I_GetKeyState(key) {
        return keyState[KEY[key]];
    }
    function I_InitKeyboard(onElement) {
        onElement.onkeydown = I_KeyDown;
        onElement.onkeyup = I_KeyUp;
    }
    function I_MouseDown(event) {
        var button = event.button;
        if (MOUSE_CODES[button])
            mouseState[MOUSE_CODES[button]] = 1;
    }
    function I_MouseUp(event) {
        var button = event.button;
        if (MOUSE_CODES[button])
            mouseState[MOUSE_CODES[button]] = 0;
    }
    function I_ResetMouseMovement() {
        mouseState.MOVING = 0;
        mouseState.MOVEMENT_X = 0;
        mouseState.MOVEMENT_Y = 0;
    }
    function I_MouseMove(event) {
        mouseState.MOVING = 1;
        mouseState.MOVEMENT_X = event.movementX;
        mouseState.MOVEMENT_Y = event.movementY;
        // reset mouse movement after some time has passed
        if (mouseStopTimeout !== undefined)
            clearTimeout(mouseStopTimeout);
        mouseStopTimeout = setTimeout(I_ResetMouseMovement, MOUSE_RESET_DELAY);
    }
    function I_ResetMouseWheel() {
        mouseState.WHEELING = 0;
        mouseState.DELTA_WHEEL = 0;
    }
    function I_MouseWheel(event) {
        event.preventDefault(); // prevent scrolling the page
        mouseState.WHEELING = 1;
        mouseState.DELTA_WHEEL = event.deltaY;
        // reset mouse wheel after some time has passed
        if (mouseWheelTimeout !== undefined)
            clearTimeout(mouseWheelTimeout);
        mouseWheelTimeout = setTimeout(I_ResetMouseWheel, MOUSE_RESET_DELAY);
    }
    function I_PointerLocked(onElement) {
        return document.pointerLockElement === onElement ||
            // @ts-ignore
            document.mozPointerLockElement === onElement;
    }
    function I_RequestPointerLock(onElement) {
        if (!I_PointerLocked(onElement)) {
            onElement.requestPointerLock = onElement.requestPointerLock ||
                // @ts-ignore
                onElement.mozRequestPointerLock;
            onElement.requestPointerLock();
        }
    }
    function I_AttachMouseEventListeners(onElement) {
        onElement.onclick = null;
        onElement.onmousedown = I_MouseDown;
        onElement.onmouseup = I_MouseUp;
        onElement.onmousemove = I_MouseMove;
        onElement.onwheel = I_MouseWheel;
    }
    function I_DetachMouseEventListeners(fromElement) {
        fromElement.onclick = I_RequestPointerLock.bind(undefined, fromElement);
        fromElement.onmousedown = null;
        fromElement.onmouseup = null;
        fromElement.onmousemove = null;
        fromElement.onwheel = null;
    }
    function I_PointerLockChange(onElement) {
        // pointer locked, attach mouse listeners
        if (I_PointerLocked(onElement))
            I_AttachMouseEventListeners(onElement);
        // pointer unlocked, detach mouse listeners
        else
            I_DetachMouseEventListeners(onElement);
    }
    function I_GetMouseState(key) {
        return mouseState[MOUSE[key]];
    }
    function I_InitMouse(onElement) {
        onElement.onclick = I_RequestPointerLock.bind(undefined, onElement);
        document.onpointerlockchange = I_PointerLockChange.bind(undefined, onElement);
        // @ts-ignore
        document.onmozpointerlockchange = I_PointerLockChange.bind(undefined, onElement);
    }
    window.__import__I_Input = function () {
        return {
            I_Keys: KEY,
            I_Mouse: MOUSE,
            I_GetKeyState: I_GetKeyState,
            I_InitKeyboard: I_InitKeyboard,
            I_GetMouseState: I_GetMouseState,
            I_InitMouse: I_InitMouse,
        };
    };
})();
