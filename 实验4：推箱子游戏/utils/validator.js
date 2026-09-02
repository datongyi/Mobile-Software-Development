const LEGAL_CHARS = new Set(['#', '.', 'o', 'b', 'p', '*', ' ']);

function validateLevel(level) {
  const errors = [];
  const map = level && level.map;
  if (!Array.isArray(map) || map.length === 0) return { valid: false, errors: ['地图必须是非空二维数组'] };
  if (!Number.isInteger(level.id) || level.id < 1) errors.push('关卡 id 必须为正整数');
  if (typeof level.name !== 'string' || !level.name.trim()) errors.push('关卡名称不能为空');
  if (typeof level.difficulty !== 'string' || !level.difficulty.trim()) errors.push('关卡难度不能为空');
  if (typeof level.thumbnail !== 'string' || !level.thumbnail.trim()) errors.push('关卡缩略图不能为空');
  if (!Number.isInteger(level.minMoves) || level.minMoves < 1) errors.push('关卡基准步数必须为正整数');
  const width = typeof map[0] === 'string' ? map[0].length : 0;
  if (width === 0 || map.some((row) => typeof row !== 'string' || row.length !== width)) errors.push('地图必须是矩形');
  let players = 0; let boxes = 0; let targets = 0;
  map.forEach((row) => {
    if (typeof row !== 'string') return;
    for (const char of row) {
      if (!LEGAL_CHARS.has(char)) errors.push(`存在非法字符: ${char}`);
      if (char === 'p') players += 1;
      if (char === 'b' || char === '*') boxes += 1;
      if (char === 'o' || char === '*') targets += 1;
    }
  });
  if (players !== 1) errors.push(`角色数量必须为 1，当前为 ${players}`);
  if (boxes < 1) errors.push('箱子数量必须至少为 1');
  if (targets !== boxes) errors.push(`箱子与目标数量必须一致，当前箱子 ${boxes}、目标 ${targets}`);
  if (width > 0) {
    const boundary = [...map[0], ...map[map.length - 1], ...map.slice(1, -1).flatMap((row) => [row[0], row[row.length - 1]])];
    if (boundary.some((char) => char !== '#' && char !== ' ')) errors.push('地图边界必须由墙或不可用区域组成');
  }
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}

module.exports = { validateLevel };
