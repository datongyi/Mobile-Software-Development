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
    if (cloudbaseTemplateConfig.photoUseMock === true) return Promise.resolve('local-user');
    if (this.globalData.openid) return Promise.resolve(this.globalData.openid);
    if (!wx.cloud || typeof wx.cloud.callFunction !== 'function') {
      return Promise.reject(new Error('微信云开发不可用，请检查基础库和云环境'));
    }
    if (this._openidPromise) return this._openidPromise;
    this._openidPromise = wx.cloud.callFunction({ name: 'getOpenid' })
      .then((response) => {
        const openid = response && response.result && response.result.openid;
        if (!openid) throw new Error('无法获取当前用户身份，请检查 getOpenid 云函数');
        this.globalData.openid = openid;
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
