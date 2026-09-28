const test = require("node:test");
const assert = require("node:assert/strict");
const {
  CATEGORIES,
  DEFINITIONS,
  evaluateCurios,
} = require("../miniprogram/lib/curios");

function entry(overrides = {}) {
  return {
    id: "entry-" + Math.random(),
    title: "今天",
    body: "写下一段生活",
    date: "2026-09-18",
    mood: "平静",
    period: "afternoon",
    tags: ["日常"],
    photos: [],
    favorite: false,
    unlockDate: "",
    deletedAt: 0,
    versions: [],
    replies: [],
    ...overrides,
  };
}

test("curio catalog has exactly fifty unique three-level rules", () => {
  assert.equal(DEFINITIONS.length, 50);
  assert.equal(new Set(DEFINITIONS.map((item) => item[0])).size, 50);
  DEFINITIONS.forEach((item) => {
    assert.equal(item[5].length, 3);
    assert.ok(item[5][0] < item[5][1]);
    assert.ok(item[5][1] < item[5][2]);
    assert.ok(CATEGORIES.includes(item[2]));
  });
});

test("curios calculate levels from visible data and tracked actions", () => {
  const entries = [
    entry({
      photos: ["/assets/sea.jpg", "/assets/book.jpg"],
      favorite: true,
      period: "morning",
      replies: [
        {
          tone: "gentle",
          mode: "dual",
          reply: "温柔",
          alternateReply: "清醒",
        },
      ],
    }),
    entry({
      id: "second",
      date: "2026-09-19",
      mood: "晴朗",
      period: "night",
      tags: ["日常", "散步"],
    }),
    entry({
      id: "third",
      date: "2026-09-20",
      period: "afternoon",
      tags: ["散步"],
    }),
  ];
  const account = {
    entries,
    achievements: ["review", "card"],
    settings: { lastBackupAt: 1 },
    metrics: { review: 5, card: 1, prompt: 10, backup: 3 },
  };
  const curios = evaluateCurios(account, entries, [], "2026-09-20");
  assert.equal(curios.length, 50);
  assert.equal(curios.find((item) => item.id === "days").level, 1);
  assert.equal(curios.find((item) => item.id === "streak").level, 1);
  assert.equal(curios.find((item) => item.id === "photo").level, 1);
  assert.equal(curios.find((item) => item.id === "review").level, 2);
  assert.equal(curios.find((item) => item.id === "prompt").level, 2);
  assert.equal(curios.find((item) => item.id === "backup").level, 2);
  assert.equal(curios.find((item) => item.id === "dual").level, 1);
  const legacyBackup = evaluateCurios(
    { ...account, metrics: {}, settings: { lastBackupAt: 1 } },
    entries,
    [],
    "2026-09-20",
  );
  assert.equal(legacyBackup.find((item) => item.id === "backup").level, 1);
});
