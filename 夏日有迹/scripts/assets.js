const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "../miniprogram/assets/icons");
const names = [
  "book-open", "calendar-days", "sparkles", "user-round", "plus", "search",
  "chevron-right", "chevron-left", "heart", "image", "share-2", "trash-2",
  "sun", "cloud", "moon", "smile", "coffee", "sprout", "shuffle",
  "lock-keyhole", "history", "download", "upload", "settings-2", "play",
  "mail", "refresh-cw", "camera", "palette", "book-marked", "feather",
  "clock", "leaf", "shell", "flower-2", "mail-open", "layout-grid",
  "shield-alert", "shield-check", "network", "gallery-horizontal-end",
];
const activeNames = new Set([
  "book-open", "calendar-days", "sparkles", "user-round",
]);

async function generate() {
  fs.mkdirSync(root, { recursive: true });
  for (const name of names) {
    const source = fs.readFileSync(
      require.resolve(`lucide-static/icons/${name}.svg`),
      "utf8",
    );
    const variants = [["", "#536D63"]];
    if (activeNames.has(name)) variants.push(["-active", "#21745D"]);
    for (const [suffix, color] of variants) {
      await sharp(Buffer.from(source.replace(/currentColor/g, color)))
        .resize(72, 72)
        .png()
        .toFile(path.join(root, `${name}${suffix}.png`));
    }
  }
  const heart = fs
    .readFileSync(require.resolve("lucide-static/icons/heart.svg"), "utf8")
    .replace('fill="none"', 'fill="#D84F48"')
    .replace(/currentColor/g, "#D84F48");
  await sharp(Buffer.from(heart))
    .resize(72, 72)
    .png()
    .toFile(path.join(root, "heart-filled.png"));
  console.log(`Generated ${names.length + activeNames.size + 1} icons`);
}

generate();
