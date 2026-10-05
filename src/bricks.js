import { BRICKS, CANVAS } from "./constants.js";

export function createBricks() {
  const gridWidth = BRICKS.cols * BRICKS.width + (BRICKS.cols - 1) * BRICKS.gap;
  const offsetX = (CANVAS.width - gridWidth) / 2;
  const bricks = [];

  for (let row = 0; row < BRICKS.rows; row++) {
    for (let col = 0; col < BRICKS.cols; col++) {
      bricks.push({
        x: offsetX + col * (BRICKS.width + BRICKS.gap),
        y: BRICKS.offsetTop + row * (BRICKS.height + BRICKS.gap),
        width: BRICKS.width,
        height: BRICKS.height,
        points: BRICKS.rowPoints[row],
        color: BRICKS.rowColors[row],
        alive: true,
        row,
      });
    }
  }

  return bricks;
}
