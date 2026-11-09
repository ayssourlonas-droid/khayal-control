/* 关于、隐私说明和"支持作者"入口。具体能用广告还是打赏，由平台层决定（src/platform/）。 */
import config from '../config.json';
import { DATA_AS_OF } from '../data/index.js';
import { platform } from '../platform/index.js';
import { esc } from '../core/util.js';
import { openAsk, toast } from './shell.js';

export const VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';

const isUrl = s => typeof s === 'string' && /^https:\/\//.test(s);

/* 玩家看完广告的次数，只记在本机，只用来说声谢谢，不影响游戏里的任何数字 */
const SUPPORT_KEY = 'can-i-afford-it:supported';
function supportCount(){ try { return Number(localStorage.getItem(SUPPORT_KEY)) || 0; } catch { return 0; } }
function addSupport(){ try { localStorage.setItem(SUPPORT_KEY, String(supportCount() + 1)); } catch { /* 存不了就算了 */ } }

export function hasSupport(){
  return platform.ads.available() || platform.tips().length > 0 || !!platform.tipQr();
}

export async function showSupport(){
  const tips = platform.tips(), qr = platform.tipQr(), canAd = platform.ads.available();
  const n = supportCount();
  const intro = canAd
    ? '游戏免费，看不看广告都不影响玩。愿意的话，看一段广告就是对作者的支持。'
    : '游戏永久免费、开源，不卖数据，也不会塞借贷广告。觉得有用的话，可以请作者喝杯咖啡。';
  const body = `<div class="stack">
    <p class="txt">${intro}</p>
    ${tips.map(c => `<a class="opt" href="${esc(c.url)}" target="_blank" rel="noopener"><b>${esc(c.name)}</b><span>${esc(c.d)}</span></a>`).join('')}
    ${qr ? `<div class="qr"><img src="${qr}" alt="微信赞赏码" width="220" height="220"><span class="small muted">微信扫一扫打赏</span></div>` : ''}
    ${n ? `<p class="small muted">你已经支持过 ${n} 次，谢谢！</p>` : ''}
  </div>`;
  const options = [{ id:'ok', label:'关闭' }];
  if(canAd) options.unshift({ id:'ad', label:'看一段广告支持作者', sub:'只换一句谢谢，不影响游戏里的任何数字', cls:'primary' });
  const c = await openAsk({ title:'支持作者', body, options });
  if(c !== 'ad') return;
  const r = await platform.ads.showRewarded('support');
  if(r === 'rewarded'){ addSupport(); toast('谢谢支持！'); }
  else if(r === 'skipped') toast('没看完也没关系，游戏照常玩');
  else toast('暂时没有广告，稍后再试');
}

export async function showAbout(){
  const repo = isUrl(config.repo) ? config.repo : '';
  const source = !repo ? '' : platform.externalLinks
    ? `源码在 <a href="${esc(repo)}" target="_blank" rel="noopener">GitHub</a>。`
    : '源码公开在 GitHub，搜索 <b style="white-space:nowrap">can-i-afford-it</b> 就能找到。';
  const body = `<div class="txt stack-s">
    <p>买得起吗 v${esc(VERSION)} · 第一关：买房 · 第二关：日常消费</p>
    <p>代码以 GPL-3.0 协议开源，数据和文案以 CC BY-SA 4.0 协议共享。${source}</p>
    <p><b>隐私</b>：${platform.privacyHTML()}</p>
    <p><b>数据</b>：房价、利率和政策截至 ${esc(DATA_AS_OF)}，来源见项目里的 DATA_SOURCES.md。随机事件和投资收益都是模拟，不构成任何理财建议。</p>
  </div>`;
  const opts = [{ id:'ok', label:'知道了', cls:'primary' }];
  if(hasSupport()) opts.unshift({ id:'support', label:'支持作者', sub: platform.ads.available() ? '看一段广告，游戏本身免费' : '打赏或赞助，游戏本身永久免费' });
  const c = await openAsk({ title:'关于买得起吗', body, options:opts });
  if(c === 'support') showSupport();
}
export function aboutLinksHTML(){
  return `<div class="row about-links"><button type="button" class="btn sm ghost" data-act="about">关于 · 隐私</button>${hasSupport() ? '<button type="button" class="btn sm ghost" data-act="support">支持作者</button>' : ''}</div>`;
}
