const globalVar={};let canvas,pointObjIndex,textureEditorTG,textureEditorOffsetX,textureEditorOffsetXR,textureEditorOffsetY,textureEditorInfo,objID,objWidth,objHeight,objDepth,objPosX,objPosY,objPosZ,objRotX,objRotY,objRotZ,isRealTimeUpdata,EdiArgsInput,textureEditorReset,textureEditorOk;export default function(ccgxkObj){const template=document.createElement("template");template.innerHTML=htmlCode;const content=template.content.cloneNode(!0);document.body.appendChild(content),canvas=document.getElementById("centerPoint"),pointObjIndex=document.getElementById("pointObjIndex"),textureEditorInfo=document.getElementById("textureEditorInfo"),objWidth=document.getElementById("objWidth"),objID=document.getElementById("objID"),objHeight=document.getElementById("objHeight"),objDepth=document.getElementById("objDepth"),objPosX=document.getElementById("objPosX"),objPosY=document.getElementById("objPosY"),objPosZ=document.getElementById("objPosZ"),objRotX=document.getElementById("objRotX"),objRotY=document.getElementById("objRotY"),objRotZ=document.getElementById("objRotZ"),isRealTimeUpdata=document.getElementById("isRealTimeUpdata"),EdiArgsInput=document.querySelectorAll(".EdiArgsInput"),textureEditorReset=document.getElementById("textureEditorReset"),textureEditorOk=document.getElementById("textureEditorOk"),globalVar.ccgxkObj=ccgxkObj;const W=ccgxkObj.W;W.tempColor=new Uint8Array(4),W.makeFBO=()=>{W.pickingFBO=W.gl.createFramebuffer(),W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,W.pickingFBO),W.pickingTexture=W.gl.createTexture(),W.gl.bindTexture(W.gl.TEXTURE_2D,W.pickingTexture),W.gl.texImage2D(W.gl.TEXTURE_2D,0,W.gl.RGBA,W.canvas.width,W.canvas.height,0,W.gl.RGBA,W.gl.UNSIGNED_BYTE,null),W.gl.framebufferTexture2D(W.gl.FRAMEBUFFER,W.gl.COLOR_ATTACHMENT0,W.gl.TEXTURE_2D,W.pickingTexture,0),W.pickingRenderbuffer=W.gl.createRenderbuffer(),W.gl.bindRenderbuffer(W.gl.RENDERBUFFER,W.pickingRenderbuffer),W.gl.renderbufferStorage(W.gl.RENDERBUFFER,W.gl.DEPTH_COMPONENT16,W.canvas.width,W.canvas.height),W.gl.framebufferRenderbuffer(W.gl.FRAMEBUFFER,W.gl.DEPTH_ATTACHMENT,W.gl.RENDERBUFFER,W.pickingRenderbuffer),W.gl.checkFramebufferStatus(W.gl.FRAMEBUFFER)!==W.gl.FRAMEBUFFER_COMPLETE?console.error("秘密排练室（FBO）创建失败！"):W.makeFBOSucess=!0,W.whiteTexture=W.gl.createTexture(),W.gl.bindTexture(W.gl.TEXTURE_2D,W.whiteTexture),W.gl.texImage2D(W.gl.TEXTURE_2D,0,W.gl.RGBA,1,1,0,W.gl.RGBA,W.gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255])),W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,null)},W.getColorPickObj=()=>{const player=W.next.mainPlayer;if(!player)return;W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,W.pickingFBO),W.gl.clearColor(0,0,0,1),W.gl.clear(W.gl.COLOR_BUFFER_BIT|W.gl.DEPTH_BUFFER_BIT);for(const index of ccgxkObj.currentlyActiveIndices){const obj=W.next["T"+index];if(obj){var obj_proxy={...obj};obj_proxy.b=(index+1).toString(16).padStart(6,"0"),obj_proxy.ns=1,obj_proxy.mix=1,W.gl.activeTexture(W.gl.TEXTURE0),W.gl.bindTexture(W.gl.TEXTURE_2D,null),W.gl.activeTexture(W.gl.TEXTURE0+3),W.gl.bindTexture(W.gl.TEXTURE_2D,W.whiteTexture),W.render(obj_proxy,0)}}var player_proxy={...player};player_proxy.b="#f00",player_proxy.ns=1,player_proxy.mix=1,W.gl.activeTexture(W.gl.TEXTURE0),W.gl.bindTexture(W.gl.TEXTURE_2D,null),W.gl.activeTexture(W.gl.TEXTURE0+3),W.gl.bindTexture(W.gl.TEXTURE_2D,W.whiteTexture),W.render(player_proxy,0);const pixels=new Uint8Array(4);W.gl.readPixels(W.gl.canvas.width/2,W.gl.canvas.height/2,1,1,W.gl.RGBA,W.gl.UNSIGNED_BYTE,pixels),W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,null),W.clearColor(ccgxkObj.colorClear),W.tempColor=pixels},ccgxkObj.hooks.on("pointer_lock_click",function(obj,e){ccgxkObj.centerPointColorUpdatax||e.button===2?ccgxkObj.hotPoint>=0&&e.button!==2?hotAction(ccgxkObj):(drawCenterPoint(canvas,ccgxkObj,!0),clearInterval(ccgxkObj.centerPointColorUpdatax),ccgxkObj.centerPointColorUpdatax=null,ccgxkObj.mainCamera.pos={x:0,y:2,z:4}):(W.makeFBOSucess!==!0&&W.makeFBO(),drawCenterPoint(canvas,ccgxkObj),ccgxkObj.centerPointColorUpdatax=setInterval(()=>{drawCenterPoint(canvas,ccgxkObj)},500),ccgxkObj.mainCamera.pos={x:0,y:.9,z:0})}),document.getElementById("textureEditorCancel").addEventListener("click",function(){myHUDModal.hidden=!0,lockPointer(),closePoint()}),EdiArgsInput.forEach(input=>{input.addEventListener("change",modelUpdate)}),textureEditorOk.addEventListener("click",modelUpdate),isRealTimeUpdata.addEventListener("change",()=>{textureEditorOk.hidden=isRealTimeUpdata.checked}),textureEditorOk.hidden=isRealTimeUpdata.checked,document.addEventListener("keydown",event=>{event.key==="Shift"&&setInputsStep("0.1")}),document.addEventListener("keyup",event=>{event.key==="Shift"&&setInputsStep("1")}),window.addEventListener("blur",()=>{setInputsStep("1")}),document.addEventListener("keydown",frozenMVP),document.addEventListener("keyup",function(){document.addEventListener("keydown",frozenMVP)});function frozenMVP(event){if(event.key==="f"){const mvpBody=globalVar.ccgxkObj.mainVPlayer.body;mvpBody.mass===0?mvpBody.mass=50:(mvpBody.mass=0,mvpBody.velocity.set(0,0,0),mvpBody.angularVelocity.set(0,0,0),mvpBody.force.set(0,0,0),mvpBody.torque.set(0,0,0))}document.removeEventListener("keydown",frozenMVP)}document.getElementById("myHUDModal").addEventListener("click",event=>{event.target.id==="myHUDModal"&&(myHUDModal.hidden=!0,lockPointer())}),textureEditorReset.addEventListener("click",()=>{insertEdiFromBackUp(),modelUpdate()})}function hotAction(thisObj){if(thisObj.hotPoint+0>1e6)return 0;globalVar.indexHotCurr=thisObj.hotPoint+0,unlockPointer(),myHUDModal.hidden=!1;const index=globalVar.indexHotCurr;globalVar.backupEdi=globalVar.ccgxkObj.indexToArgs.get(index),objID.value=index,insertEdiFromBackUp()}function insertEdiFromBackUp(){const indexArgs=globalVar.backupEdi;objWidth.value=indexArgs.width,objHeight.value=indexArgs.height,objDepth.value=indexArgs.depth,objPosX.value=indexArgs.X,objPosY.value=indexArgs.Y,objPosZ.value=indexArgs.Z,objRotX.value=indexArgs.rX,objRotY.value=indexArgs.rY,objRotZ.value=indexArgs.rZ}function modelUpdate(e){console.log("hei hei");const index=globalVar.indexHotCurr,lastArgs={X:parseFloat(objPosX.value),Y:parseFloat(objPosY.value),Z:parseFloat(objPosZ.value),rX:parseFloat(objRotX.value),rY:parseFloat(objRotY.value),rZ:parseFloat(objRotZ.value),width:parseFloat(objWidth.value),height:parseFloat(objHeight.value),depth:parseFloat(objDepth.value)},orgs_Args={...globalVar.ccgxkObj.indexToArgs.get(index)};globalVar.ccgxkObj.indexToArgs.set(index,{...orgs_Args,...lastArgs});const newInstanceData={x:lastArgs.X,y:lastArgs.Y,z:lastArgs.Z,rx:lastArgs.rX,ry:lastArgs.rY,rz:lastArgs.rZ,w:lastArgs.width,h:lastArgs.height,d:lastArgs.depth};globalVar.ccgxkObj.W.updateInstance("manyCubes",index,newInstanceData);const quat=globalVar.ccgxkObj.eulerToQuaternion({rX:newInstanceData.rx,rY:newInstanceData.ry,rZ:newInstanceData.rz}),p_offset=index*8;globalVar.ccgxkObj.positionsStatus[p_offset]=newInstanceData.x,globalVar.ccgxkObj.positionsStatus[p_offset+1]=newInstanceData.y,globalVar.ccgxkObj.positionsStatus[p_offset+2]=newInstanceData.z,globalVar.ccgxkObj.positionsStatus[p_offset+3]=quat.x,globalVar.ccgxkObj.positionsStatus[p_offset+4]=quat.y,globalVar.ccgxkObj.positionsStatus[p_offset+5]=quat.z,globalVar.ccgxkObj.positionsStatus[p_offset+6]=quat.w,globalVar.ccgxkObj.physicsProps[p_offset+1]=newInstanceData.w,globalVar.ccgxkObj.physicsProps[p_offset+2]=newInstanceData.h,globalVar.ccgxkObj.physicsProps[p_offset+3]=newInstanceData.d;const org_args=globalVar.ccgxkObj.indexToArgs.get(index);org_args.isPhysical!==!1&&org_args.cannonBody!==void 0&&globalVar.ccgxkObj.world.removeBody(org_args.cannonBody),globalVar.ccgxkObj.currentlyActiveIndices.delete(index)}function closePoint(){drawCenterPoint(canvas,globalVar.ccgxkObj,!0),clearInterval(globalVar.ccgxkObj.centerPointColorUpdatax),globalVar.ccgxkObj.centerPointColorUpdatax=null,globalVar.ccgxkObj.mainCamera.pos={x:0,y:2,z:4}}function unlockPointer(){if("pointerLockElement"in document||"mozPointerLockElement"in document||"webkitPointerLockElement"in document){const exitLock=document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock;exitLock&&exitLock.call(document)}}function lockPointer(){const canvas2=globalVar.ccgxkObj.canvas;canvas2.requestPointerLock=canvas2.requestPointerLock||canvas2.mozRequestPointerLock||canvas2.webkitRequestPointerLock,canvas2.requestPointerLock(),globalVar.upbackEdi=null}function setInputsStep(stepValue){EdiArgsInput.forEach(input=>{input.step=stepValue})}function drawCenterPoint(canvas2,thisObj,isClear){if(isClear){canvas2.width=0,canvas2.height=0;return}(canvas2.width===0||canvas2.width===1)&&(canvas2.width=20,canvas2.height=20);const ctx=canvas2.getContext("2d");thisObj.W.getColorPickObj();const colorArray=thisObj.W.tempColor||[255,0,0,255],color=`rgba(${255-colorArray[0]}, ${255-colorArray[1]}, ${255-colorArray[2]}, ${colorArray[3]/255})`,objIndex=colorArray[0]*256**2+colorArray[1]*256+colorArray[2]-1;pointObjIndex.innerHTML=objIndex,ctx.clearRect(0,0,canvas2.width,canvas2.height),objIndex>=0&&objIndex<2e6?(thisObj.hotPoint=objIndex,ctx.beginPath(),ctx.strokeStyle=color,ctx.arc(canvas2.width/2,canvas2.height/2,9,0,Math.PI*2),ctx.lineWidth=2,ctx.stroke()):thisObj.hotPoint&&(thisObj.hotPoint=-1),ctx.beginPath(),ctx.arc(canvas2.width/2,canvas2.height/2,5,0,Math.PI*2),ctx.fillStyle=color,ctx.fill()}const htmlCode=`
<style>
    /* 模态框 */
    .myHUD-modal {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100vw;
        height: 100vh;
        transform: translate(-50%, -50%);
        z-index: 999;
    }
    .myHUD-modalPos {
        margin-left: calc(100% - 350px);
        margin-top: 1em;
        /* transform: translate(-50%, -50%); */
        width: 280px;
        text-align: center;
        background-color: rgba(51, 204, 111, 0.07);
        padding: 20px;
        backdrop-filter: blur(1px);
        /* background-color: aliceblue; */
    }
    .texture-editorBtn-lab {
        display: inline-block;
        background: rgb(32 32 32);
        color: rgb(255, 255, 255);
        padding: 5px 5px;
        border: none;
        cursor: pointer;
        margin: 5px;
        font-size: 14;
        color: #bbbbbb;
    }
    .pointObjIndex {
        position: fixed;
        top: 50px;
        left: 10px;
    }
    .EdiArgsInput, #objID {
        background-color: #fff0f066;
        width: 50px;
    }

    /* webgl canvas */
    /* 可提醒用户单击画面 */
    #vistaCanv, .myHUD-modal {
        cursor: pointer;
    }
</style>
<div id="myHUDModal" class="myHUD-modal" hidden>
    <div class="myHUD-modalPos">
        <div>
            <div>
                <span id="textureEditorInfo"></span>
            </div>
            index: <input type="number" id="objID" name="objID" min="0" max="10000000" step="1">
            <hr>
            宽: <input type="number" class="EdiArgsInput" id="objWidth" name="objWidth" min="0.1">
            高: <input type="number" class="EdiArgsInput" id="objHeight" name="objHeight" min="0.1">
            纵: <input type="number" class="EdiArgsInput" id="objDepth" name="objDepth" min="0.1"><br><br>
            X: <input type="number" class="EdiArgsInput" id="objPosX" name="objPosX">
            Y: <input type="number" class="EdiArgsInput" id="objPosY" name="objPosY">
            Z: <input type="number" class="EdiArgsInput" id="objPosZ" name="objPosZ"><br><br>
            rx: <input type="number" class="EdiArgsInput" id="objRotX" name="objRotX">
            ry: <input type="number" class="EdiArgsInput" id="objRotY" name="objRotY">
            rz: <input type="number" class="EdiArgsInput" id="objRotZ" name="objRotZ"><br><br>
            <hr>
            <input type="checkbox" name="isRealTimeUpdata" id="isRealTimeUpdata" checked> 实时更新 <br><br>
            <button class="texture-editorBtn" id="textureEditorReset">恢复</button>
            <button class="texture-editorBtn" id="textureEditorOk">确认</button>
            <button class="texture-editorBtn" id="textureEditorCancel">关闭</button>
        </div>
    </div>
</div>
<span id="pointObjIndex" class="pointObjIndex">0</span>
<canvas id="centerPoint" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);" width="1" height="1"></canvas>
`;
