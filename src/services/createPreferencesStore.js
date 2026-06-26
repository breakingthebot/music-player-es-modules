/**
 * src/services/createPreferencesStore.js
 * Loads and saves lightweight player preferences to browser storage.
 * Connects to: src/main.js, src/config/appConfig.js, src/utils/clampNumber.js
 * Created: 2026-06-25
 */

import { DEFAULT_VOLUME, REPEAT_MODES, SORT_MODES, STORAGE_KEY } from "../config/appConfig.js";
import { clampNumber } from "../utils/clampNumber.js";
import { logger } from "../utils/logger.js";

/**
 * Creates a small preference store around Web Storage.
 * @param {Storage} storage The browser storage implementation to use.
 * @returns {{
 *   load: () => { favoriteTrackIds: string[], isMuted: boolean, isShuffleEnabled: boolean, recentTrackIds: string[], repeatMode: string, selectedTrackId: string | null, sortMode: string, trackProgressSeconds: Record<string, number>, volume: number },
 *   save: (preferences: { favoriteTrackIds: string[], isMuted: boolean, isShuffleEnabled: boolean, recentTrackIds: string[], repeatMode: string, selectedTrackId: string | null, sortMode: string, trackProgressSeconds: Record<string, number>, volume: number }) => void
 * }}
 */
export function createPreferencesStore(storage) {
  /**
   * Returns the default preference set.
   * @returns {{ favoriteTrackIds: string[], isMuted: boolean, isShuffleEnabled: boolean, recentTrackIds: string[], repeatMode: string, selectedTrackId: string | null, sortMode: string, trackProgressSeconds: Record<string, number>, volume: number }}
   */
  function getDefaults() {
    return {
      favoriteTrackIds: [],
      isMuted: false,
      isShuffleEnabled: false,
      recentTrackIds: [],
      repeatMode: REPEAT_MODES.OFF,
      selectedTrackId: null,
      sortMode: SORT_MODES.DEFAULT,
      trackProgressSeconds: {},
      volume: DEFAULT_VOLUME
    };
  }

  return {
    /**
     * Loads persisted preferences or returns safe defaults.
     * @returns {{ favoriteTrackIds: string[], isMuted: boolean, isShuffleEnabled: boolean, recentTrackIds: string[], repeatMode: string, selectedTrackId: string | null, sortMode: string, trackProgressSeconds: Record<string, number>, volume: number }}
     */
    load() {
      const defaults = getDefaults();

      if (!storage) {
        return defaults;
      }

      try {
        const rawValue = storage.getItem(STORAGE_KEY);

        if (!rawValue) {
          return defaults;
        }

        const parsedValue = JSON.parse(rawValue);

        return {
          favoriteTrackIds: Array.isArray(parsedValue.favoriteTrackIds)
            ? parsedValue.favoriteTrackIds.filter((trackId) => typeof trackId === "string")
            : [],
          isMuted: Boolean(parsedValue.isMuted),
          isShuffleEnabled: Boolean(parsedValue.isShuffleEnabled),
          recentTrackIds: Array.isArray(parsedValue.recentTrackIds)
            ? parsedValue.recentTrackIds.filter((trackId) => typeof trackId === "string")
            : [],
          repeatMode: Object.values(REPEAT_MODES).includes(parsedValue.repeatMode)
            ? parsedValue.repeatMode
            : REPEAT_MODES.OFF,
          selectedTrackId: typeof parsedValue.selectedTrackId === "string"
            ? parsedValue.selectedTrackId
            : null,
          sortMode: Object.values(SORT_MODES).includes(parsedValue.sortMode)
            ? parsedValue.sortMode
            : SORT_MODES.DEFAULT,
          trackProgressSeconds: typeof parsedValue.trackProgressSeconds === "object" && parsedValue.trackProgressSeconds !== null
            ? Object.fromEntries(
              Object.entries(parsedValue.trackProgressSeconds).filter(([trackId, seconds]) => {
                return typeof trackId === "string" && Number.isFinite(Number(seconds)) && Number(seconds) >= 0;
              }).map(([trackId, seconds]) => [trackId, Math.floor(Number(seconds))])
            )
            : {},
          volume: clampNumber(Number(parsedValue.volume), 0, 1, DEFAULT_VOLUME)
        };
      } catch (error) {
        logger.warn("Failed to load player preferences.", {
          error: error instanceof Error ? error.message : "Unknown error"
        });

        return defaults;
      }
    },

    /**
     * Persists the latest player preferences for the next visit.
     * @param {{ favoriteTrackIds: string[], isMuted: boolean, isShuffleEnabled: boolean, recentTrackIds: string[], repeatMode: string, selectedTrackId: string | null, sortMode: string, trackProgressSeconds: Record<string, number>, volume: number }} preferences The preferences to store.
     * @returns {void}
     */
    save(preferences) {
      if (!storage) {
        return;
      }

      try {
        storage.setItem(STORAGE_KEY, JSON.stringify({
          favoriteTrackIds: Array.isArray(preferences.favoriteTrackIds)
            ? preferences.favoriteTrackIds.filter((trackId) => typeof trackId === "string")
            : [],
          isMuted: Boolean(preferences.isMuted),
          isShuffleEnabled: Boolean(preferences.isShuffleEnabled),
          recentTrackIds: Array.isArray(preferences.recentTrackIds)
            ? preferences.recentTrackIds.filter((trackId) => typeof trackId === "string")
            : [],
          repeatMode: Object.values(REPEAT_MODES).includes(preferences.repeatMode)
            ? preferences.repeatMode
            : REPEAT_MODES.OFF,
          selectedTrackId: typeof preferences.selectedTrackId === "string"
            ? preferences.selectedTrackId
            : null,
          sortMode: Object.values(SORT_MODES).includes(preferences.sortMode)
            ? preferences.sortMode
            : SORT_MODES.DEFAULT,
          trackProgressSeconds: typeof preferences.trackProgressSeconds === "object" && preferences.trackProgressSeconds !== null
            ? Object.fromEntries(
              Object.entries(preferences.trackProgressSeconds).filter(([trackId, seconds]) => {
                return typeof trackId === "string" && Number.isFinite(Number(seconds)) && Number(seconds) >= 0;
              }).map(([trackId, seconds]) => [trackId, Math.floor(Number(seconds))])
            )
            : {},
          volume: clampNumber(Number(preferences.volume), 0, 1, DEFAULT_VOLUME)
        }));
      } catch (error) {
        logger.warn("Failed to save player preferences.", {
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  };
}
