const DIRECTIONS = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeMap(map) {
  if (!Array.isArray(map) || map.length === 0) {
    throw new TypeError('level.map must be a non-empty array');
  }
  return map.map((row) => {
    if (typeof row === 'string') return row.split('');
    if (Array.isArray(row)) return row.map((cell) => {
      if (typeof cell === 'string') return cell;
      return ({ 0: null, 1: '#', 2: '.', 3: 'o', 4: 'b', 5: 'p' })[cell];
    });
    throw new TypeError('level.map rows must be strings or arrays');
  });
}

function parseLevel(level) {
  const map = normalizeMap(level && level.map);
  const width = map[0].length;
  if (!width || map.some((row) => row.length !== width)) {
    throw new Error('level.map must be rectangular');
  }

  const staticLayer = map.map((row) => row.map((cell) => {
    if (cell === 'b' || cell === 'p' || cell === '*') return cell === '*' ? 'o' : '.';
    return cell;
  }));
  const boxes = [];
  let player = null;

  map.forEach((row, r) => row.forEach((cell, c) => {
    if (cell === 'b' || cell === '*') boxes.push({ row: r, col: c });
    if (cell === 'p') {
      if (player) throw new Error('level must contain one player');
      player = { row: r, col: c };
    }
    if (!['#', '.', 'o', 'b', 'p', '*', ' ', null].includes(cell)) {
      throw new Error(`invalid map cell: ${cell}`);
    }
  }));
  if (!player) throw new Error('level must contain one player');
  return { staticLayer, player, boxes, initial: { player, boxes } };
}

function createGame(level) {
  const parsed = parseLevel(level);
  return {
    levelId: level.id,
    level: level.id == null ? undefined : clone({ id: level.id, name: level.name }),
    staticLayer: parsed.staticLayer,
    player: clone(parsed.player),
    boxes: clone(parsed.boxes),
    initial: clone(parsed.initial),
    moves: 0,
    history: []
  };
}

function boxAt(boxes, point) {
  return boxes.findIndex((box) => box.row === point.row && box.col === point.col);
}

function isOpen(state, point) {
  const cell = state.staticLayer[point.row]?.[point.col];
  return cell != null && cell !== '#' && cell !== ' ';
}

function move(state, direction) {
  const delta = DIRECTIONS[direction];
  if (!delta) return { ...clone(state), changed: false, pushed: false, reachedGoal: false, reason: 'invalid-direction' };
  const next = clone(state);
  const destination = { row: state.player.row + delta.row, col: state.player.col + delta.col };
  const boxIndex = boxAt(state.boxes, destination);
  if (!isOpen(state, destination)) {
    return { ...next, changed: false, pushed: false, reachedGoal: false, reason: 'blocked' };
  }
  let pushed = false;
  let reachedGoal = false;
  if (boxIndex !== -1) {
    const boxDestination = { row: destination.row + delta.row, col: destination.col + delta.col };
    if (!isOpen(state, boxDestination) || boxAt(state.boxes, boxDestination) !== -1) {
      return { ...next, changed: false, pushed: false, reachedGoal: false, reason: 'box-blocked' };
    }
    next.boxes[boxIndex] = boxDestination;
    pushed = true;
    reachedGoal = state.staticLayer[boxDestination.row][boxDestination.col] === 'o';
  }
  next.history = [...state.history, snapshot(state)].slice(-5);
  next.player = destination;
  next.moves = state.moves + 1;
  next.changed = true;
  next.pushed = pushed;
  next.reachedGoal = reachedGoal;
  next.reason = null;
  return next;
}

function undo(state) {
  if (!state.history.length) {
    return { ...clone(state), changed: false, pushed: false, reachedGoal: false, reason: null };
  }
  const history = state.history.slice(0, -1);
  const restored = clone(state.history[state.history.length - 1]);
  restored.history = history;
  restored.changed = true;
  restored.pushed = false;
  restored.reachedGoal = false;
  restored.reason = null;
  return restored;
}

function restart(state) {
  const next = clone(state);
  next.player = clone(state.initial.player);
  next.boxes = clone(state.initial.boxes);
  next.moves = 0;
  next.history = [];
  next.changed = true;
  next.pushed = false;
  next.reachedGoal = false;
  next.reason = null;
  return next;
}

function isWon(state) {
  return state.boxes.every((box) => state.staticLayer[box.row]?.[box.col] === 'o');
}

function snapshot(state) {
  return {
    levelId: state.levelId,
    level: clone(state.level),
    staticLayer: clone(state.staticLayer),
    player: clone(state.player),
    boxes: clone(state.boxes),
    initial: clone(state.initial),
    moves: state.moves
  };
}

module.exports = { createGame, move, undo, restart, isWon, snapshot };
