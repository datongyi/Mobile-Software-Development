const SOUND_SOURCES = {
  move: '/sound_effects/squeak.wav',
  push: '/sound_effects/thump.wav',
  goal: '/sound_effects/bloops.wav',
  undo: '/sound_effects/whoosh.wav',
  invalid: '/sound_effects/invalid.wav',
  win: '/sound_effects/sfx1.wav'
};

function createSoundManager({ createAudioContext, isEnabled }) {
  let audio;

  function enabled() {
    return typeof isEnabled === 'function' ? isEnabled() : isEnabled;
  }

  function play(event) {
    const src = SOUND_SOURCES[event];
    if (!src || !enabled()) return;
    audio = audio || createAudioContext();
    if (typeof audio.stop === 'function') audio.stop();
    audio.src = src;
    audio.play();
  }

  function destroy() {
    if (audio && typeof audio.destroy === 'function') audio.destroy();
    audio = undefined;
  }

  return { play, destroy };
}

module.exports = { createSoundManager };
