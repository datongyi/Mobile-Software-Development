const test = require('node:test');
const assert = require('node:assert/strict');

const { createSoundManager } = require('../utils/sound');

test('音效管理器根据事件停止当前音效并播放对应资源', () => {
  const calls = [];
  const audio = {
    stop() { calls.push('stop'); },
    play() { calls.push(`play:${this.src}`); },
    destroy() { calls.push('destroy'); }
  };
  const manager = createSoundManager({
    createAudioContext: () => audio,
    isEnabled: () => true
  });

  manager.play('push');
  manager.play('win');
  manager.destroy();

  assert.deepEqual(calls, [
    'stop',
    'play:/sound_effects/thump.wav',
    'stop',
    'play:/sound_effects/sfx1.wav',
    'destroy'
  ]);
});

test('禁用或未知事件不会操作音频上下文', () => {
  let stopCount = 0;
  let playCount = 0;
  const audio = {
    stop() { stopCount += 1; },
    play() { playCount += 1; },
    destroy() {}
  };
  const manager = createSoundManager({
    createAudioContext: () => audio,
    isEnabled: () => false
  });

  manager.play('move');
  manager.play('unknown');

  assert.equal(stopCount, 0);
  assert.equal(playCount, 0);
});

test('支持六种规定事件及缺少 stop 的音频上下文', () => {
  const played = [];
  const audio = {
    play() { played.push(this.src); },
    destroy() {}
  };
  const manager = createSoundManager({
    createAudioContext: () => audio,
    isEnabled: () => true
  });

  ['move', 'push', 'goal', 'undo', 'invalid', 'win'].forEach((event) => manager.play(event));

  assert.deepEqual(played, [
    '/sound_effects/squeak.wav',
    '/sound_effects/thump.wav',
    '/sound_effects/bloops.wav',
    '/sound_effects/whoosh.wav',
    '/sound_effects/invalid.wav',
    '/sound_effects/sfx1.wav'
  ]);
});
