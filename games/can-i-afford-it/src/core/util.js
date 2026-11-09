/* 通用工具：数值格式化（万/元/百分比）、随机数、字符串转义。纯函数，不碰页面。 */

export const clamp = (x,a,b) => Math.max(a, Math.min(b, x));
export const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function hashStr(s){ let h=2166136261>>>0; for(const ch of String(s)){ h ^= ch.charCodeAt(0); h = Math.imul(h,16777619)>>>0; } return h; }
export function makeRng(seed){
  let s = seed>>>0;
  const f = () => { s = (s + 0x6D2B79F5)>>>0; let t = s; t = Math.imul(t ^ (t>>>15), t|1); t ^= t + Math.imul(t ^ (t>>>7), t|61); return ((t ^ (t>>>14))>>>0) / 4294967296; };
  f.state = () => s; f.setState = v => { s = v>>>0; };
  f.range = (a,b) => a + (b-a)*f();
  f.int = (a,b) => Math.floor(a + (b-a+1)*f());
  f.pick = arr => arr[Math.floor(f()*arr.length)];
  f.normal = () => { let u=0,v=0; while(u===0) u=f(); while(v===0) v=f(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
  return f;
}
export function trimZ(s){ return s.includes('.') ? s.replace(/0+$/,'').replace(/\.$/,'') : s; }
export function wan(x, d){
  const a = Math.abs(x), sg = x<0?'-':'';
  if(a >= 1e8) return sg + trimZ((a/1e8).toFixed(2)) + '亿';
  if(a >= 1e4) return sg + trimZ((a/1e4).toFixed(d ?? (a>=1e6?0:a>=1e5?1:2))) + '万';
  return sg + Math.round(a).toLocaleString('zh-CN');
}
export const yuan = x => (x<0?'-':'') + '¥' + Math.round(Math.abs(x)).toLocaleString('zh-CN');
export const signYuan = x => (x>=0?'+':'-') + '¥' + Math.round(Math.abs(x)).toLocaleString('zh-CN');
export const pct = (x,d=1) => trimZ((x).toFixed(d)) + '%';
export const r1 = n => Math.round(n*10)/10;
