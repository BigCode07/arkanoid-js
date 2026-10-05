import { BALL, CANVAS, LIVES, PADDLE } from "./constants.js";
import { createBricks } from "./bricks.js";
import { createInput } from "./input.js";
import { bounceBricks, bouncePaddle, bounceWalls } from "./physics.js";
import { render } from "./render.js";
import { loadHighScore, saveHighScore } from "./storage.js";

const MAX_DT = 1 / 30; // segundos

export function createState(highScore = 0) {
  return {
    status: "start", // start | ready | playing | paused | gameover | won
    score: 0,
    highScore,
    lives: LIVES,
    paddle: {
      x: (CANVAS.width - PADDLE.width) / 2,
      y: PADDLE.y,
      width: PADDLE.width,
      height: PADDLE.height,
    },
    ball: {
      x: CANVAS.width / 2,
      y: PADDLE.y - BALL.radius,
      vx: 0,
      vy: 0,
      radius: BALL.radius,
    },
    bricks: createBricks(),
  };
}

export function startGame(ctx) {
  const state = createState(loadHighScore());
  const input = createInput(ctx.canvas);
  let last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;
    update(state, input, dt);
    render(ctx, state);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function update(state, input, dt) {
  const { launch, confirm, pause } = input;
  input.launch = false;
  input.confirm = false;
  input.pause = false;

  switch (state.status) {
    case "start":
      if (confirm) state.status = "ready";
      break;
    case "ready":
      movePaddle(state.paddle, input, dt);
      stickBallToPaddle(state);
      if (launch) launchBall(state);
      break;
    case "playing":
      if (pause) {
        state.status = "paused";
        break;
      }
      movePaddle(state.paddle, input, dt);
      moveBall(state, dt);
      break;
    case "paused":
      if (pause) state.status = "playing";
      break;
    case "gameover":
    case "won":
      if (confirm) Object.assign(state, createState(state.highScore), { status: "ready" });
      break;
  }
}

function stickBallToPaddle({ ball, paddle }) {
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius;
}

function launchBall(state) {
  state.ball.vx = 0;
  state.ball.vy = -BALL.speed;
  state.status = "playing";
}

function moveBall(state, dt) {
  const { ball } = state;
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;
  bounceWalls(ball);
  bouncePaddle(ball, state.paddle);
  state.score += bounceBricks(ball, state.bricks);

  if (state.bricks.every((brick) => !brick.alive)) {
    finishGame(state, "won");
  } else if (ball.y - ball.radius > CANVAS.height) {
    loseLife(state);
  }
}

function loseLife(state) {
  state.lives -= 1;
  if (state.lives <= 0) {
    finishGame(state, "gameover");
    return;
  }
  state.status = "ready";
  stickBallToPaddle(state);
}

function finishGame(state, status) {
  state.status = status;
  if (state.score > state.highScore) {
    state.highScore = state.score;
    saveHighScore(state.highScore);
  }
}

function movePaddle(paddle, input, dt) {
  if (input.mouseX !== null) {
    paddle.x = input.mouseX - paddle.width / 2;
    input.mouseX = null;
  }

  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  paddle.x += direction * PADDLE.speed * dt;

  paddle.x = Math.max(0, Math.min(CANVAS.width - paddle.width, paddle.x));
}
