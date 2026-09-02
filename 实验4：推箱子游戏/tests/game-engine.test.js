const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createGame,
  move,
  undo,
  restart,
  isWon,
  snapshot
} = require('../utils/game-engine');

const level = {
  id: 'test-1',
  name: 'Test level',
  map: [
    '#####',
    '#...#',
    '#.o.#',
    '#.b.#',
    '#.p.#',
    '#####'
  ]
};

function position(state, row, col) {
  return state.player.row === row && state.player.col === col;
}

test('角色可以向空地移动且原状态不变', () => {
  const game = createGame(level);
  const next = move(game, 'right');

  assert.equal(next.changed, true);
  assert.equal(next.moves, 1);
  assert.equal(position(next, 4, 2), false);
  assert.deepEqual(game.player, { row: 4, col: 2 });
  assert.deepEqual(game.boxes, [{ row: 3, col: 2 }]);
  assert.equal(game.staticLayer[2][2], 'o');
  assert.deepEqual(next.player, { row: 4, col: 3 });
  assert.deepEqual(
    { pushed: next.pushed, reachedGoal: next.reachedGoal, reason: next.reason },
    { pushed: false, reachedGoal: false, reason: null }
  );
});

test('墙体阻挡时移动无效', () => {
  const game = createGame(level);
  const next = move(game, 'down');

  assert.equal(next.changed, false);
  assert.equal(next.moves, 0);
  assert.deepEqual(next.player, game.player);
  assert.deepEqual(
    { pushed: next.pushed, reachedGoal: next.reachedGoal, reason: next.reason },
    { pushed: false, reachedGoal: false, reason: 'blocked' }
  );
});

test('不可用冰面只绘制背景且不能进入', () => {
  const game = createGame({ id: 'void', map: ['#####', '#p .#', '#.bo#', '#####'] });
  const next = move(game, 'right');

  assert.equal(next.changed, false);
  assert.deepEqual(next.player, game.player);
  assert.equal(next.reason, 'blocked');
});

test('角色可以推动箱子，连续推动也会更新步数', () => {
  const game = createGame(level);
  const pushed = move(move(game, 'up'), 'up');

  assert.equal(pushed.changed, true);
  assert.equal(pushed.moves, 2);
  assert.deepEqual(pushed.player, { row: 2, col: 2 });
  assert.deepEqual(pushed.boxes, [{ row: 1, col: 2 }]);
  assert.equal(pushed.pushed, true);
  assert.equal(pushed.reachedGoal, false);
  assert.equal(pushed.reason, null);
});

test('箱子后方是墙时不能推动箱子', () => {
  const game = createGame({ id: 'blocked', map: ['#####', '#p..#', '#b..#', '#####'] });
  const next = move(game, 'down');

  assert.equal(next.changed, false);
  assert.deepEqual(next.player, game.player);
  assert.deepEqual(next.boxes, game.boxes);
  assert.equal(next.reason, 'box-blocked');
});

test('移动事件区分非法方向和箱子新到达目标', () => {
  const game = createGame(level);
  const invalid = move(game, 'diagonal');
  const won = move(game, 'up');

  assert.deepEqual(
    { changed: invalid.changed, pushed: invalid.pushed, reachedGoal: invalid.reachedGoal, reason: invalid.reason },
    { changed: false, pushed: false, reachedGoal: false, reason: 'invalid-direction' }
  );
  assert.deepEqual(
    { changed: won.changed, pushed: won.pushed, reachedGoal: won.reachedGoal, reason: won.reason },
    { changed: true, pushed: true, reachedGoal: true, reason: null }
  );
});

test('撤销恢复完整状态，重新开始恢复初始状态', () => {
  const game = createGame(level);
  const initial = snapshot(game);
  const moved = move(move(game, 'up'), 'up');
  const undone = undo(moved);

  assert.deepEqual(snapshot(undone), snapshot(move(game, 'up')));
  assert.equal(undone.moves, 1);
  assert.deepEqual(snapshot(restart(moved)), initial);
  assert.equal(restart(moved).history.length, 0);
  assert.deepEqual(
    { pushed: undone.pushed, reachedGoal: undone.reachedGoal, reason: undone.reason },
    { pushed: false, reachedGoal: false, reason: null }
  );
  assert.deepEqual(
    { pushed: restart(moved).pushed, reachedGoal: restart(moved).reachedGoal, reason: restart(moved).reason },
    { pushed: false, reachedGoal: false, reason: null }
  );
});

test('所有箱子到达目标点时胜利', () => {
  const game = createGame(level);
  const won = move(game, 'up');

  assert.equal(isWon(won), true);
});

test('静态层保留目标，动态层单独保存角色和箱子', () => {
  const game = createGame(level);

  assert.equal(game.staticLayer[2][2], 'o');
  assert.equal(game.staticLayer[3][2], '.');
  assert.deepEqual(game.player, { row: 4, col: 2 });
  assert.deepEqual(game.boxes, [{ row: 3, col: 2 }]);
});

test('历史最多保留五个快照，并可连续撤销至历史为空', () => {
  let game = createGame({
    id: 'long-game',
    map: ['#######', '#p....#', '#######']
  });

  for (let index = 0; index < 6; index += 1) {
    game = move(game, index % 2 === 0 ? 'right' : 'left');
  }

  assert.equal(game.history.length, 5);
  assert.ok(game.history.every((entry) => !Object.hasOwn(entry, 'history')));

  for (let index = 0; index < 5; index += 1) {
    game = undo(game);
    assert.equal(game.changed, true);
    assert.equal(game.pushed, false);
    assert.equal(game.reachedGoal, false);
    assert.equal(game.reason, null);
  }

  assert.equal(game.history.length, 0);
  assert.equal(game.moves, 1);
  const emptyUndo = undo(game);
  assert.deepEqual(
    { changed: emptyUndo.changed, pushed: emptyUndo.pushed, reachedGoal: emptyUndo.reachedGoal, reason: emptyUndo.reason },
    { changed: false, pushed: false, reachedGoal: false, reason: null }
  );
});
