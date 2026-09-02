const levels = require('../../utils/levels');
const { createGame, move, undo, restart, isWon } = require('../../utils/game-engine');
const { storage } = require('../../utils/storage');
const { createSoundManager } = require('../../utils/sound');
const { formatTime, directionFromSwipe, boardSizeFor } = require('../../utils/page-helpers');

const ICON_PATHS = {
  wall: '/images/icons/stone.png',
  floor: '/images/icons/ice.png',
  box: '/images/icons/box.png',
  player: '/images/icons/bird.png',
  goal: '/images/icons/pig.png'
};

function currentGameFor(progress, levelId) {
  const current = progress && progress.current;
  if (!current || current.levelId !== levelId) return null;
  const validRows = Array.isArray(current.staticLayer)
    && current.staticLayer.length > 0
    && current.staticLayer[0].length > 0
    && current.staticLayer.every((row) => Array.isArray(row) && row.length === current.staticLayer[0].length);
  if (!validRows
    || !current.player
    || !Array.isArray(current.boxes)
    || !current.initial
    || !Array.isArray(current.history)
    || !Number.isFinite(current.moves)) return null;
  return JSON.parse(JSON.stringify(current));
}

Page({
  data: {
    levelId: 1,
    levelName: '第 1 关',
    moves: 0,
    elapsedSeconds: 0,
    elapsedText: '00:00',
    boardWidth: 320,
    boardHeight: 320,
    loading: true,
    paused: false,
    won: false,
    canUndo: false,
    undoCount: 0,
    errorMessage: ''
  },

  onLoad(options) {
    const requested = Number.parseInt(options.level, 10);
    const levelId = Number.isInteger(requested) && requested >= 1 && requested <= levels.length ? requested : 1;
    this.level = levels[levelId - 1];
    const progress = storage.loadProgress();
    const saved = currentGameFor(progress, levelId);
    this.gameState = saved || createGame(this.level);
    this.gameState.levelId = levelId;
    this.elapsedSeconds = saved && Number.isFinite(saved.elapsedSeconds) ? saved.elapsedSeconds : 0;
    delete this.gameState.elapsedSeconds;

    const windowInfo = wx.getWindowInfo();
    const rows = this.gameState.staticLayer.length;
    const cols = this.gameState.staticLayer[0].length;
    const boardSize = boardSizeFor(
      cols,
      rows,
      Math.min((windowInfo.windowWidth || 375) - 32, 560),
      Math.min((windowInfo.windowHeight || 667) * 0.52, 480)
    );
    this.soundManager = createSoundManager({
      createAudioContext: () => wx.createInnerAudioContext(),
      isEnabled: () => storage.loadProgress().settings.sound
    });
    this.setData({
      levelId,
      levelName: this.level.name,
      moves: this.gameState.moves,
      elapsedSeconds: this.elapsedSeconds,
      elapsedText: formatTime(this.elapsedSeconds),
      boardWidth: boardSize.width,
      boardHeight: boardSize.height,
      canUndo: this.gameState.history.length > 0,
      undoCount: this.gameState.history.length
    });
  },

  onReady() {
    this.setupCanvas();
    this.startTimer();
  },

  onShow() {
    if (this.context && !this.data.paused && !this.data.won) this.startTimer();
  },

  onHide() {
    this.stopTimer();
    this.saveCurrentGame();
  },

  onUnload() {
    this.stopTimer();
    this.saveCurrentGame();
    if (this.soundManager) this.soundManager.destroy();
  },

  setupCanvas() {
    this.context = wx.createCanvasContext('gameCanvas', this);
    this.canvasWidth = this.data.boardWidth;
    this.canvasHeight = this.data.boardHeight;
    this.setData({ loading: false, errorMessage: '' }, () => this.drawBoard());
  },

  startTimer() {
    if (this.timer != null || this.data.paused || this.data.won) return;
    this.timer = setInterval(() => {
      this.elapsedSeconds += 1;
      this.setData({
        elapsedSeconds: this.elapsedSeconds,
        elapsedText: formatTime(this.elapsedSeconds)
      });
    }, 1000);
  },

  stopTimer() {
    if (this.timer == null) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  togglePause() {
    if (this.data.loading || this.data.won) return;
    const paused = !this.data.paused;
    this.setData({ paused });
    if (paused) {
      this.stopTimer();
      this.saveCurrentGame();
    } else {
      this.startTimer();
    }
  },

  handleDirection(event) {
    this.applyDirection(event.currentTarget.dataset.direction);
  },

  handleTouchStart(event) {
    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) return;
    this.touchStart = { x: touch.clientX, y: touch.clientY };
  },

  handleTouchEnd(event) {
    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch || !this.touchStart) return;
    const direction = directionFromSwipe(this.touchStart, { x: touch.clientX, y: touch.clientY });
    this.touchStart = null;
    if (direction) this.applyDirection(direction);
  },

  applyDirection(direction) {
    if (this.data.loading || this.data.won || this.data.paused) return;
    const nextState = move(this.gameState, direction);
    if (!nextState.changed) {
      this.soundManager.play('invalid');
      return;
    }

    this.gameState = nextState;
    this.updateGameData();
    this.drawBoard();

    if (isWon(nextState)) {
      this.finishLevel(nextState.moves);
      return;
    }
    this.soundManager.play(nextState.reachedGoal ? 'goal' : nextState.pushed ? 'push' : 'move');
    this.saveCurrentGame();
  },

  undoMove() {
    if (this.data.loading || this.data.won || this.data.paused) return;
    const previous = undo(this.gameState);
    if (!previous.changed) return;
    this.gameState = previous;
    this.updateGameData();
    this.drawBoard();
    this.soundManager.play('undo');
    this.saveCurrentGame();
  },

  updateGameData() {
    this.setData({
      moves: this.gameState.moves,
      canUndo: this.gameState.history.length > 0,
      undoCount: this.gameState.history.length
    });
  },

  restartGame() {
    if (this.data.loading) return;
    this.gameState = restart(this.gameState);
    this.elapsedSeconds = 0;
    this.setData({
      moves: 0,
      elapsedSeconds: 0,
      elapsedText: formatTime(0),
      won: false,
      paused: false,
      canUndo: false,
      undoCount: 0
    });
    this.startTimer();
    this.drawBoard();
    this.saveCurrentGame();
  },

  saveCurrentGame() {
    if (!this.gameState || this.data.won) return;
    const current = JSON.parse(JSON.stringify(this.gameState));
    current.elapsedSeconds = this.elapsedSeconds;
    const progress = storage.saveCurrentGame(current);
    const app = getApp();
    if (app && app.globalData) app.globalData.progress = progress;
  },

  finishLevel(moves) {
    if (this.data.won) return;
    this.stopTimer();
    this.setData({ won: true });
    this.soundManager.play('win');
    const progress = storage.clearCurrentGame();
    const app = getApp();
    if (app && app.globalData) app.globalData.progress = progress;
    const { levelId } = this.data;
    wx.redirectTo({ url: `/pages/result/result?level=${levelId}&moves=${moves}&time=${this.elapsedSeconds}` });
  },

  drawBoard() {
    if (!this.context) return;
    const rows = this.gameState.staticLayer.length;
    const cols = this.gameState.staticLayer[0].length;
    const cellSize = Math.min(this.canvasWidth / cols, this.canvasHeight / rows);
    const offsetX = (this.canvasWidth - cellSize * cols) / 2;
    const offsetY = (this.canvasHeight - cellSize * rows) / 2;
    const context = this.context;

    context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.gameState.staticLayer.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = offsetX + colIndex * cellSize;
        const y = offsetY + rowIndex * cellSize;
        const baseImage = cell === '#' ? ICON_PATHS.wall : ICON_PATHS.floor;
        context.drawImage(baseImage, x, y, cellSize, cellSize);
        if (cell === 'o') context.drawImage(ICON_PATHS.goal, x, y, cellSize, cellSize);
      });
    });
    this.gameState.boxes.forEach((box) => {
      context.drawImage(ICON_PATHS.box, offsetX + box.col * cellSize, offsetY + box.row * cellSize, cellSize, cellSize);
    });
    context.drawImage(
      ICON_PATHS.player,
      offsetX + this.gameState.player.col * cellSize,
      offsetY + this.gameState.player.row * cellSize,
      cellSize,
      cellSize
    );
    context.draw(false);
  }
});
