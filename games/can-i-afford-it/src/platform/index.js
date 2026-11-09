/* 平台层：游戏在哪儿运行，就用哪个平台的广告、付费和打赏方式。界面只调用这里，不直接碰任何平台 SDK。

   平台在构建时决定：
     npm run build / build:single  → web     网页版和下载版：不放广告，只显示站外打赏链接
     npm run build:taptap          → taptap  TapTap H5 小游戏：激励视频广告，不显示站外打赏

   每个平台对象都有同样的接口：
     id, name
     ads.available()                  能不能播激励视频（平台支持 + 已配置广告位）
     ads.showRewarded(placement)      播一段激励视频，结果是 'rewarded' | 'skipped' | 'unavailable' | 'error'
     pay.available()                  能不能内购。TapTap 无版号的游戏不能有内购，这里先预留，始终是 false
     pay.purchase(sku)                预留，现在返回 { ok:false, reason }
     tips()                           站外打赏渠道 [{ name, url, d }]
     tipQr()                          微信赞赏码图片地址（没有就是空字符串）
     externalLinks                    能不能放可点击的站外链接
     privacyHTML()                    "关于"里的隐私说明

   新增平台：照着 web.js / taptap.js 写一个，在下面注册，再在 vite.config.js 里加一个构建模式。 */
import config from '../config.json';
import { createTapTap } from './taptap.js';
import { createWeb } from './web.js';

/* 微信赞赏码：图片放在 src/support/，构建时打包进游戏 */
const supportImages = import.meta.glob('../support/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' });

export const PLATFORM_ID = typeof __PLATFORM__ !== 'undefined' ? __PLATFORM__ : 'web';

export function createPlatform(id = PLATFORM_ID, opts = {}){
  const cfg = opts.config || config;
  if(id === 'taptap') return createTapTap({ config: cfg, getTap: opts.getTap });
  return createWeb({ config: cfg, images: opts.images || supportImages });
}

export const platform = createPlatform();
