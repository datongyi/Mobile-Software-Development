const CATEGORIES = ["全部", "记录", "收藏", "节奏", "情绪", "探索", "AI"];

const DEFINITIONS = [
  ["first", "第一枚叶子", "记录", "leaf", "累计记录", [1, 10, 50], "篇", "entries"],
  ["ink", "墨水瓶", "记录", "feather", "累计正文", [100, 5000, 30000], "字", "bodyChars"],
  ["days", "三日拾光", "记录", "calendar-days", "留下记录的日期", [3, 15, 60], "天", "activeDays"],
  ["streak", "连续潮汐", "记录", "refresh-cw", "最长连续记录", [2, 7, 21], "天", "maxStreak"],
  ["busy-day", "一日千帆", "记录", "sun", "单日最多记录", [2, 3, 5], "篇", "maxDayEntries"],
  ["titles", "题签匣", "记录", "book-marked", "写有标题的记录", [1, 10, 30], "篇", "titledEntries"],
  ["long-letter", "长信纸", "记录", "mail-open", "正文达到 500 字", [1, 5, 15], "篇", "longEntries"],
  ["scroll", "夏日长卷", "记录", "book-open", "正文达到 1000 字", [1, 3, 10], "篇", "veryLongEntries"],
  ["slices", "时光切片", "记录", "history", "保留的历史版本", [1, 10, 30], "个", "versions"],
  ["months", "月相盘", "记录", "moon", "有记录的月份", [1, 3, 12], "个月", "activeMonths"],

  ["photo", "日光相片", "收藏", "camera", "累计照片", [1, 10, 30], "张", "photos"],
  ["album", "影集扣", "收藏", "image", "含照片的记录", [1, 5, 20], "篇", "photoEntries"],
  ["photo-days", "光影日历", "收藏", "calendar-days", "拍下生活的日期", [1, 7, 30], "天", "photoDays"],
  ["film", "三格胶卷", "收藏", "gallery-horizontal-end", "含多张照片的记录", [1, 3, 10], "篇", "multiPhotoEntries"],
  ["favorite", "红心标本", "收藏", "heart", "收藏记录", [1, 5, 20], "篇", "favorites"],
  ["favorite-photo", "珍藏底片", "收藏", "image", "收藏含照片的记录", [1, 3, 10], "篇", "favoritePhotos"],
  ["card", "分享花束", "收藏", "flower-2", "保存纪念卡", [1, 5, 20], "次", "cards"],
  ["backup", "保险信封", "收藏", "download", "成功导出备份", [1, 3, 10], "次", "backups"],
  ["review", "回忆贝壳", "收藏", "shell", "随机回忆或放映", [1, 5, 20], "次", "reviews"],
  ["prompt", "灵感火花", "收藏", "sparkles", "重新抽取灵感签", [1, 10, 30], "次", "prompts"],

  ["morning", "晨光钥匙", "节奏", "sun", "早晨记录", [1, 7, 30], "篇", "morning"],
  ["afternoon", "午后汽水", "节奏", "coffee", "午后记录", [1, 7, 30], "篇", "afternoon"],
  ["night", "星夜书签", "节奏", "moon", "夜晚记录", [1, 7, 30], "篇", "night"],
  ["three-periods", "一日三刻", "节奏", "clock", "同日集齐早午晚", [1, 5, 15], "天", "fullPeriodDays"],
  ["weekend", "周末车票", "节奏", "sun", "周末记录", [1, 10, 30], "篇", "weekendEntries"],
  ["weekday", "平日微光", "节奏", "clock", "工作日记录", [1, 20, 60], "篇", "weekdayEntries"],
  ["years", "跨年邮戳", "节奏", "mail", "记录跨越年份", [2, 3, 5], "年", "activeYears"],
  ["anniversary", "往年今日", "节奏", "history", "往年同日记录", [1, 3, 10], "篇", "anniversaries"],
  ["seasons", "四季风铃", "节奏", "cloud", "有记录的季度", [1, 4, 8], "季", "activeSeasons"],
  ["month-max", "盛夏月刊", "节奏", "book-open", "单月最多记录", [5, 15, 30], "篇", "maxMonthEntries"],
  ["capsule", "未来邮票", "节奏", "mail", "封存时光胶囊", [1, 3, 10], "封", "capsules"],
  ["opened-capsule", "开封蜡印", "节奏", "mail-open", "到期打开的胶囊", [1, 3, 10], "封", "openedCapsules"],

  ["moods", "五色情绪石", "情绪", "palette", "记录过的心情种类", [2, 4, 5], "种", "moodDiversity"],
  ["sunny", "晴光琥珀", "情绪", "sun", "晴朗记录", [1, 10, 30], "篇", "sunny"],
  ["light", "轻风铃", "情绪", "smile", "轻快记录", [1, 10, 30], "篇", "light"],
  ["calm", "静水玻璃", "情绪", "cloud", "平静记录", [1, 10, 30], "篇", "calm"],
  ["low", "雨声收纳盒", "情绪", "cloud", "低落时仍然记录", [1, 5, 15], "篇", "low"],
  ["tired", "晚安羽毛", "情绪", "feather", "疲惫时仍然记录", [1, 5, 15], "篇", "tired"],
  ["tag-seeds", "标签种子库", "情绪", "sprout", "使用过的不同标签", [3, 10, 30], "个", "uniqueTags"],
  ["tagged", "索引丝带", "情绪", "book-marked", "带标签的记录", [1, 10, 30], "篇", "taggedEntries"],
  ["tag-wreath", "标签花环", "情绪", "flower-2", "累计添加标签", [3, 30, 100], "次", "tagAssignments"],
  ["resonance", "共鸣磁石", "情绪", "network", "存在共同标签的记录组合", [1, 5, 20], "组", "relationPairs"],

  ["walk", "脚步地图", "探索", "shuffle", "散步或旅行记录", [1, 5, 20], "篇", "adventureEntries"],
  ["learn", "书页余温", "探索", "book-open", "阅读或学习记录", [1, 5, 20], "篇", "learningEntries"],
  ["daily", "烟火罐", "探索", "coffee", "日常或饮食记录", [1, 10, 30], "篇", "dailyEntries"],
  ["deep-tag", "深根标签", "探索", "sprout", "同一标签累计出现", [2, 10, 30], "次", "maxTagFrequency"],

  ["reply", "笔友墨迹", "AI", "mail-open", "保存 AI 回信", [1, 5, 20], "封", "replies"],
  ["tones", "语气调音叉", "AI", "settings-2", "使用过的回信语气", [1, 3, 5], "种", "tones"],
  ["modes", "模式万花筒", "AI", "sparkles", "使用过的 AI 模式", [1, 3, 5], "种", "modes"],
  ["dual", "双声回音", "AI", "network", "生成 AI 双声道", [1, 3, 10], "次", "dualReplies"],
];

