/**
 * src/components/createPlayerView.js
 * Owns DOM references and translates controller state into UI updates.
 * Connects to: src/components/renderPlaylist.js, src/utils/formatTime.js
 * Created: 2026-06-25
 */

import { SEEK_RANGE_MAX } from "../config/appConfig.js";
import { renderPlaylist } from "./renderPlaylist.js";
import { formatTime } from "../utils/formatTime.js";

/**
 * Creates the DOM view adapter for the music player interface.
 * @param {{
 *   onNext: () => void,
 *   onPrevious: () => void,
 *   onSeek: (ratio: number) => void,
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
  const playButton = document.querySelector("#play-button");
  const previousButton = document.querySelector("#previous-button");
  const nextButton = document.querySelector("#next-button");
  const playlist = document.querySelector("#playlist");

  previousButton.addEventListener("click", callbacks.onPrevious);
  nextButton.addEventListener("click", callbacks.onNext);
  playButton.addEventListener("click", () => {
    void callbacks.onTogglePlayback();
  });
  seekSlider.addEventListener("input", (event) => {
    const ratio = Number(event.currentTarget.value) / SEEK_RANGE_MAX;
    callbacks.onSeek(ratio);
  });

  return {
    /**
     * Renders the latest player state to the DOM.
     * @param {{
     *   currentTimeSeconds: number,
     *   durationSeconds: number,
     *   isPlaying: boolean,
     *   message: string,
     *   selectedTrack: { id: string, title: string, artist: string } | null,
     *   tracks: Array<{ id: string, title: string, artist: string, durationSeconds: number }>
     * }} state The current player state.
     * @returns {void}
     */
    render(state) {
      const { currentTimeSeconds, durationSeconds, isPlaying, message, selectedTrack, tracks } = state;
      const durationValue = durationSeconds || 0;
      const progressRatio = durationValue > 0 ? currentTimeSeconds / durationValue : 0;

      trackTitle.textContent = selectedTrack?.title ?? "No track selected";
      trackMeta.textContent = selectedTrack ? `${selectedTrack.artist}` : "Add tracks to begin playback.";
      currentTime.textContent = formatTime(currentTimeSeconds);
      duration.textContent = formatTime(durationValue);
      playerMessage.textContent = message;
      playButton.textContent = isPlaying ? "Pause" : "Play";
      seekSlider.value = `${Math.min(Math.max(progressRatio * SEEK_RANGE_MAX, 0), SEEK_RANGE_MAX)}`;

      renderPlaylist({
        container: playlist,
        onTrackSelect: (trackId) => {
          void callbacks.onTrackSelect(trackId);
        },
        selectedTrackId: selectedTrack?.id,
        tracks
      });
    }
  };
}

