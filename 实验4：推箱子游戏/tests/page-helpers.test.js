const test = require('node:test');
const assert = require('node:assert/strict');

const { formatTime, directionFromSwipe, boardSizeFor } = require('../utils/page-helpers');

test('计时格式固定为 mm:ss', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65), '01:05');
});

test('滑动按主轴识别，短距离忽略', () => {
  assert.equal(directionFromSwipe({ x: 0, y: 0 }, { x: 30, y: 5 }), 'right');
  assert.equal(directionFromSwipe({ x: 20, y: 50 }, { x: 18, y: 10 }), 'up');
  assert.equal(directionFromSwipe({ x: 0, y: 0 }, { x: 10, y: 10 }), null);
});

test('长宽地图在可用区域内保持格子为正方形', () => {
  assert.deepEqual(boardSizeFor(22, 11, 360, 420), { width: 360, height: 180 });
  assert.deepEqual(boardSizeFor(12, 17, 360, 420), { width: 296, height: 420 });
});
