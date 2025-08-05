import { appConfig } from '$lib/config/appConfig';

/**
 * Applies the theme colors from the configuration to CSS variables
 */
export function applyThemeColors() {
  const root = document.documentElement;
  const { colors } = appConfig;

  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--accent-red', colors.accent_red);
  root.style.setProperty('--accent-orange', colors.accent_orange);
  root.style.setProperty('--accent-green', colors.accent_green);
  root.style.setProperty('--bg-dark', colors.bg_dark);
  root.style.setProperty('--bg-card', colors.bg_card);
  root.style.setProperty('--border', colors.border);
} 