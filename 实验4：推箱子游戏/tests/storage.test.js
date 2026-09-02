const test = require('node:test');
const assert = require('node:assert/strict');

const { createStorage } = require('../utils/storage');

function createMemoryAdapter(initialValue) {
  let value = initialValue;
  return {
    get() {
      return value;
    },
    set(key, nextValue) {
      value = nextValue;
    },
    remove() {
      value = undefined;
    }
  };
}

test('loads a fresh default progress object when storage is empty', () => {
  const storage = createStorage(createMemoryAdapter());

  assert.deepEqual(storage.loadProgress(), {
    unlocked: 1,
    completed: {},
    best: {},
    current: null,
    settings: { sound: true }
  });
});

test('returns a fresh default progress object for corrupt stored data', () => {
  const storage = createStorage(createMemoryAdapter('{not valid JSON'));

  assert.deepEqual(storage.loadProgress(), {
    unlocked: 1,
    completed: {},
    best: {},
    current: null,
    settings: { sound: true }
  });
});

test('returns a fresh default progress object for structurally invalid stored data', () => {
  const storage = createStorage(createMemoryAdapter({
    unlocked: 'next',
    completed: {},
    best: {},
    current: null,
    settings: { sound: true }
  }));

  assert.deepEqual(storage.loadProgress(), {
    unlocked: 1,
    completed: {},
    best: {},
    current: null,
    settings: { sound: true }
  });
});

test('round-trips a serializable current game snapshot including elapsed seconds', () => {
  const storage = createStorage(createMemoryAdapter());
  const snapshot = {
    levelId: 3,
    player: { row: 2, col: 1 },
    boxes: [{ row: 2, col: 2 }],
    moves: 14,
    elapsedSeconds: 87
  };

  storage.saveCurrentGame(snapshot);

  assert.deepEqual(storage.loadProgress().current, snapshot);
  storage.clearCurrentGame();
  assert.equal(storage.loadProgress().current, null);
});

test('saves a supplied valid progress object without retaining caller mutations', () => {
  const storage = createStorage(createMemoryAdapter());
  const progress = {
    unlocked: 4,
    completed: { 1: true },
    best: {},
    current: null,
    settings: { sound: false }
  };

  storage.saveProgress(progress);
  progress.settings.sound = true;

  assert.equal(storage.loadProgress().settings.sound, false);
});

test('records independently improved move and time bests', () => {
  const storage = createStorage(createMemoryAdapter());

  storage.recordResult(1, 20, 60, 10);
  storage.recordResult(1, 12, 75, 10);
  storage.recordResult(1, 21, 50, 10);

  assert.deepEqual(storage.loadProgress().best[1], {
    moves: 12,
    elapsedSeconds: 50,
    stars: 2
  });
});

test('persists the sound setting', () => {
  const storage = createStorage(createMemoryAdapter());

  storage.setSoundEnabled(false);

  assert.equal(storage.loadProgress().settings.sound, false);
});

test('unlocks the next level but never unlocks beyond level 60', () => {
  const storage = createStorage(createMemoryAdapter());

  storage.recordResult(59, 10, 30, 10, 60);
  assert.equal(storage.loadProgress().unlocked, 60);

  storage.recordResult(60, 10, 30, 10, 60);
  assert.equal(storage.loadProgress().unlocked, 60);
});

test('calculates star thresholds and retains the highest earned stars', () => {
  const storage = createStorage(createMemoryAdapter());

  storage.recordResult(1, 10, 30, 10);
  assert.equal(storage.loadProgress().best[1].stars, 3);

  storage.recordResult(2, 12.5, 30, 10);
  assert.equal(storage.loadProgress().best[2].stars, 2);

  storage.recordResult(3, 13, 30, 10);
  assert.equal(storage.loadProgress().best[3].stars, 1);

  storage.recordResult(1, 20, 20, 10);
  assert.equal(storage.loadProgress().best[1].stars, 3);
});

test('clears all saved progress', () => {
  const storage = createStorage(createMemoryAdapter());
  storage.recordResult(1, 10, 30, 10);

  storage.clearProgress();

  assert.deepEqual(storage.loadProgress(), {
    unlocked: 1,
    completed: {},
    best: {},
    current: null,
    settings: { sound: true }
  });
});
