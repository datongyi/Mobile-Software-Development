const test = require('node:test');
const assert = require('node:assert/strict');

const { completeLevel, getCompletedCount, isLevelLocked } = require('../utils/progress');

test('完成关卡后解锁下一关', () => {
  const progress = completeLevel({ unlockedLevel: 1, completedLevels: {} }, 1, 4);

  assert.equal(progress.unlockedLevel, 2);
  assert.equal(isLevelLocked(progress, 2), false);
  assert.equal(getCompletedCount(progress), 1);
});

test('完成第 60 关后显示 60/60，且不生成第 61 关', () => {
  const progress = completeLevel({
    unlockedLevel: 60,
    completedLevels: Object.fromEntries(Array.from({ length: 59 }, (_, index) => [index + 1, true]))
  }, 60, 60);

  assert.equal(progress.unlockedLevel, 60);
  assert.equal(getCompletedCount(progress), 60);
  assert.equal(isLevelLocked(progress, 60), false);
});
