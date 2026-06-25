/**
 * src/utils/formatTime.js
 * Formats raw second counts into player-friendly minute and second labels.
 * Connects to: src/components/createPlayerView.js
 * Created: 2026-06-25
 */

/**
 * Converts seconds into an m:ss string for the player UI.
 * @param {number} totalSeconds The time value in seconds.
 * @returns {string} A formatted time string.
 */
export function formatTime(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) && totalSeconds > 0
    ? Math.floor(totalSeconds)
    : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

