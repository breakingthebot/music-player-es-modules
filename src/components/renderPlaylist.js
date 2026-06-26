/**
 * src/components/renderPlaylist.js
 * Renders the track list with accessible playback and action controls.
 * Connects to: src/components/createPlayerView.js
 * Created: 2026-06-25
 */

/**
 * Renders the playlist list markup into the target container.
 * @param {{
 *   container: HTMLUListElement,
 *   favoriteTrackIds: string[],
 *   onFavoriteToggle: (trackId: string) => void,
 *   onQueueTrack: (trackId: string) => void,
 *   onRemoveImportedTrack: (trackId: string) => void,
 *   onTrackSelect: (trackId: string) => void,
 *   queuedTrackIds: string[],
 *   selectedTrackId: string | undefined,
 *   tracks: Array<{ id: string, title: string, artist: string, durationSeconds: number, isImported: boolean }>
 * }} dependencies Playlist rendering dependencies.
 * @returns {void}
 */
export function renderPlaylist({
  container,
  favoriteTrackIds,
  onFavoriteToggle,
  onQueueTrack,
  onRemoveImportedTrack,
  onTrackSelect,
  queuedTrackIds,
  selectedTrackId,
  tracks
}) {
  container.replaceChildren();
  const favoriteIdSet = new Set(favoriteTrackIds);
  const queuedIdSet = new Set(queuedTrackIds);

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
    button.title = `${track.title} by ${track.artist}`;
    button.addEventListener("click", () => {
      onTrackSelect(track.id);
    });

    const title = document.createElement("span");
    title.className = "playlist-track-title";
    title.textContent = track.title;

    const meta = document.createElement("span");
    meta.className = "playlist-track-meta";
    meta.textContent = `${track.artist} - ${Math.round(track.durationSeconds / 60)} min`;

    const queueButton = document.createElement("button");
    queueButton.type = "button";
    queueButton.className = `queue-button${queuedIdSet.has(track.id) ? " queue-button-active" : ""}`;
    queueButton.disabled = queuedIdSet.has(track.id);
    queueButton.setAttribute(
      "aria-label",
      queuedIdSet.has(track.id)
        ? `${track.title} is already queued`
        : `Play ${track.title} next`
    );
    queueButton.title = queuedIdSet.has(track.id)
      ? `${track.title} is already queued`
      : `Queue ${track.title} to play next`;
    queueButton.textContent = queuedIdSet.has(track.id) ? "Queued" : "Play next";
    queueButton.addEventListener("click", () => {
      onQueueTrack(track.id);
    });

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
    favoriteButton.title = favoriteIdSet.has(track.id)
      ? `Remove ${track.title} from favorites`
      : `Add ${track.title} to favorites`;
    favoriteButton.textContent = favoriteIdSet.has(track.id) ? "Favorite" : "Fav";
    favoriteButton.addEventListener("click", () => {
      onFavoriteToggle(track.id);
    });

    const actions = document.createElement("div");
    actions.className = "playlist-actions";

    if (track.isImported) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-button";
      removeButton.setAttribute("aria-label", `Remove imported track ${track.title}`);
      removeButton.title = `Remove imported track ${track.title}`;
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => {
        onRemoveImportedTrack(track.id);
      });
      actions.append(queueButton, favoriteButton, removeButton);
    } else {
      actions.append(queueButton, favoriteButton);
    }

    button.append(title, meta);
    row.append(button, actions);
    item.append(row);
    container.append(item);
  }
}
