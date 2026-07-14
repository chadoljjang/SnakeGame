const GRID_SIZE = 20;
const TILE_COUNT = 20;
const HIGH_SCORE_KEY = 'snakeHighScore';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const difficultySelect = document.getElementById('difficulty');
const pauseBtn = document.getElementById('pauseBtn');

let snake, direction, nextDirection, food, score, isRunning, isPaused, loopId, currentTickMs;
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
highScoreEl.textContent = highScore;

function resetState() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  scoreEl.textContent = score;
  food = placeFood();
}

function placeFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * TILE_COUNT),
      y: Math.floor(Math.random() * TILE_COUNT),
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function update() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
    return gameOver();
  }
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    return gameOver();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    food = placeFood();
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.fillStyle = '#12121c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);

  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#66bb6a' : '#4caf50';
    ctx.fillRect(seg.x * GRID_SIZE + 1, seg.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2);
  });
}

function gameLoop() {
  update();
  if (isRunning) {
    draw();
  }
}

function startGame() {
  resetState();
  isRunning = true;
  isPaused = false;
  currentTickMs = Number(difficultySelect.value);
  difficultySelect.disabled = true;
  pauseBtn.disabled = false;
  pauseBtn.textContent = '일시정지';
  startOverlay.classList.add('hidden');
  gameOverOverlay.classList.add('hidden');
  clearInterval(loopId);
  loopId = setInterval(gameLoop, currentTickMs);
}

function togglePause() {
  if (!isRunning) return;

  isPaused = !isPaused;
  if (isPaused) {
    clearInterval(loopId);
    pauseBtn.textContent = '재개';
  } else {
    loopId = setInterval(gameLoop, currentTickMs);
    pauseBtn.textContent = '일시정지';
  }
}

function gameOver() {
  isRunning = false;
  isPaused = false;
  clearInterval(loopId);
  difficultySelect.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = '일시정지';

  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    highScoreEl.textContent = highScore;
  }

  finalScoreEl.textContent = score;
  gameOverOverlay.classList.remove('hidden');
}

document.addEventListener('keydown', (e) => {
  if (!isRunning || isPaused) return;

  switch (e.key) {
    case 'ArrowUp':
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case 'ArrowDown':
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case 'ArrowLeft':
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
    default:
      return;
  }
  e.preventDefault();
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
