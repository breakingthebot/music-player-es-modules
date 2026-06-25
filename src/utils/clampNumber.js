/**
 * src/utils/clampNumber.js
 * Clamps numeric values into a safe range with a default fallback.
 * Connects to: src/services/createPlayerController.js, src/services/createPreferencesStore.js
 * Created: 2026-06-25
 */

/**
 * Clamps a numeric input between a minimum and maximum value.
 * @param {number} value The input value to clamp.
 * @param {number} minimum The lowest allowed number.
 * @param {number} maximum The highest allowed number.
 * @param {number} fallback The fallback value used for invalid input.
 * @returns {number} The clamped value.
 */
export function clampNumber(value, minimum, maximum, fallback) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(value, minimum), maximum);
}

