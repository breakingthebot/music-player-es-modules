/**
 * src/services/filterTracks.js
 * Filters playlist tracks against a search query using title and artist fields.
 * Connects to: src/services/createPlayerController.js, src/utils/normalizeSearchText.js
 * Created: 2026-06-25
 */

import { normalizeSearchText } from "../utils/normalizeSearchText.js";

/**
 * Filters a playlist by matching normalized title and artist text.
 * @param {Array<{ artist: string, title: string }>} tracks The playlist tracks to filter.
 * @param {string} query The free-text query entered by the user.
 * @returns {Array<{ artist: string, title: string }>} The filtered track list.
 */
export function filterTracks(tracks, query) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return tracks;
  }

  return tracks.filter((track) => {
    const searchableText = normalizeSearchText(`${track.title} ${track.artist}`);

    return searchableText.includes(normalizedQuery);
  });
}

