import{S as e,_ as t,a as n,d as r,f as i,g as a,h as o,l as s,n as c,o as l,s as u,u as d,x as f,y as p}from"./index-BdmC26gT.js";import{REMOTE_ANIMATION_CONFIG as m,REMOTE_ANIMATION_SLOTS as h,remoteAnimationSetForFighter as g}from"./characterAssets-Btzvo6Yn.js";import{spritePixelScale as _}from"./render-XMbXJr38.js";var v=h,y=[`none`,`hit`,`shield`,`projectile`,`explosion`,`smoke`,`speed`,`invincible`,`ko`],b=(e,t,n,r)=>{let i=Math.max(0,Math.floor(t*e.fps*n));return r?i%e.frameCount:Math.min(e.frameCount-1,i)},x=e=>f(e).displayName,S=e[0];if(!S)throw Error(`No fighter is available for the Lab.`);var C=e=>e.replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`),w=class{root;canvas;context;image=new Image;state={fighter:S,skin:`00`,animation:`idle`,facing:1,speed:1,loop:!0,playing:!0,frame:0};elapsed=0;previousTimestamp=performance.now();raf=0;destroyed=!1;selectedStage=d;selectedItem=`vitality-fruit`;selectedEffect=`none`;constructor(e){this.root=e,this.root.innerHTML=this.markup();let t=this.root.querySelector(`[data-lab-canvas]`),n=t?.getContext(`2d`);if(!t||!n)throw Error(`The Lab canvas is unavailable.`);this.canvas=t,this.context=n,this.root.addEventListener(`click`,this.handleClick),this.root.addEventListener(`change`,this.handleChange),this.root.addEventListener(`input`,this.handleInput),this.image.decoding=`async`,this.image.addEventListener(`load`,this.draw),this.loadAnimation(!0),this.raf=requestAnimationFrame(this.tick)}destroy(){this.destroyed||(this.destroyed=!0,cancelAnimationFrame(this.raf),this.image.removeEventListener(`load`,this.draw),this.root.removeEventListener(`click`,this.handleClick),this.root.removeEventListener(`change`,this.handleChange),this.root.removeEventListener(`input`,this.handleInput))}definition(){return g(this.state.fighter,this.state.skin,m).animations[this.state.animation]}markup(){let a=Object.entries(t).map(([e,t])=>`<option value="${e}">${C(t.label)}</option>`).join(``);return`
      <div class="cc-lab-workbench">
        <aside class="cc-lab-reel" aria-label="Lab selectorsoratoire">
          <div class="cc-lab-reel__label"><span>Bank A</span><strong>Fighter</strong></div>
          <label>Fighter
            <select data-lab-field="fighter">
              ${e.map(e=>`<option value="${e}"${n(e)?``:` disabled`}>${x(e)}${n(e)?``:` — render required`}</option>`).join(``)}
            </select>
          </label>
          <label>Skin
            <select data-lab-field="skin">
              ${c[this.state.fighter].map(e=>`<option value="${e.id}">${e.label}</option>`).join(``)}
            </select>
          </label>
          <label>Animation
            <select data-lab-field="animation">
              ${v.map(e=>`<option value="${e}">${e}</option>`).join(``)}
            </select>
          </label>
          <label>Facing
            <select data-lab-field="facing">
              <option value="1">Right</option>
              <option value="-1">Left</option>
            </select>
          </label>
          <div class="cc-lab-reel__label"><span>Bank B</span><strong>Stage & items</strong></div>
          <label>Stage
            <select data-lab-field="stage">
              ${i.map(e=>`<option value="${e}">${C(r[e].displayName)}</option>`).join(``)}
            </select>
          </label>
          <label>Item
            <select data-lab-field="item">${a}</select>
          </label>
          <label>Visual effect
            <select data-lab-field="effect">
              ${y.map(e=>`<option value="${e}">${e}</option>`).join(``)}
            </select>
          </label>
          <div class="cc-lab-item-preview" data-lab-item-preview aria-live="polite"></div>
          <button class="cc-lab-exercise" type="button" data-lab-action="exercise-item">Test item</button>
          <output class="cc-lab-item-result" data-lab-item-result>Scenario ready</output>
        </aside>

        <section class="cc-lab-monitor" aria-label="Frame-by-frame preview">
          <div class="cc-lab-monitor__header">
            <div><span>TEST LAB / FRAME UNIT</span><strong data-lab-clip-name>${C(x(this.state.fighter))} • idle</strong></div>
            <output data-lab-fps>30 FPS</output>
          </div>
          <div class="cc-lab-stage" data-lab-stage="${d}">
            <canvas data-lab-canvas width="512" height="512" aria-label="Animation frame"></canvas>
            <div class="cc-lab-effect" data-lab-effect="none" aria-hidden="true"><i></i><b></b><em></em></div>
            <div class="cc-lab-overlay cc-lab-overlay--hurt" data-lab-overlay="hurt" hidden></div>
            <div class="cc-lab-overlay cc-lab-overlay--hit" data-lab-overlay="hit" hidden></div>
            <svg class="cc-lab-overlay cc-lab-overlay--collision" data-lab-overlay="collision" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" aria-label="Solid volumes, platforms, and stage ledges" hidden>
              ${this.stageCollisionMarkup(d)}
            </svg>
          </div>
          <div class="cc-lab-transport">
            <button type="button" data-lab-action="previous" aria-label="Previous frame">◀|</button>
            <button type="button" data-lab-action="toggle" data-lab-play>Pause</button>
            <button type="button" data-lab-action="next" aria-label="Next frame">|▶</button>
            <label>Speed
              <input type="range" min="0.1" max="2" step="0.1" value="1" data-lab-field="speed">
              <output data-lab-speed>1.0×</output>
            </label>
            <label class="cc-lab-check"><input type="checkbox" data-lab-field="loop" checked> Loop</label>
          </div>
          <div class="cc-lab-timeline">
            <input type="range" min="0" max="1" value="0" data-lab-field="frame" aria-label="Exact frame">
            <output data-lab-frame>Frame 1 / 1</output>
          </div>
          <div class="cc-lab-debug">
            <label><input type="checkbox" data-lab-overlay-toggle="hurt"> Hurtbox</label>
            <label><input type="checkbox" data-lab-overlay-toggle="hit"> Hitbox</label>
            <label><input type="checkbox" data-lab-overlay-toggle="collision"> Collisions</label>
            <output data-lab-engine-state>playing=true · loop=true · facing=1</output>
          </div>
        </section>
      </div>`}loadAnimation(e){e&&(this.elapsed=0,this.state.frame=0);let t=this.definition();this.image.src=t.mediaUrl;let n=this.root.querySelector(`[data-lab-field='frame']`);n&&(n.max=String(Math.max(0,t.frameCount-1)),n.value=String(this.state.frame)),this.canvas.style.filter=`none`,this.updateHurtboxOverlay(),this.updateLabels(),this.draw()}tick=e=>{if(this.destroyed)return;let t=Math.min(.1,Math.max(0,(e-this.previousTimestamp)/1e3));if(this.previousTimestamp=e,this.state.playing&&this.image.complete&&this.image.naturalWidth>0){this.elapsed+=t;let e=b(this.definition(),this.elapsed,this.state.speed,this.state.loop);e!==this.state.frame&&(this.state.frame=e,this.draw(),this.updateLabels()),!this.state.loop&&e===this.definition().frameCount-1&&(this.state.playing=!1,this.updateLabels())}this.raf=requestAnimationFrame(this.tick)};draw=()=>{let e=this.definition(),t=this.context;if(t.clearRect(0,0,this.canvas.width,this.canvas.height),!this.image.complete||this.image.naturalWidth<=0)return;let n=this.state.frame%e.columns*e.cellSize,r=Math.floor(this.state.frame/e.columns)*e.cellSize;t.save();let i=e.sourceFacing===`right`?1:-1;this.state.facing!==i&&(t.translate(this.canvas.width,0),t.scale(-1,1)),t.drawImage(this.image,n,r,e.cellSize,e.cellSize,0,0,this.canvas.width,this.canvas.height),t.restore()};updateLabels(){let e=this.definition(),t=this.root.querySelector(`[data-lab-clip-name]`),n=this.root.querySelector(`[data-lab-fps]`),r=this.root.querySelector(`[data-lab-frame]`),i=this.root.querySelector(`[data-lab-engine-state]`),a=this.root.querySelector(`[data-lab-play]`),o=this.root.querySelector(`[data-lab-field='frame']`);t&&(t.textContent=`${x(this.state.fighter)} • ${e.label}`),n&&(n.value=`${Math.round(e.fps*this.state.speed)} FPS`),r&&(r.value=`Frame ${this.state.frame+1} / ${e.frameCount}`),i&&(i.value=`playing=${this.state.playing} · loop=${this.state.loop} · facing=${this.state.facing} · frame=${this.state.frame}`),a&&(a.textContent=this.state.playing?`Pause`:`Lecture`),o&&(o.value=String(this.state.frame)),this.updateItemPreview()}updateHurtboxOverlay(){let e=this.root.querySelector(`[data-lab-overlay='hurt']`);if(!e)return;let t=s(f(this.state.fighter).size,this.state.animation===`crouch`?`crouch`:`idle`),n=(this.canvas.getBoundingClientRect().width||this.canvas.width)/(this.definition().cellSize*_(this.state.fighter));e.style.width=`${t.radius*2*n}px`,e.style.height=`${t.halfHeight*2*n}px`,e.style.transform=`translateY(${-t.centerOffsetY*n}px)`,e.dataset.hurtboxFighter=this.state.fighter,e.dataset.hurtboxState=this.state.animation===`crouch`?`crouch`:`standing`}stageCollisionMarkup(e){let t=r[e];return t.platforms.map(t=>{let n=t.x-t.width/2,r=t.x+t.width/2,i=a(e,{x:n,y:o(t,n)}),s=a(e,{x:r,y:o(t,r)});return t.kind===`platform`?`<line x1="${i.x.toFixed(2)}" y1="${i.y.toFixed(2)}" x2="${s.x.toFixed(2)}" y2="${s.y.toFixed(2)}" data-stage-surface="${C(t.id)}" class="is-platform" />`:`<polygon points="${[i,s,a(e,{x:r,y:o(t,r)-t.height}),a(e,{x:n,y:o(t,n)-t.height})].map(({x:e,y:t})=>`${e.toFixed(2)},${t.toFixed(2)}`).join(` `)}" data-stage-surface="${C(t.id)}" class="is-ground" />`}).join(``)+t.ledges.map(n=>{let r=t.platforms.find(({id:e})=>e===n.platformId);if(!r)return``;let i=r.x+(n.side===`left`?-r.width/2:r.width/2),s=a(e,{x:i,y:o(r,i)});return`<circle cx="${s.x.toFixed(2)}" cy="${s.y.toFixed(2)}" r="5" data-stage-ledge="${C(`${n.platformId}:${n.side}`)}" class="is-ledge" />`}).join(``)}updateItemPreview(){let e=this.root.querySelector(`[data-lab-field='item']`),n=this.root.querySelector(`[data-lab-item-preview]`),r=e?.value,i=r?t[r]:void 0;!n||!i||(n.innerHTML=`
      <img src="${i.iconUrl}" alt="" decoding="async" draggable="false">
      <div><strong>${C(i.label)}</strong><small>${C(i.effect)} • ${i.charges} charge${i.charges>1?`s`:``}</small></div>`)}handleClick=e=>{let t=(e.target instanceof Element?e.target.closest(`[data-lab-action]`):null)?.dataset.labAction;if(t){if(t===`toggle`)this.state.playing=!this.state.playing,this.state.playing&&!this.state.loop&&this.state.frame>=this.definition().frameCount-1&&(this.elapsed=0,this.state.frame=0);else if(t===`previous`||t===`next`){this.state.playing=!1;let e=t===`next`?1:-1;this.state.frame=Math.max(0,Math.min(this.definition().frameCount-1,this.state.frame+e)),this.elapsed=this.state.frame/(this.definition().fps*this.state.speed),this.draw()}else t===`exercise-item`&&this.exerciseSelectedItem();this.updateLabels()}};handleChange=e=>{let t=e.target;if(!(t instanceof HTMLInputElement||t instanceof HTMLSelectElement)||t instanceof HTMLInputElement&&this.syncOverlayToggle(t))return;let n=t.dataset.labField;if(n===`fighter`&&t instanceof HTMLSelectElement){this.state.fighter=t.value;let e=this.root.querySelector(`[data-lab-field='skin']`);if(e){let t=c[this.state.fighter];t.some(({id:e})=>e===this.state.skin)||(this.state.skin=t[0].id),e.innerHTML=t.map(e=>`<option value="${e.id}">${e.label}</option>`).join(``),e.value=this.state.skin}this.loadAnimation(!0)}else if(n===`skin`)this.state.skin=t.value,this.loadAnimation(!1);else if(n===`animation`)this.state.animation=t.value,this.loadAnimation(!0);else if(n===`facing`)this.state.facing=t.value===`-1`?-1:1,this.draw(),this.updateLabels();else if(n===`loop`&&t instanceof HTMLInputElement)this.state.loop=t.checked,this.updateLabels();else if(n===`stage`){this.selectedStage=t.value;let e=this.root.querySelector(`[data-lab-stage]`);e&&(e.dataset.labStage=t.value);let n=this.root.querySelector(`[data-lab-overlay='collision']`);n&&(n.innerHTML=this.stageCollisionMarkup(this.selectedStage))}else if(n===`item`)this.selectedItem=t.value,this.updateItemPreview();else if(n===`effect`){this.selectedEffect=t.value;let e=this.root.querySelector(`[data-lab-effect]`);e&&(e.dataset.labEffect=`none`,e.offsetWidth,e.dataset.labEffect=this.selectedEffect)}};handleInput=e=>{let t=e.target;if(!(t instanceof HTMLInputElement)||this.syncOverlayToggle(t))return;let n=t.dataset.labField;if(n===`frame`)this.state.playing=!1,this.state.frame=Number(t.value),this.elapsed=this.state.frame/(this.definition().fps*this.state.speed),this.draw(),this.updateLabels();else if(n===`speed`){this.state.speed=Number(t.value);let e=this.root.querySelector(`[data-lab-speed]`);e&&(e.value=`${this.state.speed.toFixed(1)}×`),this.updateLabels()}};syncOverlayToggle(e){let t=e.dataset.labOverlayToggle;return t?(this.root.querySelector(`[data-lab-overlay="${t}"]`)?.toggleAttribute(`hidden`,!e.checked),!0):!1}exerciseSelectedItem(){let n=this.root.querySelector(`[data-lab-item-result]`),r=t[this.selectedItem],i=e.find(e=>e!==this.state.fighter)??this.state.fighter,a=u({players:[{fighter:this.state.fighter,skin:this.state.skin,name:`Test`,slot:0,cpu:!1,cpuLevel:1},{fighter:i,skin:`00`,name:`Target`,slot:1,cpu:!1,cpuLevel:1}],stocks:3,items:!1,itemFrequency:`medium`,stage:this.selectedStage},{countdownFrames:0,seed:7,spawnPositions:[{x:-90,y:52},{x:90,y:52}]}),o=()=>[l(),l()];for(let e=0;e<90;e+=1)a.step(o());let s=a.getSnapshot().fighters[0].position;a.spawnItem(this.selectedItem,s);let c=[],d=e=>{c.push(...a.step(e).events)};if(p(this.selectedItem))d(o());else{d([this.testInput(`grab`),l()]);for(let e=0;e<8;e+=1)d(o());d([this.testInput(`attack`,1),l()]);for(let e=0;e<120;e+=1)d(o())}let f=a.getSnapshot(),m=c.some(e=>e.type===`item-use`&&e.item===this.selectedItem),h=c.some(e=>e.type===`hit`&&e.item===this.selectedItem),g=f.fighters[0].heldItem,_=f.items.find(e=>e.kind===this.selectedItem);n&&(n.value=`${m?`USE ✓`:`USE —`} · ${h?`HIT ✓`:g?`${g.charges} charge(s)`:_?_.mode:r.effect}`)}testInput(e,t=0){return{held:new Set([e]),pressed:new Set([e]),released:new Set,direction:{x:t,y:0}}}};export{w as TestLabController};