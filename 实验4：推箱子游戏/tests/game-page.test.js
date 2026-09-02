const test = require('node:test');
const assert = require('node:assert/strict');

const nativeSetInterval = global.setInterval;
const nativeClearInterval = global.clearInterval;

function createWx(progressOverride = {}) {
  const stored = {
    boxGameProgressV2: {
      unlocked: 60,
      completed: {},
      best: {},
      current: null,
      settings: { sound: true },
      ...progressOverride
    }
  };
  const audioEvents = [];
  const redirects = [];
  const canvasCalls = [];
  const context = new Proxy({}, {
    get(target, property) {
      if (!(property in target)) {
        target[property] = (...args) => canvasCalls.push([property, ...args]);
      }
      return target[property];
    }
  });

  return {
    stored,
    audioEvents,
    redirects,
    canvasCalls,
    getStorageSync(key) { return stored[key]; },
    setStorageSync(key, value) { stored[key] = structuredClone(value); },
    removeStorageSync(key) { delete stored[key]; },
    getWindowInfo() { return { windowWidth: 390, windowHeight: 844 }; },
    createCanvasContext() { return context; },
    createInnerAudioContext() {
      return {
        set src(value) { this.currentSrc = value; },
        get src() { return this.currentSrc; },
        stop() {},
        play() { audioEvents.push(this.currentSrc); },
        destroy() { audioEvents.push('destroy'); }
      };
    },
    redirectTo(options) { redirects.push(options.url); }
  };
}

function loadPage({ progress = {}, timers } = {}) {
  const pagePath = require.resolve('../pages/game/game');
  const storagePath = require.resolve('../utils/storage');
  delete require.cache[pagePath];
  delete require.cache[storagePath];

  const wx = createWx(progress);
  const app = { globalData: { progress: wx.stored.boxGameProgressV2 } };
  global.wx = wx;
  global.getApp = () => app;
  global.Page = (definition) => { global.__pageDefinition = definition; };
  const timerAdapter = timers || { setInterval: () => 1, clearInterval: () => {} };
  global.setInterval = timerAdapter.setInterval;
  global.clearInterval = timerAdapter.clearInterval;
  require(pagePath);

  const definition = global.__pageDefinition;
  const page = {
    ...definition,
    data: structuredClone(definition.data),
    setData(update, callback) {
      Object.assign(this.data, update);
      if (callback) callback();
    }
  };
  return { page, wx, app };
}

function movableCurrent(overrides = {}) {
  return {
    levelId: 1,
    level: { id: 1, name: '第 1 关' },
    staticLayer: ['#####', '#o..#', '#...#', '#...#', '#####'].map((row) => row.split('')),
    player: { row: 3, col: 2 },
    boxes: [{ row: 2, col: 2 }],
    initial: { player: { row: 3, col: 2 }, boxes: [{ row: 2, col: 2 }] },
    moves: 0,
    history: [],
    elapsedSeconds: 0,
    ...overrides
  };
}

test.afterEach(() => {
  delete global.wx;
  delete global.getApp;
  delete global.Page;
  delete global.__pageDefinition;
  global.setInterval = nativeSetInterval;
  global.clearInterval = nativeClearInterval;
});

test('新局初始化自适应棋盘、计时和可撤销状态', () => {
  const { page } = loadPage();

  page.onLoad({ level: '1' });

  assert.equal(page.data.levelId, 1);
  assert.equal(page.data.elapsedSeconds, 0);
  assert.equal(page.data.elapsedText, '00:00');
  assert.equal(page.data.paused, false);
  assert.equal(page.data.canUndo, false);
  assert.equal(page.data.undoCount, 0);
  assert.ok(page.data.boardWidth > 0);
  assert.ok(page.data.boardHeight > 0);
  assert.notEqual(page.data.boardWidth, page.data.boardHeight);
});

test('同关断点恢复局面、历史、步数和用时', () => {
  const current = {
    levelId: 1,
    level: { id: 1, name: '第 1 关' },
    staticLayer: [['#', '#', '#'], ['#', '.', '#'], ['#', 'o', '#']],
    player: { row: 1, col: 1 },
    boxes: [{ row: 2, col: 1 }],
    initial: { player: { row: 1, col: 1 }, boxes: [{ row: 2, col: 1 }] },
    moves: 4,
    history: [{ player: { row: 1, col: 1 }, boxes: [{ row: 2, col: 1 }], moves: 3 }],
    elapsedSeconds: 37
  };
  const { page } = loadPage({ progress: { current } });

  page.onLoad({ level: '1' });

  assert.equal(page.data.moves, 4);
  assert.equal(page.data.elapsedSeconds, 37);
  assert.equal(page.data.elapsedText, '00:37');
  assert.equal(page.data.canUndo, true);
  assert.equal(page.gameState.player.row, 1);
});

