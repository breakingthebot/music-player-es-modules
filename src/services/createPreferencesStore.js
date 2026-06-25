/**
 * src/services/createPreferencesStore.js
 * Loads and saves lightweight player preferences to browser storage.
 * Connects to: src/main.js, src/config/appConfig.js, src/utils/clampNumber.js
 * Created: 2026-06-25
 */

import { DEFAULT_VOLUME, STORAGE_KEY } from "../config/appConfig.js";
import { clampNumber } from "../utils/clampNumber.js";
import { logger } from "../utils/logger.js";

/**
 * Creates a small preference store around Web Storage.
 * @param {Storage} storage The browser storage implementation to use.
 * @returns {{
 *   load: () => { isMuted: boolean, selectedTrackId: string | null, volume: number },
 *   save: (preferences: { isMuted: boolean, selectedTrackId: string | null, volume: number }) => void
 * }}
 */
export function createPreferencesStore(storage) {
  /**
   * Returns the default preference set.
   * @returns {{ isMuted: boolean, selectedTrackId: string | null, volume: number }}
   */
  function getDefaults() {
    return {
      isMuted: false,
      selectedTrackId: null,
      volume: DEFAULT_VOLUME
    };
  }

  return {
    /**
     * Loads persisted preferences or returns safe defaults.
     * @returns {{ isMuted: boolean, selectedTrackId: string | null, volume: number }}
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
          isMuted: Boolean(parsedValue.isMuted),
          selectedTrackId: typeof parsedValue.selectedTrackId === "string"
            ? parsedValue.selectedTrackId
            : null,
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
     * @param {{ isMuted: boolean, selectedTrackId: string | null, volume: number }} preferences The preferences to store.
     * @returns {void}
     */
    save(preferences) {
      if (!storage) {
        return;
      }

      try {
        storage.setItem(STORAGE_KEY, JSON.stringify({
          isMuted: Boolean(preferences.isMuted),
          selectedTrackId: typeof preferences.selectedTrackId === "string"
            ? preferences.selectedTrackId
            : null,
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

