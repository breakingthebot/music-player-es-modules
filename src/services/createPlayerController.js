/**
 * src/services/createPlayerController.js
 * Coordinates playlist state, playback commands, and view updates.
 * Connects to: src/services/createAudioAdapter.js, src/components/createPlayerView.js
 * Created: 2026-06-25
 */

/**
 * Creates the player controller that mediates between audio and UI.
 * @param {{
 *   audioAdapter: {
 *     getCurrentTime: () => number,
 *     getDuration: () => number,
 *     loadTrack: (track: { id: string, audioUrl: string }) => void,
 *     on: (eventName: string, handler: EventListener) => void,
 *     pause: () => void,
 *     play: () => Promise<void>,
 *     seekToRatio: (ratio: number) => void
 *   },
 *   messages: Record<string, string>,
 *   onStateChange: (state: object) => void,
 *   tracks: Array<{ id: string, title: string, artist: string, durationSeconds: number, audioUrl: string }>
 * }} dependencies The controller dependencies.
 * @returns {{
 *   bootstrap: () => void,
 *   getState: () => object,
 *   next: () => void,
 *   playSelectedTrack: (trackId: string) => Promise<void>,
 *   previous: () => void,
 *   seekTo: (ratio: number) => void,
 *   togglePlayback: () => Promise<void>
 * }}
 */
export function createPlayerController({ audioAdapter, messages, onStateChange, tracks }) {
  let selectedIndex = 0;
  let isPlaying = false;
  let message = tracks.length === 0 ? messages.EMPTY_PLAYLIST : messages.LOADING;

  /**
   * Produces the current player view model.
   * @returns {object}
   */
  function buildState() {
    const selectedTrack = tracks[selectedIndex] ?? null;

    return {
      currentTimeSeconds: audioAdapter.getCurrentTime(),
      durationSeconds: audioAdapter.getDuration() || selectedTrack?.durationSeconds || 0,
      isPlaying,
      message,
      selectedTrack,
      tracks
    };
  }

  /**
   * Pushes the current state into the consumer.
   * @returns {void}
   */
  function notify() {
    onStateChange(buildState());
  }

  /**
   * Loads the currently selected track into the audio layer.
   * @returns {void}
   */
  function loadCurrentTrack() {
    const selectedTrack = tracks[selectedIndex];

    if (!selectedTrack) {
      notify();
      return;
    }

    audioAdapter.loadTrack(selectedTrack);
    notify();
  }

  /**
   * Switches playback to a specific track index.
   * @param {number} nextIndex The next index to select.
   * @returns {Promise<void>}
   */
  async function playIndex(nextIndex) {
    selectedIndex = nextIndex;
    loadCurrentTrack();
    await audioAdapter.play();
    isPlaying = true;
    message = messages.PLAYING;
    notify();
  }

  /**
   * Advances to a wrapped playlist index.
   * @param {number} direction Positive or negative playlist movement.
   * @returns {number}
   */
  function getWrappedIndex(direction) {
    const trackCount = tracks.length;

    return (selectedIndex + direction + trackCount) % trackCount;
  }

  audioAdapter.on("ended", () => {
    if (tracks.length > 0) {
      void playIndex(getWrappedIndex(1));
    }
  });

  audioAdapter.on("timeupdate", () => {
    notify();
  });

  audioAdapter.on("loadedmetadata", () => {
    notify();
  });

  audioAdapter.on("error", () => {
    isPlaying = false;
    message = messages.LOAD_ERROR;
    notify();
  });

  return {
    /**
     * Loads the first track and sends the initial state to the view.
     * @returns {void}
     */
    bootstrap() {
      loadCurrentTrack();
      notify();
    },

    /**
     * Returns the current state snapshot.
     * @returns {object}
     */
    getState() {
      return buildState();
    },

    /**
     * Advances to the next track and starts playback.
     * @returns {void}
     */
    next() {
      if (tracks.length > 0) {
        void playIndex(getWrappedIndex(1));
      }
    },

    /**
     * Plays the selected track by identifier.
     * @param {string} trackId The track identifier to activate.
     * @returns {Promise<void>}
     */
    async playSelectedTrack(trackId) {
      const nextIndex = tracks.findIndex((track) => track.id === trackId);

      if (nextIndex >= 0) {
        await playIndex(nextIndex);
      }
    },

    /**
     * Moves to the previous track and starts playback.
     * @returns {void}
     */
    previous() {
      if (tracks.length > 0) {
        void playIndex(getWrappedIndex(-1));
      }
    },

    /**
     * Seeks to a proportional position in the current track.
     * @param {number} ratio The desired position between 0 and 1.
     * @returns {void}
     */
    seekTo(ratio) {
      audioAdapter.seekToRatio(ratio);
      notify();
    },

    /**
     * Toggles between play and pause for the selected track.
     * @returns {Promise<void>}
     */
    async togglePlayback() {
      if (tracks.length === 0) {
        return;
      }

      if (isPlaying) {
        audioAdapter.pause();
        isPlaying = false;
        message = messages.PAUSED;
        notify();
        return;
      }

      await audioAdapter.play();
      isPlaying = true;
      message = messages.PLAYING;
      notify();
    }
  };
}
