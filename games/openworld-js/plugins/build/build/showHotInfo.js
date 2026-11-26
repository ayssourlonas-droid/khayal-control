export default function(ccgxkObj){var g={showScreenHotInfo:()=>{const G=ccgxkObj.centerDot.init,Curr=ccgxkObj.hotPoint;if(Curr===G.showScreenHotInfo_lastId)return;const{f}=G;let newHtml="";if(Curr>=0){const info=ccgxkObj.indexToArgs.get(Curr);if(info){const p_offset=Curr*8;info.width=ccgxkObj.physicsProps[p_offset+1],info.height=ccgxkObj.physicsProps[p_offset+2],info.depth=ccgxkObj.physicsProps[p_offset+3],info.rX=info.rX||0,info.rY=info.rY||0,info.rZ=info.rZ||0,newHtml=`<table class="data-table">
                        <tr>
                            <td>宽: ${f(info.width)},</td>
                            <td>高: ${f(info.height)},</td>
                            <td>深: ${f(info.depth)}</td>
                        </tr>
                        <tr>
                            <td>X: ${f(info.X)},</td>
                            <td>Y: ${f(info.Y)},</td>
                            <td>Z: ${f(info.Z)}</td>
                        </tr>
                        <tr>
                            <td>rX: ${f(info.rX)},</td>
                            <td>rY: ${f(info.rY)},</td>
                            <td>rZ: ${f(info.rZ)}</td>
                        </tr>
                    </table>`}}hotPointInfo.innerHTML=newHtml,G.showScreenHotInfo_lastId=Curr},showScreenHotInfo_lastId:-1};ccgxkObj.centerDot.init={...g,...ccgxkObj.centerDot.init}}
