/**
 * src/components/renderQueue.js
 * Renders the upcoming playback queue with remove controls.
 * Connects to: src/components/createPlayerView.js
 * Created: 2026-06-25
 */

/**
 * Renders queued track rows into the target container.
 * @param {{
 *   container: HTMLUListElement,
 *   onRemoveQueuedTrack: (trackId: string) => void,
 *   queuedTracks: Array<{ id: string, title: string, artist: string }>
 * }} dependencies Rendering dependencies.
 * @returns {void}
 */
export function renderQueue({ container, onRemoveQueuedTrack, queuedTracks }) {
  container.replaceChildren();

  for (const [index, track] of queuedTracks.entries()) {
    const item = document.createElement("li");
    item.className = "queue-item";

    const row = document.createElement("div");
    row.className = "queue-row";

    const details = document.createElement("div");
    details.className = "queue-details";

    const position = document.createElement("span");
    position.className = "queue-position";
    position.textContent = `Up next ${index + 1}`;

    const title = document.createElement("span");
    title.className = "queue-track-title";
    title.textContent = track.title;

    const meta = document.createElement("span");
    meta.className = "queue-track-meta";
    meta.textContent = track.artist;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "control-button control-button-secondary queue-remove-button";
    removeButton.setAttribute("aria-label", `Remove ${track.title} from queue`);
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      onRemoveQueuedTrack(track.id);
    });

    details.append(position, title, meta);
    row.append(details, removeButton);
    item.append(row);
    container.append(item);
  }
}
