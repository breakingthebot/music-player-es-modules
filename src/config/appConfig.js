/**
 * src/config/appConfig.js
 * Centralizes user-facing playback labels and default configuration values.
 * Connects to: src/main.js, src/services/createPlayerController.js, src/services/createPreferencesStore.js
 * Created: 2026-06-25
 */

export const APP_MESSAGES = {
  BUFFERING: "Buffering track.",
  EMPTY_PLAYLIST: "No tracks are available yet.",
  FAVORITES_EMPTY: "No favorite tracks match the current filters.",
  LOAD_ERROR: "The selected track could not be played.",
  LOADING: "Loading tracks.",
  PAUSED: "Playback paused.",
  PLAYING: "Playback in progress.",
  READY: "Track ready.",
  SEARCH_EMPTY: "No tracks match the current search."
};

export const DEFAULT_VOLUME = 0.72;
export const FILTER_MODES = {
  ALL: "all",
  FAVORITES: "favorites"
};
export const MINIMUM_PROGRESS_SECONDS = 5;
export const RECENT_TRACK_LIMIT = 5;
export const SEEK_RANGE_MAX = 100;
export const STORAGE_KEY = "music-player-preferences";
export const VOLUME_RANGE_MAX = 100;
