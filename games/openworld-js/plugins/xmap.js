const mapOpt={};export default function(ccgxkObj,mapRatioInput=1,posCenter={x:0,z:0}){const template=document.createElement("template");template.innerHTML=htmlCode;const content=template.content.cloneNode(!0);document.body.appendChild(content),mapOpt.ratio=mapRatioInput,mapOpt.x=posCenter.x,mapOpt.z=posCenter.z;const mapUpdateInterval=setInterval(()=>{drawRedDot(posMap,ccgxkObj)},50)}const htmlCode=`
<style>
    /* 使用一个独特的 ID 或 class 来限定样式作用域 */
    #posMap {
        position: fixed;
        right: 50px;
        bottom: 50px;
        opacity: 0.8;
        border: 1px solid #ccc; /* 增加边框以便看清 */
        background-color: #f0f0f0; /* 增加背景色 */
        user-select: none;           /* 标准语法 */
        -webkit-user-select: none;   /* Safari/Chrome */
        -moz-user-select: none;      /* Firefox */
        -ms-user-select: none;       /* 旧版 IE/Edge */
    }
</style>
<canvas id="posMap" width="100" height="100"></canvas>
`;function drawRedDot(canvasElement,ccgxkObj){const mvp=ccgxkObj.mainVPlayer;if(ccgxkObj?.isMVPInit!==!0)return 0;const ctx=canvasElement.getContext("2d"),centerX=canvasElement.width/2,centerY=canvasElement.height/2;let playerMapX=mvp.X/5e3*mapOpt.ratio*centerX,playerMapZ=mvp.Z/5e3*mapOpt.ratio*centerY;const gridSize=canvasElement.width/10;ctx.clearRect(0,0,canvasElement.width,canvasElement.height),ctx.fillStyle="#fff",ctx.fillRect(0,0,canvasElement.width,canvasElement.height),ctx.fillStyle="#F5F7FF";for(let row=0;row<10;row++)for(let col=0;col<10;col++)(row+col)%2===0&&ctx.fillRect(row*gridSize,col*gridSize,gridSize,gridSize);const finalPlayerX=centerX+playerMapX+mapOpt.x,finalPlayerY=centerY+playerMapZ+mapOpt.z;ctx.beginPath(),ctx.arc(centerX,centerY,2,0,2*Math.PI),ctx.arc(finalPlayerX,finalPlayerY,1,0,2*Math.PI),ctx.fillStyle="red",ctx.fill(),ctx.strokeStyle="#9AFF4D",ctx.lineWidth=1,ctx.beginPath(),ctx.moveTo(finalPlayerX,finalPlayerY);const mainPlayer=ccgxkObj.W.current.mainPlayer,northAngle=ccgxkObj.calYAngle(mainPlayer.rx,mainPlayer.ry,mainPlayer.rz),lineEndX=finalPlayerX-100*Math.sin(northAngle),lineEndY=finalPlayerY-100*Math.cos(northAngle);ctx.lineTo(lineEndX,lineEndY),ctx.stroke()}
