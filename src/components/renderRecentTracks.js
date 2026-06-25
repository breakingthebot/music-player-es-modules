/**
 * src/components/renderRecentTracks.js
 * Renders the compact recently played track list for quick replay.
 * Connects to: src/components/createPlayerView.js
 * Created: 2026-06-25
 */

/**
 * Renders recent track buttons into the target container.
 * @param {{
 *   container: HTMLUListElement,
 *   onTrackSelect: (trackId: string) => void,
 *   recentTracks: Array<{ id: string, title: string, artist: string }>
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
    button.textContent = `${track.title} by ${track.artist}`;
    button.addEventListener("click", () => {
      onTrackSelect(track.id);
    });

    item.append(button);
    container.append(item);
  }
}
