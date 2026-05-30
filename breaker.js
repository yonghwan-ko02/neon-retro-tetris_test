// breaker.js - Neon Breaker Game Engine

(function () {
  // Canvas Setup
  const canvas = document.getElementById('breaker-board');
  const ctx = canvas.getContext('2d');
  const wrapper = document.getElementById('breaker-wrapper');

  // DOM Elements
  const startOverlay = document.getElementById('breaker-start-overlay');
  const gameoverOverlay = document.getElementById('breaker-gameover-overlay');
  const clearOverlay = document.getElementById('breaker-clear-overlay');
  
  const startBtn = document.getElementById('breaker-start-btn');
  const restartBtn = document.getElementById('breaker-restart-btn');
  const clearBtn = document.getElementById('breaker-clear-btn');
  
  const scoreDisplay = document.getElementById('breaker-score');
  const highScoreDisplay = document.getElementById('breaker-high-score');
  const livesDisplay = document.getElementById('breaker-lives');
  
  const finalScoreDisplay = document.getElementById('breaker-final-score');
  const clearScoreDisplay = document.getElementById('breaker-clear-score');

  // Game Engine Constants
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 500;
  
  const BRICK_ROWS = 5;
  const BRICK_COLS = 6;
  const BRICK_WIDTH = 54;
  const BRICK_HEIGHT = 16;
  const BRICK_PADDING = 6;
  const BRICK_OFFSET_TOP = 50;
  const BRICK_OFFSET_LEFT = 25;

  // Neon Bricks Color Palette
  const BRICK_COLORS = [
    '#ff0055', // Row 0: Pink/Red
    '#ff7b00', // Row 1: Orange
    '#ffe600', // Row 2: Yellow
    '#38b000', // Row 3: Green
    '#00f0ff', // Row 4: Cyan
  ];

  // Game state variables
  let isRunning = false;
  let isGameOver = false;
  let isCleared = false;
  
  let score = 0;
  let highScore = parseInt(localStorage.getItem('breaker_high_score')) || 0;
  let lives = 3;

  let animationFrameId = null;
  let lastTime = 0;

  // Paddle Physics State
  const paddle = {
    x: (CANVAS_WIDTH - 80) / 2,
    y: CANVAS_HEIGHT - 35,
    width: 80,
    height: 10,
    speed: 7,
    dx: 0,
    color: '#00f0ff' // Cyan paddle
  };

  // Ball Physics State
  const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 50,
    radius: 6,
    speed: 5.0,
    dx: 3.5,
    dy: -3.5,
    color: '#ffffff' // White ball
  };

  // Bricks layout matrix
  let bricks = [];

  // Particles (Neon Brick shards)
  let particles = [];

  // Keyboard keys mapping
  let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    a: false,
    A: false,
    d: false,
    D: false
  };

  // Initialize UI Highscore display
  highScoreDisplay.textContent = highScore;

  // Initialize bricks array layout
  function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks[c] = [];
      for (let r = 0; r < BRICK_ROWS; r++) {
        bricks[c][r] = {
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          status: 1, // 1: Active, 0: Destroyed
          color: BRICK_COLORS[r]
        };
      }
    }
  }

  // Create Neon Brick Shards Particles on Break
  function spawnParticles(x, y, color) {
    const shardCount = 10;
    for (let i = 0; i < shardCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // slight upward launch bias
        radius: Math.random() * 2 + 1,
        color: color,
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015,
        gravity: 0.1
      });
    }
  }

  // Draw lives hearts icon text
  function drawLives() {
    let hearts = "";
    for (let i = 0; i < lives; i++) {
      hearts += "❤️ ";
    }
    livesDisplay.textContent = hearts || "💀";
  }

  // Collision detection ball vs brick boundaries
  function checkBrickCollisions() {
    let activeBricksLeft = 0;
    
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          activeBricksLeft++;
          
          // Ball AABB overlapping check vs brick
          if (
            ball.x + ball.radius > b.x &&
            ball.x - ball.radius < b.x + BRICK_WIDTH &&
            ball.y + ball.radius > b.y &&
            ball.y - ball.radius < b.y + BRICK_HEIGHT
          ) {
            // Determine side of collision for precise physics bounce
            const overlapX = Math.min(ball.x + ball.radius - b.x, b.x + BRICK_WIDTH - (ball.x - ball.radius));
            const overlapY = Math.min(ball.y + ball.radius - b.y, b.y + BRICK_HEIGHT - (ball.y - ball.radius));

            if (overlapX < overlapY) {
              ball.dx = -ball.dx; // side hit
            } else {
              ball.dy = -ball.dy; // top/bottom hit
            }

            // Break brick
            b.status = 0;
            score += 10;
            scoreDisplay.textContent = score;
            
            // Audio + Particles trigger
            spawnParticles(b.x + BRICK_WIDTH / 2, b.y + BRICK_HEIGHT / 2, b.color);
            audioManager.playBrickBreak();
            triggerShake();

            // Highscore save check
            if (score > highScore) {
              highScore = score;
              localStorage.setItem('breaker_high_score', highScore);
              highScoreDisplay.textContent = highScore;
            }
          }
        }
      }
    }

    // Victory stage check
    if (activeBricksLeft === 0 && isRunning) {
      handleGameClear();
    }
  }

  function triggerShake() {
    wrapper.classList.add('shake');
    setTimeout(() => {
      wrapper.classList.remove('shake');
    }, 120);
  }

  // Start/Reset Game Loop variables
  function startBreakerGame() {
    audioManager.init(); // secure audio context activation

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    isRunning = true;
    isGameOver = false;
    isCleared = false;
    
    score = 0;
    lives = 3;
    particles = [];

    // Reset paddle
    paddle.x = (CANVAS_WIDTH - paddle.width) / 2;
    paddle.dx = 0;

    // Reset ball
    resetBall();

    // Setup bricks
    initBricks();

    // Reset UI
    scoreDisplay.textContent = "0";
    drawLives();

    startOverlay.classList.remove('active');
    gameoverOverlay.classList.remove('active');
    clearOverlay.classList.remove('active');

    // Focus canvas to capture keys
    canvas.focus();

    // Launch loop
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Reset ball on life loss
  function resetBall() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT - 60;
    
    // Angled upward velocity vector
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * (3.0 + Math.random() * 1);
    ball.dy = -4.0;
  }

  function handleLifeLoss() {
    lives--;
    drawLives();
    audioManager.playLifeLoss();

    if (lives <= 0) {
      handleGameOver();
    } else {
      resetBall();
    }
  }

  function handleGameOver() {
    isRunning = false;
    isGameOver = true;
    finalScoreDisplay.textContent = score;
    gameoverOverlay.classList.add('active');
    audioManager.playGameOver();
  }

  function handleGameClear() {
    isRunning = false;
    isCleared = true;
    clearScoreDisplay.textContent = score;
    clearOverlay.classList.add('active');
    audioManager.playGameClear();
  }

  // Primary math engine updates
  function update(dt) {
    if (!isRunning || isGameOver || isCleared) return;

    // 1. Move Paddle with keyboard controls
    if (keys.ArrowLeft || keys.a || keys.A) {
      paddle.x -= paddle.speed;
    }
    if (keys.ArrowRight || keys.d || keys.D) {
      paddle.x += paddle.speed;
    }

    // Keep paddle inside board boundaries
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x > CANVAS_WIDTH - paddle.width) {
      paddle.x = CANVAS_WIDTH - paddle.width;
    }

    // 2. Move Ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Left/Right Wall Bounces
    if (ball.x + ball.radius > CANVAS_WIDTH) {
      ball.x = CANVAS_WIDTH - ball.radius;
      ball.dx = -ball.dx;
      audioManager.playMove();
    }
    if (ball.x - ball.radius < 0) {
      ball.x = ball.radius;
      ball.dx = -ball.dx;
      audioManager.playMove();
    }

    // Top Wall Bounce
    if (ball.y - ball.radius < 0) {
      ball.y = ball.radius;
      ball.dy = -ball.dy;
      audioManager.playMove();
    }

    // Bottom out (Life lost)
    if (ball.y + ball.radius > CANVAS_HEIGHT) {
      handleLifeLoss();
      return;
    }

    // 3. Paddle collision (Advanced angle bouncing geometry)
    if (
      ball.x + ball.radius > paddle.x &&
      ball.x - ball.radius < paddle.x + paddle.width &&
      ball.y + ball.radius > paddle.y &&
      ball.y - ball.radius < paddle.y + paddle.height
    ) {
      // Ensure ball sits right on top of paddle to prevent sticking inside pad
      ball.y = paddle.y - ball.radius;
      
      // Calculate collision position offset on the paddle (-1.0 to 1.0)
      const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      
      // Calculate bounce angle in radians
      const maxBounceAngle = Math.PI / 3.2; // roughly 56 degrees
      const bounceAngle = hitPoint * maxBounceAngle;

      // Adjust vectors using trigonometry
      const currentSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
      ball.dx = Math.sin(bounceAngle) * currentSpeed;
      ball.dy = -Math.cos(bounceAngle) * currentSpeed;

      // Ensure slight speed acceleration on each paddle hit for increased tension
      const speedCap = 8.5;
      if (currentSpeed < speedCap) {
        ball.dx *= 1.03;
        ball.dy *= 1.03;
      }

      audioManager.playPaddleHit();
    }

    // 4. Brick collisions check
    checkBrickCollisions();

    // 5. Update Neon Shard Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity; // Gravity pull
      p.alpha -= p.decay; // Fades out

      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  // Graphics rendering loops
  function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Background Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // 2. Draw Bricks Matrix
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        const b = bricks[c][r];
        if (b.status === 1) {
          ctx.save();
          ctx.fillStyle = b.color;
          
          // Neon glow style
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 10;
          
          roundRect(ctx, b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT, 4);
          ctx.fill();
          
          // Glassmorphic highlight inner core
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          roundRect(ctx, b.x + 2, b.y + 2, BRICK_WIDTH - 4, BRICK_HEIGHT/3, 1);
          ctx.fill();
          
          ctx.restore();
        }
      }
    }

    // 3. Draw Neon Shard Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 4. Draw Paddle (Glowing rounded cylinder)
    if (isRunning || isGameOver || isCleared) {
      ctx.save();
      ctx.fillStyle = paddle.color;
      ctx.shadowColor = paddle.color;
      ctx.shadowBlur = 12;
      
      roundRect(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 5);
      ctx.fill();
      
      // Core bright highlighting line
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(paddle.x + 8, paddle.y + 2);
      ctx.lineTo(paddle.x + paddle.width - 8, paddle.y + 2);
      ctx.stroke();
      
      ctx.restore();
    }

    // 5. Draw Ball (Glowing neon sphere)
    if (isRunning || isGameOver || isCleared) {
      ctx.save();
      ctx.fillStyle = ball.color;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }

  // Rounded rectangle helper
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

  // Animation frame loop calc
  function gameLoop(time) {
    if (!isRunning || isGameOver || isCleared) return;

    const dt = time - lastTime;
    lastTime = time;

    if (dt < 100) {
      update(dt);
    }
    
    draw();
    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Setup Event Listeners
  function initListeners() {
    startBtn.addEventListener('click', startBreakerGame);
    restartBtn.addEventListener('click', startBreakerGame);
    clearBtn.addEventListener('click', startBreakerGame);

    // Keyboard capture
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
        if (document.activeElement === canvas || document.activeElement === document.body) {
          const screen = document.getElementById('breaker-screen');
          if (screen.classList.contains('active')) {
            e.preventDefault();
          }
        }
      }

      if (e.key in keys) {
        keys[e.key] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key in keys) {
        keys[e.key] = false;
      }
    });

    // Mouse position capture for Paddle chasing
    canvas.addEventListener('mousemove', (e) => {
      if (!isRunning || isGameOver || isCleared) return;
      
      // Calculate mouse coordinates relative to canvas bounding rect
      const rect = canvas.getBoundingClientRect();
      const root = document.documentElement;
      
      const mouseX = e.clientX - rect.left - root.scrollLeft;
      
      // Set paddle center to mouse X
      paddle.x = mouseX - paddle.width / 2;
    });

    // Touch support for mobile paddle drag
    canvas.addEventListener('touchmove', (e) => {
      if (!isRunning || isGameOver || isCleared) return;
      e.preventDefault(); // stop dual mouse firing
      
      const rect = canvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      paddle.x = touchX - paddle.width / 2;
    });
  }

  // Pre-initialization
  function init() {
    initListeners();
    initBricks();
    draw();
  }

  // Expose controller API for global screen routing loop management
  window.NeonBreaker = {
    init: init,
    stop: function () {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      startOverlay.classList.add('active');
      gameoverOverlay.classList.remove('active');
      clearOverlay.classList.remove('active');
      initBricks();
      draw();
    }
  };
})();
