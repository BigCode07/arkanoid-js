import { CANVAS } from "./constants.js";

const FONT = "'Helvetica Neue', Arial, sans-serif";

export function render(ctx, state) {
  ctx.fillStyle = "#14172b";
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  for (const brick of state.bricks) {
    if (!brick.alive) continue;
    ctx.fillStyle = brick.color;
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }

  const { paddle } = state;
  ctx.fillStyle = "#f1f1f1";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  const { ball } = state;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  drawHud(ctx, state);
  drawOverlay(ctx, state);
}

function drawHud(ctx, state) {
  const highScore = Math.max(state.score, state.highScore);
  ctx.fillStyle = "#f1f1f1";
  ctx.font = `bold 20px ${FONT}`;
  ctx.textBaseline = "middle";

  ctx.textAlign = "left";
  ctx.fillText(`Puntaje: ${state.score}`, 24, 30);
  ctx.textAlign = "center";
  ctx.fillText(`Récord: ${highScore}`, CANVAS.width / 2, 30);
  ctx.textAlign = "right";
  ctx.fillText(`Vidas: ${state.lives}`, CANVAS.width - 24, 30);
}

function drawOverlay(ctx, state) {
  const screens = {
    start: ["ARKANOID", "Espacio para empezar", "Mover: ← → / A D / mouse · Lanzar: Espacio o click · Pausa: P o Esc"],
    ready: [null, "Espacio o click para lanzar"],
    paused: ["Pausa", "P o Esc para continuar"],
    gameover: ["Game Over", `Puntaje final: ${state.score}`, "Espacio para reiniciar"],
    won: ["Victoria", `Puntaje final: ${state.score}`, "Espacio para reiniciar"],
  };
  const lines = screens[state.status];
  if (!lines) return;

  const [title, ...rest] = lines;
  const full = state.status !== "ready";

  if (full) {
    ctx.fillStyle = "rgba(11, 13, 23, 0.78)";
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f1f1f1";

  if (title) {
    ctx.font = `bold 56px ${FONT}`;
    ctx.fillText(title, CANVAS.width / 2, 250);
  }

  ctx.font = `22px ${FONT}`;
  const baseY = full ? 320 : 480;
  rest.forEach((text, i) => {
    ctx.font = i === rest.length - 1 && state.status === "start" ? `16px ${FONT}` : `22px ${FONT}`;
    ctx.fillText(text, CANVAS.width / 2, baseY + i * 36);
  });
}
