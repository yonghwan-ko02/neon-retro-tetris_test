// runner.js - Neon Runner Game Engine

(function () {
  // Canvas Setup
  const canvas = document.getElementById('runner-board');
  const ctx = canvas.getContext('2d');
  const wrapper = document.getElementById('runner-wrapper');

  // DOM Elements
  const startOverlay = document.getElementById('runner-start-overlay');
  const gameoverOverlay = document.getElementById('runner-gameover-overlay');
  const startBtn = document.getElementById('runner-start-btn');
  const restartBtn = document.getElementById('runner-restart-btn');
  const scoreDisplay = document.getElementById('runner-score');
  const highScoreDisplay = document.getElementById('runner-high-score');
  const finalScoreDisplay = document.getElementById('runner-final-score');

  // Game Engine Constants
  const CANVAS_WIDTH = 640;
  const CANVAS_HEIGHT = 300;
  const GROUND_Y = 240;

  // Colors
  const COLOR_RUNNER = '#00f0ff'; // Neon Cyan
  const COLOR_OBSTACLE_GROUND = '#ff0055'; // Neon Pink
  const COLOR_OBSTACLE_AIR = '#ffe600'; // Neon Yellow
  const COLOR_GRID = 'rgba(157, 78, 221, 0.15)'; // Deep Neon Violet grid

  // Game State variables
  let isRunning = false;
  let isGameOver = false;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('runner_high_score')) || 0;
  let lastMilestone = 0;

  let animationFrameId = null;
  let lastTime = 0;

  // Runner Physics State
  const runner = {
    x: 80,
    y: GROUND_Y - 50,
    width: 30,
    height: 50,
    baseHeight: 50,
    slideHeight: 25,
    vy: 0,
    gravity: 0.65,
    jumpForce: -13.5,
    isJumping: false,
    isSliding: false,
    color: COLOR_RUNNER
  };

  // Obstacle Management
  let obstacles = [];
  let obstacleSpeed = 6.0;
  const baseObstacleSpeed = 6.0;
  const maxObstacleSpeed = 15.0;
  let spawnTimer = 0;
  let spawnInterval = 1800; // ms

  // Parallax Background Grid / Star elements
  let gridOffset = 0;
  let stars = [];

  // Initialize High Score UI
  highScoreDisplay.textContent = `${highScore} m`;

  // Initialize background star coordinates
  function initStars() {
    stars = [];
    for (let i = 0; i < 25; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * (GROUND_Y - 50),
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1
      });
    }
  }

  // Spawns obstacles randomly
  function spawnObstacle() {
    const r = Math.random();
    
    if (r < 0.35) {
      // 1. High air obstacle (yellow) - must be slided under
      obstacles.push({
        x: CANVAS_WIDTH + 50,
        y: GROUND_Y - 65,
        width: 25,
        height: 20,
        type: 'air',
        color: COLOR_OBSTACLE_AIR
      });
    } else if (r < 0.7) {
      // 2. Medium ground obstacle (cactus style)
      obstacles.push({
        x: CANVAS_WIDTH + 50,
        y: GROUND_Y - 45,
        width: 20,
        height: 45,
        type: 'ground',
        color: COLOR_OBSTACLE_GROUND
      });
    } else {
      // 3. Wide ground obstacle
      obstacles.push({
        x: CANVAS_WIDTH + 50,
        y: GROUND_Y - 30,
        width: 40,
        height: 30,
        type: 'ground',
        color: COLOR_OBSTACLE_GROUND
      });
    }
  }

  // Jump control triggers
  function triggerJump() {
    if (!isRunning || isGameOver || runner.isJumping || runner.isSliding) return;
    
    runner.vy = runner.jumpForce;
    runner.isJumping = true;
    audioManager.playJump();
  }

  // Slide controls toggle
  function setSliding(slideState) {
    if (!isRunning || isGameOver || runner.isJumping) return;

    if (slideState) {
      runner.isSliding = true;
      runner.height = runner.slideHeight;
      runner.y = GROUND_Y - runner.slideHeight;
    } else {
      runner.isSliding = false;
      runner.height = runner.baseHeight;
      runner.y = GROUND_Y - runner.baseHeight;
    }
  }

  // Box collision AABB check
  function checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  // Start/Reset runner game parameters
  function startRunnerGame() {
    audioManager.init(); // secure audio context activation

    // Clear loops
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    isRunning = true;
    isGameOver = false;
    score = 0;
    lastMilestone = 0;
    obstacles = [];
    obstacleSpeed = baseObstacleSpeed;
    spawnInterval = 1800;
    spawnTimer = 0;

    // Reset physics state
    runner.y = GROUND_Y - runner.baseHeight;
    runner.height = runner.baseHeight;
    runner.vy = 0;
    runner.isJumping = false;
    runner.isSliding = false;

    // Setup environments
    initStars();
    gridOffset = 0;

    // UI resets
    startOverlay.classList.remove('active');
    gameoverOverlay.classList.remove('active');
    scoreDisplay.textContent = "0 m";

    // Focus canvas
    canvas.focus();

    // Start loop
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function handleCrash() {
    isRunning = false;
    isGameOver = true;
    
    // UI triggers
    finalScoreDisplay.textContent = Math.floor(score);
    gameoverOverlay.classList.add('active');

    // Synth impact sound trigger
    audioManager.playCrash();
    triggerShake();

    if (Math.floor(score) > highScore) {
      highScore = Math.floor(score);
      localStorage.setItem('runner_high_score', highScore);
      highScoreDisplay.textContent = `${highScore} m`;
    }
  }

  function triggerShake() {
    wrapper.classList.add('shake');
    setTimeout(() => {
      wrapper.classList.remove('shake');
    }, 150);
  }

  // Primary runner calculations
  function update(dt) {
    if (!isRunning || isGameOver) return;

    // 1. Progress Score & Speeds
    score += dt * 0.015; // Score climbs based on time delta
    scoreDisplay.textContent = `${Math.floor(score)} m`;

    // Dynamic speeds (faster obstacles over time)
    obstacleSpeed = Math.min(maxObstacleSpeed, baseObstacleSpeed + (score * 0.01));
    // Shorten spawns slightly as speed increases
    spawnInterval = Math.max(900, 1800 - (score * 1.5));

    // Milestone sound triggers (every 100 meters)
    const currentMilestone = Math.floor(score / 100) * 100;
    if (currentMilestone > lastMilestone && currentMilestone > 0) {
      lastMilestone = currentMilestone;
      audioManager.playMilestone();
    }

    // 2. Parallax background offsets
    gridOffset = (gridOffset + obstacleSpeed * 0.8) % 40;
    stars.forEach(star => {
      star.x -= star.speed * (obstacleSpeed * 0.2);
      if (star.x < 0) {
        star.x = CANVAS_WIDTH;
      }
    });

    // 3. Physics equations (Jump / Gravity)
    if (runner.isJumping) {
      runner.vy += runner.gravity;
      runner.y += runner.vy;

      // Ground landing bounds check
      if (runner.y >= GROUND_Y - runner.height) {
        runner.y = GROUND_Y - runner.height;
        runner.vy = 0;
        runner.isJumping = false;
      }
    }

    // 4. Spawners
    spawnTimer += dt;
    if (spawnTimer > spawnInterval) {
      spawnObstacle();
      spawnTimer = 0;
    }

    // 5. Obstacle movement & out-of-screen disposals
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= obstacleSpeed;

      // Collision triggers
      const rBox = {
        x: runner.x,
        y: runner.y,
        width: runner.width,
        height: runner.height
      };
      
      if (checkCollision(rBox, obs)) {
        handleCrash();
        return;
      }

      // Dispose offscreen obstacles
      if (obs.x < -obs.width - 20) {
        obstacles.splice(i, 1);
      }
    }
  }

  // Graphics rendering loops
  function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Stars Background
    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 2. Draw Retro Synthwave Floor Grid Lines
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 1;
    
    // Vertical grid lines (Parallax)
    for (let x = -gridOffset; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      // Perspective tilting line projection
      const projectionX = (x - CANVAS_WIDTH / 2) * 1.5 + CANVAS_WIDTH / 2;
      ctx.lineTo(projectionX, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    // Horizontal floor grid lines (Fades downward)
    let gridY = GROUND_Y;
    let spacing = 10;
    while (gridY <= CANVAS_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(0, gridY);
      ctx.lineTo(CANVAS_WIDTH, gridY);
      ctx.stroke();
      spacing += 4; // perspective scaling spacing
      gridY += spacing;
    }

    // 3. Draw Neon Floor Bar (Solid Horizon)
    ctx.save();
    ctx.shadowColor = '#9d4edd';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#9d4edd';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();
    ctx.restore();

    // 4. Draw Obstacles
    obstacles.forEach(obs => {
      ctx.save();
      ctx.fillStyle = obs.color;
      ctx.shadowColor = obs.color;
      ctx.shadowBlur = 10;
      
      // Draw neon rounded obstacles
      roundRect(ctx, obs.x, obs.y, obs.width, obs.height, 4);
      ctx.fill();
      
      // Neon Core Brightener
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, obs.x + obs.width/3, obs.y + 2, obs.width/3, obs.height - 4, 2);
      ctx.globalAlpha = 0.3;
      ctx.fill();
      
      ctx.restore();
    });

    // 5. Draw Active Neon Runner Box
    if (isRunning || isGameOver) {
      ctx.save();
      ctx.fillStyle = runner.color;
      ctx.shadowColor = runner.color;
      ctx.shadowBlur = 12;
      
      // Draw round neon avatar block
      roundRect(ctx, runner.x, runner.y, runner.width, runner.height, 6);
      ctx.fill();
      
      // Add cute digital glowing "cyber eye" dot inside avatar
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      if (runner.isSliding) {
        // Sliding eye
        ctx.beginPath();
        ctx.arc(runner.x + runner.width - 8, runner.y + runner.height / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard running eye
        ctx.beginPath();
        ctx.arc(runner.x + runner.width - 8, runner.y + 12, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }

  // Standard Rounded Rect Canvas Util
  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  // Infinite Animation loop delta calculator
  function gameLoop(time) {
    if (!isRunning || isGameOver) return;

    const dt = time - lastTime;
    lastTime = time;

    // Safety fallback for huge background tab delays
    if (dt < 100) {
      update(dt);
    }
    
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Global listeners setup
  function initListeners() {
    startBtn.addEventListener('click', startRunnerGame);
    restartBtn.addEventListener('click', startRunnerGame);

    // Keyboard capture
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling when playing inside viewport
      if ([' ', 'ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(e.key)) {
        if (document.activeElement === canvas || document.activeElement === document.body) {
          // If active runner screen is open
          const screen = document.getElementById('runner-screen');
          if (screen.classList.contains('active')) {
            e.preventDefault();
          }
        }
      }

      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        triggerJump();
      }
      
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setSliding(true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setSliding(false);
      }
    });

    // Touch/Mouse clicks on board to support Mobile/Tablet jumping
    canvas.addEventListener('mousedown', triggerJump);
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault(); // prevent dual firing mouse events
      triggerJump();
    });
  }

  // Pre-initialize
  function init() {
    initListeners();
    // Render initial grid and static platform
    initStars();
    draw();
  }

  // Expose triggers globally to manage loop safely during lobby switches
  window.NeonRunner = {
    init: init,
    stop: function() {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      // Return overlay modes
      startOverlay.classList.add('active');
      gameoverOverlay.classList.remove('active');
    }
  };
})();
