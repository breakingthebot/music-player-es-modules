/**
 * src/components/createPlayerView.js
 * Owns DOM references and translates controller state into UI updates.
 * Connects to: src/components/renderPlaylist.js, src/utils/formatTime.js
 * Created: 2026-06-25
 */

import { SEEK_RANGE_MAX, VOLUME_RANGE_MAX } from "../config/appConfig.js";
import { renderPlaylist } from "./renderPlaylist.js";
import { formatTime } from "../utils/formatTime.js";

/**
 * Creates the DOM view adapter for the music player interface.
 * @param {{
 *   onFilterChange: (value: string) => void,
 *   onFilterModeChange: (value: string) => void,
 *   onNext: () => void,
 *   onPrevious: () => void,
 *   onSetVolume: (level: number) => void,
 *   onSeek: (ratio: number) => void,
 *   onToggleFavoriteTrack: (trackId: string) => void,
 *   onToggleMute: () => void,
 *   onTogglePlayback: () => void,
 *   onTrackSelect: (trackId: string) => void
 * }} callbacks Player interaction callbacks.
 * @returns {{ render: (state: object) => void }}
 */
export function createPlayerView(callbacks) {
  const trackTitle = document.querySelector("#track-title");
  const trackMeta = document.querySelector("#track-meta");
  const currentTime = document.querySelector("#current-time");
  const duration = document.querySelector("#duration");
  const playerMessage = document.querySelector("#player-message");
  const seekSlider = document.querySelector("#seek-slider");
  const volumeSlider = document.querySelector("#volume-slider");
  const playButton = document.querySelector("#play-button");
  const muteButton = document.querySelector("#mute-button");
  const previousButton = document.querySelector("#previous-button");
  const nextButton = document.querySelector("#next-button");
  const allTracksButton = document.querySelector("#all-tracks-button");
  const favoriteTracksButton = document.querySelector("#favorite-tracks-button");
  const playlistSearchInput = document.querySelector("#playlist-search");
  const clearSearchButton = document.querySelector("#clear-search-button");
  const playlist = document.querySelector("#playlist");
  const playlistEmptyState = document.querySelector("#playlist-empty-state");
  const shortcutHint = document.querySelector("#shortcut-hint");

  previousButton.addEventListener("click", callbacks.onPrevious);
  nextButton.addEventListener("click", callbacks.onNext);
  muteButton.addEventListener("click", callbacks.onToggleMute);
  allTracksButton.addEventListener("click", () => {
    callbacks.onFilterModeChange("all");
  });
  favoriteTracksButton.addEventListener("click", () => {
    callbacks.onFilterModeChange("favorites");
  });
  playButton.addEventListener("click", () => {
    void callbacks.onTogglePlayback();
  });
  seekSlider.addEventListener("input", (event) => {
    const ratio = Number(event.currentTarget.value) / SEEK_RANGE_MAX;
    callbacks.onSeek(ratio);
  });
  volumeSlider.addEventListener("input", (event) => {
    const level = Number(event.currentTarget.value) / VOLUME_RANGE_MAX;
    callbacks.onSetVolume(level);
  });
  playlistSearchInput.addEventListener("input", (event) => {
    callbacks.onFilterChange(event.currentTarget.value);
  });
  clearSearchButton.addEventListener("click", () => {
    playlistSearchInput.value = "";
    callbacks.onFilterChange("");
    playlistSearchInput.focus();
  });
  playlistSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      playlistSearchInput.value = "";
      callbacks.onFilterChange("");
      return;
    }

    if (event.key === "ArrowDown") {
      const firstTrackButton = playlist.querySelector(".playlist-button");

      if (firstTrackButton instanceof HTMLButtonElement) {
        event.preventDefault();
        firstTrackButton.focus();
      }
    }
  });

  return {
    /**
     * Renders the latest player state to the DOM.
     * @param {{
     *   currentTimeSeconds: number,
     *   durationSeconds: number,
     *   favoriteTrackIds: string[],
     *   favoriteTracks: Array<{ id: string, title: string, artist: string, durationSeconds: number }>,
     *   filterMode: string,
     *   filterQuery: string,
     *   filteredTracks: Array<{ id: string, title: string, artist: string, durationSeconds: number }>,
     *   isPlaying: boolean,
     *   isMuted: boolean,
     *   message: string,
     *   playlistMessage: string,
     *   selectedTrack: { id: string, title: string, artist: string } | null,
     *   volume: number
     * }} state The current player state.
     * @returns {void}
     */
    render(state) {
      const {
        currentTimeSeconds,
        durationSeconds,
        favoriteTrackIds,
        favoriteTracks,
        filterMode,
        filterQuery,
        filteredTracks,
        isMuted,
        isPlaying,
        message,
        playlistMessage,
        selectedTrack,
        volume
      } = state;
      const durationValue = durationSeconds || 0;
      const progressRatio = durationValue > 0 ? currentTimeSeconds / durationValue : 0;
      const hasTrack = Boolean(selectedTrack);

      trackTitle.textContent = selectedTrack?.title ?? "No track selected";
      trackMeta.textContent = selectedTrack ? `${selectedTrack.artist}` : "Add tracks to begin playback.";
      currentTime.textContent = formatTime(currentTimeSeconds);
      duration.textContent = formatTime(durationValue);
      playerMessage.textContent = message;
      playButton.textContent = isPlaying ? "Pause" : "Play";
      playButton.disabled = !hasTrack;
      previousButton.disabled = !hasTrack;
      nextButton.disabled = !hasTrack;
      muteButton.disabled = !hasTrack;
      muteButton.textContent = isMuted ? "Unmute" : "Mute";
      seekSlider.value = `${Math.min(Math.max(progressRatio * SEEK_RANGE_MAX, 0), SEEK_RANGE_MAX)}`;
      seekSlider.disabled = !hasTrack;
      volumeSlider.value = `${Math.round(volume * VOLUME_RANGE_MAX)}`;
      shortcutHint.textContent = "Shortcuts: Space play/pause, Left/Right previous/next, M mute";
      allTracksButton.setAttribute("aria-pressed", `${filterMode === "all"}`);
      favoriteTracksButton.setAttribute("aria-pressed", `${filterMode === "favorites"}`);
      allTracksButton.classList.toggle("filter-toggle-active", filterMode === "all");
      favoriteTracksButton.classList.toggle("filter-toggle-active", filterMode === "favorites");
      favoriteTracksButton.textContent = `Favorites (${favoriteTracks.length})`;

      if (playlistSearchInput.value !== filterQuery) {
        playlistSearchInput.value = filterQuery;
      }

      clearSearchButton.disabled = filterQuery.length === 0;
      playlistEmptyState.hidden = filteredTracks.length > 0;
      playlistEmptyState.textContent = playlistMessage || "";

      renderPlaylist({
        container: playlist,
        favoriteTrackIds,
        onFavoriteToggle: (trackId) => {
          callbacks.onToggleFavoriteTrack(trackId);
        },
        onTrackSelect: (trackId) => {
          void callbacks.onTrackSelect(trackId);
        },
        selectedTrackId: selectedTrack?.id,
        tracks: filteredTracks
      });
    }
  };
}
