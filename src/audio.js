import { AUDIO } from "./constants.js";

const SILENCE = 0.0001; // los exponenciales no llegan a 0

// El AudioContext se crea en `unlock()` (tras un gesto del usuario) por la política
// de autoplay. Si Web Audio falla, el audio queda inactivo y el juego sigue.
export function createAudio() {
  let context = null;
  let muted = false;

  function unlock() {
    try {
      if (!context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        context = new AudioContextClass();
      }
      if (context.state === "suspended") context.resume();
    } catch {
      context = null;
    }
  }

  function playBrick(row) {
    if (muted || !context) return;
    try {
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = AUDIO.wave;
      oscillator.frequency.value = AUDIO.rowFrequencies[row];
      gain.gain.setValueAtTime(AUDIO.volume, now);
      gain.gain.exponentialRampToValueAtTime(SILENCE, now + AUDIO.duration);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + AUDIO.duration);
    } catch {
      // Sin sonido: el juego no depende del audio.
    }
  }

  function toggleMute() {
    muted = !muted;
  }

  return { unlock, playBrick, toggleMute };
}
