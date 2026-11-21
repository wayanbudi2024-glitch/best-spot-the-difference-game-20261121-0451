// Lantern Lane — the rules: rounds, scoring, the timer, hints and
// clicks. This file owns the game state and nothing else; drawing lives
// in render.js and sound in audio.js.

import {
  ROUNDS_TOTAL, DIFFERENCES_PER_ROUND, ROUND_SECONDS, HINTS_PER_ROUND,
  POINTS_PER_FIND, POINTS_PER_COMBO_STEP, POINTS_PER_SECOND_LEFT,
  HINT_COST, WRONG_CLICK_TIME_COST, HINT_RING_MILLISECONDS,
  WRONG_FLASH_MILLISECONDS, BEST_SCORE_KEY, PANEL_TOP, PANEL_WIDTH,
  PANEL_LEFT_X, PANEL_RIGHT_X, LOW_TIME_SECONDS,
} from './config.js';
import { buildLayout, differencesForRound } from './scene.js';
import { SoundBank } from './audio.js';

export function loadBestScore() {
  try {
    return Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(score) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch {
    // A browser that refuses storage simply keeps no best score.
  }
}

export function createGame(announce) {
  const sounds = new SoundBank();
  const baseSeed = Number(new URLSearchParams(window.location.search).get('seed')) || 1;

  const state = {
    screen: 'title',
    round: { number: 1, differences: [], activeIds: new Set() },
    layout: null,
    found: new Set(),
    score: 0,
    combo: 0,
    hintsLeft: HINTS_PER_ROUND,
    timeLeft: ROUND_SECONDS,
    message: 'Welcome to Lantern Lane.',
    best: loadBestScore(),
    previousBest: 0,
    newBest: false,
    muted: false,
    crosshair: { x: 640, y: 360 },
    crosshairVisible: false,
    flashes: [],
    hintPulse: null,
    roundResults: [],
    lastStars: 0,
    lastTimeBonus: 0,
    lastTickSecond: null,
  };

  function say(text) {
    state.message = text;
    if (announce) announce(text);
  }

  function startRound(number) {
    const layout = buildLayout(baseSeed, number);
    const differences = differencesForRound(number, layout);
    state.layout = layout;
    state.round = {
      number,
      differences,
      activeIds: new Set(differences.map((d) => d.id)),
    };
    state.found = new Set();
    state.combo = 0;
    state.hintsLeft = HINTS_PER_ROUND;
    state.timeLeft = ROUND_SECONDS;
    state.lastTickSecond = null;
    state.hintPulse = null;
    state.flashes = [];
    state.screen = 'play';
    say(`Round ${number} — find ${DIFFERENCES_PER_ROUND} differences before the lanterns burn down.`);
  }

  function starsFor(foundCount) {
    if (foundCount >= 7) return 3;
    if (foundCount >= 5) return 2;
    if (foundCount >= 3) return 1;
    return 0;
  }

  function endRound(allFound) {
    const foundCount = state.found.size;
    const stars = starsFor(foundCount);
    const timeBonus = allFound ? Math.max(0, Math.ceil(state.timeLeft)) * POINTS_PER_SECOND_LEFT : 0;
    state.score += timeBonus;
    state.lastStars = stars;
    state.lastTimeBonus = timeBonus;
    state.roundResults.push({
      round: state.round.number,
      found: foundCount,
      stars,
      bonus: timeBonus,
    });
    state.screen = 'round';
    sounds.roundArpeggio();
    say(
      allFound
        ? `Round ${state.round.number} complete — all seven found, +${timeBonus} time bonus.`
        : `Time ran out on round ${state.round.number} — you found ${foundCount} of seven.`,
    );
  }

  function finishGame() {
    state.previousBest = state.best;
    state.newBest = state.score > state.best;
    if (state.newBest) {
      state.best = state.score;
      saveBestScore(state.score);
    }
    state.screen = 'over';
    sounds.winFanfare();
    say(`The stroll is over — total score ${state.score}.`);
  }

  function advance() {
    if (state.round.number < ROUNDS_TOTAL) startRound(state.round.number + 1);
    else finishGame();
  }

  function startGame() {
    state.score = 0;
    state.roundResults = [];
    state.newBest = false;
    startRound(1);
    sounds.clickBlip();
  }

  function panelAt(x, y) {
    if (y < PANEL_TOP || y >= PANEL_TOP + PANEL_WIDTH - 48) return null;
    if (x >= PANEL_LEFT_X && x < PANEL_LEFT_X + PANEL_WIDTH) {
      return { side: 'A', localX: x - PANEL_LEFT_X, localY: y - PANEL_TOP };
    }
    if (x >= PANEL_RIGHT_X && x < PANEL_RIGHT_X + PANEL_WIDTH) {
      return { side: 'B', localX: x - PANEL_RIGHT_X, localY: y - PANEL_TOP };
    }
    return null;
  }

  function handleClick(x, y, nowMs) {
    sounds.ensureContext();
    if (state.screen === 'title') {
      startGame();
      return;
    }
    if (state.screen === 'round') {
      advance();
      return;
    }
    if (state.screen === 'over') {
      state.screen = 'title';
      state.layout = buildLayout(baseSeed, 1);
      state.round = {
        number: 1,
        differences: differencesForRound(1, state.layout),
        activeIds: new Set(differencesForRound(1, state.layout).map((d) => d.id)),
      };
      state.found = new Set();
      state.timeLeft = ROUND_SECONDS;
      say('Welcome to Lantern Lane.');
      return;
    }
    if (state.screen !== 'play') return;

    const panel = panelAt(x, y);
    if (!panel) return;
    sounds.clickBlip();

    for (const diff of state.round.differences) {
      if (state.found.has(diff.id)) continue;
      const dx = panel.localX - diff.x;
      const dy = panel.localY - diff.y;
      if (dx * dx + dy * dy <= diff.r * diff.r) {
        state.found.add(diff.id);
        const gained = POINTS_PER_FIND + state.combo * POINTS_PER_COMBO_STEP;
        state.score += gained;
        state.combo += 1;
        sounds.foundChime(state.combo);
        say(`Found it — ${diff.name}! +${gained} points.`);
        if (state.found.size === state.round.differences.length) endRound(true);
        return;
      }
    }

    // Nothing there: a buzz, the combo breaks and five seconds burn away.
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_CLICK_TIME_COST);
    state.flashes.push({ x, y, at: nowMs });
    state.flashes = state.flashes.filter((f) => nowMs - f.at < WRONG_FLASH_MILLISECONDS);
    sounds.wrongBuzz();
    say('Not quite — that costs five seconds.');
    if (state.timeLeft <= 0) endRound(false);
  }

  function useHint(nowMs) {
    if (state.screen !== 'play') return;
    if (state.hintsLeft <= 0) {
      say('No hints left this round.');
      return;
    }
    const unfound = state.round.differences.filter((d) => !state.found.has(d.id));
    if (unfound.length === 0) return;
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - HINT_COST);
    const pick = unfound[Math.floor(Math.random() * unfound.length)];
    state.hintPulse = { id: pick.id, until: nowMs + HINT_RING_MILLISECONDS };
    sounds.hintNotes();
    say(`Hint — look for ${pick.name}. (−${HINT_COST} points)`);
  }

  function togglePause() {
    if (state.screen === 'play') {
      state.screen = 'paused';
      say('Paused.');
    } else if (state.screen === 'paused') {
      state.screen = 'play';
      say('Back to the hunt.');
    }
  }

  function toggleMute() {
    state.muted = !state.muted;
    sounds.setMuted(state.muted);
    say(state.muted ? 'Sound muted.' : 'Sound on.');
  }

  function tick(dtSeconds, nowMs) {
    if (state.hintPulse && nowMs > state.hintPulse.until) state.hintPulse = null;
    if (state.screen !== 'play') return;
    state.timeLeft -= dtSeconds;
    if (state.timeLeft <= LOW_TIME_SECONDS && state.timeLeft > 0) {
      const whole = Math.ceil(state.timeLeft);
      if (state.lastTickSecond !== whole) {
        state.lastTickSecond = whole;
        sounds.lowTimeTick();
      }
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      endRound(false);
    }
  }

  // The first scene, so the title screen already shows the lane.
  state.layout = buildLayout(baseSeed, 1);
  const firstDifferences = differencesForRound(1, state.layout);
  state.round = {
    number: 1,
    differences: firstDifferences,
    activeIds: new Set(firstDifferences.map((d) => d.id)),
  };

  return {
    state,
    sounds,
    startGame,
    startRound,
    advance,
    handleClick,
    useHint,
    togglePause,
    toggleMute,
    tick,
  };
}
