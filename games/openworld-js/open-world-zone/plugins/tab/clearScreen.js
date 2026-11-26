const BODY_CLASS="owz-clear-screen-mode",STYLE_ID="owzClearScreenStyle";function ensureClearScreenStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement("style");style.id=STYLE_ID,style.textContent=`
    body.${BODY_CLASS} > *:not(#openworldCanv):not(#myinfoModal):not(#pointObjIndex):not(#currCityName):not(#centerPoint):not(#signHotInfo):not(#signHotInfoContentModal) {
        visibility: hidden !important;
        pointer-events: none !important;
    }

    /* 清屏模式下强制隐藏左上角热点数字（即使它仍在动态更新） */
    body.${BODY_CLASS} #pointObjIndex,
    body.${BODY_CLASS} .pointObjIndex {
        visibility: hidden !important;
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }

    /* 清屏模式下热点信息切换按钮隐藏（覆盖它的内联 display:block） */
    body.${BODY_CLASS} #signHotInfoToggle,
    body.${BODY_CLASS} #signHotInfoToggle {
        visibility: hidden !important;
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }

    /* 清屏模式下保留热点信息面板可见性，但 display 仍由 JS 按准心状态控制 */
    body.${BODY_CLASS} #signHotInfo {
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
    }
    `,document.head.appendChild(style)}function syncButtonText(button,enabled){button&&(button.textContent=enabled?"Restore UI":"Clear Screen")}export function initClearScreen($){const button=$("clearScreenToggle");if(!button)return;const hotInfoToggle=$("signHotInfoToggle");function ensureHotInfoEnabledForClearScreen(){if(!hotInfoToggle)return;hotInfoToggle.textContent?.trim().toLowerCase()==="hide"||hotInfoToggle.click()}ensureClearScreenStyle(),syncButtonText(button,document.body.classList.contains(BODY_CLASS)),button.addEventListener("click",()=>{const enabled=document.body.classList.toggle(BODY_CLASS);enabled&&ensureHotInfoEnabledForClearScreen(),syncButtonText(button,enabled)})}
