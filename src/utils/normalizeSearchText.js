/**
 * src/utils/normalizeSearchText.js
 * Normalizes free-text input for consistent case-insensitive playlist search.
 * Connects to: src/services/filterTracks.js
 * Created: 2026-06-25
 */

/**
 * Normalizes a search string by trimming whitespace and lowercasing it.
 * @param {string} value The raw user-provided search value.
 * @returns {string} The normalized value used for search matching.
 */
export function normalizeSearchText(value) {
  return `${value}`.trim().toLowerCase();
}

