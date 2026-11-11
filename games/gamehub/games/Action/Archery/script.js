const gameState={score:0,bullseyes:0,hits:0,misses:0,totalShots:0},svg=document.querySelector("svg"),cursor=svg.createSVGPoint(),arrows=document.querySelector(".arrows"),scoreDisplay=document.getElementById("score"),bullseyesDisplay=document.getElementById("bullseyes"),shotsDisplay=document.getElementById("shots"),accuracyDisplay=document.getElementById("accuracy"),resetBtn=document.getElementById("resetBtn"),clearBtn=document.getElementById("clearBtn"),instructionToggle=document.getElementById("instructionToggle"),instructionPanel=document.getElementById("instructionPanel");let randomAngle=0;const target={x:900,y:249.5},lineSegment={x1:875,y1:280,x2:925,y2:220},pivot={x:100,y:250};aim({clientX:320,clientY:300}),window.addEventListener("mousedown",draw);const uiElements=[document.querySelector(".game-header"),document.querySelector(".instructions"),document.querySelector(".game-hint"),document.querySelector(".game-controls"),resetBtn,clearBtn,instructionToggle,instructionPanel];uiElements.forEach(element=>{element&&element.addEventListener("mousedown",e=>e.stopPropagation())}),resetBtn.addEventListener("click",resetGame),clearBtn.addEventListener("click",clearArrows),instructionToggle.addEventListener("click",toggleInstructions);function draw(e){const target2=e.target;target2.closest(".game-header")||target2.closest(".instructions")||target2.closest(".game-hint")||target2.closest(".game-controls")||target2.closest("button")||(randomAngle=Math.random()*Math.PI*.03-.015,TweenMax.to(".arrow-angle use",.3,{opacity:1}),window.addEventListener("mousemove",aim),window.addEventListener("mouseup",loose),aim(e))}function aim(e){var point=getMouseSVG(e);point.x=Math.min(point.x,pivot.x-7),point.y=Math.max(point.y,pivot.y+7);var dx=point.x-pivot.x,dy=point.y-pivot.y,angle=Math.atan2(dy,dx)+randomAngle,bowAngle=angle-Math.PI,distance=Math.min(Math.sqrt(dx*dx+dy*dy),50),scale=Math.min(Math.max(distance/30,1),2);TweenMax.to("#bow",.3,{scaleX:scale,rotation:bowAngle+"rad",transformOrigin:"right center"});var arrowX=Math.min(pivot.x-1/scale*distance,88);TweenMax.to(".arrow-angle",.3,{rotation:bowAngle+"rad",svgOrigin:"100 250"}),TweenMax.to(".arrow-angle use",.3,{x:-distance}),TweenMax.to("#bow polyline",.3,{attr:{points:"88,200 "+Math.min(pivot.x-1/scale*distance,88)+",250 88,300"}});var radius=distance*9,offset={x:Math.cos(bowAngle)*radius,y:Math.sin(bowAngle)*radius},arcWidth=offset.x*3;TweenMax.to("#arc",.3,{attr:{d:"M100,250c"+offset.x+","+offset.y+","+(arcWidth-offset.x)+","+(offset.y+50)+","+arcWidth+",50"},autoAlpha:distance/60})}function loose(){window.removeEventListener("mousemove",aim),window.removeEventListener("mouseup",loose),TweenMax.to("#bow",.4,{scaleX:1,transformOrigin:"right center",ease:Elastic.easeOut}),TweenMax.to("#bow polyline",.4,{attr:{points:"88,200 88,250 88,300"},ease:Elastic.easeOut});var newArrow=document.createElementNS("http://www.w3.org/2000/svg","use");newArrow.setAttributeNS("http://www.w3.org/1999/xlink","href","#arrow"),arrows.appendChild(newArrow);var path=MorphSVGPlugin.pathDataToBezier("#arc");TweenMax.to([newArrow],.5,{force3D:!0,bezier:{type:"cubic",values:path,autoRotate:["x","y","rotation"]},onUpdate:hitTest,onUpdateParams:["{self}"],onComplete:onMiss,ease:Linear.easeNone}),TweenMax.to("#arc",.3,{opacity:0}),TweenMax.set(".arrow-angle use",{opacity:0})}function hitTest(tween){var arrow=tween.target[0],transform=arrow._gsTransform,radians=transform.rotation*Math.PI/180,arrowSegment={x1:transform.x,y1:transform.y,x2:Math.cos(radians)*60+transform.x,y2:Math.sin(radians)*60+transform.y},intersection=getIntersection(arrowSegment,lineSegment);if(intersection.segment1&&intersection.segment2){tween.pause();var dx=intersection.x-target.x,dy=intersection.y-target.y,distance=Math.sqrt(dx*dx+dy*dy),selector=".hit",isBullseye=!1;distance<7?(selector=".bullseye",isBullseye=!0,updateScore(10,!0),showNotification("🎯 靶心！+10分","success")):(updateScore(5,!1),showNotification("✓ 命中！+5分","success")),showMessage(selector)}}function onMiss(){updateScore(0,!1),showMessage(".miss"),showNotification("✗ 未命中！","warning")}function showMessage(selector){TweenMax.killTweensOf(selector),TweenMax.killChildTweensOf(selector),TweenMax.set(selector,{autoAlpha:1}),TweenMax.staggerFromTo(selector+" path",.5,{rotation:-5,scale:0,transformOrigin:"center"},{scale:1,ease:Back.easeOut},.05),TweenMax.staggerTo(selector+" path",.3,{delay:2,rotation:20,scale:0,ease:Back.easeIn},.03)}function getMouseSVG(e){return cursor.x=e.clientX,cursor.y=e.clientY,cursor.matrixTransform(svg.getScreenCTM().inverse())}function getIntersection(segment1,segment2){var dx1=segment1.x2-segment1.x1,dy1=segment1.y2-segment1.y1,dx2=segment2.x2-segment2.x1,dy2=segment2.y2-segment2.y1,cx=segment1.x1-segment2.x1,cy=segment1.y1-segment2.y1,denominator=dy2*dx1-dx2*dy1;if(denominator==0)return null;var ua=(dx2*cy-dy2*cx)/denominator,ub=(dx1*cy-dy1*cx)/denominator;return{x:segment1.x1+ua*dx1,y:segment1.y1+ua*dy1,segment1:ua>=0&&ua<=1,segment2:ub>=0&&ub<=1}}function updateScore(points,isBullseye=!1){gameState.score+=points,gameState.totalShots++,isBullseye?(gameState.bullseyes++,gameState.hits++):points>0?gameState.hits++:gameState.misses++,updateDisplays()}function updateDisplays(){scoreDisplay.textContent=gameState.score,bullseyesDisplay.textContent=gameState.bullseyes,shotsDisplay.textContent=gameState.totalShots;const accuracy=gameState.totalShots>0?Math.round(gameState.hits/gameState.totalShots*100):0;accuracyDisplay.textContent=accuracy+"%",animateStatUpdate(scoreDisplay)}function animateStatUpdate(element){element.style.transform="scale(1.3)",element.style.color="#ffd700",setTimeout(()=>{element.style.transform="scale(1)",element.style.color="#ffffff"},300)}function resetGame(){gameState.score=0,gameState.bullseyes=0,gameState.hits=0,gameState.misses=0,gameState.totalShots=0,updateDisplays(),clearArrows(),showNotification("游戏已重置！","info")}function clearArrows(){arrows.innerHTML="",showNotification("箭矢已清除！","info")}function toggleInstructions(){instructionPanel.classList.toggle("active"),instructionPanel.classList.contains("active")?instructionToggle.style.transform="rotate(180deg)":instructionToggle.style.transform="rotate(0deg)"}function showNotification(message,type="success"){const notification=document.createElement("div");notification.className=`notification notification-${type}`,notification.textContent=message,notification.style.cssText=`
		position: fixed;
		top: 120px;
		left: 50%;
		transform: translateX(-50%);
		background: ${type==="success"?"linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)":type==="warning"?"linear-gradient(135deg, #fa709a 0%, #fee140 100%)":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)"};
		color: white;
		padding: 1rem 2rem;
		border-radius: 50px;
		font-size: 1rem;
		font-weight: 600;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
		z-index: 1000;
		animation: slideDownFade 0.5s ease;
	`,document.body.appendChild(notification),setTimeout(()=>{notification.style.animation="slideUpFade 0.5s ease",setTimeout(()=>{notification.remove()},500)},2e3)}const notificationStyles=document.createElement("style");notificationStyles.textContent=`
	@keyframes slideDownFade {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-20px);
		}
// Email: 2952671670@qq.com

// Developer: SinceraXY
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}
	
// QQ: 2952671670
	@keyframes slideUpFade {
		from {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
		to {
			opacity: 0;
			transform: translateX(-50%) translateY(-20px);
		}
	}

/* Project: https://github.com/SinceraXY/GameHub */
`,document.head.appendChild(notificationStyles);
