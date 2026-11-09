/* FlowForge WebStudio — lightweight local image assets
 * Images stay in project.assets as Base64, while components keep only a tiny
 * asset://<id> reference. This avoids duplicating large Base64 strings in
 * every component and keeps the designer responsive. Export/Preview resolve
 * the references to real data URLs in the final HTML.
 */
(function(){
  'use strict';

  const IMAGE_KINDS = new Set(['image','picturebox','sprite','spritesheet']);
  const DATA_RE = /^data:image\//i;
  const ASSET_RE = /^asset:\/\/([^\s"'<>]+)$/;

  try{
    if(!Object.getOwnPropertyDescriptor(window,'project')){
      Object.defineProperty(window,'project',{configurable:true,get:()=>project});
    }
  }catch(_){ }

  function assets(){
    try{return FlowForge.modules.assets.ensure(project)}catch(_){return project.assets||(project.assets=[])}
  }
  function selectedImage(){
    const x=window.ffSelected?.();
    return x && IMAGE_KINDS.has(x.kind) ? x : null;
  }
  function assetById(id){
    return assets().find(a=>String(a.id)===String(id));
  }
  function tokenFor(a){return a ? `asset://${a.id}` : ''}
  function escText(v){
    const d=document.createElement('div');
    d.textContent=String(v??'');
    return d.innerHTML;
  }

  // Migrate only existing image components that already have assetId. This
  // removes the duplicated Base64 copy from the component without touching
  // ordinary external image URLs.
  function compactProjectImages(){
    for(const p of (project.pages||[])){
      for(const x of (p.items||[])){
        if(!IMAGE_KINDS.has(x.kind) || !x.assetId)continue;
        const a=assetById(x.assetId);
        if(a && (DATA_RE.test(String(x.src||'')) || String(x.src||'').startsWith('asset://'))){
          x.src=tokenFor(a);
          x.srcType='asset';
        }
      }
    }
  }

  function resolveSrc(src){
    const m=String(src||'').match(ASSET_RE);
    if(!m)return String(src||'');
    return assetById(m[1])?.data || '';
  }

  function resolveStageImages(root=document){
    root.querySelectorAll?.('img[src^="asset://"]').forEach(img=>{
      const src=resolveSrc(img.getAttribute('src'));
      if(src)img.src=src;
      else img.removeAttribute('src');
    });
  }

  function resolveHtml(html){
    return String(html||'').replace(/asset:\/\/([A-Za-z0-9_-]+)/g,(full,id)=>assetById(id)?.data||full);
  }

  function ensurePickerStyles(){
    if(document.getElementById('ffImageAssetStyles'))return;
    const style=document.createElement('style');
    style.id='ffImageAssetStyles';
    style.textContent=`
      #ffImageAssetBox{margin-top:10px;padding:11px;border:1px solid #3b414b;border-radius:8px;background:#252930;box-shadow:0 2px 8px #0003}
      #ffImageAssetBox .ffImgTitle{font-size:12px;font-weight:700;color:#e8edf4;margin-bottom:9px}
      #ffImageAssetBox .ffImgPreview{height:82px;border:1px solid #3b414b;border-radius:6px;background:#1b1e23;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:9px;color:#7f8795;font-size:11px}
      #ffImageAssetBox .ffImgPreview img{display:block;max-width:100%;max-height:100%;object-fit:contain}
      #ffImageAssetBox .ffImgSection{display:grid;gap:5px;margin-bottom:9px}
      #ffImageAssetBox .ffImgLabel{font-size:10px;text-transform:uppercase;letter-spacing:.35px;color:#9fa6b3}
      #ffImageAssetBox .ffImgFileBtn{display:flex;align-items:center;justify-content:center;width:100%;min-height:32px;padding:7px 8px;border:1px solid #526077;border-radius:5px;background:#303640;color:#eef3f8;cursor:pointer;font-size:12px}
      #ffImageAssetBox .ffImgFileBtn:hover{background:#3b4350}
      #ffImageAssetBox .ffImgFileName{font-size:10px;color:#7f8795;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #ffImageAssetBox select{width:100%;min-width:0;padding:7px 8px;font-size:11px;background:#30343c;color:#eee;border:1px solid #484e59;border-radius:5px}
      #ffImageAssetBox .ffImgClear{width:100%;padding:7px 8px;font-size:11px;border-radius:5px}
      #ffImageAssetBox .ffImgStatus{display:block;margin-top:7px;font-size:10px;line-height:1.3;color:#7f8795}
    `;
    document.head.appendChild(style);
  }

  function renderAssetPicker(){
    const box=document.getElementById('ffImageAssetBox');
    const x=selectedImage();
    if(!box || !x)return;
    const list=assets();
    const current=String(x.assetId||'');
    const select=box.querySelector('[data-ff-asset-select]');
    if(select){
      const opts=['<option value="">Escolher dos Assets...</option>']
        .concat(list.filter(a=>String(a.type||'').startsWith('image/')).map(a=>
          `<option value="${escText(a.id)}"${current===String(a.id)?' selected':''}>${escText(a.name)} · ${Math.ceil((Number(a.size)||0)/1024)} KB</option>`
        ));
      select.innerHTML=opts.join('');
    }
    const status=box.querySelector('[data-ff-asset-status]');
    const fileName=box.querySelector('[data-ff-file-name]');
    const preview=box.querySelector('[data-ff-preview]');
    const data=resolveSrc(x.src);
    if(preview){
      if(data){
        preview.innerHTML=`<img src="${escText(data)}" alt="">`;
      }else{
        preview.textContent='Pré-visualização da imagem';
      }
    }
    if(fileName)fileName.textContent=current?(assetById(current)?.name||'Imagem armazenada no projeto'):'Nenhuma imagem selecionada';
    if(status)status.textContent=current?'Imagem armazenada no projeto':(DATA_RE.test(String(x.src||''))?'Imagem incorporada':'Nenhuma imagem local selecionada');
  }

  function injectPicker(){
    const host=document.getElementById('propDynamic');
    const x=selectedImage();
    if(!host || !x)return;
    let box=document.getElementById('ffImageAssetBox');
    if(!box){
      ensurePickerStyles();
      box=document.createElement('div');
      box.id='ffImageAssetBox';
      box.innerHTML=`<div class="ffImgTitle">Imagem</div>
        <div class="ffImgPreview" data-ff-preview>Pré-visualização da imagem</div>
        <div class="ffImgSection">
          <div class="ffImgLabel">Imagem do computador</div>
          <label class="ffImgFileBtn">Escolher imagem
            <input type="file" accept="image/*" data-ff-image-file style="display:none">
          </label>
          <div class="ffImgFileName" data-ff-file-name>Nenhuma imagem selecionada</div>
        </div>
        <div class="ffImgSection">
          <div class="ffImgLabel">Imagem dos Assets</div>
          <select data-ff-asset-select></select>
        </div>
        <button type="button" class="ffImgClear" data-ff-clear-image>Remover imagem</button>
        <small class="ffImgStatus" data-ff-asset-status></small>`;
      host.appendChild(box);

      box.querySelector('[data-ff-image-file]').addEventListener('change',async e=>{ 
        const file=e.target.files?.[0];
        const current=selectedImage();
        if(!file || !current)return;
        if(!file.type.startsWith('image/'))return;
        try{
          if(typeof snapshot==='function')snapshot();
          const a=await FlowForge.modules.assets.add(project,file);
          current.assetId=a.id;
          current.src=tokenFor(a);
          current.srcType='asset';
          current.assetName=a.name;
          render();
        }catch(err){
          console.error('[FlowForge image asset]',err);
          alert(err?.message||'Não foi possível armazenar a imagem.');
        }finally{e.target.value=''}
      });

      box.querySelector('[data-ff-asset-select]').addEventListener('change',e=>{
        const current=selectedImage();
        const a=assetById(e.target.value);
        if(!current)return;
        if(typeof snapshot==='function')snapshot();
        if(a){
          current.assetId=a.id;
          current.src=tokenFor(a);
          current.srcType='asset';
          current.assetName=a.name;
        }else{
          delete current.assetId;
          delete current.srcType;
          delete current.assetName;
          current.src='';
        }
        render();
      });

      box.querySelector('[data-ff-clear-image]').addEventListener('click',()=>{
        const current=selectedImage();
        if(!current)return;
        if(typeof snapshot==='function')snapshot();
        delete current.assetId;
        delete current.srcType;
        delete current.assetName;
        current.src='';
        render();
      });
    }
    renderAssetPicker();
  }

  function wrapExportButtons(){
    const exportBtn=document.getElementById('exportBtn');
    if(exportBtn && !exportBtn.__ffImageWrapped){
      exportBtn.__ffImageWrapped=true;
      exportBtn.onclick=()=>{
        if(typeof saveEventBodiesFromEditor==='function')saveEventBodiesFromEditor();
        if(typeof window.openExportDialog==='function'){window.openExportDialog();return;}
        const html=resolveHtml(generated());
        const a=document.createElement('a');
        a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));
        a.download='index.html';
        a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href),1000);
      };
    }
    const previewBtn=document.getElementById('previewBtn');
    if(previewBtn && !previewBtn.__ffImageWrapped){
      previewBtn.__ffImageWrapped=true;
      previewBtn.onclick=()=>{
        const tab=document.querySelector('#tabs button[data-tab="preview"]');
        if(tab)tab.click();
      };
    }
  }

  function boot(){
    compactProjectImages();
    const stage=document.getElementById('stage');
    if(stage && !stage.__ffImageObserver){
      const observer=new MutationObserver(()=>resolveStageImages(stage));
      observer.observe(stage,{childList:true,subtree:true});
      stage.__ffImageObserver=observer;
      resolveStageImages(stage);
    }
    // propDynamic is observed only for picker creation; it does not watch the
    // whole document and therefore remains cheap during normal editing.
    const host=document.getElementById('propDynamic');
    if(host && !host.__ffImageObserver){
      // propDynamic is rebuilt by the property panel. Only create the picker
      // when it does not already exist. Do NOT call injectPicker on every
      // mutation: renderAssetPicker() updates <select>.innerHTML, which itself
      // fires MutationObserver and can otherwise create an endless loop that
      // freezes the browser when an Image component is selected.
      const observer=new MutationObserver(()=>{
        if(selectedImage() && !document.getElementById('ffImageAssetBox')) injectPicker();
      });
      observer.observe(host,{childList:true,subtree:true});
      host.__ffImageObserver=observer;
    }
    if(selectedImage())injectPicker();
    wrapExportButtons();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.FlowForgeImageAssets={
    isImageData:v=>DATA_RE.test(String(v||'')),
    isAssetRef:v=>ASSET_RE.test(String(v||'')),
    list:()=>assets(),
    resolve:(id)=>assetById(id)?.data||'',
    resolveSrc,
    resolveHtml
  };
})();
