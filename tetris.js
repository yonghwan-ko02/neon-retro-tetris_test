// tetris.js - Core Tetris Game Controller

// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // 300x600 px canvas

// Colors linked to the CSS variables
const COLORS = [
  null,
  '#00f0ff', // 1: I (Cyan)
  '#ffe600', // 2: O (Yellow)
  '#b5179e', // 3: T (Purple)
  '#38b000', // 4: S (Green)
  '#ff0055', // 5: Z (Red)
  '#0072ff', // 6: J (Blue)
  '#ff7b00', // 7: L (Orange)
];

// Tetromino Shapes
const SHAPES = [
  null,
  [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
  [[2,2], [2,2]],                               // O
  [[0,3,0], [3,3,3], [0,0,0]],                   // T
  [[0,4,4], [4,4,0], [0,0,0]],                   // S
  [[5,5,0], [0,5,5], [0,0,0]],                   // Z
  [[6,0,0], [6,6,6], [0,0,0]],                   // J
  [[0,0,7], [7,7,7], [0,0,0]]                    // L
];

// Canvas Setup
const canvas = document.getElementById('tetris-board');
const ctx = canvas.getContext('2d');

const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const holdCanvas = document.getElementById('hold-canvas');
const holdCtx = holdCanvas.getContext('2d');

const boardWrapper = document.getElementById('board-wrapper');
const flashOverlay = document.getElementById('flash-overlay');

// UI DOM elements
const startOverlay = document.getElementById('start-overlay');
const pauseOverlay = document.getElementById('pause-overlay');
const gameoverOverlay = document.getElementById('gameover-overlay');

const startBtn = document.getElementById('start-btn');
const resumeBtn = document.getElementById('resume-btn');
const restartBtn = document.getElementById('restart-btn');

const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const levelDisplay = document.getElementById('level');
const linesDisplay = document.getElementById('lines');
const finalScoreDisplay = document.getElementById('final-score');

const muteBtn = document.getElementById('mute-btn');
const muteIcon = document.getElementById('mute-icon');
const pauseToggleBtn = document.getElementById('pause-toggle-btn');
const pauseIcon = document.getElementById('pause-icon');

// Game State variables
let board = createMatrix(COLS, ROWS);
let score = 0;
let highScore = parseInt(localStorage.getItem('tetris_high_score')) || 0;
let level = 1;
let lines = 0;

let gameOver = false;
let isPaused = false;
let gameStarted = false;

let dropCounter = 0;
let dropInterval = 1000; // in milliseconds
let lastTime = 0;

let bag = [];
let currentPiece = null;
let nextPiece = null;
let holdPiece = null;
let hasHeld = false; // Hold lock per turn

// Setup high score initially
highScoreDisplay.textContent = highScore;

// Matrix operations
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// 7-Bag Random Generator (Standard Tetris rule for fair piece distribution)
function generateNextPiece() {
  if (bag.length === 0) {
    bag = [1, 2, 3, 4, 5, 6, 7];
    // Shuffle the bag
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }
  
  const typeId = bag.pop();
  return {
    matrix: JSON.parse(JSON.stringify(SHAPES[typeId])),
    typeId: typeId,
    pos: { x: 0, y: 0 }
  };
}

// Spawns a piece at the top
function spawnPiece(piece) {
  piece.pos.x = Math.floor((COLS - piece.matrix[0].length) / 2);
  piece.pos.y = piece.typeId === 1 ? -1 : 0; // I spawns slightly offset

  // Check if spawned piece immediately collides (Game Over)
  if (collide(board, piece)) {
    handleGameOver();
  }
}

// Collision Detection
function collide(board, piece) {
  const m = piece.matrix;
  const o = piece.pos;
  for (let r = 0; r < m.length; ++r) {
    for (let c = 0; c < m[r].length; ++c) {
      if (m[r][c] !== 0) {
        const boardY = r + o.y;
        const boardX = c + o.x;

        // If outside boundaries or colliding with non-empty cell
        if (boardX < 0 || boardX >= COLS || boardY >= ROWS) {
          return true;
        }
        if (boardY >= 0 && board[boardY][boardX] !== 0) {
          return true;
        }
      }
    }
  }
  return false;
}

// Merge piece into board matrix
function merge(board, piece) {
  piece.matrix.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value !== 0) {
        const targetY = r + piece.pos.y;
        if (targetY >= 0) {
          board[targetY][c + piece.pos.x] = value;
        }
      }
    });
  });
}

