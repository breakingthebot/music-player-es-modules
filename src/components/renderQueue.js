/**
 * src/components/renderQueue.js
 * Renders the upcoming playback queue with reorder and remove controls.
 * Connects to: src/components/createPlayerView.js
 * Created: 2026-06-25
 */

/**
 * Renders queued track rows into the target container.
 * @param {{
 *   container: HTMLUListElement,
 *   onMoveQueuedTrackDown: (trackId: string) => void,
 *   onMoveQueuedTrackUp: (trackId: string) => void,
 *   onRemoveQueuedTrack: (trackId: string) => void,
 *   queuedTracks: Array<{ id: string, title: string, artist: string }>
 * }} dependencies Rendering dependencies.
 * @returns {void}
 */
export function renderQueue({
  container,
  onMoveQueuedTrackDown,
  onMoveQueuedTrackUp,
  onRemoveQueuedTrack,
  queuedTracks
}) {
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

    const actions = document.createElement("div");
    actions.className = "queue-actions";

    const moveUpButton = document.createElement("button");
    moveUpButton.type = "button";
    moveUpButton.className = "control-button control-button-secondary queue-action-button";
    moveUpButton.setAttribute("aria-label", `Move ${track.title} up in queue`);
    moveUpButton.title = `Move ${track.title} earlier in the queue`;
    moveUpButton.textContent = "Move up";
    moveUpButton.disabled = index === 0;
    moveUpButton.addEventListener("click", () => {
      onMoveQueuedTrackUp(track.id);
    });

    const moveDownButton = document.createElement("button");
    moveDownButton.type = "button";
    moveDownButton.className = "control-button control-button-secondary queue-action-button";
    moveDownButton.setAttribute("aria-label", `Move ${track.title} down in queue`);
    moveDownButton.title = `Move ${track.title} later in the queue`;
    moveDownButton.textContent = "Move down";
    moveDownButton.disabled = index === queuedTracks.length - 1;
    moveDownButton.addEventListener("click", () => {
      onMoveQueuedTrackDown(track.id);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "control-button control-button-secondary queue-action-button queue-remove-button";
    removeButton.setAttribute("aria-label", `Remove ${track.title} from queue`);
    removeButton.title = `Remove ${track.title} from the queue`;
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      onRemoveQueuedTrack(track.id);
    });

    actions.append(moveUpButton, moveDownButton, removeButton);
    details.append(position, title, meta);
    row.append(details, actions);
    item.append(row);
    container.append(item);
  }
}
