/**
 * src/models/createTrack.js
 * Normalizes raw playlist items into a consistent track shape.
 * Connects to: src/data/playlist.js, src/main.js
 * Created: 2026-06-25
 */

/**
 * Creates an immutable track record from raw seed data.
 * @param {object} rawTrack The raw track input.
 * @param {string} rawTrack.id The unique track identifier.
 * @param {string} rawTrack.title The track title.
 * @param {string} rawTrack.artist The artist name.
 * @param {number} rawTrack.durationSeconds The expected track length in seconds.
 * @param {string} rawTrack.audioUrl The HTTPS audio source URL.
 * @returns {{ id: string, title: string, artist: string, durationSeconds: number, audioUrl: string }}
 */
export function createTrack(rawTrack) {
  const track = {
    id: `${rawTrack.id}`,
    title: `${rawTrack.title}`.trim(),
    artist: `${rawTrack.artist}`.trim(),
    durationSeconds: Number(rawTrack.durationSeconds),
    audioUrl: `${rawTrack.audioUrl}`.trim()
  };

  if (!track.id || !track.title || !track.artist) {
    throw new Error("Track metadata is incomplete.");
  }

  if (!Number.isFinite(track.durationSeconds) || track.durationSeconds <= 0) {
    throw new Error("Track duration must be a positive number.");
  }

  if (!track.audioUrl.startsWith("https://")) {
    throw new Error("Track audio URL must use HTTPS.");
  }

  return Object.freeze(track);
}