// Transpose and reverse matrix to rotate (Clockwise)
function rotateMatrix(matrix, dir) {
  // Transpose
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  // Reverse rows for clockwise, or reverse columns for counter-clockwise
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

// Player actions
function playerRotate(dir) {
  if (gameOver || isPaused || !gameStarted) return;
  
  const pos = currentPiece.pos.x;
  let offset = 1;
  rotateMatrix(currentPiece.matrix, dir);

  // Wall Kick logic: try shifting horizontally if colliding upon rotation
  while (collide(board, currentPiece)) {
    currentPiece.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > currentPiece.matrix[0].length + 1) {
      // Rotate back if all kick offsets fail
      rotateMatrix(currentPiece.matrix, -dir);
      currentPiece.pos.x = pos;
      return;
    }
  }
  audioManager.playRotate();
}

// Left/Right move
function playerMove(dir) {
  if (gameOver || isPaused || !gameStarted) return;

  currentPiece.pos.x += dir;
  if (collide(board, currentPiece)) {
    currentPiece.pos.x -= dir;
  } else {
    audioManager.playMove();
  }
}

// Soft Drop
function playerDrop() {
  if (gameOver || isPaused || !gameStarted) return;

  currentPiece.pos.y++;
  if (collide(board, currentPiece)) {
    currentPiece.pos.y--;
    lockPiece();
  } else {
    dropCounter = 0;
  }
}

// Hard Drop
function playerHardDrop() {
  if (gameOver || isPaused || !gameStarted) return;

  let droppedRows = 0;
  while (!collide(board, currentPiece)) {
    currentPiece.pos.y++;
    droppedRows++;
  }
  currentPiece.pos.y--;
  
  if (droppedRows > 1) {
    audioManager.playHardDrop();
    triggerShake();
  } else {
    audioManager.playDrop();
  }

  lockPiece();
  dropCounter = 0;
}

// Put currently falling piece into Hold section
function playerHold() {
  if (gameOver || isPaused || !gameStarted) return;
  if (hasHeld) return; // Only 1 hold allowed per piece fall

  audioManager.playHold();

  if (holdPiece === null) {
    // First hold
    holdPiece = {
      typeId: currentPiece.typeId,
      matrix: JSON.parse(JSON.stringify(SHAPES[currentPiece.typeId])),
      pos: { x: 0, y: 0 }
    };
    currentPiece = nextPiece;
    nextPiece = generateNextPiece();
    spawnPiece(currentPiece);
  } else {
    // Swap
    const temp = {
      typeId: currentPiece.typeId,
      matrix: JSON.parse(JSON.stringify(SHAPES[currentPiece.typeId])),
      pos: { x: 0, y: 0 }
    };
    currentPiece = holdPiece;
    holdPiece = temp;
    spawnPiece(currentPiece);
  }

  hasHeld = true;
  drawSubCanvas(holdCanvas, holdCtx, holdPiece);
}

// Lock the piece to the board, trigger line clears, reset hold limit
function lockPiece() {
  merge(board, currentPiece);
  clearLines();
  
  // Setup next tetromino
  currentPiece = nextPiece;
  nextPiece = generateNextPiece();
  spawnPiece(currentPiece);
  
  // Release hold lock for new block
  hasHeld = false;
  
  drawSubCanvas(nextCanvas, nextCtx, nextPiece);
}

// Screen Shake on hard drop impact
function triggerShake() {
  boardWrapper.classList.add('shake');
  setTimeout(() => {
    boardWrapper.classList.remove('shake');
  }, 150);
}

// Flash effect on line clears
function triggerFlash() {
  flashOverlay.classList.add('do-flash');
  setTimeout(() => {
    flashOverlay.classList.remove('do-flash');
  }, 200);
}

// Line clears, score updates, level calculations
function clearLines() {
  let clearedCount = 0;
  
  outer: for (let y = ROWS - 1; y >= 0; --y) {
    for (let x = 0; x < COLS; ++x) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }

    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    y++; 
    clearedCount++;
  }

  if (clearedCount > 0) {
    triggerFlash();
    audioManager.playLineClear(clearedCount);

    const baseScores = [0, 100, 300, 500, 800];
    score += baseScores[clearedCount] * level;
    lines += clearedCount;
    
    const targetLevel = Math.floor(lines / 10) + 1;
    if (targetLevel > level) {
      level = targetLevel;
      audioManager.playLevelUp();
      dropInterval = Math.max(80, 1000 - (level - 1) * 90);
    }

    updateUI();
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('tetris_high_score', highScore);
      highScoreDisplay.textContent = highScore;
    }
  }
}

