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
 *     setMuted: (value: boolean) => void,
 *     setVolume: (value: number) => void,
 *     seekToRatio: (ratio: number) => void
 *   },
 *   initialPreferences?: { isMuted?: boolean, selectedTrackId?: string | null, volume?: number },
 *   messages: Record<string, string>,
 *   onStateChange: (state: object) => void,
 *   onPreferencesChange?: (preferences: { isMuted: boolean, selectedTrackId: string | null, volume: number }) => void,
 *   tracks: Array<{ id: string, title: string, artist: string, durationSeconds: number, audioUrl: string }>
 * }} dependencies The controller dependencies.
 * @returns {{
 *   bootstrap: () => void,
 *   getState: () => object,
 *   next: () => void,
 *   playSelectedTrack: (trackId: string) => Promise<void>,
 *   previous: () => void,
 *   setFilterQuery: (value: string) => void,
 *   setVolume: (level: number) => void,
 *   seekTo: (ratio: number) => void,
 *   toggleMute: () => void,
 *   togglePlayback: () => Promise<void>
 * }}
 */
import { DEFAULT_VOLUME } from "../config/appConfig.js";
import { filterTracks } from "./filterTracks.js";
import { clampNumber } from "../utils/clampNumber.js";

export function createPlayerController({
  audioAdapter,
  initialPreferences = {},
  messages,
  onPreferencesChange = () => {},
  onStateChange,
  tracks
}) {
  let selectedIndex = getInitialSelectedIndex(tracks, initialPreferences.selectedTrackId);
  let isPlaying = false;
  let isMuted = Boolean(initialPreferences.isMuted);
  let filterQuery = "";
  let message = tracks.length === 0 ? messages.EMPTY_PLAYLIST : messages.LOADING;
  let volume = clampNumber(Number(initialPreferences.volume), 0, 1, DEFAULT_VOLUME);

  /**
   * Resolves the initial selected track index from preferences.
   * @param {Array<{ id: string }>} availableTracks The available playlist.
   * @param {string | null | undefined} selectedTrackId The stored selected track identifier.
   * @returns {number} The valid initial playlist index.
   */
  function getInitialSelectedIndex(availableTracks, selectedTrackId) {
    if (availableTracks.length === 0 || !selectedTrackId) {
      return 0;
    }

    const matchedIndex = availableTracks.findIndex((track) => track.id === selectedTrackId);

    return matchedIndex >= 0 ? matchedIndex : 0;
  }

  /**
   * Produces the current player view model.
   * @returns {object}
   */
  function buildState() {
    const selectedTrack = tracks[selectedIndex] ?? null;
    const filteredTracks = filterTracks(tracks, filterQuery);

    return {
      currentTimeSeconds: audioAdapter.getCurrentTime(),
      durationSeconds: audioAdapter.getDuration() || selectedTrack?.durationSeconds || 0,
      filterQuery,
      filteredTracks,
      isPlaying,
      isMuted,
      message,
      playlistMessage: filteredTracks.length === 0 ? messages.SEARCH_EMPTY : "",
      selectedTrack,
      tracks,
      volume
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
   * Persists the user preference subset.
   * @returns {void}
   */
  function persistPreferences() {
    onPreferencesChange({
      isMuted,
      selectedTrackId: tracks[selectedIndex]?.id ?? null,
      volume
    });
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

    message = messages.LOADING;
    audioAdapter.loadTrack(selectedTrack);
    persistPreferences();
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
    message = messages.BUFFERING;
    notify();

    try {
      await audioAdapter.play();
    } catch {
      isPlaying = false;
      message = messages.LOAD_ERROR;
      notify();
    }
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

  audioAdapter.on("playing", () => {
    isPlaying = true;
    message = messages.PLAYING;
    notify();
  });

  audioAdapter.on("waiting", () => {
    if (tracks.length > 0) {
      message = messages.BUFFERING;
      notify();
    }
  });

  audioAdapter.on("timeupdate", () => {
    notify();
  });

  audioAdapter.on("loadedmetadata", () => {
    if (!isPlaying) {
      message = messages.READY;
    }

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
      audioAdapter.setVolume(volume);
      audioAdapter.setMuted(isMuted);
      loadCurrentTrack();
      persistPreferences();
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
     * Updates the playlist search query without changing playback state.
     * @param {string} value The latest search text.
     * @returns {void}
     */
    setFilterQuery(value) {
      filterQuery = `${value}`;
      notify();
    },

    /**
     * Updates the player volume between 0 and 1.
     * @param {number} level The desired volume level.
     * @returns {void}
     */
    setVolume(level) {
      volume = clampNumber(Number(level), 0, 1, DEFAULT_VOLUME);
      audioAdapter.setVolume(volume);

      if (isMuted && volume > 0) {
        isMuted = false;
        audioAdapter.setMuted(false);
      }

      persistPreferences();
      notify();
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
     * Toggles the muted state without changing the saved volume level.
     * @returns {void}
     */
    toggleMute() {
      isMuted = !isMuted;
      audioAdapter.setMuted(isMuted);
      persistPreferences();
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

      message = messages.BUFFERING;
      notify();

      try {
        await audioAdapter.play();
      } catch {
        isPlaying = false;
        message = messages.LOAD_ERROR;
        notify();
      }
    }
  };
}
