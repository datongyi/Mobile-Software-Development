function completeLevel(progress, levelId, totalLevels) {
  return {
    unlockedLevel: Math.max(progress.unlockedLevel || 1, Math.min(levelId + 1, totalLevels)),
    completedLevels: {
      ...(progress.completedLevels || {}),
      [levelId]: true
    }
  };
}

function getCompletedCount(progress) {
  return Object.keys(progress.completedLevels || {}).length;
}

function isLevelLocked(progress, levelId) {
  return levelId > (progress.unlockedLevel || 1);
}

module.exports = { completeLevel, getCompletedCount, isLevelLocked };
