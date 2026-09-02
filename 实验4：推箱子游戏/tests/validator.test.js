const test = require('node:test');
const assert = require('node:assert/strict');

const { validateLevel } = require('../utils/validator');
const levels = require('../utils/levels');

const baseLevel = {
  id: 99,
  name: '测试关卡',
  difficulty: '入门',
  thumbnail: 'images/level99.png',
  map: ['#####', '#p.o#', '#.b.#', '#...#', '#####'],
  minMoves: 1
};

test('箱子与目标数量一致的合法地图通过结构校验', () => {
  assert.deepEqual(validateLevel(baseLevel), { valid: true, errors: [] });
});

test('目标多于箱子时失败', () => {
  const result = validateLevel({ ...baseLevel, map: ['#####', '#poo#', '#.b.#', '#...#', '#####'] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('必须一致')));
});

test('箱子多于目标时失败', () => {
  const result = validateLevel({ ...baseLevel, map: ['#####', '#p..#', '#.b.#', '#bo.#', '#####'] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('必须一致')));
});

test('存在两个角色时失败', () => {
  const result = validateLevel({ ...baseLevel, map: ['#####', '#p.o#', '#.b.#', '#..p#', '#####'] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('角色')));
});

test('存在非法字符时失败', () => {
  const result = validateLevel({ ...baseLevel, map: ['#####', '#p?o#', '#.b.#', '#...#', '#####'] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('非法字符')));
});

test('非矩形地图时失败', () => {
  const result = validateLevel({ ...baseLevel, map: ['#####', '#p.o#', '#.b.#', '#..#', '#####'] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('矩形')));
});

test('第 1 关保留素材中的全部箱子', () => {
  const level = levels[0];

  assert.equal(level.dynamicLayer.boxes.length, 6);
  assert.equal(validateLevel(level).valid, true);
});

test('60 关地图结构和元数据全部有效', () => {
  assert.equal(levels.length, 60);
  for (const level of levels) {
    assert.deepEqual(validateLevel(level), { valid: true, errors: [] });
    assert.equal(level.name, `第 ${level.id} 关`);
    assert.match(level.thumbnail, /^images\/level0[1-4]\.png$/);
    assert.ok(Number.isInteger(level.minMoves) && level.minMoves > 0);
  }
});

test('第 1 关保留不可用区域与墙体的区别', () => {
  assert.equal(levels[0].map[0][0], ' ');
  assert.equal(levels[0].map[0][4], '#');
  assert.equal(levels[0].staticLayer[0][0], ' ');
  assert.equal(levels[0].staticLayer[0][4], '#');
});

test('关卡元数据缺失或不合法时失败', () => {
  for (const level of [
    { ...baseLevel, id: 0 },
    { ...baseLevel, name: '' },
    { ...baseLevel, difficulty: '' },
    { ...baseLevel, thumbnail: '' },
    { ...baseLevel, minMoves: 0 }
  ]) {
    assert.equal(validateLevel(level).valid, false);
  }
});
