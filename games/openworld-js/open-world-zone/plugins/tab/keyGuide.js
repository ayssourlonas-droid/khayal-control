const STORAGE_KEY="openworld_key_guide_hidden",STYLE_ID="keyGuideStyle",MOBILE_BREAKPOINT=768,KEY_UNIT=42,GUIDE_LAYOUT=[{code:"Tab",label:"TAB",desc:"Panel",x:0,y:48,width:64},{code:"KeyQ",label:"Q",desc:"Boost",x:104,y:48},{code:"KeyW",label:"W",desc:"Forward",x:154,y:48},{code:"KeyE",label:"E",desc:"Jump",x:204,y:48},{code:"KeyA",label:"A",desc:"Left",x:104,y:110},{code:"KeyS",label:"S",desc:"Back",x:154,y:110},{code:"KeyD",label:"D",desc:"Right",x:204,y:110},{code:"KeyF",label:"F",desc:"Freeze",x:254,y:110},{code:"KeyV",label:"V",desc:"View",x:304,y:170},{code:"ShiftLeft",label:"Shift",desc:"Boost",x:0,y:170,width:86,aliases:["ShiftRight"]},{code:"Space",label:"Space",desc:"Jump",x:110,y:220,width:138}],GUIDE_STYLE_CSS=`
#keyGuidePanel {
    position: fixed;
    left: 18px;
    bottom: 70px;
    width: 380px;
    max-width: calc(100vw - 36px);
    min-height: 300px;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.16);
    background: rgba(10,10,10,0.46);
    backdrop-filter: blur(8px);
    color: #fff;
    z-index: 22;
    box-sizing: border-box;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

#keyGuidePanel .kg-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    position: relative;
    z-index: 2;
}

#keyGuidePanel .kg-title {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 4px;
}

#keyGuidePanel .kg-subtitle {
    font-size: 12px;
    color: #fff;
}

#keyGuidePanel .kg-close-btn {
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.08);
    color: #fff;
    border-radius: 9px;
    padding: 6px 10px;
    cursor: pointer;
    flex-shrink: 0;
}

#keyGuidePanel .kg-body {
    position: relative;
    height: 268px;
    margin-top: -50px;
    z-index: 1;
}

#keyGuidePanel .kg-shell {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

#keyGuidePanel .kg-keycap {
    height: 34px;
    border: 1px solid rgba(255,255,255,0.42);
    border-radius: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.08);
    box-shadow: inset 0 -2px 0 rgba(255,255,255,0.08);
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    flex-shrink: 0;
    transform: translateY(0);
}

#keyGuidePanel .kg-keycap.is-active {
    background: #facc15;
    color: #000;
    border-color: #fde68a;
    transform: translateY(1px);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.45);
}

#keyGuidePanel .kg-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    font-size: 12px;
    color: #fff;
    text-align: center;
    line-height: 1.05;
    min-width: 100%;
}
`;function ensureGuideStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement("style");style.id=STYLE_ID,style.textContent=GUIDE_STYLE_CSS,document.head.appendChild(style)}function normalizeCode(event){return event.code==="ShiftLeft"||event.code==="ShiftRight"?"ShiftLeft":event.code==="Space"||event.key===" "?"Space":event.key==="Tab"?"Tab":event.code||event.key}function isMobileViewport(){return window.innerWidth<768}function isGuideHiddenForever(){return localStorage.getItem(STORAGE_KEY)==="1"}function setGuideHiddenForever(hidden){if(hidden){localStorage.setItem(STORAGE_KEY,"1");return}localStorage.removeItem(STORAGE_KEY)}function createKeyItem(item){const shell=document.createElement("div");shell.className="kg-shell",shell.style.left=`${item.x}px`,shell.style.top=`${item.y}px`,shell.style.width=`${item.width??42}px`;const keycap=document.createElement("div");keycap.className="kg-keycap",keycap.dataset.code=item.code,keycap.style.width=`${item.width??42}px`,keycap.textContent=item.label;const text=document.createElement("div");text.className="kg-text";const desc=document.createElement("span");return desc.textContent=item.desc,text.appendChild(desc),shell.appendChild(keycap),shell.appendChild(text),{shell,keycap}}export function initKeyGuide(){if(document.getElementById("keyGuidePanel"))return;ensureGuideStyle();const panel=document.createElement("div");panel.id="keyGuidePanel";const header=document.createElement("div");header.className="kg-header";const titleWrap=document.createElement("div"),title=document.createElement("div");title.className="kg-title",title.textContent="Key Guide";const subtitle=document.createElement("div");subtitle.className="kg-subtitle",subtitle.textContent="Recommended: Q / E for boost & jump",titleWrap.appendChild(title),titleWrap.appendChild(subtitle);const closeBtn=document.createElement("button");closeBtn.type="button",closeBtn.className="kg-close-btn",closeBtn.textContent="Close",header.appendChild(titleWrap),header.appendChild(closeBtn);const body=document.createElement("div");body.className="kg-body";const keycapMap=new Map;GUIDE_LAYOUT.forEach(item=>{const{shell,keycap}=createKeyItem(item);body.appendChild(shell),keycapMap.set(item.code,keycap),item.aliases?.forEach(aliasCode=>{keycapMap.set(aliasCode,keycap)})}),panel.appendChild(header),panel.appendChild(body),document.body.appendChild(panel);const api={show(force=!1){!force&&isGuideHiddenForever()||(panel.hidden=!1)},hide(){panel.hidden=!0},resetHidden(){setGuideHiddenForever(!1),panel.hidden=!1}};window.keyGuideAPI=api,panel.hidden=isGuideHiddenForever()||isMobileViewport();const setActive=(code,active)=>{const keycap=keycapMap.get(code);keycap&&keycap.classList.toggle("is-active",active)},handleKeyDown=event=>{setActive(normalizeCode(event),!0)},handleKeyUp=event=>{setActive(normalizeCode(event),!1)},handleBlur=()=>{keycapMap.forEach(keycap=>keycap.classList.remove("is-active"))};window.addEventListener("keydown",handleKeyDown),window.addEventListener("keyup",handleKeyUp),window.addEventListener("blur",handleBlur);const handleClose=event=>{event?.preventDefault?.(),event?.stopPropagation?.(),window.confirm("Hide this key guide? You can turn it back on in the panel.")&&(setGuideHiddenForever(!0),panel.hidden=!0)};closeBtn.addEventListener("click",handleClose)}
