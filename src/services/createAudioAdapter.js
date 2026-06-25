/**
 * src/services/createAudioAdapter.js
 * Wraps the browser Audio element behind a small service boundary.
 * Connects to: src/services/createPlayerController.js, src/main.js
 * Created: 2026-06-25
 */

import { logger } from "../utils/logger.js";

/**
 * Creates an audio adapter for browser playback and event forwarding.
 * @returns {{
 *   getCurrentTime: () => number,
 *   getDuration: () => number,
 *   loadTrack: (track: { audioUrl: string }) => void,
 *   on: (eventName: string, handler: EventListener) => void,
 *   pause: () => void,
 *   play: () => Promise<void>,
 *   seekToSeconds: (seconds: number) => void,
 *   setMuted: (value: boolean) => void,
 *   setVolume: (value: number) => void,
 *   seekToRatio: (ratio: number) => void
 * }}
 */
export function createAudioAdapter() {
  const audio = new Audio();
  audio.preload = "metadata";

  return {
    /**
     * Returns the current playback time in seconds.
     * @returns {number}
     */
    getCurrentTime() {
      return audio.currentTime;
    },

    /**
     * Returns the loaded track duration in seconds.
     * @returns {number}
     */
    getDuration() {
      return Number.isFinite(audio.duration) ? audio.duration : 0;
    },

    /**
     * Loads a new track into the shared audio element.
     * @param {{ audioUrl: string, id?: string }} track The track to load.
     * @returns {void}
     */
    loadTrack(track) {
      logger.info("Loading audio track.", { trackId: track.id });
      audio.src = track.audioUrl;
      audio.load();
    },

    /**
     * Registers a listener on the underlying audio element.
     * @param {string} eventName The media event to listen for.
     * @param {EventListener} handler The event handler function.
     * @returns {void}
     */
    on(eventName, handler) {
      audio.addEventListener(eventName, handler);
    },

    /**
     * Pauses active playback.
     * @returns {void}
     */
    pause() {
      audio.pause();
    },

    /**
     * Starts playback for the loaded track.
     * @returns {Promise<void>}
     */
    async play() {
      await audio.play();
    },

    /**
     * Seeks to an exact time in seconds within the current track.
     * @param {number} seconds The desired playback time.
     * @returns {void}
     */
    seekToSeconds(seconds) {
      audio.currentTime = Math.max(seconds, 0);
    },

    /**
     * Sets the browser audio muted state.
     * @param {boolean} value Whether audio output should be muted.
     * @returns {void}
     */
    setMuted(value) {
      audio.muted = value;
    },

    /**
     * Sets the browser audio volume from 0 to 1.
     * @param {number} value The desired volume ratio.
     * @returns {void}
     */
    setVolume(value) {
      audio.volume = Math.min(Math.max(value, 0), 1);
    },

    /**
     * Seeks to a percentage ratio within the current track.
     * @param {number} ratio The target ratio between 0 and 1.
     * @returns {void}
     */
    seekToRatio(ratio) {
      const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
      audio.currentTime = duration * Math.min(Math.max(ratio, 0), 1);
    }
  };
}
