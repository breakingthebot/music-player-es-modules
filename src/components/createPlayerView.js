/**
 * src/components/createPlayerView.js
 * Owns DOM references and translates controller state into UI updates.
 * Connects to: src/components/renderPlaylist.js, src/components/renderQueue.js, src/components/renderRecentTracks.js, src/utils/attachListKeyboardNavigation.js, src/utils/formatTime.js
 * Created: 2026-06-25
 */

import { REPEAT_MODES, SEEK_RANGE_MAX, SORT_MODES, VOLUME_RANGE_MAX } from "../config/appConfig.js";
import { renderPlaylist } from "./renderPlaylist.js";
import { renderQueue } from "./renderQueue.js";
import { renderRecentTracks } from "./renderRecentTracks.js";
import { attachListKeyboardNavigation } from "../utils/attachListKeyboardNavigation.js";
import { formatTime } from "../utils/formatTime.js";

/**
 * Creates the DOM view adapter for the music player interface.
 * @param {{
 *   onCycleRepeatMode: () => void,
 *   onFilterChange: (value: string) => void,
 *   onFilterModeChange: (value: string) => void,
 *   onImportTracks: (files: File[]) => Promise<string>,
 *   onMoveQueuedTrackDown: (trackId: string) => void,
 *   onMoveQueuedTrackUp: (trackId: string) => void,
 *   onNext: () => void,
 *   onPrevious: () => void,
 *   onQueueTrack: (trackId: string) => void,
 *   onRemoveQueuedTrack: (trackId: string) => void,
 *   onSetSortMode: (value: string) => void,
 *   onSetVolume: (level: number) => void,
 *   onSeek: (ratio: number) => void,
 *   onToggleFavoriteTrack: (trackId: string) => void,
 *   onToggleMute: () => void,
 *   onTogglePlayback: () => void,
 *   onToggleShuffle: () => void,
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
  const recentTracksList = document.querySelector("#recent-tracks");
  const recentTracksSection = document.querySelector("#recent-tracks-section");
  const recentTracksSummary = document.querySelector("#recent-tracks-summary");
  const queueList = document.querySelector("#queue-list");
  const queueSection = document.querySelector("#queue-section");
  const queueSummary = document.querySelector("#queue-summary");
  const seekSlider = document.querySelector("#seek-slider");
  const volumeSlider = document.querySelector("#volume-slider");
  const playButton = document.querySelector("#play-button");
  const muteButton = document.querySelector("#mute-button");
  const previousButton = document.querySelector("#previous-button");
  const nextButton = document.querySelector("#next-button");
  const shuffleButton = document.querySelector("#shuffle-button");
  const repeatButton = document.querySelector("#repeat-button");
  const playbackModeIndicator = document.querySelector("#playback-mode-indicator");
  const allTracksButton = document.querySelector("#all-tracks-button");
  const favoriteTracksButton = document.querySelector("#favorite-tracks-button");
  const importInput = document.querySelector("#playlist-import-input");
  const importButton = document.querySelector("#playlist-import-button");
  const importStatus = document.querySelector("#playlist-import-status");
  const playlistSearchInput = document.querySelector("#playlist-search");
  const clearSearchButton = document.querySelector("#clear-search-button");
  const sortSelect = document.querySelector("#playlist-sort");
  const playlist = document.querySelector("#playlist");
  const playlistEmptyState = document.querySelector("#playlist-empty-state");
  const shortcutHint = document.querySelector("#shortcut-hint");

  previousButton.addEventListener("click", callbacks.onPrevious);
  nextButton.addEventListener("click", callbacks.onNext);
  muteButton.addEventListener("click", callbacks.onToggleMute);
  shuffleButton.addEventListener("click", callbacks.onToggleShuffle);
  repeatButton.addEventListener("click", callbacks.onCycleRepeatMode);
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
  sortSelect.addEventListener("change", (event) => {
    callbacks.onSetSortMode(event.currentTarget.value);
  });
  playlistSearchInput.addEventListener("input", (event) => {
    callbacks.onFilterChange(event.currentTarget.value);
  });
  importInput.addEventListener("change", async () => {
    const files = Array.from(importInput.files ?? []);

    if (files.length === 0) {
      return;
    }

    importButton.disabled = true;
    importInput.disabled = true;
    importStatus.textContent = "Importing local audio files...";

    try {
      importStatus.textContent = await callbacks.onImportTracks(files);
    } catch (error) {
      importStatus.textContent = error instanceof Error
        ? error.message
        : "Imported audio files could not be added.";
    } finally {
      importInput.value = "";
      importButton.disabled = false;
      importInput.disabled = false;
    }
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

  attachListKeyboardNavigation(playlist, ".playlist-button");
  attachListKeyboardNavigation(recentTracksList, ".recent-track-button");
  attachListKeyboardNavigation(queueList, ".queue-action-button");

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
     *   isShuffleEnabled: boolean,
     *   message: string,
     *   playbackModeLabel: string,
     *   playlistMessage: string,
     *   queuedTracks: Array<{ id: string, title: string, artist: string }>,
     *   recentTracks: Array<{ id: string, title: string, artist: string, resumeSeconds: number }>,
     *   repeatMode: string,
     *   selectedTrack: { id: string, title: string, artist: string } | null,
     *   sortMode: string,
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
        isShuffleEnabled,
        message,
        playbackModeLabel,
        playlistMessage,
        queuedTracks,
        recentTracks,
        repeatMode,
        selectedTrack,
        sortMode,
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
      playbackModeIndicator.textContent = playbackModeLabel;
      shuffleButton.setAttribute("aria-pressed", `${isShuffleEnabled}`);
      shuffleButton.classList.toggle("filter-toggle-active", isShuffleEnabled);
      repeatButton.setAttribute("aria-pressed", `${repeatMode !== REPEAT_MODES.OFF}`);
      repeatButton.classList.toggle("filter-toggle-active", repeatMode !== REPEAT_MODES.OFF);
      repeatButton.textContent = repeatMode === REPEAT_MODES.ALL
        ? "Repeat: All"
        : repeatMode === REPEAT_MODES.ONE
          ? "Repeat: One"
          : "Repeat: Off";
      allTracksButton.setAttribute("aria-pressed", `${filterMode === "all"}`);
      favoriteTracksButton.setAttribute("aria-pressed", `${filterMode === "favorites"}`);
      allTracksButton.classList.toggle("filter-toggle-active", filterMode === "all");
      favoriteTracksButton.classList.toggle("filter-toggle-active", filterMode === "favorites");
      favoriteTracksButton.textContent = `Favorites (${favoriteTracks.length})`;

      if (playlistSearchInput.value !== filterQuery) {
        playlistSearchInput.value = filterQuery;
      }

      if (!Object.values(SORT_MODES).includes(sortSelect.value) || sortSelect.value !== sortMode) {
        sortSelect.value = sortMode;
      }

      clearSearchButton.disabled = filterQuery.length === 0;
      playlistEmptyState.hidden = filteredTracks.length > 0;
      playlistEmptyState.textContent = playlistMessage || "";
      recentTracksSection.hidden = recentTracks.length === 0;
      recentTracksSummary.textContent = recentTracks.length > 0
        ? `Resume one of your last ${recentTracks.length} tracks.`
        : "";
      queueSection.hidden = queuedTracks.length === 0;
      queueSummary.textContent = queuedTracks.length > 0
        ? `${queuedTracks.length} queued ${queuedTracks.length === 1 ? "track" : "tracks"} will play before the normal order resumes.`
        : "";

      renderRecentTracks({
        container: recentTracksList,
        onTrackSelect: (trackId) => {
          void callbacks.onTrackSelect(trackId);
        },
        recentTracks
      });

      renderQueue({
        container: queueList,
        onMoveQueuedTrackDown: (trackId) => {
          callbacks.onMoveQueuedTrackDown(trackId);
        },
        onMoveQueuedTrackUp: (trackId) => {
          callbacks.onMoveQueuedTrackUp(trackId);
        },
        onRemoveQueuedTrack: (trackId) => {
          callbacks.onRemoveQueuedTrack(trackId);
        },
        queuedTracks
      });

      renderPlaylist({
        container: playlist,
        favoriteTrackIds,
        onFavoriteToggle: (trackId) => {
          callbacks.onToggleFavoriteTrack(trackId);
        },
        onQueueTrack: (trackId) => {
          callbacks.onQueueTrack(trackId);
        },
        onTrackSelect: (trackId) => {
          void callbacks.onTrackSelect(trackId);
        },
        queuedTrackIds: queuedTracks.map((track) => track.id),
        selectedTrackId: selectedTrack?.id,
        tracks: filteredTracks
      });
    }
  };
}
