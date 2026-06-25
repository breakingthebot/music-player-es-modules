/**
 * src/services/filterTracks.js
 * Filters playlist tracks against a search query using title and artist fields.
 * Connects to: src/services/createPlayerController.js, src/utils/normalizeSearchText.js
 * Created: 2026-06-25
 */

import { FILTER_MODES } from "../config/appConfig.js";
import { normalizeSearchText } from "../utils/normalizeSearchText.js";

/**
 * Filters a playlist by matching normalized title and artist text.
 * @param {Array<{ artist: string, id: string, title: string }>} tracks The playlist tracks to filter.
 * @param {string} query The free-text query entered by the user.
 * @param {Set<string>} [favoriteTrackIds] The persisted favorite track identifiers.
 * @param {string} [filterMode] The active playlist mode.
 * @returns {Array<{ artist: string, id: string, title: string }>} The filtered track list.
 */
export function filterTracks(tracks, query, favoriteTrackIds = new Set(), filterMode = FILTER_MODES.ALL) {
  const normalizedQuery = normalizeSearchText(query);
  const modeFilteredTracks = filterMode === FILTER_MODES.FAVORITES
    ? tracks.filter((track) => favoriteTrackIds.has(track.id))
    : tracks;

  if (!normalizedQuery) {
    return modeFilteredTracks;
  }

  return modeFilteredTracks.filter((track) => {
    const searchableText = normalizeSearchText(`${track.title} ${track.artist}`);

    return searchableText.includes(normalizedQuery);
  });
}
