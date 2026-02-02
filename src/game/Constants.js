export const GAME_WIDTH = 540; // Logical width (9:16 approx qHD)
export const GAME_HEIGHT = 960; // Logical height
export const PLAYER_RADIUS = 20;
export const PLAYER_SPEED = 400; // Pixels per second
export const SPAWN_RATE_INITIAL = 1.0; // Seconds between spawns
export const GAME_DURATION = 40; // Seconds

export const COLORS = {
  BACKGROUND: '#4A0E0E', // Deeper Berry Red (Base) - Will act as fog/deep tissue
  SAFE_ZONE: '#FFB6C1', // Light Pink (Bubblegum)
  KILL_ZONE: '#2D0606', // Very Dark Red (Danger)
  PLAYER: '#E0F7FA', // Cyan White (Glowing)
  PLAYER_GLOW: '#00FFFF', // Cyan Neon
  ENEMY_GERM: '#00FF00', // Neon Green (Lime)
  ENEMY_BACTERIA: '#D500F9', // Neon Purple (Magenta)
  ENEMY_VIRUS: '#FFFF00', // Neon Yellow
};

// Safe Zone is the center 80% (Base width before curve)
export const SAFE_ZONE_WIDTH_PCT = 0.65; // Reduced slightly to allow for swinging
export const SAFE_ZONE_BASE_WIDTH = GAME_WIDTH * SAFE_ZONE_WIDTH_PCT;

// Winding Path Constants
export const SCROLL_SPEED = 150; // Pixels per second (World scrolling down)
export const PATH_AMPLITUDE = 80; // Max deviation from center in pixels
export const PATH_FREQUENCY = 0.002; // How frequent the curve is (per pixel of World Y)
