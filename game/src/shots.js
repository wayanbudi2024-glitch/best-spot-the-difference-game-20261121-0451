// Lantern Lane — staged scenes for screenshots. A ?shot= URL freezes
// the game into one exact moment so the screenshots are reproducible:
// the title screen, a mid-hunt round 1, a mid-hunt round 3, and a
// finished round 1. Each scene is deterministic for its ?seed= value.

import { buildLayout, differencesForRound } from './scene.js';
import { ROUND_SECONDS } from './config.js';

// Mark the first `count` differences of the round as found, in the
// round's own order, and return the names for the message line.
function markFound(state, count) {
  const names = [];
  for (const diff of state.round.differences.slice(0, count)) {
    state.found.add(diff.id);
    names.push(diff.name);
  }
  return names;
}

function stageRound(state, roundNumber, seed, foundCount, timeLeft, score, message) {
  const layout = buildLayout(seed, roundNumber);
  const differences = differencesForRound(roundNumber, layout);
  state.layout = layout;
  state.round = {
    number: roundNumber,
    differences,
    activeIds: new Set(differences.map((d) => d.id)),
  };
  state.found = new Set();
  state.timeLeft = timeLeft;
  state.score = score;
  state.combo = foundCount;
  state.hintsLeft = 3;
  state.screen = 'play';
  const names = markFound(state, foundCount);
  state.message = message || (names.length ? `Found it — ${names[names.length - 1]}!` : '');
}

// Returns true when a ?shot= scene was staged. The boot code then paints
// the scene twice and raises window.__shotReady.
export function applyShot(game) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  const seed = Number(params.get('seed')) || 1;
  const state = game.state;

  if (shot === 'start') {
    // The title screen over round 1, panels visible behind the panel.
    state.screen = 'title';
    state.timeLeft = ROUND_SECONDS;
    state.score = 0;
    state.message = 'Welcome to Lantern Lane.';
    return true;
  }

  if (shot === 'play') {
    // Round 1 mid-hunt: exactly three found, four still hiding.
    stageRound(state, 1, seed, 3, 62, 320, 'Found it — the front door changed colour! +120 points.');
    return true;
  }

  if (shot === 'round3') {
    // Round 3 mid-hunt: five of seven found, the subtle ones left.
    stageRound(state, 3, seed, 5, 41, 1150, 'Found it — an extra star appeared! +140 points.');
    return true;
  }

  if (shot === 'end') {
    // Round 1 finished: all seven found, three stars, time bonus shown.
    // Seven finds pay 100+110+120+130+140+150+160 = 910, plus the
    // 28 seconds left at 5 points each = 140, for 1050 in all.
    stageRound(state, 1, seed, 7, 28, 910, 'Round 1 complete — all seven found, +140 time bonus.');
    state.score = 1050;
    state.lastStars = 3;
    state.lastTimeBonus = 140;
    state.roundResults = [{ round: 1, found: 7, stars: 3, bonus: 140 }];
    state.screen = 'round';
    return true;
  }

  return false;
}
