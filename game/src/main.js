// Lantern Lane — boot and frame loop. One canvas, one requestAnimationFrame
// loop: advance the timer, paint the frame, and, for a staged ?shot=
// scene, raise window.__shotReady once the scene has painted twice.

import { createGame } from './game.js';
import { attachInput } from './input.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';
import { PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT } from './config.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');

function announce(text) {
  if (statusLine) statusLine.textContent = text;
}

const game = createGame(announce);
attachInput(canvas, game);

// The play-test and the screenshot tool read the live game through this.
window.__game = game;

const staged = applyShot(game);
let paintedFrames = 0;
let lastTime = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  game.tick(dt, now);
  ctx.clearRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);
  drawGame(ctx, game.state, now);
  paintedFrames += 1;
  if (staged && paintedFrames >= 2) window.__shotReady = true;
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
