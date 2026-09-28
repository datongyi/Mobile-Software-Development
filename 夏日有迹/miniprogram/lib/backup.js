const { store } = require("./runtime");
const MAX = 18 * 1024 * 1024;
async function exportBackup() {
  const fs = wx.getFileSystemManager();
  const data = store.exportAccount();
  data.images = {};
  let index = 0;
  for (const e of data.account.entries) {
    e.photos = e.photos.map((p) => {
      if (p.startsWith("/assets/")) return p;
      const key = "image-" + index++;
      data.images[key] = fs.readFileSync(p, "base64");
      return "backup:" + key;
    });
  }
  data.account.draft = null;
  const json = JSON.stringify(data);
  if (json.length > MAX) throw Error("备份超过 18 MB，请减少照片后重试");
  const path = wx.env.USER_DATA_PATH + "/summer-backup-" + Date.now() + ".json";
  fs.writeFileSync(path, json, "utf8");
  return path;
}
async function importBackup(path) {
  const fs = wx.getFileSystemManager();
  const info = fs.statSync(path);
  if (info.size > MAX) throw Error("备份文件超过 18 MB");
  let data;
  try {
    data = JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    throw Error("无法解析备份文件");
  }
  if (
    !data ||
    data.schema !== 1 ||
    !data.account ||
    !Array.isArray(data.account.entries)
  )
    throw Error("不是支持的夏日有迹备份");
  const created = [];
  try {
    for (const e of data.account.entries) {
      if (!Array.isArray(e.photos)) throw Error("照片格式错误");
      e.photos = e.photos.map((p) => {
        if (typeof p !== "string") throw Error("照片格式错误");
        if (/^\/assets\/(sea|leaves|book)\.jpg$/.test(p)) return p;
        if (!/^backup:image-\d+$/.test(p))
          throw Error("备份含不支持的图片路径");
        const bytes = data.images && data.images[p.slice(7)];
        if (
          typeof bytes !== "string" ||
          bytes.length > 7 * 1024 * 1024 ||
          !/^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
            bytes,
          )
        )
          throw Error("图片数据校验失败");
        if (!bytes.startsWith("/9j/") && !bytes.startsWith("iVBORw0KGgo"))
          throw Error("只支持 JPG/PNG 备份图片");
        const target =
          wx.env.USER_DATA_PATH +
          "/import-" +
          Date.now() +
          "-" +
          created.length +
          "." +
          (bytes.startsWith("/9j/") ? "jpg" : "png");
        fs.writeFileSync(target, bytes, "base64");
        created.push(target);
        return target;
      });
    }
    return store.importAccount(data);
  } catch (e) {
    created.forEach((p) => {
      try {
        fs.unlinkSync(p);
      } catch {}
    });
    throw e;
  }
}
module.exports = { exportBackup, importBackup };
