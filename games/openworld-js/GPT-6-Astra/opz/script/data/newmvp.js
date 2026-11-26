function newMvp(){k.W.cube({n:"mainPlayer",hidden:!0,size:.5}),k.W.sphere({g:"mainPlayer",n:"mvp_head",y:.82,x:0,z:0,s:1,size:.5}),k.W.cube({g:"mainPlayer",n:"mvp_neck",y:.6,x:0,z:0,w:.1,h:.1,d:.1}),k.W.cube({g:"mainPlayer",n:"mvp_body",y:.3,x:0,z:0,w:.6,h:.5,d:.1}),k.W.cube({g:"mainPlayer",n:"joint_test",y:.47,x:.3,z:0,rz:15,ry:0,w:.1,h:.1,d:.1}),k.W.cube({g:"joint_test",n:"aaa",y:-2,x:0,z:0,rz:0,w:1,h:5,d:1}),k.W.cube({g:"mainPlayer",n:"joint_test_left",y:.47,x:-.3,z:0,rz:-15,ry:0,w:.1,h:.1,d:.1}),k.W.cube({g:"joint_test_left",n:"bbb",y:-2,x:0,z:0,rz:0,w:1,h:5,d:1}),k.W.cube({g:"mainPlayer",n:"joint_test_right_leg",y:.1,x:.15,z:0,w:.1,h:.1,d:.1}),k.W.cube({g:"joint_test_right_leg",n:"rightleg",y:-3,x:0,z:0,rz:0,w:1,h:6,d:1}),k.W.cube({g:"mainPlayer",n:"joint_test_left_leg",y:.1,x:-.15,z:0,w:.1,h:.1,d:.1}),k.W.cube({g:"joint_test_left_leg",n:"leftleg",y:-3,x:0,z:0,rz:0,w:1,h:6,d:1});{let updateWskStudio2=function(){const container=document.getElementById("wskStudio");if(!container)return;const type1=[],type2=[],type3=[];for(let i=0;i<63e4;i+=1e4)k.indexToArgs.has(i)&&type1.push(i);for(let i=63e4;i<99e4;i+=300)k.indexToArgs.has(i)&&type2.push(i);for(let i=99e4;i<1e6;i+=1)k.indexToArgs.has(i)&&type3.push(i);const t1Total=63,t2Total=1200,t3Total=1e4;let gridHTML="";for(let i=0;i<63;i++){const idx=i*1e4,has=k.indexToArgs.has(idx),info=has?k.indexToArgs.get(idx):null;gridHTML+=`<span title="idx:${idx} ${info?"":"空"}" 
                    style="display:inline-block;width:18px;height:18px;line-height:18px;text-align:center;
                    font-size:11px;margin:1px;cursor:default;border-radius:2px;
                    background:${has?"#3a7bd5":"#e0e0e0"};color:${has?"#fff":"#999"};">
                    ${has?"■":"·"}
                </span>`,(i+1)%10===0&&(gridHTML+="<br>")}const bar=(used,total,color)=>{const pct=Math.round(used/total*100),filled=Math.round(pct/5);return`
                    <div style="display:flex;align-items:center;gap:8px;margin:4px 0;">
                        <div style="flex:1;height:10px;background:#e0e0e0;border-radius:5px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:${color};border-radius:5px;transition:width 0.3s;"></div>
                        </div>
                        <span style="font-size:11px;color:#555;min-width:80px;">${used} / ${total} (${pct}%)</span>
                    </div>`};container.innerHTML=`
                <div style="font-family:monospace;font-size:12px;line-height:1.6;">

                    <!-- 万数块网格 -->
                    <div style="margin-bottom:10px;">
                        <div style="font-size:11px;color:#888;margin-bottom:4px;">
                            万数块 &nbsp;${type1.length} / ${t1Total} 已用
                            &nbsp;<span style="color:#3a7bd5;">■ 占用</span>
                            &nbsp;<span style="color:#999;">· 空闲</span>
                        </div>
                        ${gridHTML}
                    </div>

                    <hr style="border:none;border-top:1px solid #ddd;margin:8px 0;">

                    <!-- 三类进度条 -->
                    <div>
                        <div style="font-size:11px;color:#555;margin-bottom:2px;">万数块 (0 ~ 63w)</div>
                        ${bar(type1.length,t1Total,"#3a7bd5")}

                        <div style="font-size:11px;color:#555;margin:6px 0 2px;">百数块 (63w ~ 99w)</div>
                        ${bar(type2.length,t2Total,"#9b59b6")}

                        <div style="font-size:11px;color:#555;margin:6px 0 2px;">单数块 (99w ~ 100w)</div>
                        ${bar(type3.length,t3Total,"#27ae60")}
                    </div>

                    <!-- 底部时间戳 -->
                    <div style="font-size:10px;color:#aaa;margin-top:8px;text-align:right;">
                        更新于 ${new Date().toLocaleTimeString()}
                    </div>

                </div>
            `};var updateWskStudio=updateWskStudio2;let _wskTimer=null;_wskTimer&&clearInterval(_wskTimer),_wskTimer=setInterval(updateWskStudio2,1e3)}return;{let analyzeTexture2=function(myData){const result=new Array,len=myData.length;for(let i=0;i<len;i++){const obj=myData[i],texture=obj?.t??0;result[texture]===void 0&&(result[texture]=[]),result[texture].push(obj)}return result};var analyzeTexture;logicFunc(testcubedata);const getdata=logicData(testcubedata);get2data=analyzeTexture2(getdata)}{let doWork2=function(deadline){for(;deadline.timeRemaining()>0&&count<total;){let i=Math.floor(count/number)+1,j=count%number+1;tri(160+50*i-2e3,-60*j),count++}if(count<total)requestIdleCallback(doWork2);else{const endTime=performance.now();console.log("%c 任务全部完成！","color: #4caf50; font-weight: bold;"),console.log(`总计耗时: ${((endTime-startTime)/1e3).toFixed(2)} 秒`)}};var doWork;let number=57,total=number*number,count=0;console.log("开始利用闲时执行...");const startTime=performance.now();requestIdleCallback(doWork2)}function tri(zDis=60,xDis=0){const skySlot=SkylineSystem.claim(xDis,zDis),triggerState={inGemZone:!1,inBoardZone:!1,inHutZone:!1};let mvppos=-1,requestStateUpdate,runBusinessLogic,runGemfunc,runHutfunc,runBoardfunc,runSkylinefunc;{let x,m,m2,l;runGemfunc=()=>{x||(x=dataProc.process(x_m,{x:xDis,z:zDis},dls,"gem")),m||(m=dataProc.process(m_m,{x:xDis,z:zDis},dls,"board",2)),m2||(m2=dataProc.process(m2_m,{x:xDis,z:zDis},dls,"board2",2)),l&&(k.deleteModBlock(l),l=null),SkylineSystem.hide(skySlot)},runBoardfunc=()=>{m||(m=dataProc.process(m_m,{x:xDis,z:zDis},dls,"board",2)),m2||(m2=dataProc.process(m2_m,{x:xDis,z:zDis},dls,"board2",2)),x&&(k.deleteModBlock(x),x=null),l&&(k.deleteModBlock(l),l=null),SkylineSystem.hide(skySlot)},runHutfunc=()=>{l||(l=dataProc.process(l_m,{x:xDis,z:zDis},dls,"hut",2)),x&&(k.deleteModBlock(x),x=null),m&&(k.deleteModBlock(m),m=null),m2&&(k.deleteModBlock(m2),m2=null),SkylineSystem.hide(skySlot)},runSkylinefunc=()=>{x&&(k.deleteModBlock(x),x=null),m&&(k.deleteModBlock(m),m=null),m2&&(k.deleteModBlock(m2),m2=null),l&&(k.deleteModBlock(l),l=null),SkylineSystem.show(skySlot)}}{let stateDebounceTimer=null;requestStateUpdate=()=>{stateDebounceTimer&&clearTimeout(stateDebounceTimer),stateDebounceTimer=setTimeout(()=>{evaluateFinalState(),stateDebounceTimer=null},15)};const evaluateFinalState=()=>{let targetState=4;triggerState.inGemZone?targetState=1:triggerState.inBoardZone?targetState=2:triggerState.inHutZone?targetState=3:targetState=4,mvppos!==targetState&&(mvppos=targetState,runBusinessLogic(targetState))}}runBusinessLogic=state=>{switch(state){case 1:runGemfunc();break;case 2:runBoardfunc();break;case 3:runHutfunc();break;case 4:runSkylinefunc();break}},triggers.forEach(conf=>{triggersPosData[0].dz=conf.dz,triggersPosData[0].st=1;const idx=dataProc.process(triggersPosData,{x:xDis,z:zDis-60},dls,"setTriModel",3,!0),args=k.indexToArgs.get(idx+0);args.activeFunc=()=>{triggerState[conf.key]=!0,requestStateUpdate()},args.deleteFunc=()=>{triggerState[conf.key]=!1,requestStateUpdate()}})}}
