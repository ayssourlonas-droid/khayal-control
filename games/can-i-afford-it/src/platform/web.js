/* 网页版和下载版：不放任何广告，也没有内购；支持作者只走站外打赏（在 src/config.json 里配置）。 */
const isUrl = s => typeof s === 'string' && /^https:\/\//.test(s);
const unavailable = { ok: false, reason: '网页版没有内购' };

export function createWeb({ config = {}, images = {} } = {}){
  const s = config.support || {};
  return {
    id: 'web',
    name: '网页版',
    externalLinks: true,
    ads: {
      available: () => false,
      showRewarded: async () => 'unavailable',
    },
    pay: {
      available: () => false,
      purchase: async () => unavailable,
    },
    tips(){
      const list = [];
      if(isUrl(s.afdian)) list.push({ name: '爱发电', url: s.afdian, d: '可以一次性打赏，也可以按月赞助' });
      if(isUrl(s.githubSponsors)) list.push({ name: 'GitHub Sponsors', url: s.githubSponsors, d: '适合有 GitHub 账号的朋友' });
      return list;
    },
    tipQr(){
      const name = s.wechatQr; if(!name) return '';
      const hit = Object.entries(images).find(([p]) => p.endsWith('/' + name));
      return hit ? hit[1] : '';
    },
    privacyHTML: () => '你填的工资、存款和游戏存档，只保存在这台设备的浏览器里，不上传、不统计。网页版不加载任何广告或统计脚本。',
  };
}
