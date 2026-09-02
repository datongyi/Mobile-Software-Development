function formatTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function directionFromSwipe(start, end, threshold = 24) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < threshold) return null;
  if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX > 0 ? 'right' : 'left';
  return deltaY > 0 ? 'down' : 'up';
}

function boardSizeFor(cols, rows, maxWidth, maxHeight) {
  const cellSize = Math.min(maxWidth / cols, maxHeight / rows);
  return {
    width: Math.floor(cellSize * cols),
    height: Math.floor(cellSize * rows)
  };
}

module.exports = { formatTime, directionFromSwipe, boardSizeFor };
