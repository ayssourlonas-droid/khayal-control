/* 入口：加载样式和字体，注册全局事件，然后读存档开始 */
import './assets/fonts/fonts.css';
import './styles.css';
import './ui/events.js';     // 点击、输入等全局事件
import './ui/borrow.js';     // 借款金额长按加减
import './ui/charts.js';     // 图表随窗口重绘
import './ui/life.js';       // 注册"钱不够时"的处理
import { $$ } from './ui/dom.js';
import { render } from './ui/shell.js';
import { UI, loadSaved, snapshot } from './ui/state.js';

export function start(data){
  loadSaved(data);
  $$('.tab').forEach(b=>b.setAttribute('aria-selected', String(b.dataset.tab===UI.tab)));
  render();
}

/* 在 claude.ai 在线版里运行时，页面更新后保留进度；独立运行时这段什么都不做 */
try{ window.claude?.hot?.snapshot?.(snapshot); }catch(e){}
if(window.claude?.hot?.ready) window.claude.hot.ready(start); else start(window.claude?.hot?.data ?? null);
