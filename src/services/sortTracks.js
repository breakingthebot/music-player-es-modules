/**
 * src/services/sortTracks.js
 * Sorts playlist tracks for presentation without mutating the original collection.
 * Connects to: src/services/createPlayerController.js, src/config/appConfig.js
 * Created: 2026-06-25
 */

import { SORT_MODES } from "../config/appConfig.js";

/**
 * Returns a sorted copy of tracks for the selected sort mode.
 * @param {Array<{ artist: string, durationSeconds: number, title: string }>} tracks The tracks to sort.
 * @param {string} sortMode The active sort mode.
 * @returns {Array<{ artist: string, durationSeconds: number, title: string }>} The sorted track copy.
 */
export function sortTracks(tracks, sortMode) {
  const copiedTracks = [...tracks];

  if (sortMode === SORT_MODES.TITLE_ASC) {
    return copiedTracks.sort((leftTrack, rightTrack) => leftTrack.title.localeCompare(rightTrack.title));
  }

  if (sortMode === SORT_MODES.ARTIST_ASC) {
    return copiedTracks.sort((leftTrack, rightTrack) => {
      return leftTrack.artist.localeCompare(rightTrack.artist) || leftTrack.title.localeCompare(rightTrack.title);
    });
  }

  if (sortMode === SORT_MODES.DURATION_ASC) {
    return copiedTracks.sort((leftTrack, rightTrack) => {
      return leftTrack.durationSeconds - rightTrack.durationSeconds || leftTrack.title.localeCompare(rightTrack.title);
    });
  }

  return copiedTracks;
}

