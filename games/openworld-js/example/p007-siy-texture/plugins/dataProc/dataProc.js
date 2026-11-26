export default function(ccgxkObj){const dataProc={buildMode:0,totalCube:1e4,cubeIndex:0,myCubeInstances:[],wskIdx:-1,dataName:"",typesMeta:(()=>{const types=[[63e4,1e4],[Math.floor(1200)*300,300],[1e4,1]];let cursor=0;return types.map(([span,cap])=>{const meta={startIdx:cursor,endIdx:cursor+span,step:cap,total:span/cap};return cursor+=span,meta})})(),readData:function(data,offset){if(dataProc.cubeIndex>=dataProc.totalCube)return-1;data.del&&(data={x:999999999,y:999999999,z:999999999,w:.001,d:.001,h:.001});const result={x:(data?.x||0)+(offset?.x??0),y:(data?.y||1)+(offset?.y??0),z:(data?.z||0)+(offset?.z??0),w:data?.w||1,d:data?.d||1,h:data?.h||1,rx:data?.rx||0,ry:data?.ry||0,rz:data?.rz||0};return data?.b&&(result.b=data.b),data?.t&&(result.t=data.t),dataProc.myCubeInstances.push(result),dataProc.cubeIndex++},fullInst:function(data,offset){const len=data.length;for(let index=0;index<len&&!(dataProc.cubeIndex>=dataProc.totalCube);index++)dataProc.readData(data[index],offset)},addPhysical:function(data,instData,invisible){const boxLen=instData.length;for(let index=0;index<boxLen;index++){const args={DPZ:data[index]?.dz??4,isPhysical:!data[index]?.st,mass:0,background:"#4dff00ff",mixValue:.5,customIdx:dataProc.wskIdx+index,isShadow:!1,X:instData[index].x,Y:instData[index].y,Z:instData[index].z,width:instData[index].w,depth:instData[index].d,height:instData[index].h,rX:instData[index].rx,rY:instData[index].ry,rZ:instData[index].rz,isInvisible:invisible};instData[index].t&&(args.texture=instData[index].t),index===0&&(args.dataName=dataProc.dataName),ccgxkObj.addTABox(args)}},calcFreeIdx:function(start,end,step){for(let idx=start;idx<end;idx+=step)if(ccgxkObj.indexToArgs.get(idx)===void 0)return idx;return-1},renderInst:function(texture,model){ccgxkObj.W[model]({n:"sk_"+dataProc.wskIdx+"_"+dataProc.dataName,t:texture,instances:dataProc.myCubeInstances,mix:.7})},process:function({data,offset,texture,name="untitle",type=1,noIns=!1,model="cube",invisible=!0}={}){texture=texture||window.marble;const{startIdx,endIdx,step}=dataProc.typesMeta[type-1]??dataProc.typesMeta[0],cap=step;if(dataProc.wskIdx=dataProc.calcFreeIdx(startIdx,endIdx,step),dataProc.wskIdx===-1)return console.error(`Type ${type} 类型的存储空间已满（${startIdx}~${endIdx}），无法创建！`),-1;dataProc.totalCube=cap,dataProc.dataName=Math.floor(Math.random()*1e6),ccgxkObj.indexToArgs.set(dataProc.wskIdx,{n:name,type}),dataProc.fullInst(data,offset),dataProc.addPhysical(data,dataProc.myCubeInstances,invisible),noIns||dataProc.renderInst(texture,model);const wskID=dataProc.wskIdx;return dataProc.myCubeInstances=[],dataProc.buildMode=0,dataProc.totalCube=1e4,dataProc.cubeIndex=0,dataProc.wskIdx=-1,wskID}};ccgxkObj.dataProc=dataProc,window.dataProc=dataProc,ccgxkObj.deleteModBlock=function(blockIndex,cobj){cobj=cobj||ccgxkObj;const rootArgs=cobj.indexToArgs.get(blockIndex);if(!rootArgs)return;const dataName=rootArgs.dataName;let blockSize=dataProc.typesMeta[0].step;for(let i=0;i<dataProc.typesMeta.length;i++){const meta=dataProc.typesMeta[i];if(blockIndex>=meta.startIdx&&blockIndex<meta.endIdx){blockSize=meta.step;break}}for(let i=blockIndex;i<blockIndex+blockSize;i++){cobj.hiddenTABox(i);{const gridkey=cobj.indexToArgs.get(i)?.initGridKey;gridkey&&cobj.spatialGrid.has(gridkey)&&cobj.spatialGrid.get(gridkey).delete(i)}cobj.indexToArgs.delete(i)}cobj.W.delete("sk_"+blockIndex+"_"+dataName)};{let updateWskStudio=function(){const container=document.getElementById("wskStudio");if(!container)return;const type1=[],type2=[],type3=[],[m1,m2,m3]=ccgxkObj.dataProc.typesMeta;for(let i=m1.startIdx;i<m1.endIdx;i+=m1.step)ccgxkObj.indexToArgs.has(i)&&type1.push(i);for(let i=m2.startIdx;i<m2.endIdx;i+=m2.step)ccgxkObj.indexToArgs.has(i)&&type2.push(i);for(let i=m3.startIdx;i<m3.endIdx;i+=m3.step)ccgxkObj.indexToArgs.has(i)&&type3.push(i);let gridHTML="";for(let i=0;i<m1.total;i++){const idx=m1.startIdx+i*m1.step,has=ccgxkObj.indexToArgs.has(idx),info=has?ccgxkObj.indexToArgs.get(idx):null;gridHTML+=`<span title="idx:${idx} ${info?info?.n:"空"}"
                    style="display:inline-block;width:18px;height:18px;line-height:18px;text-align:center;
                    font-size:11px;margin:1px;cursor:default;border-radius:2px;
                    background:${has?"#3a7bd5":"#e0e0e0"};color:${has?"#fff":"#999"};">
                    ${has?"■":"·"}
                </span>`,(i+1)%10===0&&(gridHTML+="<br>")}const bar=(used,total,color)=>{const pct=Math.round(used/total*100);return`
                    <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                        <div style="flex:1;height:10px;background:#e0e0e0;border-radius:5px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:${color};border-radius:5px;transition:width 0.3s;"></div>
                        </div>
                        <span style="font-size:11px;color:#555;min-width:80px;">${used} / ${total} (${pct}%)</span>
                    </div>`},w=n=>Math.round(n/1e4);container.innerHTML=`
                <div style="font-family:monospace;font-size:12px;line-height:1.6;">

                    <div style="margin-bottom:10px;">
                        <div style="font-size:11px;color:#888;margin-bottom:4px;">
                            万数块 &nbsp;${type1.length} / ${m1.total} 已用
                            &nbsp;<span style="color:#3a7bd5;">■ 占用</span>
                            &nbsp;<span style="color:#999;">· 空闲</span>
                        </div>
                        ${gridHTML}
                    </div>

                    <hr style="border:none;border-top:1px solid #ddd;margin:8px 0;">

                    <div>
                        <div style="font-size:11px;color:#555;margin-bottom:2px;">万数块 (0 ~ ${w(m1.endIdx)}w)</div>
                        ${bar(type1.length,m1.total,"#3a7bd5")}

                        <div style="font-size:11px;color:#555;margin:6px 0 2px;">百数块 (${w(m2.startIdx)}w ~ ${w(m2.endIdx)}w)</div>
                        ${bar(type2.length,m2.total,"#9b59b6")}

                        <div style="font-size:11px;color:#555;margin:6px 0 2px;">单数块 (${w(m3.startIdx)}w ~ ${w(m3.endIdx)}w)</div>
                        ${bar(type3.length,m3.total,"#27ae60")}
                    </div>

                    <div style="font-size:10px;color:#aaa;margin-top:8px;text-align:right;">
                        更新于 ${new Date().toLocaleTimeString()}
                    </div>

                </div>
            `},_wskTimer=null;_wskTimer&&clearInterval(_wskTimer),_wskTimer=setInterval(updateWskStudio,1e3)}}