test('同关断点结构不完整时回退到新局', () => {
  const { page } = loadPage({
    progress: { current: { levelId: 1, staticLayer: [[]], player: { row: 0, col: 0 }, boxes: [] } }
  });

  assert.doesNotThrow(() => page.onLoad({ level: '1' }));
  assert.equal(page.data.moves, 0);
  assert.equal(page.data.canUndo, false);
  assert.ok(page.gameState.initial);
});

test('暂停停止计时并阻止方向操作，继续后恢复', () => {
  let tick;
  let cleared = 0;
  const timers = {
    setInterval(callback) { tick = callback; return 11; },
    clearInterval(id) { assert.equal(id, 11); cleared += 1; }
  };
  const { page } = loadPage({ timers });
  page.onLoad({ level: '1' });
  page.onReady();
  tick();
  assert.equal(page.data.elapsedSeconds, 1);

  page.togglePause();
  const player = structuredClone(page.gameState.player);
  page.handleDirection({ currentTarget: { dataset: { direction: 'right' } } });
  assert.equal(page.data.paused, true);
  assert.equal(cleared, 1);
  assert.deepEqual(page.gameState.player, player);

  page.togglePause();
  assert.equal(page.data.paused, false);
  tick();
  assert.equal(page.data.elapsedSeconds, 2);
});

test('计时器句柄为零时仍可停止', () => {
  let cleared;
  const timers = {
    setInterval() { return 0; },
    clearInterval(id) { cleared = id; }
  };
  const { page } = loadPage({ timers });
  page.onLoad({ level: '1' });
  page.onReady();

  page.togglePause();

  assert.equal(cleared, 0);
});

test('方向键、滑动、无效移动和撤销触发对应音效', () => {
  const { page, wx } = loadPage({ progress: { current: movableCurrent() } });
  page.onLoad({ level: '1' });
  page.onReady();

  page.handleDirection({ currentTarget: { dataset: { direction: 'down' } } });
  assert.equal(wx.audioEvents.at(-1), '/sound_effects/invalid.wav');

  page.handleTouchStart({ changedTouches: [{ clientX: 100, clientY: 100 }] });
  page.handleTouchEnd({ changedTouches: [{ clientX: 160, clientY: 100 }] });
  assert.equal(page.data.moves, 1);
  assert.equal(page.data.canUndo, true);
  assert.equal(page.data.undoCount, 1);
  assert.ok(['/sound_effects/squeak.wav', '/sound_effects/thump.wav'].includes(wx.audioEvents.at(-1)));

  page.undoMove();
  assert.equal(page.data.moves, 0);
  assert.equal(page.data.canUndo, false);
  assert.equal(wx.audioEvents.at(-1), '/sound_effects/whoosh.wav');
});

test('重开清零并保存，离开保存断点，销毁音频和计时器', () => {
  let cleared = 0;
  const timers = {
    setInterval() { return 12; },
    clearInterval() { cleared += 1; }
  };
  const { page, wx } = loadPage({ progress: { current: movableCurrent() }, timers });
  page.onLoad({ level: '1' });
  page.onReady();
  page.handleDirection({ currentTarget: { dataset: { direction: 'right' } } });
  page.setData({ elapsedSeconds: 9, elapsedText: '00:09' });

  page.restartGame();
  assert.equal(page.data.moves, 0);
  assert.equal(page.data.elapsedSeconds, 0);
  assert.equal(wx.stored.boxGameProgressV2.current.elapsedSeconds, 0);

  page.handleDirection({ currentTarget: { dataset: { direction: 'right' } } });
  page.onHide();
  assert.equal(wx.stored.boxGameProgressV2.current.moves, 1);
  assert.equal(cleared, 1);

  page.onUnload();
  assert.equal(wx.audioEvents.at(-1), 'destroy');
});

test('通关播放音效并把步数和用时传给结果页', () => {
  const current = {
    levelId: 1,
    level: { id: 1, name: '第 1 关' },
    staticLayer: ['#####', '#...#', '#.o.#', '#.b.#', '#.p.#', '#####'].map((row) => row.split('')),
    player: { row: 4, col: 2 },
    boxes: [{ row: 3, col: 2 }],
    initial: { player: { row: 4, col: 2 }, boxes: [{ row: 3, col: 2 }] },
    moves: 6,
    history: [],
    elapsedSeconds: 42
  };
  const { page, wx } = loadPage({ progress: { current } });
  page.onLoad({ level: '1' });
  page.onReady();

  page.handleDirection({ currentTarget: { dataset: { direction: 'up' } } });

  assert.equal(page.data.won, true);
  assert.equal(wx.audioEvents.at(-1), '/sound_effects/sfx1.wav');
  assert.equal(wx.redirects.at(-1), '/pages/result/result?level=1&moves=7&time=42');
});
