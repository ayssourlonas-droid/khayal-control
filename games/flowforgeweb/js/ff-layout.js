/* FlowForge Layout System - additive Flex/Grid helpers. */
(function(w){'use strict';
  function base(el){el.style.display='flex';el.style.boxSizing='border-box';return el}
  function row(el,opt={}){base(el);Object.assign(el.style,{flexDirection:'row',gap:(opt.gap??0)+'px',alignItems:opt.align||'stretch',justifyContent:opt.justify||'flex-start',flexWrap:opt.wrap?'wrap':'nowrap'});return el}
  function column(el,opt={}){row(el,opt);el.style.flexDirection='column';return el}
  function stack(el,opt={}){return column(el,{...opt,align:opt.align||'stretch'})}
  function grid(el,opt={}){el.style.display='grid';el.style.boxSizing='border-box';el.style.gap=(opt.gap??0)+'px';el.style.gridTemplateColumns=opt.columns||'repeat(auto-fit,minmax(0,1fr))';if(opt.rows)el.style.gridTemplateRows=opt.rows;return el}
  function fill(child){child.style.flex='1 1 auto';child.style.minWidth='0';child.style.minHeight='0';return child}
  function gap(el,n){el.style.gap=(Number(n)||0)+'px';return el}
  w.FFLayout={row,column,stack,grid,fill,gap,version:'1.0'};
})(window);
