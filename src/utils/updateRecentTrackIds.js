/**
 * src/utils/updateRecentTrackIds.js
 * Maintains a bounded most-recent-first track history without duplicates.
 * Connects to: src/services/createPlayerController.js
 * Created: 2026-06-25
 */

/**
 * Adds a track ID to recent history while keeping the newest items first.
 * @param {string[]} recentTrackIds The existing recent track ID list.
 * @param {string} trackId The track ID to insert.
 * @param {number} limit The maximum number of recent items to keep.
 * @returns {string[]} The updated recent track ID list.
 */
export function updateRecentTrackIds(recentTrackIds, trackId, limit) {
  const nextTrackIds = recentTrackIds.filter((currentTrackId) => currentTrackId !== trackId);
  nextTrackIds.unshift(trackId);

  return nextTrackIds.slice(0, limit);
}
