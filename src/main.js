import { CANVAS } from "./constants.js";
import { startGame } from "./game.js";

const canvas = document.getElementById("game");
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;

const ctx = canvas.getContext("2d");
startGame(ctx);
