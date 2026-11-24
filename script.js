const display = document.getElementById("display");
const keys = document.querySelector(".keys");

let current = "0";
let stored = null;
let operator = null;
let fresh = true;

function render() {
  display.textContent = current;
}

function inputDigit(digit) {
  if (fresh || current === "0") {
    current = digit;
    fresh = false;
    return;
  }
  if (current.replace("-", "").length >= 12) return;
  current += digit;
}

function inputDot() {
  if (fresh) {
    current = "0.";
    fresh = false;
    return;
  }
  if (!current.includes(".")) current += ".";
}

function setOperator(next) {
  if (operator && !fresh) compute();
  stored = Number(current);
  operator = next;
  fresh = true;
}

function compute() {
  if (operator === null || stored === null) return;
  const right = Number(current);
  let result;
  if (operator === "+") result = stored + right;
  else if (operator === "−") result = stored - right;
  else if (operator === "×") result = stored * right;
  else if (operator === "÷") result = right === 0 ? "Error" : stored / right;

  current = format(result);
  stored = null;
  operator = null;
  fresh = true;
}

function format(value) {
  if (value === "Error") return "Error";
  if (!Number.isFinite(value)) return "Error";
  const text = String(Math.round(value * 1e10) / 1e10);
  return text.length > 12 ? Number(value).toExponential(6) : text;
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (current === "Error" && !button.dataset.action) {
    current = "0";
    fresh = true;
  }

  if (button.dataset.digit) inputDigit(button.dataset.digit);
  else if (button.dataset.op) setOperator(button.dataset.op);
  else if (button.dataset.action === "dot") inputDot();
  else if (button.dataset.action === "clear") {
    current = "0";
    stored = null;
    operator = null;
    fresh = true;
  } else if (button.dataset.action === "sign") {
    if (current !== "0" && current !== "Error") {
      current = current.startsWith("-") ? current.slice(1) : "-" + current;
    }
  } else if (button.dataset.action === "percent") {
    current = format(Number(current) / 100);
    fresh = true;
  } else if (button.dataset.action === "equals") {
    compute();
  }

  render();
});

const snakeCanvas = document.getElementById("snake-canvas");
const snakeCtx = snakeCanvas.getContext("2d");
const snakeScoreEl = document.getElementById("snake-score");
const snakeStartBtn = document.getElementById("snake-start");

const GRID = 20;
const CELL = snakeCanvas.width / GRID;
const TICK_MS = 110;
const KEY_DIR = {
  arrowup: [0, -1],
  w: [0, -1],
  arrowdown: [0, 1],
  s: [0, 1],
  arrowleft: [-1, 0],
  a: [-1, 0],
  arrowright: [1, 0],
  d: [1, 0],
};

let snake = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
let food = { x: 14, y: 10 };
let dir = { x: 1, y: 0 };
let pendingDir = { x: 1, y: 0 };
let snakeScore = 0;
let snakeAlive = false;
let snakeStarted = false;
let snakeTimer = null;

function resetSnake(startDir) {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  dir = startDir ? { ...startDir } : { x: 1, y: 0 };
  pendingDir = { ...dir };
  snakeScore = 0;
  snakeScoreEl.textContent = "0";
  placeFood();
  snakeAlive = true;
  snakeStarted = true;
  drawSnake();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function drawCell(x, y, color, inset, radius) {
  snakeCtx.fillStyle = color;
  snakeCtx.beginPath();
  snakeCtx.roundRect(
    x * CELL + inset,
    y * CELL + inset,
    CELL - inset * 2,
    CELL - inset * 2,
    radius
  );
  snakeCtx.fill();
}

function drawSnake() {
  snakeCtx.fillStyle = "#292524";
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  drawCell(food.x, food.y, "#ea580c", 3, 4);

  snake.forEach((part, index) => {
    drawCell(part.x, part.y, index === 0 ? "#fdba74" : "#f97316", 1, 4);
  });

  if (snakeStarted && !snakeAlive) {
    snakeCtx.fillStyle = "rgba(28, 25, 23, 0.62)";
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    snakeCtx.fillStyle = "#fafaf9";
    snakeCtx.font = "500 18px ui-sans-serif, system-ui, sans-serif";
    snakeCtx.textAlign = "center";
    snakeCtx.textBaseline = "middle";
    snakeCtx.fillText("Game Over", snakeCanvas.width / 2, snakeCanvas.height / 2);
  }
}

function tickSnake() {
  if (!snakeAlive) return;

  dir = pendingDir;
  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y,
  };

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= GRID ||
    head.y >= GRID ||
    snake.some((part) => part.x === head.x && part.y === head.y)
  ) {
    snakeAlive = false;
    clearInterval(snakeTimer);
    snakeTimer = null;
    snakeStartBtn.textContent = "重开";
    drawSnake();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    snakeScore += 1;
    snakeScoreEl.textContent = String(snakeScore);
    placeFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function startSnake(startDir) {
  clearInterval(snakeTimer);
  resetSnake(startDir);
  snakeStartBtn.textContent = "重开";
  snakeTimer = setInterval(tickSnake, TICK_MS);
}

function setSnakeDir(x, y) {
  if (dir.x + x === 0 && dir.y + y === 0) return;
  pendingDir = { x, y };
}

snakeStartBtn.addEventListener("click", () => startSnake());

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const next = KEY_DIR[key];
  if (!next) return;

  event.preventDefault();
  const [x, y] = next;

  if (!snakeAlive) {
    startSnake({ x, y });
    return;
  }

  setSnakeDir(x, y);
});

drawSnake();
