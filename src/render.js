import { CANVAS, EXPLOSION } from "./constants.js";

const FONT = "'Helvetica Neue', Arial, sans-serif";

export function render(ctx, state) {
  ctx.fillStyle = "#14172b";
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  ctx.save();
  applyShake(ctx, state.effects);

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

  drawEffects(ctx, state.effects);
  ctx.restore();

  drawHud(ctx, state);
  drawOverlay(ctx, state);
}

function applyShake(ctx, { shake }) {
  if (shake <= 0) return;
  const amount = EXPLOSION.shakeMagnitude * (shake / EXPLOSION.shakeDuration);
  ctx.translate((Math.random() * 2 - 1) * amount, (Math.random() * 2 - 1) * amount);
}

function drawEffects(ctx, effects) {
  ctx.save();

  ctx.fillStyle = "#ffffff";
  for (const f of effects.flashes) {
    ctx.globalAlpha = f.life;
    ctx.fillRect(f.x, f.y, f.width, f.height);
  }

  for (const r of effects.rings) {
    ctx.globalAlpha = r.life;
    ctx.strokeStyle = r.color;
    ctx.shadowColor = r.color;
    ctx.shadowBlur = EXPLOSION.ringGlow;
    ctx.lineWidth = 1 + 3 * r.life;
    ctx.beginPath();
    ctx.arc(r.x, r.y, EXPLOSION.ringRadius * (1 - r.life * r.life), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  for (const p of effects.particles) {
    const size = p.size * (0.5 + 0.5 * p.life);
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.fillRect(-size / 2, (-size * 0.6) / 2, size, size * 0.6);
    ctx.restore();
  }

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 18px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const t of effects.texts) {
    ctx.globalAlpha = t.life;
    ctx.fillText(`+${t.value}`, t.x, t.y - EXPLOSION.textRise * (1 - t.life));
  }

  ctx.restore();
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
