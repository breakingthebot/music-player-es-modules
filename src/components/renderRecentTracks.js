/**
 * src/components/renderRecentTracks.js
 * Renders the compact recently played track list for quick replay.
 * Connects to: src/components/createPlayerView.js, src/utils/formatTime.js
 * Created: 2026-06-25
 */

import { formatTime } from "../utils/formatTime.js";

/**
 * Renders recent track buttons into the target container.
 * @param {{
 *   container: HTMLUListElement,
 *   onTrackSelect: (trackId: string) => void,
 *   recentTracks: Array<{ id: string, title: string, artist: string, resumeSeconds: number }>
 * }} dependencies Rendering dependencies.
 * @returns {void}
 */
export function renderRecentTracks({ container, onTrackSelect, recentTracks }) {
  container.replaceChildren();

  for (const track of recentTracks) {
    const item = document.createElement("li");
    item.className = "recent-track-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-track-button";
    button.addEventListener("click", () => {
      onTrackSelect(track.id);
    });

    const title = document.createElement("span");
    title.className = "recent-track-title";
    title.textContent = `${track.title} by ${track.artist}`;

    const resumeMeta = document.createElement("span");
    resumeMeta.className = "recent-track-meta";
    resumeMeta.textContent = track.resumeSeconds > 0
      ? `Resume at ${formatTime(track.resumeSeconds)}`
      : "Start from the beginning";

    button.append(title, resumeMeta);
    item.append(button);
    container.append(item);
  }
}
