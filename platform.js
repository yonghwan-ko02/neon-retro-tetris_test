// platform.js - Neon Arcade Platform Lobby & Navigation Controller

(function () {
  // DOM Screen elements
  const lobbyScreen = document.getElementById('lobby-screen');
  const tetrisScreen = document.getElementById('tetris-screen');
  const runnerScreen = document.getElementById('runner-screen');
  const breakerScreen = document.getElementById('breaker-screen');

  // Trigger Cards
  const selectTetris = document.getElementById('select-tetris');
  const selectRunner = document.getElementById('select-runner');
  const selectBreaker = document.getElementById('select-breaker');

  // Home buttons
  const tetrisHomeBtn = document.getElementById('tetris-home-btn');
  const runnerHomeBtn = document.getElementById('runner-home-btn');
  const breakerHomeBtn = document.getElementById('breaker-home-btn');

  // Active game instances
  const tetrisBoard = document.getElementById('tetris-board');
  const runnerBoard = document.getElementById('runner-board');
  const breakerBoard = document.getElementById('breaker-board');

  // Switch screens with sleek fade-in transition
  function switchScreen(targetScreen) {
    const screens = [lobbyScreen, tetrisScreen, runnerScreen, breakerScreen];
    
    screens.forEach(screen => {
      screen.classList.remove('active');
    });

    // Make screen block before setting opacity to trigger CSS transition
    targetScreen.classList.add('active');
  }

  // Lobby transitions
  function showLobby() {
    // Terminate running game engines immediately to free cycles and prevent audio loops
    if (window.TetrisGame && typeof window.TetrisGame.stop === 'function') {
      window.TetrisGame.stop();
    }
    if (window.NeonRunner && typeof window.NeonRunner.stop === 'function') {
      window.NeonRunner.stop();
    }
    if (window.NeonBreaker && typeof window.NeonBreaker.stop === 'function') {
      window.NeonBreaker.stop();
    }

    switchScreen(lobbyScreen);
    audioManager.init(); // secure audio context on user navigation clicks
  }

  function launchTetris() {
    switchScreen(tetrisScreen);
    
    // Focus board to start keyboard listening immediately
    setTimeout(() => {
      tetrisBoard.focus();
    }, 100);
  }

  function launchRunner() {
    switchScreen(runnerScreen);
    
    // Focus board to start keyboard listening immediately
    setTimeout(() => {
      runnerBoard.focus();
    }, 100);
  }

  function launchBreaker() {
    switchScreen(breakerScreen);
    
    // Focus board to start keyboard listening immediately
    setTimeout(() => {
      breakerBoard.focus();
    }, 100);
  }

  // Setup platform listeners
  function initPlatform() {
    // Selection Cards Click
    selectTetris.addEventListener('click', launchTetris);
    selectRunner.addEventListener('click', launchRunner);
    selectBreaker.addEventListener('click', launchBreaker);

    // Home buttons
    tetrisHomeBtn.addEventListener('click', showLobby);
    runnerHomeBtn.addEventListener('click', showLobby);
    breakerHomeBtn.addEventListener('click', showLobby);

    // Global sound toggle control sync with audioManager
    const globalMuteBtn = document.getElementById('mute-btn');
    const globalMuteIcon = document.getElementById('mute-icon');

    function updateGlobalMuteUI(muted) {
      if (muted) {
        globalMuteIcon.className = "fa-solid fa-volume-xmark";
        globalMuteBtn.style.color = "var(--text-muted)";
      } else {
        globalMuteIcon.className = "fa-solid fa-volume-high";
        globalMuteBtn.style.color = "var(--text-main)";
      }
    }

    // Sync initial state
    updateGlobalMuteUI(audioManager.isMuted);

    globalMuteBtn.addEventListener('click', () => {
      const isMuted = audioManager.toggleMute();
      updateGlobalMuteUI(isMuted);
      
      // Sync internal tetris UI mute indicator if it exists
      if (typeof updateMuteUI === 'function') {
        updateMuteUI(isMuted);
      }
    });

    // Sub-modules initialization triggers
    if (window.NeonRunner && typeof window.NeonRunner.init === 'function') {
      window.NeonRunner.init();
    }
    if (window.NeonBreaker && typeof window.NeonBreaker.init === 'function') {
      window.NeonBreaker.init();
    }
  }

  // Kickstart platform script
  window.addEventListener('DOMContentLoaded', () => {
    initPlatform();
  });
})();
