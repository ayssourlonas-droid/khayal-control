/* TapTap H5 小游戏。
   - 广告：TapTap 宿主会注入全局 tap 对象，激励视频用 tap.createRewardedVideoAd({ adUnitId })。
     广告位 ID 在开发者中心开通"小游戏广告"后获得（竖屏），填到 src/config.json 的 ads.taptap.rewardedVideo。
     没填或不在 TapTap 里运行（比如本地浏览器调试）时，广告入口自动隐藏。
   - 内购：TapTap 审核规范要求有版号才能内购，所以先预留接口，始终不可用。
   - 站外打赏：审核规范禁止诱导站外充值、二维码赞助，所以不显示。
   文档：https://developer.taptap.cn/minigameapidoc/dev/tutorial/open-capabilities/ad/rewarded-video-ad/ */
const defaultGetTap = () => (typeof globalThis !== 'undefined' ? globalThis.tap : undefined);

export function createTapTap({ config = {}, getTap = defaultGetTap } = {}){
  const unitId = config.ads?.taptap?.rewardedVideo || '';
  let ad = null, pending = null, busy = false;

  const available = () => {
    const tap = getTap();
    return !!(unitId && tap && typeof tap.createRewardedVideoAd === 'function');
  };

  /* 激励视频组件在整个游戏里只有一个，关闭回调只注册一次 */
  function ensureAd(){
    if(ad) return ad;
    ad = getTap().createRewardedVideoAd({ adUnitId: unitId });
    ad.onClose(res => {
      const done = pending; pending = null;
      if(done) done(res && res.isEnded ? 'rewarded' : 'skipped');
    });
    if(typeof ad.onError === 'function') ad.onError(() => {});
    return ad;
  }

  async function showRewarded(){
    if(!available() || busy) return 'unavailable';
    busy = true;
    try {
      const a = ensureAd();
      const closed = new Promise(resolve => { pending = resolve; });
      try { await a.show(); }
      catch {
        /* 素材还没加载好：重新拉一次再播，还不行就算失败，不卡住游戏 */
        try { await a.load(); await a.show(); }
        catch { pending = null; return 'error'; }
      }
      return await closed;
    } catch {
      pending = null; return 'error';
    } finally {
      busy = false;
    }
  }

  return {
    id: 'taptap',
    name: 'TapTap',
    externalLinks: false,
    ads: { available, showRewarded },
    pay: {
      available: () => false,
      purchase: async () => ({ ok: false, reason: 'TapTap 上的内购需要游戏版号，暂未开放' }),
    },
    tips: () => [],
    tipQr: () => '',
    privacyHTML: () => '你填的工资、存款和游戏存档只保存在本机，不上传。游戏里的广告由 TapTap 平台提供，只在你主动点"看广告支持作者"时播放；播放时 TapTap 会按它的隐私政策处理设备信息。',
  };
}
