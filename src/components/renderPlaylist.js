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
 *   favoriteTrackIds: string[],
 *   selectedTrackId: string | undefined,
 *   tracks: Array<{ id: string, title: string, artist: string, durationSeconds: number }>,
 *   onFavoriteToggle: (trackId: string) => void,
 *   onTrackSelect: (trackId: string) => void
 * }} dependencies Playlist rendering dependencies.
 * @returns {void}
 */
export function renderPlaylist({
  container,
  favoriteTrackIds,
  onFavoriteToggle,
  onTrackSelect,
  selectedTrackId,
  tracks
}) {
  container.replaceChildren();
  const favoriteIdSet = new Set(favoriteTrackIds);

  for (const track of tracks) {
    const item = document.createElement("li");
    item.className = "playlist-item";

    const row = document.createElement("div");
    row.className = "playlist-row";

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

    const favoriteButton = document.createElement("button");
    favoriteButton.type = "button";
    favoriteButton.className = `favorite-button${favoriteIdSet.has(track.id) ? " favorite-button-active" : ""}`;
    favoriteButton.setAttribute("aria-pressed", `${favoriteIdSet.has(track.id)}`);
    favoriteButton.setAttribute(
      "aria-label",
      favoriteIdSet.has(track.id)
        ? `Remove ${track.title} from favorites`
        : `Add ${track.title} to favorites`
    );
    favoriteButton.textContent = favoriteIdSet.has(track.id) ? "★" : "☆";
    favoriteButton.addEventListener("click", () => {
      onFavoriteToggle(track.id);
    });

    button.append(title, meta);
    row.append(button, favoriteButton);
    item.append(row);
    container.append(item);
  }
}
