import{getServerAddress}from"./serverConfig.js";const STORAGE_PREFIX="openworld_tab_address_favorites:",STYLE_ID="addressFavoritesStyle",MAX_FAVORITES=12;function ensureAddressFavoritesStyle(){if(document.getElementById(STYLE_ID))return;const style=document.createElement("style");style.id=STYLE_ID,style.textContent=`
    .address-favorite-server {
        max-width: 100%;
        margin-bottom: 8px;
        padding: 4px 8px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.05);
        color: #111;
        font-family: monospace;
        font-size: 11px;
        line-height: 1.35;
        overflow-wrap: anywhere;
    }

    .address-favorite-tools {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
    }

    .address-favorite-name {
        flex: 1;
        min-width: 0;
        height: 32px;
        padding: 5px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 13px;
    }

    .address-favorite-save {
        min-width: 112px;
        height: 32px;
        white-space: nowrap;
    }

    .address-favorite-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin: 8px 0;
    }

    .address-favorite-item {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 30px;
        gap: 6px;
        min-height: 34px;
    }

    .address-favorite-chip {
        display: flex;
        align-items: center;
        min-width: 0;
        min-height: 34px;
        padding: 6px 9px;
        border: 1px solid rgba(0, 0, 0, 0.16);
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.72);
        color: #111;
        text-align: left;
    }

    .address-favorite-index {
        flex: 0 0 22px;
        width: 22px;
        height: 22px;
        margin-right: 8px;
        border-radius: 50%;
        background: #111;
        color: #fff;
        font-size: 12px;
        line-height: 22px;
        text-align: center;
    }

    .address-favorite-text {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .address-favorite-delete {
        width: 30px;
        min-width: 30px;
        min-height: 34px;
        padding: 0;
        border: 1px solid rgba(0, 0, 0, 0.14);
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.58);
        color: #333;
        font-size: 15px;
        line-height: 1;
    }

    .address-favorite-empty {
        padding: 6px 0;
        color: #333;
        font-size: 12px;
    }
    `,document.head.appendChild(style)}function mountAddressFavorites($){const mount=$("addressFavoritesMount");return mount?(mount.innerHTML=`
        <h3>Places</h3>
        <div id="addressFavoriteServer" class="address-favorite-server">World: loading</div>
        <div class="address-favorite-tools">
            <input type="text" id="addressFavoriteName" class="address-favorite-name" maxlength="28" placeholder="Optional name">
            <button id="addressFavoriteSave" class="tab-btn-md address-favorite-save">Save Here</button>
        </div>
        <div id="addressFavoriteList" class="address-favorite-list"></div>
        <div id="addressFavoriteStatus" class="tab-note tab-note-mb8">Places are saved for this World API only.</div>
        <hr>
    `,{serverEl:$("addressFavoriteServer"),nameInput:$("addressFavoriteName"),saveBtn:$("addressFavoriteSave"),listEl:$("addressFavoriteList"),statusEl:$("addressFavoriteStatus")}):null}function isValidNum(num){return typeof num=="number"&&Number.isFinite(num)}function roundCoord(num){return Math.round(num*100)/100}function getStorageKey(){return STORAGE_PREFIX+encodeURIComponent(getServerAddress())}function readCurrentPose(ccgxkObj){const mvp=ccgxkObj?.mainVPlayer,pos=mvp?.body?.position;return!pos||!isValidNum(pos.x)||!isValidNum(pos.y)||!isValidNum(pos.z)?null:{x:roundCoord(pos.x),y:roundCoord(pos.y),z:roundCoord(pos.z),rX:isValidNum(mvp?.rX)?roundCoord(mvp.rX):0,rY:isValidNum(ccgxkObj?.keys?.turnRight)?roundCoord(ccgxkObj.keys.turnRight):0,rZ:isValidNum(mvp?.rZ)?roundCoord(mvp.rZ):0}}function normalizeFavorite(raw){if(!raw||!raw.pose)return null;const pose=raw.pose;return!isValidNum(pose.x)||!isValidNum(pose.y)||!isValidNum(pose.z)?null:{id:String(raw.id||Date.now()),label:String(raw.label||"Point").trim().slice(0,28)||"Point",pose:{x:roundCoord(pose.x),y:roundCoord(pose.y),z:roundCoord(pose.z),rX:isValidNum(pose.rX)?roundCoord(pose.rX):0,rY:isValidNum(pose.rY)?roundCoord(pose.rY):0,rZ:isValidNum(pose.rZ)?roundCoord(pose.rZ):0},createdAt:Number.isFinite(raw.createdAt)?raw.createdAt:Date.now()}}function readFavorites(){try{const parsed=JSON.parse(localStorage.getItem(getStorageKey())||"[]");return Array.isArray(parsed)?parsed.map(normalizeFavorite).filter(Boolean).slice(0,MAX_FAVORITES):[]}catch(error){return console.warn("[addressFavorites] read failed:",error),[]}}function saveFavorites(favorites){localStorage.setItem(getStorageKey(),JSON.stringify(favorites.slice(0,MAX_FAVORITES)))}function makeDefaultLabel(favorites,pose){return`P${favorites.length+1} ${pose.x},${pose.y},${pose.z}`}function makeFavoriteId(){return`place_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`}function teleportToPose(ccgxkObj,pose){const mvp=ccgxkObj?.mainVPlayer,body=mvp?.body;return!body||!pose?!1:(body.position.set(pose.x,pose.y,pose.z),body.velocity?.set?.(0,0,0),body.angularVelocity?.set?.(0,0,0),body.force?.set?.(0,0,0),body.torque?.set?.(0,0,0),isValidNum(pose.rY)&&ccgxkObj?.keys&&(ccgxkObj.keys.turnRight=pose.rY),isValidNum(pose.rX)&&(mvp.rX=pose.rX),isValidNum(pose.rZ)&&(mvp.rZ=pose.rZ),ccgxkObj.lastPos={...pose},!0)}function createFavoriteRow(favorite,index,onGo,onDelete){const row=document.createElement("div");row.className="address-favorite-item";const goBtn=document.createElement("button");goBtn.type="button",goBtn.className="address-favorite-chip",goBtn.title=`Go: ${favorite.pose.x}, ${favorite.pose.y}, ${favorite.pose.z}`;const badge=document.createElement("span");badge.className="address-favorite-index",badge.textContent=String(index+1);const text=document.createElement("span");text.className="address-favorite-text",text.textContent=favorite.label,goBtn.append(badge,text),goBtn.addEventListener("click",()=>onGo(favorite));const deleteBtn=document.createElement("button");return deleteBtn.type="button",deleteBtn.className="address-favorite-delete",deleteBtn.title="Delete",deleteBtn.textContent="x",deleteBtn.addEventListener("click",()=>onDelete(favorite.id)),row.append(goBtn,deleteBtn),row}export function initAddressFavorites($,ccgxkObj,options={}){ensureAddressFavoritesStyle();const elements=mountAddressFavorites($);if(!elements)return;const{serverEl,nameInput,saveBtn,listEl,statusEl}=elements,onArrive=typeof options.onArrive=="function"?options.onArrive:null;if(!serverEl||!nameInput||!saveBtn||!listEl)return;function setStatus(text){statusEl&&(statusEl.textContent=text)}function render(){const favorites=readFavorites();if(serverEl.textContent=`World: ${getServerAddress()}`,listEl.innerHTML="",favorites.length===0){const empty=document.createElement("div");empty.className="address-favorite-empty",empty.textContent="No saved places yet.",listEl.appendChild(empty);return}favorites.forEach((favorite,index)=>{listEl.appendChild(createFavoriteRow(favorite,index,item=>{if(!teleportToPose(ccgxkObj,item.pose)){setStatus("Player is not ready yet.");return}setStatus(`Arrived: ${item.label}`),onArrive?.(item)},favoriteId=>{const nextFavorites=readFavorites().filter(item=>item.id!==favoriteId);saveFavorites(nextFavorites),setStatus("Deleted."),render()}))})}function saveCurrentPlace(){const pose=readCurrentPose(ccgxkObj);if(!pose){setStatus("Player is not ready yet.");return}const favorites=readFavorites(),customLabel=nameInput.value.trim().slice(0,28),favorite={id:makeFavoriteId(),label:customLabel||makeDefaultLabel(favorites,pose),pose,createdAt:Date.now()};saveFavorites([favorite,...favorites].slice(0,MAX_FAVORITES)),nameInput.value="",setStatus(`Saved: ${favorite.label}`),render()}saveBtn.addEventListener("click",saveCurrentPlace),nameInput.addEventListener("keydown",event=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="s"){event.preventDefault(),saveCurrentPlace();return}event.key==="Enter"&&(event.preventDefault(),saveCurrentPlace())}),render()}
