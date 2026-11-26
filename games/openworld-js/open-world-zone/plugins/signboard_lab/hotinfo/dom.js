import{signContentMap,signIndexMap,lazyLoadSign}from"../store.js";import{isRemarkContentFallbackEnabled}from"./remarkFallbackPreference.js";export const htmlTemplate=`
<button id="signHotInfoToggle" style="display: none;">Hide</button>
<div id="signHotInfo" class="sign-hot-info" style="display: none;">
    <div class="sign-hot-info-body" id="signHotInfoBody">
        <div class="sign-hot-info-row">
            <span class="sign-hot-info-label"></span>
            <span class="sign-hot-info-value" id="signHotInfoId">-</span>
            <span class="sign-hot-info-actions">
                <a id="signHotInfoRefresh">[refresh]</a>
                <span id="signHotInfoRefreshStatus"></span>
            </span>
        </div>
        <div class="sign-hot-info-row">
            <span class="sign-hot-info-label"></span>
            <span class="sign-hot-info-value" id="signHotInfoDate">-</span>
        </div>
        <div class="sign-hot-info-view-original" id="signHotInfoViewOriginal" style="display: none;">
            <a>[View Img]</a>
            <a id="signHotInfoPopImage">[Pop]</a>
            <a id="signHotInfoEditImage">[Edit]</a>
        </div>
        <div class="sign-hot-info-view-original" id="signHotInfoCopyText" style="display: none;">
            <a>[View Txt]</a>
            <a id="signHotInfoPopText">[Pop]</a>
            <a id="signHotInfoEditText">[Edit]</a>
        </div>
        <div class="sign-hot-info-view-original" id="signHotInfoViewEmpty" style="display: none;">
            <a>[View]</a>
            <a id="signHotInfoPopEmpty">[Pop]</a>
            <a id="signHotInfoEditEmpty">[Edit]</a>
        </div>
        <div class="sign-hot-info-remark" id="signHotInfoRemark" style="display: none;"></div>
    </div>
</div>
<div id="signHotInfoContentModal" style="display: none;">
    <div class="sign-hot-info-content-modal-backdrop" id="signHotInfoContentModalBackdrop"></div>
    <div class="sign-hot-info-content-modal-panel" role="dialog" aria-modal="true" aria-label="Content Preview">
        <div class="sign-hot-info-content-modal-header">
            <span id="signHotInfoContentModalTitle">Info</span>
            <div class="sign-hot-info-text-modal-actions">
                <button type="button" id="signHotInfoContentModalEdit" style="display: none;">Edit</button>
                <button type="button" id="signHotInfoContentModalOpen" style="display: none;">POP</button>
                <button type="button" id="signHotInfoContentModalClose">Close</button>
            </div>
        </div>
        <div class="sign-hot-info-content-modal-body">
            <pre id="signHotInfoContentModalText"></pre>
            <div class="sign-hot-info-content-modal-image-wrap" id="signHotInfoContentModalImageWrap" hidden>
                <img id="signHotInfoContentModalImage" alt="" />
            </div>
        </div>
    </div>
</div>
`,LINK_PATTERN=/(?:[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s<]+|(?:https?:\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s<]*)?)/g;export function normalizeLinkUrl(rawUrl){return rawUrl?/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawUrl)?rawUrl:`https://${rawUrl}`:""}export function isHtmlRemarkText(text=""){return/^\s*</.test(text)&&text.includes(">")}function formatLinkDisplay(link,rawUrl,shortenDisplay=!0){const fullUrl=rawUrl||link.getAttribute("href")||link.textContent||"",displayUrl=fullUrl.replace(/^https?:\/\//i,"");link.title=fullUrl,link.textContent=shortenDisplay&&displayUrl.length>10?`${displayUrl.slice(0,10)}...`:displayUrl}function formatLinksInContainer(container){container.querySelectorAll("a").forEach(link=>{formatLinkDisplay(link,link.getAttribute("href")||link.textContent||"")})}export function normalizeRemarkHtml(remark="",options={}){const{shortenDisplay=!0}=options,wrapper=document.createElement("div");return wrapper.innerHTML=String(remark||""),wrapper.querySelectorAll("a").forEach(link=>{formatLinkDisplay(link,link.getAttribute("href")||link.textContent||"",shortenDisplay)}),wrapper.innerHTML}function renderTextWithLinks(container,text,options={}){container.replaceChildren();const sourceText=text||"",{shortenDisplay=!0}=options;let lastIndex=0;sourceText.replace(LINK_PATTERN,(match,offset)=>{offset>lastIndex&&container.appendChild(document.createTextNode(sourceText.slice(lastIndex,offset)));const link=document.createElement("a");return link.href=normalizeLinkUrl(match),link.target="_blank",link.rel="noopener noreferrer",formatLinkDisplay(link,match,shortenDisplay),container.appendChild(link),lastIndex=offset+match.length,match}),lastIndex<sourceText.length&&container.appendChild(document.createTextNode(sourceText.slice(lastIndex)))}function getRemarkDisplayPayload(info){let extra=info?.extra||{};typeof extra=="string"&&(extra=JSON.parse(extra));const remark=extra?.remark;return remark?{type:"remark",value:remark}:isRemarkContentFallbackEnabled()?info?.mode==="text"&&info?.t?{type:"text",value:info.t}:info?.mode==="image"&&info?.imgUrl?{type:"text",value:info.imgUrl}:null:null}export function unlockPointer(){const exitLock=document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock;exitLock&&exitLock.call(document)}export function findBoardIdByIndex(hotIndex){for(const[id,data]of signIndexMap.entries())if(data.index===hotIndex)return id;return null}export function updateHotInfo(hotIndex,boardsData,isExpanded){const container=document.getElementById("signHotInfo"),idSpan=document.getElementById("signHotInfoId"),dateSpan=document.getElementById("signHotInfoDate"),remarkDiv=document.getElementById("signHotInfoRemark"),viewOriginalDiv=document.getElementById("signHotInfoViewOriginal"),viewEmptyDiv=document.getElementById("signHotInfoViewEmpty");if(hotIndex<0){container.style.display="none";return}const boardId=findBoardIdByIndex(hotIndex);if(!boardId){container.style.display="none";return}const info=signContentMap.get(boardId);if(!info){lazyLoadSign(boardId),container.style.display="none";return}container.style.display=isExpanded?"block":"none",idSpan.textContent=boardId;const boardData=boardsData.find(b=>b.id===boardId);if(boardData&&boardData.updated_at){const date=new Date(boardData.updated_at);dateSpan.textContent=date.toLocaleString("en-US",{year:"numeric",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit",second:"2-digit"})}else dateSpan.textContent="-";const copyTextDiv=document.getElementById("signHotInfoCopyText"),hasImageContent=info.mode==="image"&&!!info.imgUrl,hasTextContent=info.mode==="text"&&!!info.t;info.mode==="image"&&info.imgUrl?(viewOriginalDiv.style.display="block",copyTextDiv.style.display="none",viewEmptyDiv.style.display="none",viewOriginalDiv.dataset.imgUrl=info.imgUrl):info.mode==="text"&&info.t?(viewOriginalDiv.style.display="none",copyTextDiv.style.display="block",viewEmptyDiv.style.display="none",copyTextDiv.dataset.text=info.t):(viewOriginalDiv.style.display="none",copyTextDiv.style.display="none",viewEmptyDiv.style.display="none",viewOriginalDiv.dataset.imgUrl="");const remarkPayload=getRemarkDisplayPayload(info);remarkPayload?.value?(remarkPayload.type==="remark"&&isHtmlRemarkText(remarkPayload.value)?remarkDiv.innerHTML=normalizeRemarkHtml(remarkPayload.value):renderTextWithLinks(remarkDiv,remarkPayload.value,{shortenDisplay:remarkPayload.type==="remark"}),remarkDiv.style.display="block"):(remarkDiv.replaceChildren(),remarkDiv.style.display="none"),!hasImageContent&&!hasTextContent&&(viewEmptyDiv.style.display="block")}export function openContentModal(options={}){const modal=document.getElementById("signHotInfoContentModal"),title=document.getElementById("signHotInfoContentModalTitle"),textEl=document.getElementById("signHotInfoContentModalText"),imageWrap=document.getElementById("signHotInfoContentModalImageWrap"),imageEl=document.getElementById("signHotInfoContentModalImage"),editBtn=document.getElementById("signHotInfoContentModalEdit"),openBtn=document.getElementById("signHotInfoContentModalOpen");if(!modal||!title||!textEl||!imageWrap||!imageEl)return;const{type="text",titleText="Info",text="",imageUrl="",allowEdit=!1,allowOpen=!1}=options;title.textContent=titleText,textEl.hidden=type!=="text",imageWrap.hidden=type!=="image",type==="text"?(renderTextWithLinks(textEl,text,{shortenDisplay:!1}),imageEl.removeAttribute("src"),imageEl.alt=""):(textEl.replaceChildren(),imageEl.alt="",imageEl.src=imageUrl||""),editBtn&&(editBtn.style.display=allowEdit?"":"none"),openBtn&&(openBtn.style.display=allowOpen?"":"none"),modal.style.display="flex"}export function closeContentModal(){const modal=document.getElementById("signHotInfoContentModal"),title=document.getElementById("signHotInfoContentModalTitle"),textEl=document.getElementById("signHotInfoContentModalText"),imageWrap=document.getElementById("signHotInfoContentModalImageWrap"),imageEl=document.getElementById("signHotInfoContentModalImage"),editBtn=document.getElementById("signHotInfoContentModalEdit"),openBtn=document.getElementById("signHotInfoContentModalOpen");!modal||!title||!textEl||!imageWrap||!imageEl||(modal.style.display="none",title.textContent="Info",editBtn&&(editBtn.style.display="none"),openBtn&&(openBtn.style.display="none"),textEl.hidden=!1,textEl.replaceChildren(),imageWrap.hidden=!0,imageEl.removeAttribute("src"),imageEl.alt="")}
