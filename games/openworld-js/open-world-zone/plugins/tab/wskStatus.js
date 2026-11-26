export function initWskStatus(ccgxkObj){window.__wskStatusTimer&&(clearInterval(window.__wskStatusTimer),window.__wskStatusTimer=null);function updateWskStatusPanel(){const container=document.getElementById("wskStudio");if(!container||!ccgxkObj?.dataProc?.typesMeta)return;const wskUsed=[],bskUsed=[],dskUsed=[],[m1,m2,m3]=ccgxkObj.dataProc.typesMeta;for(let i=m1.startIdx;i<m1.endIdx;i+=m1.step)ccgxkObj.indexToArgs.has(i)&&wskUsed.push(i);for(let i=m2.startIdx;i<m2.endIdx;i+=m2.step)ccgxkObj.indexToArgs.has(i)&&bskUsed.push(i);for(let i=m3.startIdx;i<m3.endIdx;i+=m3.step)ccgxkObj.indexToArgs.has(i)&&dskUsed.push(i);let gridHTML="";for(let i=0;i<m1.total;i++){const idx=m1.startIdx+i*m1.step,has=ccgxkObj.indexToArgs.has(idx),info=has?ccgxkObj.indexToArgs.get(idx):null;gridHTML+=`<span title="idx:${idx} ${info?info?.n:"empty"}"
                style="display:inline-block;width:18px;height:18px;line-height:18px;text-align:center;
                font-size:11px;margin:1px;cursor:default;border-radius:2px;
                background:${has?"#3a7bd5":"#00ecd8"};color:${has?"#fff":"#999"};">
                ${has?"■":"·"}
            </span>`,(i+1)%10===0&&(gridHTML+="<br>")}const bar=(used,total,color)=>{const pct=Math.round(used/total*100);return`
                <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                    <div style="flex:1;height:10px;background:#00ecd8;border-radius:5px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;background:${color};border-radius:5px;transition:width 0.3s;"></div>
                    </div>
                    <span style="font-size:11px;color:#555;min-width:80px;">${used} / ${total} (${pct}%)</span>
                </div>`};container.innerHTML=`
            <div style="font-family:monospace;font-size:12px;line-height:1.6;">
                <div style="margin-bottom:10px;">
                    <div style="font-size:11px;color:#888;margin-bottom:4px;">
                        WSK: ${wskUsed.length}, BSK: ${bskUsed.length}, DSK: ${dskUsed.length}
                        &nbsp;<span style="color:#3a7bd5;">■ Occupied</span>
                        &nbsp;<span style="color:#999;">· Free</span>
                    </div>
                    ${gridHTML}
                </div>

                <hr style="border:none;border-top:1px solid #ddd;margin:8px 0;">

                <div>
                    <div style="font-size:11px;color:#555;margin-bottom:2px;">WSK</div>
                    ${bar(wskUsed.length,m1.total,"#3a7bd5")}

                    <div style="font-size:11px;color:#555;margin:6px 0 2px;">BSK</div>
                    ${bar(bskUsed.length,m2.total,"#9b59b6")}

                    <div style="font-size:11px;color:#555;margin:6px 0 2px;">DSK</div>
                    ${bar(dskUsed.length,m3.total,"#27ae60")}
                </div>

                <div style="font-size:10px;color:#aaa;margin-top:8px;text-align:right;">
                    Updated at ${new Date().toLocaleTimeString()}
                </div>
            </div>
        `}updateWskStatusPanel(),window.__wskStatusTimer=setInterval(updateWskStatusPanel,1e3)}
