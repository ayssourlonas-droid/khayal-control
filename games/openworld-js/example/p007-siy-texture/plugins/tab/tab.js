export default function(ccgxkObj){const $=id=>document.getElementById(id),template=document.createElement("template");template.innerHTML=htmlCode;const content=template.content.cloneNode(!0);document.body.appendChild(content);const modal=$("myinfoModal"),showModal=()=>modal.classList.remove("zindex-1"),hideModal=()=>modal.classList.add("zindex-1");btn01.addEventListener("mousedown",showModal),$("closeBtn").addEventListener("click",hideModal),$("closeBtn02").addEventListener("click",hideModal);const unlockPointer=()=>{const exit=document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock;exit&&exit.call(document)},lockPointer=()=>{const element=document.getElementById("openworldCanv"),request=element.requestPointerLock||element.mozRequestPointerLock||element.webkitRequestPointerLock;request&&request.call(element)};window.addEventListener("keydown",e=>{e.key==="Tab"&&(e.preventDefault(),modal.classList.contains("zindex-1")?(showModal(),k.keys.viewForward=0,k.keys.viewBackward=0,k.keys.viewLeft=0,k.keys.viewRight=0,unlockPointer()):(hideModal(),lockPointer()))})}const htmlCode=`
<style>
    #someCtrl {
        position: fixed;
        top: 25px;
        opacity: 0.5;
        right: 50px;
    }
    #someCtrl button {
        width: 160px;
        height: 50px;
        font-size: 20px;
    }
    .info-modal {
        position: fixed;
        background-color: #ffffff6b;
        backdrop-filter: blur(7px);
        right: 30px;
        top: 30px;
        width: 500px;
        max-width: calc(100vw - 80px);
        height: 80vh;
        z-index: 1;
        overflow: auto;
        padding: 1em;
        font-size: 15px;
        opacity: 1;
        pointer-events: auto;
    }
    .zindex-1 {  /* 使用这个来控制model，或许可以展示 ads ？  */
        position: fixed;
        z-index: -1; /* 不挡住页面 */
        opacity: 0;  /* 肉眼不可见，但仍渲染 */
        pointer-events: none; /* 防止误点 */
        transition: opacity 0.3s ease, z-index 0.3s ease;
    }
</style>

<div id="someCtrl">
    <button id="btn01" style="width: 105px;">面板(Tab)</button>
</div>

<div class="info-modal zindex-1" id="myinfoModal">
    
    <div> <button id="closeBtn">关闭</button> </div>
    
    <div id="wskStudio"></div><!-- 万数块临时测试使用 -->

    <div> <button id="closeBtn02">关闭</button> </div>
</div>
`;
