/**
 * src/components/renderPlaylist.js
 * Renders the track list with accessible button controls.
 * Connects to: src/components/createPlayerView.js
 * Created: 2026-06-25
 */

/**
 * Renders the playlist list markup into the target container.
 * @param {{
 *   container: HTMLUListElement,
 *   selectedTrackId: string | undefined,
 *   tracks: Array<{ id: string, title: string, artist: string, durationSeconds: number }>,
 *   onTrackSelect: (trackId: string) => void
 * }} dependencies Playlist rendering dependencies.
 * @returns {void}
 */
export function renderPlaylist({ container, onTrackSelect, selectedTrackId, tracks }) {
  container.replaceChildren();

  for (const track of tracks) {
    const item = document.createElement("li");
    item.className = "playlist-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = `playlist-button${track.id === selectedTrackId ? " playlist-button-active" : ""}`;
    button.dataset.trackId = track.id;
    button.setAttribute("aria-pressed", `${track.id === selectedTrackId}`);
    button.addEventListener("click", () => {
      onTrackSelect(track.id);
    });

    const title = document.createElement("span");
    title.className = "playlist-track-title";
    title.textContent = track.title;

    const meta = document.createElement("span");
    meta.className = "playlist-track-meta";
    meta.textContent = `${track.artist} • ${Math.round(track.durationSeconds / 60)} min`;

    button.append(title, meta);
    item.append(button);
    container.append(item);
  }
}
