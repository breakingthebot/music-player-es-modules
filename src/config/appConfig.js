/**
 * src/config/appConfig.js
 * Centralizes user-facing playback labels and default configuration values.
 * Connects to: src/main.js, src/services/createPlayerController.js
 * Created: 2026-06-25
 */

export const APP_MESSAGES = {
  EMPTY_PLAYLIST: "No tracks are available yet.",
  LOAD_ERROR: "The selected track could not be played.",
  LOADING: "Loading tracks.",
  PAUSED: "Playback paused.",
  PLAYING: "Playback in progress."
};

export const SEEK_RANGE_MAX = 100;

