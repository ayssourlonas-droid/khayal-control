/* FlowForge Style System - additive style API and themes. */
(function(w){'use strict';
  const themes=new Map();
  function set(el,styles){if(!el||!styles)return el;Object.keys(styles).forEach(k=>{let v=styles[k];if(v==null)return;if(k.startsWith('--')||k.includes('-'))el.style.setProperty(k,String(v));else if(k in el.style)el.style[k]=v;else el.style.setProperty(k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase()),String(v))});return el}
  function get(el,key){if(!el)return undefined;return key?getComputedStyle(el).getPropertyValue(key)||el.style[key]:getComputedStyle(el)}
  function theme(name,vars){if(vars===undefined)return themes.get(name);themes.set(name,{...vars});return themes.get(name)}
  function useTheme(name,root=document.documentElement){const vars=themes.get(name)||{};Object.entries(vars).forEach(([k,v])=>root.style.setProperty(k.startsWith('--')?k:'--ff-'+k,v));root.dataset.ffTheme=name;return vars}
  w.FFStyle={set,get,theme,useTheme,themes};
})(window);
