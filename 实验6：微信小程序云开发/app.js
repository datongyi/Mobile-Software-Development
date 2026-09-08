import updateManager from './common/updateManager';
import { cloudbaseTemplateConfig } from './config/index';

if (wx.cloud) {
  const cloudOptions = { traceUser: true };
  if (cloudbaseTemplateConfig.env) cloudOptions.env = cloudbaseTemplateConfig.env;
  wx.cloud.init(cloudOptions);
}

App({
  globalData: { openid: '', userInfo: null },
  onLaunch: function () { this.getOpenid().catch(() => undefined); },
  onShow: function () {
    updateManager();
  },
  getOpenid: function () {
    if (this.globalData.openid) return Promise.resolve(this.globalData.openid);
    if (!wx.cloud || typeof wx.cloud.callFunction !== 'function') {
      this.globalData.openid = 'local-user';
      return Promise.resolve(this.globalData.openid);
    }
    if (this._openidPromise) return this._openidPromise;
    this._openidPromise = wx.cloud.callFunction({ name: 'getOpenid' })
      .then((response) => {
        this.globalData.openid = response && response.result && response.result.openid || 'local-user';
        return this.globalData.openid;
      })
      .catch((error) => {
        this._openidPromise = null;
        if (cloudbaseTemplateConfig.allowPhotoFallback !== false) {
          this.globalData.openid = 'local-user';
          return this.globalData.openid;
        }
        throw error;
      });
    return this._openidPromise;
  },
});
