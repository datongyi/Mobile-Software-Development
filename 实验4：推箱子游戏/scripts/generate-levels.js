const fs = require('node:fs');
const path = require('node:path');
const { parseSokobanMaps } = require('../utils/map-parser');

const projectRoot = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(projectRoot, 'maps/sokoban-maps-60-plain.txt'), 'utf8');
const mapData = parseSokobanMaps(source).map(({ id, minMoves, map }) => [id, minMoves, map]);
const suffix = `

function difficultyFor(id) {
  if (id <= 10) return '入门';
  if (id <= 25) return '基础';
  if (id <= 45) return '进阶';
  return '挑战';
}

function layersFor(map) {
  const staticLayer = map.map((row) => Array.from(row, (cell) => {
    if (cell === 'b' || cell === 'p') return '.';
    if (cell === '*') return 'o';
    return cell;
  }));
  const dynamicLayer = { player: null, boxes: [] };
  map.forEach((row, rowIndex) => Array.from(row).forEach((cell, colIndex) => {
    if (cell === 'p') dynamicLayer.player = { row: rowIndex, col: colIndex };
    if (cell === 'b' || cell === '*') dynamicLayer.boxes.push({ row: rowIndex, col: colIndex });
  }));
  return { staticLayer, dynamicLayer };
}

const levels = mapData.map(([id, minMoves, map]) => ({
  id,
  name: \`第 \${id} 关\`,
  difficulty: difficultyFor(id),
  thumbnail: \`images/level0\${((id - 1) % 4) + 1}.png\`,
  map,
  ...layersFor(map),
  minMoves
}));

module.exports = levels;
module.exports.mapData = mapData;
module.exports.layersFor = layersFor;
`;

fs.writeFileSync(
  path.join(projectRoot, 'utils/levels.js'),
  `const mapData = ${JSON.stringify(mapData, null, 2)};${suffix}`,
  'utf8'
);
