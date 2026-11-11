const SHOP_PACKAGES=[{id:"starter",icon:"💰",nameKey:"shop_pkg_starter",coins:1e3,bonusKey:null,priceUSD:"$0.99",popular:!1,paymentUrl:"https://buy.stripe.com/YOUR_STARTER_LINK"},{id:"standard",icon:"💎",nameKey:"shop_pkg_standard",coins:5500,bonusKey:"shop_pkg_standard_bonus",priceUSD:"$3.99",popular:!0,paymentUrl:"https://buy.stripe.com/YOUR_STANDARD_LINK"},{id:"premium",icon:"👑",nameKey:"shop_pkg_premium",coins:17e3,bonusKey:"shop_pkg_premium_bonus",priceUSD:"$9.99",popular:!1,paymentUrl:"https://buy.stripe.com/YOUR_PREMIUM_LINK"}],PACKAGE_COINS=Object.fromEntries(SHOP_PACKAGES.map(p=>[p.id,p.coins])),USED_SESSIONS_KEY="tetrisUsedPaymentSessions";function getUsedSessions(){try{const raw=localStorage.getItem(USED_SESSIONS_KEY);return raw?JSON.parse(raw):[]}catch{return[]}}function markSessionUsed(sid){try{const used=getUsedSessions();used.push(sid);const trimmed=used.slice(-100);localStorage.setItem(USED_SESSIONS_KEY,JSON.stringify(trimmed))}catch{}}function isSessionUsed(sid){return getUsedSessions().includes(sid)}function checkPaymentSuccess(){const params=new URLSearchParams(window.location.search),payment=params.get("payment"),pkg=params.get("pkg"),sid=params.get("sid");if(payment!=="success"||!pkg||!sid)return;const coins=PACKAGE_COINS[pkg];if(coins){if(isSessionUsed(sid)){cleanUrl();return}typeof window.tetriCoins<"u"&&window.tetriCoins&&window.tetriCoins.addCoins(coins),markSessionUsed(sid),cleanUrl(),setTimeout(()=>openShopModal(pkg,coins),600)}}function cleanUrl(){if(window.history&&window.history.replaceState){const clean=window.location.pathname;window.history.replaceState({},document.title,clean)}}function buildSuccessUrl(pkgId){const base=window.location.origin+window.location.pathname,sid=typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Array.from(typeof crypto<"u"&&crypto.getRandomValues?crypto.getRandomValues(new Uint8Array(12)):new Uint8Array(12).map(()=>Math.floor(Math.random()*256))).map(b=>b.toString(16).padStart(2,"0")).join("");return`${base}?payment=success&pkg=${encodeURIComponent(pkgId)}&sid=${encodeURIComponent(sid)}`}const PLACEHOLDER_URLS=new Set(["https://buy.stripe.com/YOUR_STARTER_LINK","https://buy.stripe.com/YOUR_STANDARD_LINK","https://buy.stripe.com/YOUR_PREMIUM_LINK"]);function isPlaceholderUrl(url){return PLACEHOLDER_URLS.has(url)}function buildPaymentUrl(paymentBase,successUrl){try{const url=new URL(paymentBase);return url.searchParams.set("success_url",successUrl),url.toString()}catch{const params=new URLSearchParams({success_url:successUrl}),sep=paymentBase.includes("?")?"&":"?";return`${paymentBase}${sep}${params.toString()}`}}function buildShopModal(){const lang=typeof getCurrentLanguage=="function"?getCurrentLanguage():"en",t=key=>typeof getTranslation=="function"?getTranslation(key,lang):key,balance=typeof window.tetriCoins<"u"&&window.tetriCoins?window.tetriCoins.getBalance().toLocaleString():"—",packagesHtml=SHOP_PACKAGES.map(pkg=>{const successUrl=buildSuccessUrl(pkg.id),paymentHref=isPlaceholderUrl(pkg.paymentUrl)?"#shop-not-configured":buildPaymentUrl(pkg.paymentUrl,successUrl),bonusHtml=pkg.bonusKey?`<div class="pkg-bonus">✦ ${t(pkg.bonusKey)}</div>`:"",popularBadge=pkg.popular?`<span class="popular-badge">${t("shop_popular")}</span>`:"";return`
        <div class="shop-package${pkg.popular?" popular":""}">
            ${popularBadge}
            <div class="shop-pkg-icon">${pkg.icon}</div>
            <div class="shop-pkg-info">
                <div class="pkg-name">${t(pkg.nameKey)}</div>
                <div class="pkg-coins">${pkg.coins.toLocaleString()} TC</div>
                ${bonusHtml}
            </div>
            <button class="shop-pkg-buy"
                    data-pkg="${pkg.id}"
                    data-href="${paymentHref}">
                ${pkg.priceUSD}
            </button>
        </div>`}).join("");return`
    <div id="shop-modal" style="display:none;">
        <div class="shop-modal-content">
            <button id="close-shop" aria-label="Close">&times;</button>
            <h2>💎 ${t("shop_title")}</h2>
            <p class="shop-subtitle">${t("shop_subtitle")}</p>

            <div class="shop-balance-strip">
                <span>${t("shop_your_balance")}</span>
                <span class="tc-amount" id="shop-balance-display">${balance} TC</span>
            </div>

            <div id="shop-packages-view">
                <div class="shop-packages">${packagesHtml}</div>
                <p class="shop-note">
                    ${t("shop_note")}
                    <a href="https://stripe.com" target="_blank" rel="noopener">Stripe</a>.
                </p>
            </div>

            <div id="shop-success-msg">
                <span class="success-icon">🎉</span>
                <h3 id="shop-success-heading"></h3>
                <p id="shop-success-text"></p>
            </div>
        </div>
    </div>`}function openShopModal(successPkg,successCoins){let modal=document.getElementById("shop-modal");modal||(document.body.insertAdjacentHTML("beforeend",buildShopModal()),modal=document.getElementById("shop-modal"),attachShopEvents(modal));const balanceEl=modal.querySelector("#shop-balance-display");balanceEl&&typeof window.tetriCoins<"u"&&window.tetriCoins&&(balanceEl.textContent=window.tetriCoins.getBalance().toLocaleString()+" TC");const packagesView=modal.querySelector("#shop-packages-view"),successMsg=modal.querySelector("#shop-success-msg");if(successPkg&&successCoins){const lang=typeof getCurrentLanguage=="function"?getCurrentLanguage():"en",t=key=>typeof getTranslation=="function"?getTranslation(key,lang):key;packagesView.style.display="none",successMsg.style.display="block";const heading=modal.querySelector("#shop-success-heading"),text=modal.querySelector("#shop-success-text");heading&&(heading.textContent=t("shop_success_heading")),text&&(text.textContent=t("shop_success_text").replace("{coins}",successCoins.toLocaleString()))}else packagesView.style.display="",successMsg.style.display="none";modal.style.display="flex",document.body.style.overflow="hidden"}function closeShopModal(){const modal=document.getElementById("shop-modal");modal&&(modal.style.display="none",document.body.style.overflow="")}function attachShopEvents(modal){modal.querySelector("#close-shop").addEventListener("click",closeShopModal),modal.addEventListener("click",e=>{e.target===modal&&closeShopModal()}),modal.addEventListener("click",e=>{const btn=e.target.closest(".shop-pkg-buy");if(!btn)return;const href=btn.dataset.href;if(href==="#shop-not-configured"){const lang=typeof getCurrentLanguage=="function"?getCurrentLanguage():"en";alert((key=>typeof getTranslation=="function"?getTranslation(key,lang):key)("shop_error_not_configured"));return}window.location.href=href})}function injectShopButton(){const balanceItem=document.querySelector(".balance-item");if(!balanceItem||balanceItem.querySelector(".shop-open-btn"))return;const lang=typeof getCurrentLanguage=="function"?getCurrentLanguage():"en",t=key=>typeof getTranslation=="function"?getTranslation(key,lang):key,btn=document.createElement("button");btn.className="shop-open-btn",btn.textContent="+ "+t("shop_btn"),btn.title=t("shop_btn_title"),btn.setAttribute("aria-label",t("shop_btn_title")),btn.addEventListener("click",()=>openShopModal()),balanceItem.appendChild(btn)}document.addEventListener("DOMContentLoaded",()=>{injectShopButton(),checkPaymentSuccess()});
