export default class CompatibilityManager {
    constructor() {
        this.SDKVersion = wx.getSystemInfoSync().SDKVersion;
    }

    // Ref: https://developers.weixin.qq.com/minigame/dev/guide/runtime/client-lib/compatibility.html
    checkSDKVersion(v2, v1 = this.SDKVersion) {
        v1 = v1.split('.')
        v2 = v2.split('.')
        const len = Math.max(v1.length, v2.length)

        while (v1.length < len) {
            v1.push('0')
        }
        while (v2.length < len) {
            v2.push('0')
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i])
            const num2 = parseInt(v2[i])

            if (num1 > num2) {
                return 1
            } else if (num1 < num2) {
                return -1
            }
        }

        return 0
    }

    static getInstance() {
        if (!CompatibilityManager.instance) {
            CompatibilityManager.instance = new CompatibilityManager();
        }
        return CompatibilityManager.instance;
    }
}