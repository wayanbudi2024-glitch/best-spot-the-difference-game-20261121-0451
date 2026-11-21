// Lantern Lane — keyboard and pointer input. The canvas is drawn at a
// fixed logical size of 1280 x 720 and scaled by CSS, so every pointer
// position is mapped back into logical coordinates before the game sees
// it. Arrow keys move a visible crosshair; Enter or Space selects where
// the crosshair stands.

import { PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT } from './config.js';

const CROSSHAIR_STEP = 14;
const CROSSHAIR_FAST_STEP = 48;

export function attachInput(canvas, game) {
  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * PLAYFIELD_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * PLAYFIELD_HEIGHT,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const point = toLogical(event);
    game.handleClick(point.x, point.y, performance.now());
  });

  canvas.addEventListener('pointermove', (event) => {
    const point = toLogical(event);
    game.state.crosshair.x = point.x;
    game.state.crosshair.y = point.y;
  });

  window.addEventListener('keydown', (event) => {
    const state = game.state;
    const now = performance.now();
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowDown': {
        event.preventDefault();
        state.crosshairVisible = true;
        const step = event.shiftKey ? CROSSHAIR_FAST_STEP : CROSSHAIR_STEP;
        if (event.key === 'ArrowLeft') state.crosshair.x -= step;
        if (event.key === 'ArrowRight') state.crosshair.x += step;
        if (event.key === 'ArrowUp') state.crosshair.y -= step;
        if (event.key === 'ArrowDown') state.crosshair.y += step;
        state.crosshair.x = Math.max(0, Math.min(PLAYFIELD_WIDTH, state.crosshair.x));
        state.crosshair.y = Math.max(0, Math.min(PLAYFIELD_HEIGHT, state.crosshair.y));
        break;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (state.screen === 'title') game.startGame();
        else if (state.screen === 'round') game.advance();
        else if (state.screen === 'over') game.startGame();
        else if (state.screen === 'play') {
          state.crosshairVisible = true;
          game.handleClick(state.crosshair.x, state.crosshair.y, now);
        }
        break;
      case 'h':
      case 'H':
        game.useHint(now);
        break;
      case 'p':
      case 'P':
      case 'Escape':
        game.togglePause();
        break;
      case 'm':
      case 'M':
        game.toggleMute();
        break;
      default:
        break;
    }
  });
}
