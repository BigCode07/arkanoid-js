import { STORAGE_KEY } from "./constants.js";

// Fallback en memoria si localStorage no está disponible (modo privado, bloqueado).
let memoryHighScore = 0;

export function loadHighScore() {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(value) && value > 0) memoryHighScore = value;
  } catch {
    // Sin persistencia: se usa el valor en memoria.
  }
  return memoryHighScore;
}

export function saveHighScore(score) {
  memoryHighScore = score;
  try {
    localStorage.setItem(STORAGE_KEY, String(score));
  } catch {
    // Sin persistencia: el valor queda solo en memoria.
  }
}
