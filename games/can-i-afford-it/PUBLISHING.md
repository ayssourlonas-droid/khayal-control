# 发布步骤

游戏有两个发布渠道：

| 渠道 | 构建 | 变现 |
|---|---|---|
| 网页版（GitHub Pages）和下载版（GitHub Releases） | `npm run build` / `npm run build:single` | 不放广告，只显示站外打赏链接 |
| TapTap H5 小游戏 | `npm run build:taptap` | 激励视频广告（玩家主动点才播），不显示站外打赏 |

两个渠道的差别都在 `src/platform/` 里，界面代码不需要改。

## 0. 配置（`src/config.json`）

```json
{
  "repo": "https://github.com/你的用户名/can-i-afford-it",
  "support": {
    "afdian": "https://afdian.com/a/你的主页",
    "githubSponsors": "https://github.com/sponsors/你的用户名",
    "wechatQr": "wechat-qr.png"
  },
  "ads": {
    "taptap": { "rewardedVideo": "TapTap 开发者中心给的竖屏激励视频广告位 ID" }
  }
}
```

- `support`：只在网页版和下载版显示。只填 `https://` 开头的链接，留空的渠道不显示；微信赞赏码图片放到 `src/support/wechat-qr.png`。
- `ads.taptap.rewardedVideo`：只在 TapTap 版用。没填时 TapTap 版不显示广告入口。

## 1. GitHub（网页版和下载版）

推送到 main 后，"Deploy to GitHub Pages" 会自动更新网页版。第一次需要在仓库 **Settings → Pages → Source** 选 **GitHub Actions**。

### 发一个版本

在仓库 **Releases → Draft a new release**，标签填 `v0.1.0`（和 `package.json` 的版本一致），写好说明后点 **Publish release**。

"Release assets" 这个 Action 会自动构建并把两个文件附到 Release 上：

- `can-i-afford-it-v0.1.0.html`：下载版，双击就能玩
- `can-i-afford-it-v0.1.0-taptap.zip`：TapTap H5 小游戏上传包（根目录是 `index.html`）

本地用 `npm run build:release` 也能生成，文件在 `release/` 目录。

## 2. TapTap（H5 小游戏）

下面的要求摘自 [TapTap 小游戏文档](https://developer.taptap.cn/minigameapidoc/quick-start/document-guide/)，以提交时开发者中心的实际要求为准。

### 2.1 资质（需要本人办理）

1. **开发者注册和实名认证**：个人可以入驻。
2. **软件著作权（软著）**：审核要求提供"原始取得"的软著登记号和证书扫描件。游戏在 TapTap 上的标题要和软著名称完全一致，所以软著就用"买得起吗"。
3. **小游戏前置备案**：开发者中心 → 商店 → 小游戏管理 → 小游戏资质。要填软著著作权人、游戏内容介绍、负责人身份信息，再用微信或支付宝做电子核验。全程预计 20 个工作日；初审后工信部会发短信核验，收到后 24 小时内要处理，否则会被退回。
4. **没有版号就不能有内购**。游戏里的内购接口（`platform.pay`）只是预留，TapTap 版始终不启用。

### 2.2 开通广告

1. 开发者中心完善财务主体信息（收款账户、开户行）。
2. 你的游戏 → 商店 → **小游戏广告** → 申请开通。平台不分成；每月 10 号更新上月收益，满 100 元可以提现。
3. 游戏方向设为**竖屏**，拿到竖屏激励视频的广告位 ID，填进 `src/config.json` 的 `ads.taptap.rewardedVideo`。
4. **先检查能不能屏蔽借贷类广告**：在广告后台找行业屏蔽设置，关掉借贷、网贷、理财、博彩类广告。这个游戏讲的就是借钱的后果，不能在里面给网贷打广告；如果平台不支持屏蔽，先别开广告。

### 2.3 打包、上传和测试

1. `npm run build:release`，上传 `release/can-i-afford-it-v版本-taptap.zip`（或者直接用 `dist-taptap/` 目录）。
2. 本地浏览器里没有 TapTap 注入的 `tap` 对象，广告入口会自动隐藏，这是正常的。要用 TapTap 的真机调试，点"关于 · 隐私"→"支持作者"→"看一段广告支持作者"，看完应提示"谢谢支持！"。

### 2.4 审核时容易踩的坑（摘自《小游戏审核规范》）

- 不能诱导站外充值、二维码赞助：TapTap 版已经自动隐藏爱发电、GitHub Sponsors 和微信赞赏码。
- 简介和"开发者的话"里不能放外部链接（Steam 和 TapTap 详情页除外）、交流群、二维码；宣传图和截图里也不能有。
- 广告要明确标出"广告"；激励视频必须由玩家自己点开、能随时关闭；不能自动弹出激励视频。
- 隐私协议里要写明接入的广告 SDK 名称和数据用途。游戏内"关于 · 隐私"已经按平台换了说明，商店页的隐私协议需要你另外填写。
- 宣传截图要和游戏内容一致。

## 3. 以后更新

1. 改代码或数据，跑 `npm test`。
2. 把 `package.json` 里的 `version` 加一位（如 0.1.1）。
3. 推送到 main，网页版会自动更新。玩家刷新页面（或重新打开主屏幕上的图标）就能拿到新版本，离线缓存会跟着换掉。
4. 发一个新的 Release（标签如 `v0.1.1`），等 Action 附上文件后，把新的 TapTap 包上传到开发者中心提审。

## 注意

- 不要接入借贷、网贷、博彩类广告，也不要做"看广告领游戏里的钱"这种设计：看广告只换一句谢谢，不影响游戏里的任何数字。
- 网页版和下载版不加载任何广告或统计脚本。
