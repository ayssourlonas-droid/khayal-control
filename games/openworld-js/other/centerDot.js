const globalVar={};let canvas,pointObjIndex,textureEditorTG,textureEditorOffsetX,textureEditorOffsetXR,textureEditorOffsetY,textureEditorInfo;export default function(ccgxkObj){const template=document.createElement("template");template.innerHTML=htmlCode;const content=template.content.cloneNode(!0);document.body.appendChild(content),canvas=document.getElementById("centerPoint"),pointObjIndex=document.getElementById("pointObjIndex"),textureEditorTG=document.getElementById("textureEditorTG"),textureEditorOffsetX=document.getElementById("textureEditorOffsetX"),textureEditorOffsetXR=document.getElementById("textureEditorOffsetXR"),textureEditorOffsetY=document.getElementById("textureEditorOffsetY"),textureEditorInfo=document.getElementById("textureEditorInfo"),globalVar.ccgxkObj=ccgxkObj;const W=ccgxkObj.W;W.tempColor=new Uint8Array(4),W.makeFBO=()=>{W.pickingFBO=W.gl.createFramebuffer(),W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,W.pickingFBO),W.pickingTexture=W.gl.createTexture(),W.gl.bindTexture(W.gl.TEXTURE_2D,W.pickingTexture),W.gl.texImage2D(W.gl.TEXTURE_2D,0,W.gl.RGBA,W.canvas.width,W.canvas.height,0,W.gl.RGBA,W.gl.UNSIGNED_BYTE,null),W.gl.framebufferTexture2D(W.gl.FRAMEBUFFER,W.gl.COLOR_ATTACHMENT0,W.gl.TEXTURE_2D,W.pickingTexture,0),W.pickingRenderbuffer=W.gl.createRenderbuffer(),W.gl.bindRenderbuffer(W.gl.RENDERBUFFER,W.pickingRenderbuffer),W.gl.renderbufferStorage(W.gl.RENDERBUFFER,W.gl.DEPTH_COMPONENT16,W.canvas.width,W.canvas.height),W.gl.framebufferRenderbuffer(W.gl.FRAMEBUFFER,W.gl.DEPTH_ATTACHMENT,W.gl.RENDERBUFFER,W.pickingRenderbuffer),W.gl.checkFramebufferStatus(W.gl.FRAMEBUFFER)!==W.gl.FRAMEBUFFER_COMPLETE?console.error("秘密排练室（FBO）创建失败！"):W.makeFBOSucess=!0,W.whiteTexture=W.gl.createTexture(),W.gl.bindTexture(W.gl.TEXTURE_2D,W.whiteTexture),W.gl.texImage2D(W.gl.TEXTURE_2D,0,W.gl.RGBA,1,1,0,W.gl.RGBA,W.gl.UNSIGNED_BYTE,new Uint8Array([255,255,255,255])),W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,null)},W.getColorPickObj=()=>{const player=W.next.mainPlayer;if(!player)return;W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,W.pickingFBO),W.gl.clearColor(0,0,0,1),W.gl.clear(W.gl.COLOR_BUFFER_BIT|W.gl.DEPTH_BUFFER_BIT);for(const index of ccgxkObj.currentlyActiveIndices){const obj=W.next["T"+index];if(obj){var obj_proxy={...obj};obj_proxy.b=index.toString(16).padStart(6,"0"),obj_proxy.ns=1,obj_proxy.mix=1,W.gl.activeTexture(W.gl.TEXTURE0),W.gl.bindTexture(W.gl.TEXTURE_2D,null),W.gl.activeTexture(W.gl.TEXTURE0+3),W.gl.bindTexture(W.gl.TEXTURE_2D,W.whiteTexture),W.render(obj_proxy,0)}}var player_proxy={...player};player_proxy.b="#f00",player_proxy.ns=1,player_proxy.mix=1,W.gl.activeTexture(W.gl.TEXTURE0),W.gl.bindTexture(W.gl.TEXTURE_2D,null),W.gl.activeTexture(W.gl.TEXTURE0+3),W.gl.bindTexture(W.gl.TEXTURE_2D,W.whiteTexture),W.render(player_proxy,0);const pixels=new Uint8Array(4);W.gl.readPixels(W.gl.canvas.width/2,W.gl.canvas.height/2,1,1,W.gl.RGBA,W.gl.UNSIGNED_BYTE,pixels),W.gl.bindFramebuffer(W.gl.FRAMEBUFFER,null),W.clearColor(ccgxkObj.colorClear),W.tempColor=pixels},ccgxkObj.hooks.on("forwardBackward",function(obj,speed){}),ccgxkObj.hooks.on("pointer_lock_click",function(obj,e){ccgxkObj.centerPointColorUpdatax||e.button===2?ccgxkObj.hotPoint&&e.button!==2?hotAction(ccgxkObj):(drawCenterPoint(canvas,ccgxkObj,!0),clearInterval(ccgxkObj.centerPointColorUpdatax),ccgxkObj.centerPointColorUpdatax=null,ccgxkObj.mainCamera.pos={x:0,y:2,z:4}):(W.makeFBOSucess!==!0&&W.makeFBO(),drawCenterPoint(canvas,ccgxkObj),ccgxkObj.centerPointColorUpdatax=setInterval(()=>{drawCenterPoint(canvas,ccgxkObj)},500),ccgxkObj.mainCamera.pos={x:0,y:.9,z:0})}),document.getElementById("textureEditorNumAux").addEventListener("click",function(){textureEditorTG.value=`0
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30`}),document.getElementById("textureEditorClear").addEventListener("click",function(){textureEditorTG.value=""}),document.getElementById("textureEditorNumAuxRemove").addEventListener("click",function(){textureEditorTG.value=textureEditorTG.value.replace(/^\d+$/gm,"")}),document.getElementById("textureEditorSave").addEventListener("click",function(){myHUDModal.hidden=!0,lockPointer();const modValue={content:textureEditorTG.value,x:Number(textureEditorOffsetX.value),xr:Number(textureEditorOffsetXR.value),y:Number(textureEditorOffsetY.value)};modTextDemo(globalVar.indexHotCurr,modValue,globalVar.ccgxkObj),cleanEditorPanel(),closePoint();const bookAsArray=[...globalVar.ccgxkObj.currTextData.entries()],jsonScroll=JSON.stringify(bookAsArray,null,2);localStorage.setItem("TGTOOL-backup",jsonScroll)}),document.getElementById("textureEditorCancel").addEventListener("click",function(){myHUDModal.hidden=!0,lockPointer(),cleanEditorPanel(),closePoint()}),document.getElementById("textureEditorDownload").addEventListener("click",function(){const bookAsArray=[...globalVar.ccgxkObj.currTextData.entries()],jsonScroll=JSON.stringify(bookAsArray,null,2),blob=new Blob([jsonScroll],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url,link.download=`TGTool-backup-${new Date(Date.now()).toLocaleString("sv-SE").replace(/[-:T\s]/g,"")}.json`,link.click(),URL.revokeObjectURL(url)}),document.getElementById("textureEditorReadfile").addEventListener("change",function(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader;reader.onload=e=>{try{readAfter(e.target.result)}catch(error){alert(`研读失败！这可能是一份损坏或格式错误的存档。
`+error.message)}},reader.readAsText(file),event.target.value=""}),document.getElementById("textureEditorRcover").addEventListener("click",function(){const jsonScroll=localStorage.getItem("TGTOOL-backup");if(jsonScroll)try{readAfter(jsonScroll),textureEditorTG.placeholder="",textureEditorInfo.innerText=""}catch(error){alert(`研读失败！这可能是一份损坏或格式错误的存档。
`+error.message)}});function frozenMVP(event){if(event.key.toUpperCase()==="F"){const mvpBody=globalVar.ccgxkObj.mainVPlayer.body;mvpBody.mass===0?mvpBody.mass=50:(mvpBody.mass=0,mvpBody.velocity.set(0,0,0),mvpBody.angularVelocity.set(0,0,0),mvpBody.force.set(0,0,0),mvpBody.torque.set(0,0,0))}document.removeEventListener("keydown",frozenMVP)}document.addEventListener("keydown",frozenMVP),document.addEventListener("keyup",function(){document.addEventListener("keydown",frozenMVP)}),ccgxkObj.hooks.on("errorTexture_diy",function(ctx,width,height,drawItem,_this){const index=drawItem.index,id=drawItem.id;if("T"+index!==id)return;const value=k.currTextData.get(id)?.content||"",offsetX=k.currTextData.get(id)?.x||0,offsetY=k.currTextData.get(id)?.y||0,offsetXR=k.currTextData.get(id)?.xr||0,typeObj={};if(!value)return;ctx.font=typeObj.font||"25px Arial",ctx.fillStyle=typeObj.fillStyle||"white",ctx.strokeStyle="transparent",ctx.textAlign=typeObj.textAlign||"left",ctx.textBaseline=typeObj.textBaseline||"top";var lineHeight=parseInt(ctx.font)||30;const margin=10,marginLeft=10,marginTop=10;ctx.clearRect(0,0,width,height),ctx.fillStyle="white";function wrapText(_ctx,text,x,y,maxWidth,lineHeight2){text=text.split("/*")[0];const words=text.split("");let line="";for(let n=0;n<words.length;n++){if(words[n]===`
`){_ctx.fillText(line,x,y),y+=lineHeight2,line="";continue}words[n]==="&"&&(ctx.fillStyle="transparent",ctx.font="25px Arial",lineHeight2=25,words[n]=""),words[n]==="#"&&(ctx.fillStyle="blue",ctx.font="40px serif",lineHeight2=43,words[n]=""),words[n]==="%"&&(ctx.fillStyle="red",ctx.font="40px serif",lineHeight2=43,words[n]=""),words[n]==="@"&&(ctx.fillStyle="white",ctx.font=typeObj.font||"25px Arial",lineHeight2=25,words[n]="");const testLine=line+words[n];_ctx.measureText(testLine).width>maxWidth&&n>0?(_ctx.fillText(line,x,y),line=words[n],y+=lineHeight2):line=testLine}_ctx.fillText(line,x,y)}wrapText(ctx,value,marginLeft+width*offsetX,marginTop+height*offsetY,(width-margin*2)*(1-offsetX-offsetXR),lineHeight),_this.W.next[id].hidden=!1,_this.indexToArgs.get(index).isInvisible=!1}),document.getElementById("btn02").addEventListener("click",function(){readArchiveFromCloud()})}function readArchiveFromCloud(){globalVar.oldExArSt=globalVar.oldExArSt||document.getElementById("btn02").innerText;const archiveURL="https://git.ccgxk.com/myWorkSpace/webgl_show/cyber_city/ExampleArchive.json";document.getElementById("btn02").innerText="读取中...",fetch(archiveURL).then(response=>{if(!response.ok)throw new Error("网络响应失败，状态码: "+response.status);return response.text()}).then(archiveContent=>{try{readAfter(archiveContent),alert("应用成功！您可以去城寨入口或坐标原点看一下哈~ 😊 欢迎您来到赛博城寨！！！"),document.getElementById("btn02").innerText=globalVar.oldExArSt}catch(error){document.getElementById("btn02").innerText=globalVar.oldExArSt,alert(`研读失败！这可能是一份损坏或格式错误的云端存档。
`+error.message)}}).catch(error=>{alert(`读取云端存档失败！请检查您的网络连接或联系管理员。
`+error.message),document.getElementById("btn02").innerText=globalVar.oldExArSt})}function drawCenterPoint(canvas2,thisObj,isClear){if(isClear){canvas2.width=0,canvas2.height=0;return}(canvas2.width===0||canvas2.width===1)&&(canvas2.width=20,canvas2.height=20);const ctx=canvas2.getContext("2d");thisObj.W.getColorPickObj();const colorArray=thisObj.W.tempColor||[255,0,0,255],color=`rgba(${255-colorArray[0]}, ${255-colorArray[1]}, ${255-colorArray[2]}, ${colorArray[3]/255})`,objIndex=colorArray[0]*256**2+colorArray[1]*256+colorArray[2];pointObjIndex.innerHTML="方块ID："+objIndex,ctx.clearRect(0,0,canvas2.width,canvas2.height),objIndex!==0?(thisObj.hotPoint=objIndex,ctx.beginPath(),ctx.strokeStyle=color,ctx.arc(canvas2.width/2,canvas2.height/2,9,0,Math.PI*2),ctx.lineWidth=2,ctx.stroke()):thisObj.hotPoint&&(thisObj.hotPoint=!1),ctx.beginPath(),ctx.arc(canvas2.width/2,canvas2.height/2,5,0,Math.PI*2),ctx.fillStyle=color,ctx.fill()}function hotAction(thisObj){if(globalVar.indexHotCurr=thisObj.hotPoint+0,unlockPointer(),myHUDModal.hidden=!1,thisObj.currTextData.size===0&&localStorage.getItem("TGTOOL-backup")!==null){const warnInfo="浏览器里有上次的备份存档，推荐您【从浏览器恢复】！（数据无价）";textureEditorInfo.innerText=warnInfo,textureEditorTG.placeholder=warnInfo}textureEditorTG.value=thisObj.currTextData.get("T"+globalVar.indexHotCurr)?.content||"",textureEditorOffsetX.value=thisObj.currTextData.get("T"+globalVar.indexHotCurr)?.x||0,textureEditorOffsetXR.value=thisObj.currTextData.get("T"+globalVar.indexHotCurr)?.xr||0,textureEditorOffsetY.value=thisObj.currTextData.get("T"+globalVar.indexHotCurr)?.y||0}function cleanEditorPanel(){textureEditorTG.value="",textureEditorOffsetX.value=0,textureEditorOffsetXR.value=0,textureEditorOffsetY.value=0,globalVar.indexHotCurr=-1}function closePoint(){drawCenterPoint(canvas,globalVar.ccgxkObj,!0),clearInterval(globalVar.ccgxkObj.centerPointColorUpdatax),globalVar.ccgxkObj.centerPointColorUpdatax=null,globalVar.ccgxkObj.mainCamera.pos={x:0,y:2,z:4}}function readAfter(result){const bookAsArray=JSON.parse(result);if(Array.isArray(bookAsArray)){globalVar.ccgxkObj.currTextData=new Map(bookAsArray);for(const item of globalVar.ccgxkObj.currTextData)globalVar.ccgxkObj.indexToArgs.get(Number(item[0].substring(1))).texture=item[0];for(const item of globalVar.ccgxkObj.currentlyActiveIndices){const indexID="T"+item;globalVar.ccgxkObj.currTextData.has(indexID)&&globalVar.ccgxkObj.currentlyActiveIndices.delete(item)}myHUDModal.hidden=!0,lockPointer(),cleanEditorPanel(),alert("读取完成！")}else throw new Error("格式不正确。")}function modTextDemo(indexID,value={},thisObj){const nID="T"+indexID;if(!thisObj?.indexToArgs?.get(indexID)?.TGtoolText)return 0;thisObj.currTextData.set(nID,{content:value?.content||"",x:value?.x||0,xr:value?.xr||0,y:value?.y||0}),thisObj.textureMap.delete(nID),window[nID]=void 0,thisObj.W.plane({n:"T"+indexID,t:nID}),thisObj.indexToArgs.get(indexID).texture=nID,thisObj.currentlyActiveIndices.delete(indexID)}function unlockPointer(){if("pointerLockElement"in document||"mozPointerLockElement"in document||"webkitPointerLockElement"in document){const exitLock=document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock;exitLock&&exitLock.call(document)}}function lockPointer(){const canvas2=globalVar.ccgxkObj.canvas;canvas2.requestPointerLock=canvas2.requestPointerLock||canvas2.mozRequestPointerLock||canvas2.webkitRequestPointerLock,canvas2.requestPointerLock()}const htmlCode=`
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
        margin-left: 50vw;
        margin-top: 50vh;
        transform: translate(-50%, -50%);
        width: 700px;
        text-align: center;
        background-color: rgb(159 51 204 / 55%);
        padding: 32px;
        backdrop-filter: blur(2px);
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
    .xCity {
        font-size: 60px;
        color: rgb(255, 255, 255);
        position: fixed;
        left: 50vw;
        transform: translate(-50%);
        width: max-content;
        top: 30px;
    }
    .pointObjIndex {
        position: fixed;
        top: 50px;
        left: 10px;
    }
</style>
<div id="myHUDModal" class="myHUD-modal" hidden>
    <div class="myHUD-modalPos">
        <div>
            左 <input type="number" id="textureEditorOffsetX" name="offsetX" min="0" max="1" step="0.1">
            &nbsp;&nbsp;&nbsp;&nbsp;
            右 <input type="number" id="textureEditorOffsetXR" name="offsetXR" min="0" max="1" step="0.1">
            &nbsp;&nbsp;&nbsp;&nbsp;
            下 <input type="number" id="textureEditorOffsetY" name="offsetY" min="0" max="1" step="0.1">
            （偏移量，0 ~ 1）
        </div>
        <textarea rows="10" cols="50" class="tgeditor-texture" id="textureEditorTG"></textarea>
        <div><br>
            <div>
                <span id="textureEditorInfo"></span><br>
            </div>
            <button class="texture-editorBtn" id="textureEditorSave">写入</button>
            <button class="texture-editorBtn" id="textureEditorCancel">取消</button>
            <button class="texture-editorBtn" id="textureEditorDownload">下载存档</button>
            <label for="textureEditorReadfile" class="texture-editorBtn-lab">读取存档 </label>
            <input  type="file" id="textureEditorReadfile" accept=".json" hidden>
            <div>
                <button class="texture-editorBtn" id="textureEditorClear">清空</button>
                <button class="texture-editorBtn" id="textureEditorNumAux">数字行号辅</button>
                <button class="texture-editorBtn" id="textureEditorNumAuxRemove">一键去除行号</button>
            </div>
            <hr>
            <button class="texture-editorBtn" id="textureEditorRcover">从浏览器恢复</button>
        </div>
    </div>
</div>
<span id="currCityName" class="xCity">城市</span>
<span id="pointObjIndex" class="pointObjIndex"></span>
<canvas id="centerPoint" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);" width="1" height="1"></canvas>
`;
