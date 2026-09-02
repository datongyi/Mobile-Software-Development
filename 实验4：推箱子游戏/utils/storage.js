const STORAGE_KEY = 'boxGameProgressV2';

function createDefaultProgress() {
  return {
    unlocked: 1,
    completed: {},
    best: {},
    current: null,
    settings: { sound: true }
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function isValidCompleted(value) {
  return Object.values(value).every((completed) => typeof completed === 'boolean');
}

function isValidBest(value) {
  return Object.values(value).every((record) => isPlainObject(record)
    && Number.isFinite(record.moves)
    && Number.isFinite(record.elapsedSeconds)
    && Number.isInteger(record.stars)
    && record.stars >= 1
    && record.stars <= 3);
}

function isValidProgress(value) {
  return isPlainObject(value)
    && Number.isFinite(value.unlocked)
    && value.unlocked >= 1
    && isPlainObject(value.completed)
    && isValidCompleted(value.completed)
    && isPlainObject(value.best)
    && isValidBest(value.best)
    && (value.current === null || isPlainObject(value.current))
    && isPlainObject(value.settings)
    && typeof value.settings.sound === 'boolean';
}

function readProgress(adapter) {
  try {
    const stored = adapter.get(STORAGE_KEY);
    const progress = typeof stored === 'string' ? JSON.parse(stored) : stored;
    return isValidProgress(progress) ? clone(progress) : createDefaultProgress();
  } catch (error) {
    return createDefaultProgress();
  }
}

function starsFor(moves, minMoves) {
  if (moves <= minMoves) return 3;
  if (moves <= minMoves * 1.25) return 2;
  return 1;
}

function createStorage(adapter) {
  if (!adapter || typeof adapter.get !== 'function' || typeof adapter.set !== 'function' || typeof adapter.remove !== 'function') {
    throw new TypeError('adapter must provide get, set, and remove methods');
  }

  function loadProgress() {
    return readProgress(adapter);
  }

  function saveProgress(progress) {
    const next = isValidProgress(progress) ? clone(progress) : createDefaultProgress();
    adapter.set(STORAGE_KEY, next);
    return clone(next);
  }

  function saveCurrentGame(snapshot) {
    const progress = loadProgress();
    progress.current = clone(snapshot);
    return saveProgress(progress);
  }

  function clearCurrentGame() {
    const progress = loadProgress();
    progress.current = null;
    return saveProgress(progress);
  }

  function recordResult(levelId, moves, elapsedSeconds, minMoves, totalLevels = 60) {
    const progress = loadProgress();
    const previousBest = progress.best[levelId] || {};
    const stars = Math.max(previousBest.stars || 0, starsFor(moves, minMoves));

    progress.completed[levelId] = true;
    progress.unlocked = Math.min(60, Math.max(progress.unlocked, Math.min(levelId + 1, totalLevels, 60)));
    progress.best[levelId] = {
      moves: Math.min(previousBest.moves == null ? moves : previousBest.moves, moves),
      elapsedSeconds: Math.min(previousBest.elapsedSeconds == null ? elapsedSeconds : previousBest.elapsedSeconds, elapsedSeconds),
      stars
    };
    progress.current = null;
    return saveProgress(progress);
  }

  function setSoundEnabled(enabled) {
    const progress = loadProgress();
    progress.settings.sound = Boolean(enabled);
    return saveProgress(progress);
  }

  function clearProgress() {
    adapter.remove(STORAGE_KEY);
  }

  return {
    loadProgress,
    saveProgress,
    saveCurrentGame,
    clearCurrentGame,
    recordResult,
    setSoundEnabled,
    clearProgress
  };
}

const defaultStorage = typeof wx !== 'undefined'
  ? createStorage({
    get: (key) => wx.getStorageSync(key),
    set: (key, value) => wx.setStorageSync(key, value),
    remove: (key) => wx.removeStorageSync(key)
  })
  : null;

module.exports = { createStorage, defaultStorage, storage: defaultStorage };
