export default function(ccgxkObj){const template=document.createElement("template");template.innerHTML=htmlCode;const content=template.content.cloneNode(!0);document.body.appendChild(content),shiftInfo.textContent="Online: 1 | ",ccgxkObj.fpsFrameCount=0,ccgxkObj.lastTime=performance.now(),ccgxkObj.isFirstShowFPS=!0,ccgxkObj.showFPS1S=function(){var currentTime=performance.now(),deltaTime=currentTime-this.lastTime;if(this.fpsFrameCount++,deltaTime>1e3||this.isFirstShowFPS){this.isFirstShowFPS=!1;var fps=this.fpsFrameCount/(deltaTime/1e3);this.fpsFrameCount=0,this.lastTime=currentTime,this._showMemory(),this.displayPOS();const mVP=this.mainVPlayer;var dynaNodesCon=this.calPosID(mVP?.X,mVP?.Y,mVP?.Z,2);posIDMVP.textContent=dynaNodesCon.replace(/[Dd]/g,"W").replace(/[Xx]/g,"E").replace(/[Nn]/g,"S").replace(/[Bb]/g,"N"),fpsInfo.textContent="FPS: "+fps.toFixed(1)+"  ，Render: "+this.W.drawTime,modListCount.textContent="Models:  Active "+this.currentlyActiveIndices.size+` | Phys ${this.world.bodies.length} | Rendered ${this._calWNotHidden()} | Tracked ${this.indexToArgs.size} | Textures ${this.textureMap.size} |`}},ccgxkObj._showMemory=function(){var output=document.getElementById("metrics");if(performance.memory){const mem=performance.memory;output.textContent=`Mem: ${(mem.usedJSHeapSize/1048576).toFixed(1)}MB/${(mem.jsHeapSizeLimit/1048576).toFixed(1)}MB | `}},ccgxkObj._calWNotHidden=function(){let length=0;for(var key in this.W.next)this.W.next[key].hidden!==!0&&length++;return length},ccgxkObj.hooks.on("animatePreFrame",function(_this){_this.showFPS1S()})}const htmlCode=`
<style>
    .myHUD {
        position: absolute;
        bottom: 5px;
        padding: 0.3em;
        color: #ffffff;
        font-size: 12px;
        font-family: monospace;
    }
</style>
<div id="myHUD" class="myHUD">
    <div id="fpsInfo"></div>
    <span id="shiftInfo"></span>
    <span id="posInfo"></span>
    <span id="metrics"></span>
    <span id="cpuInfo"></span>
    <span id="modListCount"></span>
    <span id="posIDMVP"></span>
</div>
`;
