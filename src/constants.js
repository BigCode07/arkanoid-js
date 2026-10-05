export const CANVAS = { width: 800, height: 600 };
export const PADDLE = { width: 100, height: 14, y: 560, speed: 520 }; // px/s
export const BALL = { radius: 8, speed: 360, maxAngle: Math.PI / 3 }; // 60° desde la vertical
export const BRICKS = {
  rows: 5,
  cols: 10,
  width: 70,
  height: 22,
  gap: 6,
  offsetTop: 70,
  rowPoints: [50, 40, 30, 20, 10],
  rowColors: ["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#4361ee"],
};
export const AUDIO = {
  rowFrequencies: [988, 880, 784, 698, 622], // Hz, una por fila (arriba a abajo)
  duration: 0.08, // segundos
  volume: 0.15, // ganancia 0..1
  wave: "triangle",
};
export const LIVES = 3;
export const STORAGE_KEY = "arkanoid:v1:highScore";
