import { describe, expect, it } from 'vitest';
import { createPlatform, PLATFORM_ID } from '../src/platform/index.js';
import { createTapTap } from '../src/platform/taptap.js';
import { createWeb } from '../src/platform/web.js';

/* 模拟 TapTap 注入的 tap 对象：show 前 showFails 次失败，load 是否失败，看完没看完 */
function mockTap({ showFails = 0, loadFails = false, isEnded = true } = {}){
  const calls = { create: 0, show: 0, load: 0, opts: null };
  let onClose = null;
  const ad = {
    onClose(fn){ onClose = fn; },
    onError(){},
    show(){
      calls.show++;
      if(calls.show <= showFails) return Promise.reject(new Error('not loaded'));
      setTimeout(() => onClose && onClose({ isEnded }), 0);
      return Promise.resolve();
    },
    load(){ calls.load++; return loadFails ? Promise.reject(new Error('no fill')) : Promise.resolve(); },
  };
  return { tap: { createRewardedVideoAd(opts){ calls.create++; calls.opts = opts; return ad; } }, calls };
}
const withUnit = { ads: { taptap: { rewardedVideo: 'unit-123' } } };

describe('平台选择', () => {
  it('测试和默认构建是网页平台', () => {
    expect(PLATFORM_ID).toBe('web');
    expect(createPlatform().id).toBe('web');
    expect(createPlatform('taptap').id).toBe('taptap');
  });
  it('两个平台接口一致', () => {
    for(const p of [createWeb(), createTapTap()]){
      expect(typeof p.ads.available).toBe('function');
      expect(typeof p.ads.showRewarded).toBe('function');
      expect(typeof p.pay.available).toBe('function');
      expect(typeof p.pay.purchase).toBe('function');
      expect(Array.isArray(p.tips())).toBe(true);
      expect(typeof p.tipQr()).toBe('string');
      expect(typeof p.privacyHTML()).toBe('string');
      expect(typeof p.externalLinks).toBe('boolean');
    }
  });
});

describe('网页版', () => {
  it('没有广告和内购', async () => {
    const p = createWeb();
    expect(p.ads.available()).toBe(false);
    expect(await p.ads.showRewarded('support')).toBe('unavailable');
    expect(p.pay.available()).toBe(false);
    expect((await p.pay.purchase('x')).ok).toBe(false);
  });
  it('只显示填了 https 链接的打赏渠道', () => {
    const p = createWeb({ config: { support: { afdian: 'https://afdian.com/a/x', githubSponsors: 'http://insecure', wechatQr: '' } } });
    expect(p.tips().map(t => t.name)).toEqual(['爱发电']);
    expect(p.tipQr()).toBe('');
  });
  it('微信赞赏码按文件名匹配打包进来的图片', () => {
    const p = createWeb({ config: { support: { wechatQr: 'qr.png' } }, images: { '../support/qr.png': '/assets/qr.png' } });
    expect(p.tipQr()).toBe('/assets/qr.png');
  });
  it('隐私说明写明不加载广告', () => {
    expect(createWeb().privacyHTML()).toContain('不加载任何广告');
  });
});

describe('TapTap 版', () => {
  it('不显示站外打赏，也不放可点的站外链接', () => {
    const p = createTapTap({ config: { support: { afdian: 'https://afdian.com/a/x', wechatQr: 'qr.png' } } });
    expect(p.tips()).toEqual([]);
    expect(p.tipQr()).toBe('');
    expect(p.externalLinks).toBe(false);
  });
  it('内购预留但不可用（没有版号）', async () => {
    const p = createTapTap({ config: withUnit, getTap: () => mockTap().tap });
    expect(p.pay.available()).toBe(false);
    expect((await p.pay.purchase('x')).reason).toContain('版号');
  });
  it('没配广告位或不在 TapTap 里运行时，广告不可用', async () => {
    expect(createTapTap({ config: {}, getTap: () => mockTap().tap }).ads.available()).toBe(false);
    const p = createTapTap({ config: withUnit, getTap: () => undefined });
    expect(p.ads.available()).toBe(false);
    expect(await p.ads.showRewarded('support')).toBe('unavailable');
  });
  it('看完广告返回 rewarded，组件只创建一次', async () => {
    const m = mockTap();
    const p = createTapTap({ config: withUnit, getTap: () => m.tap });
    expect(p.ads.available()).toBe(true);
    expect(await p.ads.showRewarded('support')).toBe('rewarded');
    expect(await p.ads.showRewarded('support')).toBe('rewarded');
    expect(m.calls.create).toBe(1);
    expect(m.calls.opts).toEqual({ adUnitId: 'unit-123' });
  });
  it('中途关掉返回 skipped', async () => {
    const m = mockTap({ isEnded: false });
    const p = createTapTap({ config: withUnit, getTap: () => m.tap });
    expect(await p.ads.showRewarded('support')).toBe('skipped');
  });
  it('素材没加载好时先 load 再播', async () => {
    const m = mockTap({ showFails: 1 });
    const p = createTapTap({ config: withUnit, getTap: () => m.tap });
    expect(await p.ads.showRewarded('support')).toBe('rewarded');
    expect(m.calls.load).toBe(1);
    expect(m.calls.show).toBe(2);
  });
  it('拉不到广告返回 error，不会卡住，之后还能再试', async () => {
    const m = mockTap({ showFails: 2 });
    const p = createTapTap({ config: withUnit, getTap: () => m.tap });
    expect(await p.ads.showRewarded('support')).toBe('error');
    expect(await p.ads.showRewarded('support')).toBe('rewarded');
  });
  it('隐私说明提到 TapTap 广告', () => {
    expect(createTapTap().privacyHTML()).toContain('TapTap');
  });
});
