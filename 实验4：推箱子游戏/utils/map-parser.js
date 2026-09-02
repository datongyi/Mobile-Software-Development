const EXPECTED_MAP_COUNT = 60;
const SOURCE_TO_ENGINE = {
  X: '#',
  ' ': ' ',
  '.': 'o',
  '*': 'b',
  '@': 'p',
  '&': '*'
};

function readNumber(block, label) {
  const match = block.match(new RegExp(`^${label}:\\s*(\\d+)\\s*$`, 'm'));
  if (!match) throw new Error(`Maze 区块缺少 ${label}`);
  return Number(match[1]);
}

function classifySpaces(rows) {
  const height = rows.length;
  const width = rows[0].length;
  const outside = new Set();
  const queue = [];
  const enqueue = (row, col) => {
    if (row < 0 || row >= height || col < 0 || col >= width) return;
    if (rows[row][col] !== ' ') return;
    const key = `${row},${col}`;
    if (outside.has(key)) return;
    outside.add(key);
    queue.push([row, col]);
  };

  for (let col = 0; col < width; col += 1) {
    enqueue(0, col);
    enqueue(height - 1, col);
  }
  for (let row = 1; row < height - 1; row += 1) {
    enqueue(row, 0);
    enqueue(row, width - 1);
  }
  for (let index = 0; index < queue.length; index += 1) {
    const [row, col] = queue[index];
    enqueue(row - 1, col);
    enqueue(row + 1, col);
    enqueue(row, col - 1);
    enqueue(row, col + 1);
  }

  return rows.map((row, rowIndex) => Array.from(row, (char, colIndex) => {
    if (char !== ' ') return SOURCE_TO_ENGINE[char];
    return outside.has(`${rowIndex},${colIndex}`) ? ' ' : '.';
  }).join(''));
}

function parseBlock(block) {
  const id = readNumber(block, 'Maze');
  const width = readNumber(block, 'Size X');
  const height = readNumber(block, 'Size Y');
  const minMoves = readNumber(block, 'Length');
  const lines = block.replace(/\r/g, '').split('\n');
  const lengthLine = lines.findIndex((line) => /^Length:\s*\d+\s*$/.test(line));
  const mapLines = lines.slice(lengthLine + 1).filter((line, index, rows) => {
    if (index === 0 && line === '') return false;
    return !(index === rows.length - 1 && line === '');
  });

  if (mapLines.length !== height) {
    throw new Error(`Maze ${id} 高度应为 ${height}，实际为 ${mapLines.length}`);
  }

  const paddedRows = mapLines.map((row, rowIndex) => {
    if (row.length > width) {
      throw new Error(`Maze ${id} 第 ${rowIndex + 1} 行宽度不能超过 ${width}，实际为 ${row.length}`);
    }
    const padded = row.padEnd(width, ' ');
    Array.from(padded, (char) => {
      if (!Object.hasOwn(SOURCE_TO_ENGINE, char)) {
        throw new Error(`Maze ${id} 存在非法字符: ${char}`);
      }
      return char;
    });
    return padded;
  });
  const map = classifySpaces(paddedRows);

  return { id, width, height, minMoves, map };
}

function parseSokobanMaps(source) {
  if (typeof source !== 'string') throw new TypeError('地图素材必须是字符串');
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r/g, '');
  const blocks = normalized
    .split(/^\*{5,}\s*$/m)
    .map((block) => block.trimEnd())
    .filter((block) => /^Maze:\s*\d+/m.test(block));

  if (blocks.length !== EXPECTED_MAP_COUNT) {
    throw new Error(`地图素材必须包含恰好 ${EXPECTED_MAP_COUNT} 个 Maze 区块，当前为 ${blocks.length}`);
  }

  const maps = blocks.map(parseBlock);
  maps.forEach((map, index) => {
    if (map.id !== index + 1) {
      throw new Error(`Maze 编号必须从 1 连续到 ${EXPECTED_MAP_COUNT}`);
    }
  });
  return maps;
}

module.exports = { parseSokobanMaps, EXPECTED_MAP_COUNT };
