/* FlowForge WebStudio — QR Code local (sem API externa).
 * Usa qrcode-generator (MIT) vendorizado e gera um SVG data URL.
 */
(function(){
  'use strict';

  const MAX_TEXT=1200;
  const cache=new Map();

  function svgDataUrl(text,size){
    text=String(text??'').slice(0,MAX_TEXT);
    size=Math.max(64,Math.min(2048,Number(size)||160));
    const key=text+'|'+size;
    if(cache.has(key))return cache.get(key);
    let out='';
    try{
      const qr=qrcode(0,'M');
      qr.addData(text);
      qr.make();
      const n=qr.getModuleCount(),pad=4,total=n+pad*2;
      let path='';
      for(let r=0;r<n;r++)for(let c=0;c<n;c++){
        if(qr.isDark(r,c))path+='M'+(c+pad)+','+(r+pad)+'h1v1h-1z';
      }
      const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+total+' '+total+'" width="'+size+'" height="'+size+'" shape-rendering="crispEdges"><rect width="'+total+'" height="'+total+'" fill="#ffffff"/><path d="'+path+'" fill="#000000"/></svg>';
      out='data:image/svg+xml;base64,'+btoa(svg);
    }catch(err){
      console.warn('[FlowForge QR] Não foi possível gerar o código:',err);
    }
    cache.set(key,out);
    if(cache.size>40)cache.delete(cache.keys().next().value);
    return out;
  }

  function apply(img,text,size){
    if(!img)return '';
    const url=svgDataUrl(text,size);
    if(url)img.src=url;
    img.alt='QR Code: '+String(text??'').slice(0,MAX_TEXT);
    return url;
  }

  function runtime(){
    var MAX=1200;
    function render(text,size){
      text=String(text==null?'':text).slice(0,MAX);
      size=Math.max(64,Math.min(2048,Number(size)||160));
      try{
        var qr=qrcode(0,'M');
        qr.addData(text);
        qr.make();
        var n=qr.getModuleCount(),pad=4,total=n+pad*2,d='';
        for(var r=0;r<n;r++)for(var c=0;c<n;c++){
          if(qr.isDark(r,c))d+='M'+(c+pad)+','+(r+pad)+'h1v1h-1z';
        }
        var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+total+' '+total+'" shape-rendering="crispEdges"><rect width="'+total+'" height="'+total+'" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>';
        return 'data:image/svg+xml;base64,'+btoa(svg);
      }catch(e){return ''}
    }
    window.FlowForgeQRCode={
      render:render,
      apply:function(img,text,size){
        if(!img)return '';
        var url=render(text,size);
        if(url)img.src=url;
        img.alt='QR Code: '+String(text==null?'':text).slice(0,MAX);
        return url;
      }
    };
  }

  window.FlowForgeQRCode={render:svgDataUrl,apply};
  window.FlowForgeQRRuntimeSource='(function(){var qrcode='+window.FlowForgeQRLibSource+';('+runtime.toString()+')();})();';
})();
