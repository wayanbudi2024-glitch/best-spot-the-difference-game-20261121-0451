// Lantern Lane — drawing only. Every pixel of the game is painted here
// with canvas vector shapes: the HUD, both picture panels, the markers,
// the hint ring, the wrong-click flash, the crosshair and every overlay
// screen. No images, no external assets.

import {
  PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT, HUD_HEIGHT, PANEL_TOP, PANEL_WIDTH,
  PANEL_HEIGHT, PANEL_LEFT_X, PANEL_RIGHT_X, BOTTOM_BAR_TOP, PALETTE, SKY,
  LOW_TIME_SECONDS,
} from './config.js';
import { WINDOWS } from './scene.js';

const PANELS = [
  { letter: 'A', x: PANEL_LEFT_X },
  { letter: 'B', x: PANEL_RIGHT_X },
];

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function star(ctx, x, y, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

// ---------------------------------------------------------------- scene

function drawCloud(ctx, x, y, s) {
  ctx.fillStyle = 'rgba(232, 222, 246, 0.72)';
  ellipse(ctx, x, y, 34 * s, 15 * s); ctx.fill();
  ellipse(ctx, x - 22 * s, y + 5 * s, 22 * s, 11 * s); ctx.fill();
  ellipse(ctx, x + 24 * s, y + 5 * s, 24 * s, 12 * s); ctx.fill();
}

function drawWindow(ctx, w, lit) {
  ctx.fillStyle = '#241d45';
  roundRect(ctx, w.x - w.w / 2 - 3, w.y - w.h / 2 - 3, w.w + 6, w.h + 6, 4);
  ctx.fill();
  if (lit) {
    const glow = ctx.createRadialGradient(w.x, w.y, 4, w.x, w.y, 34);
    glow.addColorStop(0, 'rgba(255, 214, 130, 0.55)');
    glow.addColorStop(1, 'rgba(255, 214, 130, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(w.x - 34, w.y - 34, 68, 68);
    ctx.fillStyle = '#ffd98a';
  } else {
    ctx.fillStyle = '#2c3550';
  }
  roundRect(ctx, w.x - w.w / 2, w.y - w.h / 2, w.w, w.h, 3);
  ctx.fill();
  if (lit) {
    ctx.strokeStyle = 'rgba(120, 70, 20, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w.x, w.y - w.h / 2);
    ctx.lineTo(w.x, w.y + w.h / 2);
    ctx.moveTo(w.x - w.w / 2, w.y);
    ctx.lineTo(w.x + w.w / 2, w.y);
    ctx.stroke();
  }
}

function drawDoor(ctx, cx, top, w, h, colour) {
  ctx.fillStyle = '#241d45';
  ctx.fillRect(cx - w / 2 - 3, top - 3, w + 6, h + 3);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, top + h);
  ctx.lineTo(cx - w / 2, top + w / 2);
  ctx.arc(cx, top + w / 2, w / 2, Math.PI, 0);
  ctx.lineTo(cx + w / 2, top + h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.arc(cx + w / 2 - 7, top + h / 2 + 6, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawHouse(ctx, x, w, wallTop, wallBottom, peakY, wallColour, roofColour) {
  ctx.fillStyle = wallColour;
  ctx.fillRect(x, wallTop, w, wallBottom - wallTop);
  ctx.fillStyle = roofColour;
  ctx.beginPath();
  ctx.moveTo(x - 8, wallTop);
  ctx.lineTo(x + w / 2, peakY);
  ctx.lineTo(x + w + 8, wallTop);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, peakY);
  ctx.lineTo(x + w + 8, wallTop);
  ctx.lineTo(x + w, wallTop);
  ctx.lineTo(x + w / 2, peakY + 14);
  ctx.closePath();
  ctx.fill();
}

function drawChimney(ctx, x, top, bottom) {
  ctx.fillStyle = '#5a3a3a';
  ctx.fillRect(x, top, 24, bottom - top);
  ctx.fillStyle = '#7a4a4a';
  ctx.fillRect(x - 3, top - 6, 30, 8);
}

function drawSmoke(ctx, x, y) {
  const puffs = [
    { dx: 0, dy: 0, r: 9 },
    { dx: -8, dy: -15, r: 11 },
    { dx: 8, dy: -27, r: 13 },
    { dx: -2, dy: -43, r: 14 },
  ];
  for (const p of puffs) {
    ctx.fillStyle = 'rgba(214, 206, 228, 0.5)';
    ellipse(ctx, x + p.dx, y + p.dy, p.r, p.r * 0.85);
    ctx.fill();
  }
}

function drawCat(ctx, x, y) {
  ctx.fillStyle = '#2e2a38';
  ellipse(ctx, x, y + 6, 13, 10); ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 8, y - 6, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 11); ctx.lineTo(x + 4, y - 19); ctx.lineTo(x + 8, y - 12);
  ctx.moveTo(x + 11, y - 13); ctx.lineTo(x + 14, y - 20); ctx.lineTo(x + 16, y - 11);
  ctx.fill();
  ctx.strokeStyle = '#2e2a38';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 10);
  ctx.quadraticCurveTo(x - 22, y + 2, x - 18, y - 8);
  ctx.stroke();
}

function drawLantern(ctx, x, y, colour) {
  ctx.strokeStyle = '#1d1830';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y + 16);
  ctx.lineTo(x, 522);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + 16);
  ctx.quadraticCurveTo(x + 14, y + 4, x + 10, y - 8);
  ctx.stroke();
  const glow = ctx.createRadialGradient(x, y, 2, x, y, 46);
  glow.addColorStop(0, colour === '#ffb347' ? 'rgba(255, 179, 71, 0.55)' : 'rgba(77, 208, 196, 0.55)');
  glow.addColorStop(1, 'rgba(255, 179, 71, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 46, y - 46, 92, 92);
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(x - 11, y - 16, 22, 5);
  ctx.fillStyle = colour;
  roundRect(ctx, x - 9, y - 11, 18, 24, 5);
  ctx.fill();
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(x - 11, y + 13, 22, 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillRect(x - 2, y - 7, 4, 16);
}

function drawBicycle(ctx, withBasket) {
  ctx.strokeStyle = '#1d1830';
  ctx.lineWidth = 3;
  for (const wx of [64, 128]) {
    ctx.beginPath();
    ctx.arc(wx, 498, 15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wx - 15, 498); ctx.lineTo(wx + 15, 498);
    ctx.moveTo(wx, 483); ctx.lineTo(wx, 513);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(64, 498); ctx.lineTo(92, 470); ctx.lineTo(128, 498);
  ctx.moveTo(92, 470); ctx.lineTo(118, 468);
  ctx.moveTo(92, 470); ctx.lineTo(76, 470);
  ctx.stroke();
  ctx.fillStyle = '#1d1830';
  ctx.fillRect(70, 466, 16, 5);
  ctx.beginPath();
  ctx.moveTo(118, 468); ctx.lineTo(112, 458);
  ctx.stroke();
  if (withBasket) {
    ctx.fillStyle = '#8a6a3f';
    ctx.beginPath();
    ctx.moveTo(92, 468); ctx.lineTo(120, 468); ctx.lineTo(116, 492); ctx.lineTo(96, 492);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(60, 40, 15, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(96, 476); ctx.lineTo(118, 476);
    ctx.moveTo(97, 484); ctx.lineTo(117, 484);
    ctx.stroke();
  }
}

// The street scene itself, painted in panel-local coordinates.
// `active` is the set of difference ids the panel shows: empty for the
// left picture, the round's seven for the right one.
export function drawScene(ctx, layout, active, nowMs) {
  const has = (id) => active.has(id);

  // Sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, SKY.top);
  sky.addColorStop(0.45, SKY.middle);
  sky.addColorStop(0.8, SKY.low);
  sky.addColorStop(1, SKY.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 600, 440);

  // Stars, twinkling slowly.
  for (const s of layout.stars) {
    const a = 0.45 + 0.4 * Math.sin(nowMs / 700 + s.tw);
    ctx.fillStyle = `rgba(255, 244, 214, ${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moon and its craters; one crater is the difference.
  const m = layout.moon;
  const moonGlow = ctx.createRadialGradient(m.x, m.y, 6, m.x, m.y, 64);
  moonGlow.addColorStop(0, 'rgba(245, 238, 218, 0.5)');
  moonGlow.addColorStop(1, 'rgba(245, 238, 218, 0)');
  ctx.fillStyle = moonGlow;
  ctx.fillRect(m.x - 64, m.y - 64, 128, 128);
  ctx.fillStyle = '#f5eeda';
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(190, 175, 140, 0.55)';
  for (const c of m.craters) {
    if (c.dx === 0 && c.dy === 0 && has('crater')) continue;
    ctx.beginPath();
    ctx.arc(m.x + c.dx, m.y + c.dy, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (has('star')) {
    ctx.fillStyle = '#fff6d8';
    star(ctx, m.x + 60, m.y - 33, 7, 4);
    ctx.fill();
  }

  // Clouds.
  for (const c of layout.clouds) drawCloud(ctx, c.x, c.y, c.s);
  if (has('cloud')) drawCloud(ctx, 120, 110, 1.05);

  // The wire across the sky, with its bird.
  ctx.strokeStyle = 'rgba(20, 14, 38, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= 600; x += 12) {
    const y = 170 + 22 * Math.sin((Math.PI * x) / 600);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  if (!has('bird')) {
    ctx.fillStyle = '#171226';
    ellipse(ctx, 280, 188, 9, 6); ctx.fill();
    ctx.beginPath();
    ctx.arc(287, 184, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(272, 188); ctx.lineTo(262, 184); ctx.lineTo(272, 192);
    ctx.fill();
  }

  // Distant rooftops behind the houses.
  ctx.fillStyle = '#241a3d';
  ctx.beginPath();
  ctx.moveTo(0, 440);
  ctx.lineTo(0, 372); ctx.lineTo(60, 348); ctx.lineTo(120, 372); ctx.lineTo(180, 352);
  ctx.lineTo(240, 374); ctx.lineTo(300, 350); ctx.lineTo(360, 372); ctx.lineTo(430, 352);
  ctx.lineTo(500, 374); ctx.lineTo(560, 354); ctx.lineTo(600, 372); ctx.lineTo(600, 440);
  ctx.closePath();
  ctx.fill();

  // Left house: warm orange, red door that can turn teal.
  drawHouse(ctx, 30, 160, 300, 440, 240, '#c96f3f', '#7a3b2e');
  for (const w of WINDOWS) {
    if (w.id === 'w1' || w.id === 'w2') drawWindow(ctx, w, layout.litWindows.has(w.id));
  }
  drawDoor(ctx, 95, 380, 34, 60, has('door') ? '#2e8b8b' : '#b03a2e');

  // Middle house: purple, chimney and smoke, sign, flower box.
  drawHouse(ctx, 210, 180, 225, 440, 170, '#6b4a8f', '#4a2f66');
  drawChimney(ctx, 338, 165, 228);
  if (!has('smoke')) drawSmoke(ctx, 350, 150);
  for (const w of WINDOWS) {
    if (w.id === 'w3') drawWindow(ctx, w, layout.litWindows.has(w.id));
    if (w.id === 'w4') drawWindow(ctx, w, !has('window') && layout.litWindows.has(w.id));
    if (w.id === 'w5') drawWindow(ctx, w, layout.litWindows.has(w.id));
  }
  drawDoor(ctx, 300, 385, 36, 55, '#3f6b4a');
  // Hanging sign beside the door.
  ctx.strokeStyle = '#1d1830';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(240, 358); ctx.lineTo(240, 368);
  ctx.stroke();
  ctx.fillStyle = has('sign') ? '#3fa08a' : '#f0d9a0';
  roundRect(ctx, 222, 368, 36, 26, 4);
  ctx.fill();
  ctx.fillStyle = has('sign') ? '#eaf6f0' : '#7a5a2a';
  ctx.fillRect(229, 378, 22, 3);
  ctx.fillRect(229, 385, 14, 3);
  // Flower box under the lower window, with one extra bloom possible.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(290, 388, 50, 14);
  const blooms = [
    { x: 298, y: 386, c: '#e86a8a' },
    { x: 310, y: 384, c: '#ffd34d' },
    { x: 322, y: 386, c: '#e86a8a' },
    { x: 332, y: 384, c: '#c98ae8' },
  ];
  if (has('flower')) blooms.push({ x: 310, y: 392, c: '#ff8a5c' });
  for (const b of blooms) {
    ctx.fillStyle = '#3a7040';
    ctx.beginPath();
    ctx.arc(b.x, b.y + 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = b.c;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Right house: teal-green, round attic window, its own chimney.
  drawHouse(ctx, 420, 160, 270, 440, 210, '#3f7a6b', '#2c5348');
  if (!has('chimney')) drawChimney(ctx, 508, 195, 252);
  if (has('attic')) {
    ctx.fillStyle = '#ffd98a';
    ctx.fillRect(490 - 14, 300 - 14, 28, 28);
    ctx.strokeStyle = '#241d45';
    ctx.lineWidth = 3;
    ctx.strokeRect(490 - 14, 300 - 14, 28, 28);
  } else {
    ctx.fillStyle = '#241d45';
    ctx.beginPath();
    ctx.arc(490, 300, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath();
    ctx.arc(490, 300, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120, 70, 20, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(490, 285); ctx.lineTo(490, 315);
    ctx.moveTo(475, 300); ctx.lineTo(505, 300);
    ctx.stroke();
  }
  for (const w of WINDOWS) {
    if (w.id === 'w6' || w.id === 'w7') drawWindow(ctx, w, layout.litWindows.has(w.id));
  }
  drawDoor(ctx, 500, 395, 34, 45, '#8a5a2e');

  // Tree at the left edge, with its apples.
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(12, 300, 16, 140);
  ctx.fillStyle = '#2c5a34';
  ctx.beginPath();
  ctx.arc(45, 255, 42, 0, Math.PI * 2);
  ctx.arc(18, 282, 30, 0, Math.PI * 2);
  ctx.arc(72, 278, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a7040';
  ctx.beginPath();
  ctx.arc(45, 245, 26, 0, Math.PI * 2);
  ctx.arc(66, 268, 18, 0, Math.PI * 2);
  ctx.fill();
  for (const a of layout.apples) {
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
    ctx.fill();
  }
  if (has('apple')) {
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath();
    ctx.arc(40, 270, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Low wall with the sitting cat.
  ctx.fillStyle = '#6a6478';
  ctx.fillRect(235, 425, 130, 27);
  ctx.fillStyle = '#8a8498';
  ctx.fillRect(232, 421, 136, 6);
  ctx.strokeStyle = 'rgba(30, 25, 50, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(275, 427); ctx.lineTo(275, 450);
  ctx.moveTo(320, 427); ctx.lineTo(320, 450);
  ctx.stroke();
  if (!has('cat')) drawCat(ctx, 300, 410);

  // Lantern posts: the left one stays amber, the right one can turn teal.
  drawLantern(ctx, 200, 345, '#ffb347');
  drawLantern(ctx, 450, 350, has('lantern') ? '#4dd0c4' : '#ffb347');

  // Bicycle with its basket.
  drawBicycle(ctx, !has('basket'));

  // Cobbled street.
  ctx.fillStyle = '#2e2a3e';
  ctx.fillRect(0, 440, 600, 112);
  ctx.strokeStyle = 'rgba(200, 190, 230, 0.16)';
  ctx.lineWidth = 2;
  for (const row of layout.cobbles) {
    for (let x = -20 + row.offset; x < 620; x += 52) {
      ctx.beginPath();
      ctx.arc(x, row.y, 22, Math.PI, 0);
      ctx.stroke();
    }
  }

  // Puddles catching the moonlight.
  ctx.fillStyle = '#4a5a8a';
  ellipse(ctx, 180, 525, 34, 8); ctx.fill();
  if (!has('puddle')) {
    ctx.fillStyle = '#4a5a8a';
    ellipse(ctx, 420, 520, 46, 10); ctx.fill();
    ctx.fillStyle = 'rgba(245, 238, 218, 0.5)';
    ellipse(ctx, 420, 518, 26, 4); ctx.fill();
  }
  ctx.fillStyle = 'rgba(245, 238, 218, 0.35)';
  ellipse(ctx, 180, 524, 18, 3); ctx.fill();
}

// ------------------------------------------------------------------ HUD

function drawHud(ctx, state) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, PLAYFIELD_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, HUD_HEIGHT - 2, PLAYFIELD_WIDTH, 2);

  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.title;
  ctx.font = '700 26px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'left';
  ctx.fillText('Lantern Lane', 28, 34);

  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '600 19px system-ui, sans-serif';
  ctx.fillText(`Round ${state.round.number} of 5`, 320, 34);

  ctx.textAlign = 'center';
  ctx.font = '700 21px system-ui, sans-serif';
  ctx.fillStyle = PALETTE.accentGold;
  ctx.fillText(`Found ${state.found.size} / ${state.round.differences.length}`, 640, 34);

  // Timer bar with the seconds left.
  const frac = Math.max(0, state.timeLeft / 90);
  const barX = 748;
  const barW = 210;
  ctx.fillStyle = '#241d45';
  roundRect(ctx, barX, 22, barW, 20, 10);
  ctx.fill();
  ctx.fillStyle = state.timeLeft <= LOW_TIME_SECONDS ? '#ff6a5a' : state.timeLeft <= 30 ? '#ffb347' : '#58d68d';
  if (frac > 0) {
    roundRect(ctx, barX, 22, Math.max(20, barW * frac), 20, 10);
    ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.fillText(`${Math.ceil(state.timeLeft)}s`, barX + barW / 2, 33);

  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '600 19px system-ui, sans-serif';
  ctx.fillText(`Score ${state.score}`, 990, 34);
  ctx.fillText(`Hints ${state.hintsLeft}`, 1150, 34);
}

function drawBottomBar(ctx, state) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, BOTTOM_BAR_TOP, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT - BOTTOM_BAR_TOP);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, BOTTOM_BAR_TOP, PLAYFIELD_WIDTH, 2);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.message;
  ctx.font = '600 19px system-ui, sans-serif';
  ctx.fillText(state.message, PLAYFIELD_WIDTH / 2, 658);
  ctx.fillStyle = PALETTE.hudDim;
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText(
    'Click a difference in either picture  •  H hint (−25 pts)  •  P pause  •  M mute  •  Arrow keys move the crosshair, Enter selects',
    PLAYFIELD_WIDTH / 2,
    692,
  );
  if (state.muted) {
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.wrongRed;
    ctx.font = '600 14px system-ui, sans-serif';
    ctx.fillText('sound muted', PLAYFIELD_WIDTH - 24, 692);
  }
}

// -------------------------------------------------------------- markers

function drawCheck(ctx, x, y, r) {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.1, y + r * 0.38);
  ctx.lineTo(x + r * 0.5, y - r * 0.4);
  ctx.stroke();
}

function drawFoundMarkers(ctx, state) {
  for (const diff of state.round.differences) {
    if (!state.found.has(diff.id)) continue;
    for (const panel of PANELS) {
      const x = panel.x + diff.x;
      const y = PANEL_TOP + diff.y;
      ctx.strokeStyle = PALETTE.foundGreen;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, diff.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(88, 214, 141, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, diff.r, 0, Math.PI * 2);
      ctx.fill();
      drawCheck(ctx, x, y, diff.r);
    }
  }
}

function drawHintRing(ctx, state, nowMs) {
  if (!state.hintPulse) return;
  const diff = state.round.differences.find((d) => d.id === state.hintPulse.id);
  if (!diff) return;
  const pulse = 1 + 0.18 * Math.sin(nowMs / 120);
  const r = (diff.r + 7) * pulse;
  for (const panel of PANELS) {
    ctx.strokeStyle = PALETTE.hintGold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(panel.x + diff.x, PANEL_TOP + diff.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawFlashes(ctx, state, nowMs) {
  for (const flash of state.flashes) {
    const age = nowMs - flash.at;
    if (age > 650) continue;
    const alpha = 1 - age / 650;
    ctx.strokeStyle = `rgba(255, 90, 90, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const s = 12;
    ctx.beginPath();
    ctx.moveTo(flash.x - s, flash.y - s); ctx.lineTo(flash.x + s, flash.y + s);
    ctx.moveTo(flash.x + s, flash.y - s); ctx.lineTo(flash.x - s, flash.y + s);
    ctx.stroke();
  }
}

function drawCrosshair(ctx, state) {
  if (!state.crosshairVisible || state.screen !== 'play') return;
  const { x, y } = state.crosshair;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 17, y); ctx.lineTo(x - 6, y);
  ctx.moveTo(x + 6, y); ctx.lineTo(x + 17, y);
  ctx.moveTo(x, y - 17); ctx.lineTo(x, y - 6);
  ctx.moveTo(x, y + 6); ctx.lineTo(x, y + 17);
  ctx.stroke();
}

// ------------------------------------------------------------- overlays

function overlayPanel(ctx, x, y, w, h) {
  ctx.fillStyle = PALETTE.overlay;
  ctx.fillRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);
  ctx.fillStyle = PALETTE.overlayPanel;
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = PALETTE.accentGold;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();
}

function drawTitle(ctx, state, nowMs) {
  overlayPanel(ctx, 240, 130, 800, 460);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.title;
  ctx.font = '700 56px Georgia, "Times New Roman", serif';
  ctx.fillText('Lantern Lane', 640, 205);
  ctx.fillStyle = PALETTE.subtitle;
  ctx.font = 'italic 21px Georgia, serif';
  ctx.fillText('A spot-the-difference evening stroll', 640, 252);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '17px system-ui, sans-serif';
  const lines = [
    'Two pictures of the same lantern-lit street. Seven small things changed',
    'between them — a colour, a cat that wandered off, a star that was not there.',
    'Find all seven before the lanterns burn down. Five rounds, and each',
    'round hides its differences a little better than the last.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 640, 300 + i * 26));
  if (state.best > 0) {
    ctx.fillStyle = PALETTE.accentGold;
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillText(`Best score: ${state.best}`, 640, 428);
  }
  ctx.fillStyle = `rgba(255, 233, 184, ${0.65 + 0.35 * Math.sin(nowMs / 400)})`;
  ctx.font = '700 20px system-ui, sans-serif';
  ctx.fillText('Click anywhere or press Enter to begin', 640, 500);
  ctx.fillStyle = PALETTE.hudDim;
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Mouse or arrow keys + Enter  •  H hint  •  P pause  •  M mute', 640, 545);
}

function drawPaused(ctx) {
  overlayPanel(ctx, 390, 250, 500, 220);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.title;
  ctx.font = '700 44px Georgia, serif';
  ctx.fillText('Paused', 640, 320);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText('The lanterns wait for you.', 640, 372);
  ctx.fillText('Press P or Esc to keep hunting.', 640, 404);
}

function drawRoundComplete(ctx, state) {
  overlayPanel(ctx, 340, 160, 600, 400);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.title;
  ctx.font = '700 38px Georgia, serif';
  ctx.fillText(`Round ${state.round.number} complete!`, 640, 220);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < state.lastStars ? PALETTE.starGold : PALETTE.starDim;
    ctx.font = '46px system-ui, sans-serif';
    ctx.fillText('★', 570 + i * 70, 292);
  }
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '20px system-ui, sans-serif';
  ctx.fillText(`Found ${state.found.size} / ${state.round.differences.length} differences`, 640, 348);
  if (state.lastTimeBonus > 0) {
    ctx.fillStyle = PALETTE.accentGold;
    ctx.fillText(`Time bonus  +${state.lastTimeBonus}`, 640, 382);
  }
  ctx.fillStyle = PALETTE.hudText;
  ctx.fillText(`Score  ${state.score}`, 640, 416);
  ctx.fillStyle = PALETTE.message;
  ctx.font = '700 19px system-ui, sans-serif';
  ctx.fillText(
    state.round.number < 5 ? 'Press Space for the next round' : 'Press Space for the final tally',
    640,
    486,
  );
}

function drawGameOver(ctx, state) {
  overlayPanel(ctx, 300, 110, 680, 500);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.title;
  ctx.font = '700 38px Georgia, serif';
  ctx.fillText('Lantern Lane complete!', 640, 168);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '22px system-ui, sans-serif';
  ctx.fillText(`Total score  ${state.score}`, 640, 222);
  ctx.fillStyle = PALETTE.accentGold;
  ctx.font = '600 19px system-ui, sans-serif';
  ctx.fillText(
    state.newBest ? `New best score!  (was ${state.previousBest})` : `Best score  ${state.best}`,
    640,
    256,
  );
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = '18px system-ui, sans-serif';
  state.roundResults.forEach((r, i) => {
    const stars = '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars);
    ctx.fillText(
      `Round ${r.round} — ${r.found}/7  ${stars}  +${r.bonus} time bonus`,
      640,
      306 + i * 30,
    );
  });
  ctx.fillStyle = PALETTE.message;
  ctx.font = '700 19px system-ui, sans-serif';
  ctx.fillText('Click or press Enter to stroll the lane again', 640, 540);
}

// -------------------------------------------------------------- top level

export function drawGame(ctx, state, nowMs) {
  ctx.fillStyle = PALETTE.page;
  ctx.fillRect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT);

  drawHud(ctx, state);

  // Both picture panels.
  for (const panel of PANELS) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT);
    ctx.clip();
    ctx.translate(panel.x, PANEL_TOP);
    drawScene(ctx, state.layout, panel.letter === 'A' ? new Set() : state.round.activeIds, nowMs);
    ctx.restore();
    ctx.strokeStyle = PALETTE.panelBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(panel.x, PANEL_TOP, PANEL_WIDTH, PANEL_HEIGHT);
    // Letter badge.
    ctx.fillStyle = PALETTE.panelLabel;
    ctx.beginPath();
    ctx.arc(panel.x + 22, PANEL_TOP + 22, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 17px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(panel.letter, panel.x + 22, PANEL_TOP + 23);
  }

  drawFoundMarkers(ctx, state);
  drawHintRing(ctx, state, nowMs);
  drawFlashes(ctx, state, nowMs);
  drawCrosshair(ctx, state);
  drawBottomBar(ctx, state);

  if (state.screen === 'title') drawTitle(ctx, state, nowMs);
  else if (state.screen === 'paused') drawPaused(ctx);
  else if (state.screen === 'round') drawRoundComplete(ctx, state);
  else if (state.screen === 'over') drawGameOver(ctx, state);
}