// Ghost Piece calculation
function getGhostPosition() {
  const ghost = {
    matrix: currentPiece.matrix,
    pos: { x: currentPiece.pos.x, y: currentPiece.pos.y },
    typeId: currentPiece.typeId
  };

  while (!collide(board, ghost)) {
    ghost.pos.y++;
  }
  ghost.pos.y--;
  return ghost.pos.y;
}

// Graphics rendering
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background grid lines (sleek neon wireframe lines)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK_SIZE, 0);
    ctx.lineTo(x * BLOCK_SIZE, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * BLOCK_SIZE);
    ctx.lineTo(canvas.width, y * BLOCK_SIZE);
    ctx.stroke();
  }

  // Draw locked blocks on the board
  drawMatrix(board, { x: 0, y: 0 });

  // Draw ghost piece and falling piece if active
  if (gameStarted && !gameOver && currentPiece) {
    const ghostY = getGhostPosition();
    drawGhost(currentPiece.matrix, { x: currentPiece.pos.x, y: ghostY }, currentPiece.typeId);
    drawMatrix(currentPiece.matrix, currentPiece.pos);
  }
}

// Helper to draw matrices
function drawMatrix(matrix, offset, isGhost = false, ghostTypeId = 0) {
  matrix.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value !== 0) {
        const x = (c + offset.x) * BLOCK_SIZE;
        const y = (r + offset.y) * BLOCK_SIZE;
        
        if (y < 0) return;

        const colorVal = COLORS[value];
        drawNeonBlock(ctx, x, y, BLOCK_SIZE, colorVal, isGhost);
      }
    });
  });
}

// Render Ghost Piece with subtle neon border lines
function drawGhost(matrix, offset, typeId) {
  matrix.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value !== 0) {
        const x = (c + offset.x) * BLOCK_SIZE;
        const y = (r + offset.y) * BLOCK_SIZE;
        if (y < 0) return;

        const colorVal = COLORS[typeId];
        drawNeonBlock(ctx, x, y, BLOCK_SIZE, colorVal, true);
      }
    });
  });
}

// Specialized Block Drawing Engine
function drawNeonBlock(context, x, y, size, colorHex, isGhost = false) {
  context.save();
  
  if (isGhost) {
    context.strokeStyle = colorHex;
    context.lineWidth = 2;
    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    
    context.shadowColor = colorHex;
    context.shadowBlur = 6;
    
    roundRect(context, x + 2, y + 2, size - 4, size - 4, 4);
    context.fill();
    context.stroke();
  } else {
    context.fillStyle = colorHex;
    context.shadowColor = colorHex;
    context.shadowBlur = 8;
    
    roundRect(context, x + 1, y + 1, size - 2, size - 2, 5);
    context.fill();
    
    context.shadowBlur = 0; 
    context.fillStyle = 'rgba(255, 255, 255, 0.25)'; 
    
    context.beginPath();
    context.moveTo(x + 1, y + 1);
    context.lineTo(x + size - 1, y + 1);
    context.lineTo(x + size - 5, y + 5);
    context.lineTo(x + 5, y + 5);
    context.lineTo(x + 5, y + size - 5);
    context.lineTo(x + 1, y + size - 1);
    context.closePath();
    context.fill();
    
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.beginPath();
    context.moveTo(x + size - 1, y + 1);
    context.lineTo(x + size - 1, y + size - 1);
    context.lineTo(x + 1, y + size - 1);
    context.lineTo(x + 5, y + size - 5);
    context.lineTo(x + size - 5, y + size - 5);
    context.lineTo(x + size - 5, y + 5);
    context.closePath();
    context.fill();
  }
  
  context.restore();
}

// Utility for rounded rectangles on canvas
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// Renders Next & Hold canvases
function drawSubCanvas(canvasObj, subCtx, pieceObj) {
  subCtx.clearRect(0, 0, canvasObj.width, canvasObj.height);
  if (!pieceObj) return;

  const m = pieceObj.matrix;
  
  let minX = m[0].length, maxX = 0;
  let minY = m.length, maxY = 0;
  let hasContent = false;

  m.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val !== 0) {
        hasContent = true;
        if (c < minX) minX = c;
        if (c > maxX) maxX = c;
        if (r < minY) minY = r;
        if (r > maxY) maxY = r;
      }
    });
  });

  if (!hasContent) return;

  const blockW = maxX - minX + 1;
  const blockH = maxY - minY + 1;
  const size = 18;

  const offsetX = (canvasObj.width - blockW * size) / 2 - minX * size;
  const offsetY = (canvasObj.height - blockH * size) / 2 - minY * size;

  m.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value !== 0) {
        const x = c * size + offsetX;
        const y = r * size + offsetY;
        const colorVal = COLORS[pieceObj.typeId];
        drawNeonBlock(subCtx, x, y, size, colorVal);
      }
    });
  });
}

