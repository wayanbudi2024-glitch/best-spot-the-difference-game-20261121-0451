// Lantern Lane — tuning numbers and the evening palette.
// One place for every magic number the rest of the game reads, so a
// balance change never means hunting through the drawing code.

export const PLAYFIELD_WIDTH = 1280;
export const PLAYFIELD_HEIGHT = 720;

export const HUD_HEIGHT = 64;
export const PANEL_TOP = 76;
export const PANEL_WIDTH = 600;
export const PANEL_HEIGHT = 552;
export const PANEL_LEFT_X = 24;
export const PANEL_RIGHT_X = 656;
export const BOTTOM_BAR_TOP = 628;

export const PANEL_INNER_WIDTH = 600;
export const PANEL_INNER_HEIGHT = 552;

export const ROUNDS_TOTAL = 5;
export const DIFFERENCES_PER_ROUND = 7;
export const ROUND_SECONDS = 90;
export const HINTS_PER_ROUND = 3;

export const POINTS_PER_FIND = 100;
export const POINTS_PER_COMBO_STEP = 10;
export const POINTS_PER_SECOND_LEFT = 5;
export const HINT_COST = 25;
export const WRONG_CLICK_TIME_COST = 5;
export const HINT_RING_MILLISECONDS = 1500;
export const WRONG_FLASH_MILLISECONDS = 650;
export const LOW_TIME_SECONDS = 10;

export const BEST_SCORE_KEY = 'lantern-lane.best';

export const SKY = {
  top: '#1b1440',
  middle: '#4a2a63',
  low: '#8a4a6b',
  horizon: '#e08a4c',
};

export const PALETTE = {
  page: '#0d0b1e',
  hud: '#171233',
  hudLine: '#3a2f66',
  hudText: '#f4ead8',
  hudDim: '#b8aed6',
  panelBorder: '#5a4a86',
  panelLabel: '#241d45',
  message: '#ffe9b8',
  accentGold: '#ffcf5c',
  foundGreen: '#58d68d',
  foundDark: '#1e7a46',
  wrongRed: '#ff5a5a',
  hintGold: '#ffd34d',
  starGold: '#ffcf5c',
  starDim: '#4a4266',
  overlay: 'rgba(13, 9, 32, 0.82)',
  overlayPanel: 'rgba(30, 22, 58, 0.92)',
  title: '#ffd98a',
  subtitle: '#e8d9b8',
};
