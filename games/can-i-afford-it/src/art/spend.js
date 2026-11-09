/* 第二关的插图：信用卡、表情。全部 SVG 现场生成。 */
import { clamp, r1 } from '../core/util.js';

/* 开局页的大图：一张虚构银行的信用卡、一张长长的小票、几个购物袋 */
export function cardArtSVG(){
  return `<svg viewBox="0 0 360 150" role="img" aria-label="信用卡、购物小票和购物袋">
    <defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2F3B45"/><stop offset="1" stop-color="#1B2228"/></linearGradient></defs>
    <rect x="0" y="128" width="360" height="22" fill="var(--paper-2)"/>
    <g transform="translate(218 22) rotate(4)">
      <rect width="96" height="118" rx="3" fill="var(--paper)" stroke="var(--line)"/>
      ${[16,28,40,52,64,76].map((y,i)=>`<rect x="10" y="${y}" width="${[44,38,50,30,46,34][i]}" height="4" rx="2" fill="var(--line)"/><rect x="${70-[0,6,0,4,0,8][i]}" y="${y}" width="${16+[0,6,0,4,0,8][i]}" height="4" rx="2" fill="var(--ink-2)" opacity=".55"/>`).join('')}
      <line x1="10" x2="86" y1="88" y2="88" stroke="var(--ink-2)" stroke-dasharray="3 3"/>
      <rect x="10" y="96" width="30" height="6" rx="2" fill="var(--ink)"/><rect x="58" y="96" width="28" height="6" rx="2" fill="var(--seal)"/>
    </g>
    <g transform="translate(36 40) rotate(-7)">
      <rect width="168" height="104" rx="12" fill="url(#cg)"/>
      <rect x="16" y="36" width="28" height="21" rx="4" fill="#D9B45B"/><path d="M16 46h28M30 36v21" stroke="#B8923A" stroke-width="1"/>
      <text x="16" y="24" font-size="12" font-weight="700" fill="#F3EDE2" letter-spacing="1">小鹿银行</text>
      <text x="16" y="80" font-size="12" fill="#C9CED2" font-family="monospace" letter-spacing="2">•••• •••• •••• 0000</text>
      <text x="16" y="96" font-size="8" fill="#9AA3AA" letter-spacing="1">额度不是你的钱</text>
      <circle cx="136" cy="86" r="10" fill="#BC3226" opacity=".9"/><circle cx="150" cy="86" r="10" fill="#E0A63A" opacity=".85"/>
    </g>
    <g transform="translate(300 84)"><path d="M0 14h40l-4 44H4z" fill="var(--seal)"/><path d="M12 14v-6a8 8 0 0 1 16 0v6" fill="none" stroke="var(--ink)" stroke-width="2"/></g>
    <g transform="translate(320 104)"><path d="M0 10h28l-3 30H3z" fill="#E0A63A"/><path d="M8 10v-4a6 6 0 0 1 12 0v4" fill="none" stroke="var(--ink)" stroke-width="2"/></g>
  </svg>`;
}

/* 表情：开心值越高嘴角越往上 */
export function moodFaceSVG(h){
  const k = clamp((h-50)/40, -1, 1);
  const mouthY = 33, curve = r1(k*7);
  const fill = h>=65 ? '#F2D27A' : h>=45 ? '#E9DDC4' : '#C9D3DA';
  return `<svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true">
    <circle cx="24" cy="24" r="21" fill="${fill}" stroke="var(--ink)" stroke-width="2"/>
    <circle cx="17" cy="20" r="2.4" fill="var(--ink)"/><circle cx="31" cy="20" r="2.4" fill="var(--ink)"/>
    <path d="M15 ${mouthY} Q24 ${r1(mouthY+curve)} 33 ${mouthY}" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/>
    ${h<40?'<path d="M34 27c2 3 2 5 0 6" fill="none" stroke="#5B8FB0" stroke-width="2" stroke-linecap="round"/>':''}
  </svg>`;
}