// DOM & Interface Updates
function updateUI() {
  scoreDisplay.textContent = score;
  levelDisplay.textContent = level;
  linesDisplay.textContent = lines;
}

// Game State Operations
function startGame() {
  audioManager.init(); 
  
  board = createMatrix(COLS, ROWS);
  score = 0;
  level = 1;
  lines = 0;
  gameOver = false;
  isPaused = false;
  gameStarted = true;
  dropInterval = 1000;
  dropCounter = 0;
  
  bag = [];
  holdPiece = null;
  hasHeld = false;

  currentPiece = generateNextPiece();
  nextPiece = generateNextPiece();
  spawnPiece(currentPiece);
  
  updateUI();
  
  startOverlay.classList.remove('active');
  pauseOverlay.classList.remove('active');
  gameoverOverlay.classList.remove('active');
  
  drawSubCanvas(nextCanvas, nextCtx, nextPiece);
  drawSubCanvas(holdCanvas, holdCtx, holdPiece);
  
  pauseIcon.className = "fa-solid fa-pause";
  canvas.focus();
  
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function handleGameOver() {
  gameOver = true;
  finalScoreDisplay.textContent = score;
  gameoverOverlay.classList.add('active');
  audioManager.playGameOver();
}

function togglePause() {
  if (!gameStarted || gameOver) return;

  isPaused = !isPaused;
  if (isPaused) {
    pauseOverlay.classList.add('active');
    pauseIcon.className = "fa-solid fa-play";
  } else {
    pauseOverlay.classList.remove('active');
    pauseIcon.className = "fa-solid fa-pause";
    lastTime = performance.now();
    canvas.focus();
    requestAnimationFrame(gameLoop);
  }
}

// Core Game Loop
function gameLoop(time = 0) {
  if (gameOver || isPaused || !gameStarted) return;

  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

// User Event Listeners Setup
function initEventListeners() {
  startBtn.addEventListener('click', startGame);
  resumeBtn.addEventListener('click', togglePause);
  restartBtn.addEventListener('click', startGame);

  // Key Down Events
  window.addEventListener('keydown', (event) => {
    // Prevent default scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      if (document.activeElement === canvas || document.activeElement === document.body) {
        const screen = document.getElementById('tetris-screen');
        if (screen.classList.contains('active')) {
          event.preventDefault();
        }
      }
    }

    if (!gameStarted || gameOver) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        playerMove(-1);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        playerMove(1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        playerDrop();
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        playerRotate(1); 
        break;
      case ' ': 
        playerHardDrop();
        break;
      case 'c':
      case 'C':
        playerHold();
        break;
      case 'Escape':
      case 'p':
      case 'P':
        togglePause();
        break;
    }
  });

  canvas.addEventListener('click', () => {
    if (gameStarted && !isPaused && !gameOver) {
      canvas.focus();
    }
  });
}

function updateMuteUI(muted) {
  if (muted) {
    muteIcon.className = "fa-solid fa-volume-xmark";
    muteBtn.style.color = "var(--text-muted)";
  } else {
    muteIcon.className = "fa-solid fa-volume-high";
    muteBtn.style.color = "var(--text-main)";
  }
}

// Initial script bootstrap
function init() {
  updateMuteUI(audioManager.isMuted);
  draw();
  initEventListeners();
}

// Start everything up
window.addEventListener('DOMContentLoaded', init);

// Expose controller methods to window object for lobby platform control
window.TetrisGame = {
  init: init,
  stop: function() {
    gameStarted = false;
    gameOver = false;
    isPaused = false;
    startOverlay.classList.add('active');
    pauseOverlay.classList.remove('active');
    gameoverOverlay.classList.remove('active');
    board = createMatrix(COLS, ROWS);
    holdPiece = null;
    draw();
    drawSubCanvas(nextCanvas, nextCtx, null);
    drawSubCanvas(holdCanvas, holdCtx, null);
  }
};
