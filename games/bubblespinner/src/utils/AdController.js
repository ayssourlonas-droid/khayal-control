import CompatibilityManager from "./CompatibilityManager";


export default class AdController {
    constructor() {
        this.interstitialAd = null;
        this.interstitialAdShownOnce = false;

        if (CompatibilityManager.getInstance().checkSDKVersion('2.6.0') >= 0) {
            if (wx.createInterstitialAd) {
                this.interstitialAd = wx.createInterstitialAd({
                    adUnitId: "adunit-05504e088717e5b8"
                });
            }
        }
    }

    showInterstitialAdOnce() {

        if (!this.interstitialAdShownOnce && this.interstitialAd) {
            this.interstitialAd.show().catch((err) => {
                console.error(err);
            });
            this.interstitialAdShownOnce = true;
        }
    }

    resetInterstitialAdShownOnce() {
        this.interstitialAdShownOnce = false;
    }

    static getInstance() {
        if (!AdController.instance) {
            AdController.instance = new AdController();
        }
        return AdController.instance;
    }
}