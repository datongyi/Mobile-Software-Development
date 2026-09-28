const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const app = JSON.parse(fs.readFileSync(path.join(root, 'miniprogram/app.json'), 'utf8'));
let checked = 0;
const requireAsset = relative => {
  if (!fs.existsSync(path.join(root, 'miniprogram', relative))) {
    throw Error(`Missing asset: ${relative}`);
  }
};
for (const page of app.pages) {
  for (const ext of ['js', 'json', 'wxml', 'wxss']) {
    const file = path.join(root, 'miniprogram', `${page}.${ext}`);
    if (!fs.existsSync(file)) throw Error(`Missing page file: ${file}`);
    if (ext === 'js') {
      const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
      if (result.status !== 0) throw Error(result.stderr);
    }
    if (ext === 'json') JSON.parse(fs.readFileSync(file, 'utf8'));
    if (ext === 'wxml') {
      const text = fs.readFileSync(file, 'utf8');
      for (const match of text.matchAll(/src="(\/assets\/[^"{}]+)"/g)) {
        requireAsset(match[1]);
      }
    }
    checked++;
  }
}
for (const item of app.tabBar.list) {
  for (const key of ['iconPath', 'selectedIconPath']) {
    requireAsset(item[key]);
  }
}
const { DEFINITIONS } = require('../miniprogram/lib/curios');
for (const definition of DEFINITIONS) {
  requireAsset(`/assets/icons/${definition[3]}.png`);
}
for (const avatar of ['sprout', 'sun', 'coffee', 'shell']) {
  requireAsset(`/assets/icons/${avatar}.png`);
}
for (const photo of ['sea', 'leaves', 'book']) {
  requireAsset(`/assets/${photo}.jpg`);
}
console.log(`${app.pages.length} routes / ${checked} page files, JSON, JavaScript syntax, static and dynamic assets checked`);