function countBy(values) {
  return values.reduce((result, value) => {
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});
}

function dayNumber(value) {
  return Math.floor(new Date(value + "T12:00:00").getTime() / 86400000);
}

function maxStreak(dates) {
  const values = [...new Set(dates)].map(dayNumber).sort((a, b) => a - b);
  let best = values.length ? 1 : 0;
  let current = best;
  for (let i = 1; i < values.length; i++) {
    current = values[i] === values[i - 1] + 1 ? current + 1 : 1;
    best = Math.max(best, current);
  }
  return best;
}

function buildStats(account, entries, capsules, today) {
  const dates = entries.map((entry) => entry.date);
  const dayCounts = countBy(dates);
  const monthCounts = countBy(dates.map((date) => date.slice(0, 7)));
  const tagAssignments = entries.flatMap((entry) => entry.tags || []);
  const tagCounts = countBy(tagAssignments);
  const photoEntries = entries.filter((entry) => entry.photos.length);
  const replyList = entries.flatMap((entry) => entry.replies || []);
  const metrics = account.metrics || {};
  const legacy = new Set(account.achievements || []);
  const periodsByDay = {};
  entries.forEach((entry) => {
    periodsByDay[entry.date] ||= new Set();
    periodsByDay[entry.date].add(entry.period || "afternoon");
  });
  let relationPairs = 0;
  for (let i = 0; i < entries.length; i++)
    for (let j = i + 1; j < entries.length; j++)
      if ((entries[i].tags || []).some((tag) => entries[j].tags.includes(tag)))
        relationPairs++;
  const moodCounts = countBy(entries.map((entry) => entry.mood));
  const periodCounts = countBy(entries.map((entry) => entry.period || "afternoon"));
  const allCapsules = (account.entries || []).filter(
    (entry) => !entry.deletedAt && entry.unlockDate,
  );
  const tagMatches = (entry, pattern) =>
    (entry.tags || []).some((tag) => pattern.test(tag));
  return {
    entries: entries.length,
    bodyChars: entries.reduce((sum, entry) => sum + entry.body.length, 0),
    activeDays: new Set(dates).size,
    maxStreak: maxStreak(dates),
    maxDayEntries: Math.max(0, ...Object.values(dayCounts)),
    titledEntries: entries.filter((entry) => entry.title.trim()).length,
    longEntries: entries.filter((entry) => entry.body.length >= 500).length,
    veryLongEntries: entries.filter((entry) => entry.body.length >= 1000).length,
    versions: entries.reduce((sum, entry) => sum + entry.versions.length, 0),
    activeMonths: new Set(dates.map((date) => date.slice(0, 7))).size,
    photos: entries.reduce((sum, entry) => sum + entry.photos.length, 0),
    photoEntries: photoEntries.length,
    photoDays: new Set(photoEntries.map((entry) => entry.date)).size,
    multiPhotoEntries: entries.filter((entry) => entry.photos.length >= 2).length,
    favorites: entries.filter((entry) => entry.favorite).length,
    favoritePhotos: entries.filter(
      (entry) => entry.favorite && entry.photos.length,
    ).length,
    cards: Math.max(Number(metrics.card) || 0, legacy.has("card") ? 1 : 0),
    backups: Math.max(
      Number(metrics.backup) || 0,
      account.settings && account.settings.lastBackupAt ? 1 : 0,
    ),
    reviews: Math.max(
      Number(metrics.review) || 0,
      legacy.has("review") ? 1 : 0,
    ),
    prompts: Number(metrics.prompt) || 0,
    morning: periodCounts.morning || 0,
    afternoon: periodCounts.afternoon || 0,
    night: periodCounts.night || 0,
    fullPeriodDays: Object.values(periodsByDay).filter(
      (periods) =>
        periods.has("morning") &&
        periods.has("afternoon") &&
        periods.has("night"),
    ).length,
    weekendEntries: entries.filter((entry) =>
      [0, 6].includes(new Date(entry.date + "T12:00:00").getDay()),
    ).length,
    weekdayEntries: entries.filter(
      (entry) =>
        ![0, 6].includes(new Date(entry.date + "T12:00:00").getDay()),
    ).length,
    activeYears: new Set(dates.map((date) => date.slice(0, 4))).size,
    anniversaries: entries.filter(
      (entry) => entry.date !== today && entry.date.slice(5) === today.slice(5),
    ).length,
    activeSeasons: new Set(
      dates.map((date) => {
        const month = Number(date.slice(5, 7));
        return date.slice(0, 4) + "-Q" + (Math.floor((month - 1) / 3) + 1);
      }),
    ).size,
    maxMonthEntries: Math.max(0, ...Object.values(monthCounts)),
    capsules: allCapsules.length,
    openedCapsules: capsules.filter((capsule) => !capsule.locked).length,
    moodDiversity: Object.keys(moodCounts).length,
    sunny: moodCounts["晴朗"] || 0,
    light: moodCounts["轻快"] || 0,
    calm: moodCounts["平静"] || 0,
    low: moodCounts["低落"] || 0,
    tired: moodCounts["疲惫"] || 0,
    uniqueTags: Object.keys(tagCounts).length,
    taggedEntries: entries.filter((entry) => entry.tags.length).length,
    tagAssignments: tagAssignments.length,
    relationPairs,
    adventureEntries: entries.filter((entry) =>
      tagMatches(entry, /散步|旅行|海边|户外|运动/),
    ).length,
    learningEntries: entries.filter((entry) =>
      tagMatches(entry, /阅读|学习|工作|课程|写作/),
    ).length,
    dailyEntries: entries.filter((entry) =>
      tagMatches(entry, /日常|饮食|家人|朋友|周末/),
    ).length,
    maxTagFrequency: Math.max(0, ...Object.values(tagCounts)),
    replies: replyList.length,
    tones: new Set(replyList.map((reply) => reply.tone).filter(Boolean)).size,
    modes: new Set(replyList.map((reply) => reply.mode).filter(Boolean)).size,
    dualReplies: replyList.filter(
      (reply) => reply.mode === "dual" && reply.alternateReply,
    ).length,
  };
}

function evaluateCurios(account, entries, capsules, today) {
  const stats = buildStats(
    account,
    entries,
    capsules,
    today || new Date().toISOString().slice(0, 10),
  );
  return DEFINITIONS.map(
    ([id, name, category, icon, desc, thresholds, unit, key]) => {
      const value = Math.max(0, Number(stats[key]) || 0);
      const level = thresholds.filter((target) => value >= target).length;
      const nextTarget = thresholds[Math.min(level, 2)];
      return {
        id,
        name,
        category,
        icon,
        desc,
        thresholds,
        unit,
        value,
        level,
        unlocked: level > 0,
        progress:
          level === 3
            ? 100
            : Math.min(100, Math.round((value / nextTarget) * 100)),
        progressText:
          level === 3
            ? `三级达成 · 当前 ${value}${unit}`
            : `下一级 ${nextTarget}${unit} · 当前 ${value}${unit}`,
      };
    },
  );
}

module.exports = { CATEGORIES, DEFINITIONS, buildStats, evaluateCurios };
