import { BALL, CANVAS } from "./constants.js";

// Centro de la paleta = vertical; bordes = BALL.maxAngle desde la vertical.
// Solo rebota si la bola baja y su centro está sobre la cara superior,
// así un toque lateral no teletransporta la bola arriba de la paleta.
export function bouncePaddle(ball, paddle) {
  if (ball.vy <= 0 || ball.y > paddle.y) return;

  const overlapsX =
    ball.x + ball.radius >= paddle.x &&
    ball.x - ball.radius <= paddle.x + paddle.width;
  if (!overlapsX || ball.y + ball.radius < paddle.y) return;

  const half = paddle.width / 2;
  const offset = (ball.x - (paddle.x + half)) / half;
  const angle = Math.max(-1, Math.min(1, offset)) * BALL.maxAngle;

  ball.vx = BALL.speed * Math.sin(angle);
  ball.vy = -BALL.speed * Math.cos(angle);
  ball.y = paddle.y - ball.radius;
}

// Destruye como máximo un ladrillo por llamada (evita doble rebote).
// Invierte el eje de menor penetración y devuelve los puntos ganados (0 si no hubo golpe).
export function bounceBricks(ball, bricks) {
  for (const brick of bricks) {
    if (!brick.alive) continue;

    const nearestX = Math.max(brick.x, Math.min(ball.x, brick.x + brick.width));
    const nearestY = Math.max(brick.y, Math.min(ball.y, brick.y + brick.height));
    const dx = ball.x - nearestX;
    const dy = ball.y - nearestY;
    if (dx * dx + dy * dy >= ball.radius * ball.radius) continue;

    const penX = Math.min(
      ball.x + ball.radius - brick.x,
      brick.x + brick.width - (ball.x - ball.radius),
    );
    const penY = Math.min(
      ball.y + ball.radius - brick.y,
      brick.y + brick.height - (ball.y - ball.radius),
    );
    const fromLeft = ball.x < brick.x + brick.width / 2;
    const fromTop = ball.y < brick.y + brick.height / 2;

    if (penX < penY) {
      ball.vx = fromLeft ? -Math.abs(ball.vx) : Math.abs(ball.vx);
      ball.x += fromLeft ? -penX : penX;
    } else {
      ball.vy = fromTop ? -Math.abs(ball.vy) : Math.abs(ball.vy);
      ball.y += fromTop ? -penY : penY;
    }

    brick.alive = false;
    return brick.points;
  }
  return 0;
}

export function bounceWalls(ball) {
  if (ball.x < ball.radius) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
  } else if (ball.x > CANVAS.width - ball.radius) {
    ball.x = CANVAS.width - ball.radius;
    ball.vx = -Math.abs(ball.vx);
  }

  if (ball.y < ball.radius) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
  }
}
