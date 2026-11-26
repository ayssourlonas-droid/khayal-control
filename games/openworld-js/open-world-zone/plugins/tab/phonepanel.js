export function initPhonePanel($,ccgxkObj){const template=document.createElement("template");template.innerHTML=PHONE_PANEL_HTML,document.body.appendChild(template.content.cloneNode(!0));function addPressAction(el,onPress,onRelease){let pressed=!1;const press=()=>{pressed=!0,onPress()},release=()=>{pressed&&(onRelease(),pressed=!1)};el.addEventListener("mousedown",press),el.addEventListener("touchstart",press),el.addEventListener("mouseup",release),el.addEventListener("touchend",release),window.addEventListener("mouseup",release),window.addEventListener("touchend",release)}function bindKeyToggle(id,keyName,onValue=1,offValue=0){addPressAction($(id),()=>{k.keys[keyName]=onValue},()=>{k.keys[keyName]=offValue})}function bindIntervalControl(id,updateFn){let timer=null;addPressAction($(id),()=>{timer||(timer=setInterval(updateFn,10))},()=>{clearInterval(timer),timer=null})}bindKeyToggle("ppGoF","viewForward"),bindKeyToggle("ppGoB","viewBackward"),bindKeyToggle("ppGoL","viewLeft"),bindKeyToggle("ppGoR","viewRight"),addPressAction($("ppGoJump"),()=>{k.mainVPlayer.body.velocity.y=k.jumpYVel},()=>{});const turnNum=.7;bindIntervalControl("ppTurnL",()=>{k.keys.turnRight+=turnNum}),bindIntervalControl("ppTurnR",()=>{k.keys.turnRight-=turnNum}),bindIntervalControl("ppLookUp",()=>{k.keys.turnUp+=turnNum}),bindIntervalControl("ppLookDn",()=>{k.keys.turnUp-=turnNum})}const PHONE_PANEL_STYLE=`
<style>
    /* 移动端控制面板 */
    .phone-panel {
        background: transparent;
        width: 150px;
        height: 150px;
        position: fixed;
        z-index: 1000;
        bottom: 80px;
        right: 10%;
        user-select: none;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 6px;
        padding: 6px;
        box-sizing: border-box;
        touch-action: none;
    }

    .phone-panel-cell {
        user-select: none;
        border: none;
        background: #ffffff82;
        font-size: 22px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        cursor: pointer;
    }

    .phone-panel-cell:active {
        color: #000;
        transform: scale(1.1);
    }

    /* 默认隐藏（PC 端） */
    .phone-panel-hidden {
        display: none;
    }

    /* 移动端自动显示 */
    @media (max-width: 820px) and (hover: none) and (pointer: coarse) {
        .phone-panel-hidden {
            display: grid;
        }
    }
</style>
`,PHONE_PANEL_MARKUP=`
<div id="phonePanel" class="phone-panel phone-panel-hidden">
    <button class="phone-panel-cell" id="ppTurnL">↶</button>
    <button class="phone-panel-cell" id="ppGoF">F</button>
    <button class="phone-panel-cell" id="ppTurnR">↷</button>

    <button class="phone-panel-cell" id="ppGoL">L</button>
    <button class="phone-panel-cell" id="ppGoJump">⤒</button>
    <button class="phone-panel-cell" id="ppGoR">R</button>

    <button class="phone-panel-cell" id="ppLookUp">↑</button>
    <button class="phone-panel-cell" id="ppGoB">B</button>
    <button class="phone-panel-cell" id="ppLookDn">↓</button>
</div>
`,PHONE_PANEL_HTML=`${PHONE_PANEL_STYLE}
${PHONE_PANEL_MARKUP}`;export default function(ccgxkObj){initPhonePanel(id=>document.getElementById(id),ccgxkObj)}
