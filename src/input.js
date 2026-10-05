import { CANVAS } from "./constants.js";

const LEFT_KEYS = ["ArrowLeft", "KeyA"];
const RIGHT_KEYS = ["ArrowRight", "KeyD"];
const PAUSE_KEYS = ["KeyP", "Escape"];

// `launch` (Espacio o click), `confirm` (solo Espacio) y `pause` son acciones de un
// solo disparo: el juego las consume y las limpia en cada frame.
export function createInput(canvas) {
  const input = {
    left: false,
    right: false,
    mouseX: null,
    launch: false,
    confirm: false,
    pause: false,
  };

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (!e.repeat) {
        input.launch = true;
        input.confirm = true;
      }
    }
    if (PAUSE_KEYS.includes(e.code) && !e.repeat) input.pause = true;
    if (LEFT_KEYS.includes(e.code)) input.left = true;
    if (RIGHT_KEYS.includes(e.code)) input.right = true;
  });

  window.addEventListener("keyup", (e) => {
    if (LEFT_KEYS.includes(e.code)) input.left = false;
    if (RIGHT_KEYS.includes(e.code)) input.right = false;
  });

  window.addEventListener("blur", () => {
    input.left = false;
    input.right = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((e.clientX - rect.left) / rect.width) * CANVAS.width;
  });

  canvas.addEventListener("mousedown", () => {
    input.launch = true;
  });

  return input;
}
