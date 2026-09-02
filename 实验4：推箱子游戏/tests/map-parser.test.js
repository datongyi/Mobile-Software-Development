const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { parseSokobanMaps } = require('../utils/map-parser');
const { createGame, move } = require('../utils/game-engine');
const levels = require('../utils/levels');

const source = fs.readFileSync(
  path.join(__dirname, '../maps/sokoban-maps-60-plain.txt'),
  'utf8'
);

test('解析素材中的恰好 60 个 Maze 区块', () => {
  const maps = parseSokobanMaps(source);

  assert.equal(maps.length, 60);
  assert.deepEqual(maps.map((map) => map.id), Array.from({ length: 60 }, (_, index) => index + 1));
});

test('读取尺寸和 Length 元数据，并将每关补齐为声明的矩形', () => {
  const maps = parseSokobanMaps(source);
  const first = maps[0];
  const last = maps[59];

  assert.deepEqual(
    { width: first.width, height: first.height, minMoves: first.minMoves },
    { width: 22, height: 11, minMoves: 50 }
  );
  assert.deepEqual(
    { width: last.width, height: last.height, minMoves: last.minMoves },
    { width: 26, height: 16, minMoves: 108 }
  );
  for (const map of maps) {
    assert.equal(map.map.length, map.height);
    assert.ok(map.map.every((row) => row.length === map.width));
  }
});

test('转换素材字符并保留外部空白为不可进入区域', () => {
  const maps = parseSokobanMaps(source);
  const first = maps[0];

  assert.equal(first.map[0], '    #####             ');
  assert.equal(first.map[2][5], 'b');
  assert.equal(first.map[6].slice(-3), 'oo#');
  assert.equal(first.map[8][12], 'p');
  assert.ok(first.map.every((row) => !/[X@&]/.test(row)));
});

test('区分墙外空白和墙内地板，使第一关玩家可移动', () => {
  const first = parseSokobanMaps(source)[0];
  const game = createGame({ id: first.id, map: first.map });
  const directions = ['up', 'down', 'left', 'right'];

  assert.equal(first.map[0][0], ' ');
  assert.equal(first.map[7][12], '.');
  assert.ok(directions.some((direction) => move(game, direction).changed));
});

test('运行时静态关卡与地图素材的解析结果一致', () => {
  const maps = parseSokobanMaps(source);

  assert.deepEqual(
    levels.map(({ id, minMoves, map }) => ({ id, minMoves, map })),
    maps.map(({ id, minMoves, map }) => ({ id, minMoves, map }))
  );
});

test('将素材中的目标上箱子转换为引擎叠加字符', () => {
  const maze12 = parseSokobanMaps(source)[11];

  assert.ok(maze12.map.some((row) => row.includes('*')));
  assert.equal(maze12.map.reduce((count, row) => count + (row.match(/\*/g) || []).length, 0), 18);
});

test('拒绝数量、编号或地图行不完整的素材', () => {
  assert.throws(() => parseSokobanMaps(source.replace(/Maze: 60[\s\S]*$/, '')), /60/);
  assert.throws(() => parseSokobanMaps(source.replace('Maze: 2', 'Maze: 3')), /编号/);
  assert.throws(() => parseSokobanMaps(source.replace('    XXXXX             ', '    XXXXXXXXXXXXXXXXXXX')), /宽度/);
});
