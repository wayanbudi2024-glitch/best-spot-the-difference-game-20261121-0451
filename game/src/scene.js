// Lantern Lane — the evening street scene: its seeded layout and the
// pool of differences. A layout is built from one seed per round, so the
// stars, clouds, lit windows, moon drift and apples change while the
// houses, the tree, the wall, the lanterns and the bicycle stay put.

import { makeRandom } from './random.js';

// Every difference the game can hide, in panel-local coordinates
// (600 x 552). `kind` says how the right picture changes: 'gone' removes
// a thing, 'colour' recolours it, 'extra' adds one, 'shape' reshapes it.
export const DIFFERENCE_POOL = [
  { id: 'lantern', name: 'the lantern changed colour', x: 450, y: 350, r: 30, kind: 'colour' },
  { id: 'cat', name: 'the cat slipped away', x: 300, y: 418, r: 28, kind: 'gone' },
  { id: 'smoke', name: 'the chimney smoke vanished', x: 350, y: 165, r: 26, kind: 'gone' },
  { id: 'door', name: 'the front door changed colour', x: 95, y: 420, r: 26, kind: 'colour' },
  { id: 'bird', name: 'the bird flew off the wire', x: 280, y: 192, r: 20, kind: 'gone' },
  { id: 'puddle', name: 'a puddle dried up', x: 420, y: 520, r: 30, kind: 'gone' },
  { id: 'window', name: 'a window went dark', x: 320, y: 260, r: 26, kind: 'gone' },
  { id: 'basket', name: 'the bicycle basket is gone', x: 105, y: 478, r: 24, kind: 'gone' },
  { id: 'chimney', name: 'a chimney is missing', x: 520, y: 235, r: 24, kind: 'gone' },
  { id: 'sign', name: 'the hanging sign changed colour', x: 240, y: 380, r: 22, kind: 'colour' },
  { id: 'cloud', name: 'an extra cloud drifted in', x: 120, y: 110, r: 30, kind: 'extra' },
  { id: 'star', name: 'an extra star appeared', x: 530, y: 55, r: 20, kind: 'extra' },
  { id: 'flower', name: 'an extra flower bloomed', x: 310, y: 392, r: 18, kind: 'extra' },
  { id: 'apple', name: 'an extra apple grew', x: 40, y: 270, r: 18, kind: 'extra' },
  { id: 'attic', name: 'the round window turned square', x: 490, y: 300, r: 22, kind: 'shape' },
  { id: 'crater', name: 'a moon crater vanished', x: 470, y: 88, r: 32, kind: 'gone' },
];

// The seven differences of each round. Round 1 is mostly obvious so the
// hunt opens kindly; round 3 is all subtle; round 5 mixes the quiet ones.
export const ROUND_SETS = [
  ['lantern', 'cat', 'door', 'puddle', 'basket', 'chimney', 'window'],
  ['lantern', 'door', 'smoke', 'bird', 'sign', 'puddle', 'window'],
  ['smoke', 'bird', 'sign', 'cloud', 'star', 'flower', 'crater'],
  ['window', 'basket', 'chimney', 'apple', 'attic', 'star', 'smoke'],
  ['bird', 'sign', 'cloud', 'flower', 'apple', 'attic', 'crater'],
];

const POOL_BY_ID = new Map(DIFFERENCE_POOL.map((d) => [d.id, d]));

// Fixed windows of the three houses, in panel-local coordinates.
// `lit` is seeded per round, except the difference window, which is
// always lit on the left so that going dark on the right means something.
export const WINDOWS = [
  { id: 'w1', x: 60, y: 330, w: 32, h: 40 },
  { id: 'w2', x: 140, y: 330, w: 32, h: 40 },
  { id: 'w3', x: 245, y: 260, w: 32, h: 40 },
  { id: 'w4', x: 320, y: 260, w: 32, h: 40, alwaysLit: true },
  { id: 'w5', x: 315, y: 360, w: 32, h: 38 },
  { id: 'w6', x: 470, y: 380, w: 30, h: 36 },
  { id: 'w7', x: 545, y: 380, w: 30, h: 36 },
];

export function buildLayout(seed, roundNumber) {
  const rng = makeRandom(seed * 1000 + roundNumber * 7919 + 13);

  // Stars, kept out of the moon's disc and away from the extra-star spot.
  const moon = {
    x: 470 + rng.range(-6, 6),
    y: 88 + rng.range(-6, 6),
    r: 30,
    craters: [
      { dx: 0, dy: 0, r: 6 },
      { dx: -13, dy: -8, r: 4.5 },
      { dx: 11, dy: 10, r: 3.5 },
    ],
  };
  const stars = [];
  for (let i = 0; i < 46; i++) {
    const x = rng.range(8, 592);
    const y = rng.range(8, 190);
    const moonDx = x - moon.x;
    const moonDy = y - moon.y;
    if (moonDx * moonDx + moonDy * moonDy < 48 * 48) continue;
    if (Math.abs(x - 530) < 26 && Math.abs(y - 55) < 26) continue;
    stars.push({ x, y, r: rng.range(0.8, 2.1), tw: rng.range(0, Math.PI * 2) });
  }

  // Soft clouds, kept away from the extra-cloud spot and the moon.
  const clouds = [];
  for (let i = 0; i < 4; i++) {
    const x = rng.range(30, 570);
    const y = rng.range(45, 150);
    if (Math.abs(x - 120) < 70 && Math.abs(y - 110) < 45) continue;
    if (Math.abs(x - moon.x) < 80 && Math.abs(y - moon.y) < 45) continue;
    clouds.push({ x, y, s: rng.range(0.7, 1.25) });
  }

  // Which windows glow. The difference window is always lit.
  const litWindows = new Set();
  for (const w of WINDOWS) {
    if (w.alwaysLit || rng.chance(0.62)) litWindows.add(w.id);
  }

  // Apples on the tree, kept away from the extra-apple spot.
  const apples = [];
  for (let i = 0; i < 7; i++) {
    const x = rng.range(14, 88);
    const y = rng.range(228, 292);
    if (Math.abs(x - 40) < 22 && Math.abs(y - 270) < 22) continue;
    apples.push({ x, y, r: rng.range(3.2, 4.6) });
  }

  // Cobble shading, one jitter per stone row so the street never repeats.
  const cobbles = [];
  for (let row = 0; row < 5; row++) {
    cobbles.push({ y: 462 + row * 19, offset: rng.range(0, 26), shade: rng.range(0, 1) });
  }

  return { seed, roundNumber, stars, clouds, moon, litWindows, apples, cobbles };
}

// Resolve a round's seven differences. The two moon differences follow
// the moon's seeded drift, so the marker always lands on the moon itself.
export function differencesForRound(roundNumber, layout) {
  const ids = ROUND_SETS[roundNumber - 1];
  return ids.map((id) => {
    const base = POOL_BY_ID.get(id);
    const diff = { ...base };
    if (id === 'crater') {
      diff.x = layout.moon.x;
      diff.y = layout.moon.y;
    } else if (id === 'star') {
      diff.x = layout.moon.x + 60;
      diff.y = layout.moon.y - 33;
    }
    return diff;
  });
}
