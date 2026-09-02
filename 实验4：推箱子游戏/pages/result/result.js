const levels = require('../../utils/levels');
const { storage } = require('../../utils/storage');
const { formatTime } = require('../../utils/page-helpers');

Page({
  data: {
    levelId: 1,
    moves: 0,
    elapsedText: '00:00',
    bestMoves: 0,
    bestTimeText: '00:00',
    starsText: '★',
    hasNext: true
  },

  onLoad(options) {
    const level = Number.parseInt(options.level, 10);
    const moves = Number.parseInt(options.moves, 10);
    const elapsedSeconds = Number.parseInt(options.time, 10);
    const levelId = Number.isInteger(level) && level >= 1 && level <= levels.length ? level : 1;
    const safeMoves = Number.isInteger(moves) && moves >= 0 ? moves : 0;
    const safeElapsed = Number.isInteger(elapsedSeconds) && elapsedSeconds >= 0 ? elapsedSeconds : 0;
    const progress = storage.recordResult(levelId, safeMoves, safeElapsed, levels[levelId - 1].minMoves, levels.length);
    const best = progress.best[levelId];
    const app = getApp();
    app.globalData.progress = progress;
    this.setData({
      levelId,
      moves: safeMoves,
      elapsedText: formatTime(safeElapsed),
      bestMoves: best.moves,
      bestTimeText: formatTime(best.elapsedSeconds),
      starsText: '★'.repeat(best.stars) + '☆'.repeat(3 - best.stars),
      hasNext: levelId < levels.length
    });
  },

  nextLevel() {
    if (!this.data.hasNext) return;
    wx.redirectTo({ url: `/pages/game/game?level=${this.data.levelId + 1}` });
  },

  replay() {
    wx.redirectTo({ url: `/pages/game/game?level=${this.data.levelId}` });
  },

  backHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  }
});
