const MOOD_COLORS = {
  晴朗: "#F3B95F",
  轻快: "#E58D76",
  平静: "#6FAE9B",
  低落: "#7D91A8",
  疲惫: "#9A8F87",
};
const STOP_WORDS = new Set([
  "今天",
  "一个",
  "没有",
  "还是",
  "觉得",
  "自己",
  "时候",
  "然后",
  "就是",
  "这个",
  "那个",
  "已经",
  "因为",
  "所以",
  "生活",
  "记录",
]);
const PARTICLES =
  /^[的一了着把被给在也就都还而与和是有没个]|[的一了着把被给在也就都还而与和是有没个]$/;

function periodForHour(hour = new Date().getHours()) {
  return hour < 11 ? "morning" : hour < 18 ? "afternoon" : "night";
}

function privacyFindings(text) {
  const value = String(text || "");
  const rules = [
    ["手机号码", /(^|\D)1[3-9]\d{9}(\D|$)/],
    ["身份证号码", /(^|\D)\d{17}[0-9Xx](\D|$)/],
    ["电子邮箱", /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/],
    ["详细地址", /(住址|地址|宿舍|小区|路\d+号|街\d+号|栋\d+室)/],
  ];
  return rules.filter((rule) => rule[1].test(value)).map((rule) => rule[0]);
}

function addTokens(map, text, weight) {
  const chunks =
    String(text || "").match(/[A-Za-z0-9]{2,}|[\u4e00-\u9fff]{2,}/g) || [];
  chunks.forEach((chunk) => {
    const values = /^[\u4e00-\u9fff]+$/.test(chunk)
      ? chunk.length <= 4
        ? [chunk]
        : Array.from({ length: chunk.length - 1 }, (_, i) =>
            chunk.slice(i, i + 2),
          )
      : [chunk.toLowerCase()];
    values.forEach((word) => {
      if (!STOP_WORDS.has(word) && !PARTICLES.test(word))
        map.set(word, (map.get(word) || 0) + weight);
    });
  });
}

function wordCloud(entries, limit = 24) {
  const map = new Map();
  entries.forEach((entry) => {
    (entry.tags || []).forEach((tag) => addTokens(map, tag, 5));
    String(entry.title || "")
      .split(/[\s，。！？、,.!?：:；;]+/)
      .map((value) => value.trim())
      .filter(
        (value) =>
          value.length >= 2 &&
          value.length <= 12 &&
          !STOP_WORDS.has(value) &&
          !PARTICLES.test(value),
      )
      .forEach((value) => map.set(value, (map.get(value) || 0) + 3));
  });
  const ranked = [...map.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
  const max = ranked[0] ? ranked[0][1] : 1;
  return ranked.map(([word, count], index) => ({
    word,
    count,
    size: Math.round(26 + (count / max) * 30),
    tone: index % 4,
  }));
}

function graph(entries, limit = 12) {
  const nodes = entries.slice(0, limit).map((entry) => ({
    id: entry.id,
    title: entry.title || "未命名记录",
    date: entry.date,
    color: entry.color || MOOD_COLORS[entry.mood] || MOOD_COLORS.平静,
    tags: entry.tags || [],
  }));
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const common = nodes[i].tags.filter((tag) => nodes[j].tags.includes(tag));
      const union = new Set([...nodes[i].tags, ...nodes[j].tags]);
      const score = union.size ? common.length / union.size : 0;
      if (score > 0) edges.push({ from: i, to: j, score, common });
    }
  }
  return { nodes, edges: edges.sort((a, b) => b.score - a.score).slice(0, 24) };
}

function palette(entries) {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title || "未命名记录",
    date: entry.date,
    mood: entry.mood,
    color: entry.color || MOOD_COLORS[entry.mood] || MOOD_COLORS.平静,
    source: entry.color ? "AI 情绪色" : "本地心情色",
  }));
}

function mosaic(entries, limit = 9) {
  const result = [];
  entries.forEach((entry) => {
    (entry.photos || []).forEach((photo) => {
      if (result.length < limit)
        result.push({
          id: entry.id,
          photo,
          title: entry.title || "这一刻",
          date: entry.date,
        });
    });
  });
  entries.forEach((entry) => {
    if (result.length < limit && !result.some((item) => item.id === entry.id))
      result.push({
        id: entry.id,
        photo: "",
        title: entry.title || entry.body.slice(0, 16),
        date: entry.date,
      });
  });
  return result;
}

function dataHealth(account) {
  const entries = account.entries || [];
  const photos = entries.reduce(
    (sum, entry) => sum + (entry.photos || []).length,
    0,
  );
  const largest = entries.reduce(
    (best, entry) =>
      String(entry.body || "").length > best.length
        ? {
            id: entry.id,
            title: entry.title || "未命名记录",
            length: entry.body.length,
          }
        : best,
    { id: "", title: "暂无记录", length: 0 },
  );
  return {
    entries: entries.length,
    visible: entries.filter((entry) => !entry.deletedAt).length,
    trash: entries.filter((entry) => entry.deletedAt).length,
    photos,
    largest,
    estimateKB: Math.max(
      1,
      Math.ceil((JSON.stringify(account).length * 2) / 1024),
    ),
    lastBackupAt:
      Number(account.settings && account.settings.lastBackupAt) || 0,
  };
}

module.exports = {
  MOOD_COLORS,
  periodForHour,
  privacyFindings,
  wordCloud,
  graph,
  palette,
  mosaic,
  dataHealth,
};
