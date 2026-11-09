// Exportador modular/PWA v0.8.2
FlowForge.registerModule('exporter',{
 manifest(p){return {name:p.name,short_name:p.shortName||p.name,description:p.description||'',start_url:'./',scope:'./',display:p.display||'standalone',orientation:p.orientation||'any',theme_color:p.themeColor||'#20242a',background_color:p.backgroundColor||'#ffffff',icons:[{src:p.icon||'assets/icon-192.png',sizes:'192x192',type:'image/png'},{src:p.icon512||'assets/icon-512.png',sizes:'512x512',type:'image/png'}]};},
 serviceWorker(){return `const CACHE='flowforge-v1';const CORE=['./','./index.html'];self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{let y=x.clone();caches.open(CACHE).then(c=>c.put(e.request,y));return x}).catch(()=>r))));`;},
 responsiveCSS(){return `*{box-sizing:border-box}img,video,canvas{max-width:100%;height:auto}@media(max-width:767px){.ff-desktop-only{display:none!important}}@media(min-width:768px){.ff-mobile-only{display:none!important}}`;},
 manifestJSON(p){return JSON.stringify(this.manifest(p),null,2)}
});
window.FlowForgeExporter=FlowForge.modules.exporter;
