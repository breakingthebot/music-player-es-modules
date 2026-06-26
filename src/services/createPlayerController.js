/**
 * src/services/createPlayerController.js
 * Coordinates playlist state, playback commands, and view updates.
 * Connects to: src/services/createAudioAdapter.js, src/components/createPlayerView.js
 * Created: 2026-06-25
 */

import {
  DEFAULT_VOLUME,
  FILTER_MODES,
  MINIMUM_PROGRESS_SECONDS,
  RECENT_TRACK_LIMIT,
  REPEAT_MODES,
  SORT_MODES
} from "../config/appConfig.js";
import { clampNumber } from "../utils/clampNumber.js";
import { updateRecentTrackIds } from "../utils/updateRecentTrackIds.js";
import { filterTracks } from "./filterTracks.js";
import { sortTracks } from "./sortTracks.js";

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
 *     seekToSeconds: (seconds: number) => void,
 *     setMuted: (value: boolean) => void,
 *     setVolume: (value: number) => void,
 *     seekToRatio: (ratio: number) => void
 *   },
 *   initialPreferences?: {
 *     favoriteTrackIds?: string[],
 *     isMuted?: boolean,
 *     isShuffleEnabled?: boolean,
 *     recentTrackIds?: string[],
 *     repeatMode?: string,
 *     selectedTrackId?: string | null,
 *     sortMode?: string,
 *     trackProgressSeconds?: Record<string, number>,
 *     volume?: number
 *   },
 *   messages: Record<string, string>,
 *   onStateChange: (state: object) => void,
 *   onPreferencesChange?: (preferences: {
 *     favoriteTrackIds: string[],
 *     isMuted: boolean,
 *     isShuffleEnabled: boolean,
 *     recentTrackIds: string[],
 *     repeatMode: string,
 *     selectedTrackId: string | null,
 *     sortMode: string,
 *     trackProgressSeconds: Record<string, number>,
 *     volume: number
 *   }) => void,
 *   randomNumber?: () => number,
 *   tracks: Array<{ id: string, title: string, artist: string, durationSeconds: number, audioUrl: string }>
 * }} dependencies The controller dependencies.
 * @returns {{
 *   bootstrap: () => void,
 *   cycleRepeatMode: () => void,
 *   getState: () => object,
 *   moveQueuedTrackDown: (trackId: string) => void,
 *   moveQueuedTrackUp: (trackId: string) => void,
 *   next: () => void,
 *   playSelectedTrack: (trackId: string) => Promise<void>,
 *   previous: () => void,
 *   queueTrack: (trackId: string) => void,
 *   removeQueuedTrack: (trackId: string) => void,
 *   setFilterMode: (value: string) => void,
 *   setFilterQuery: (value: string) => void,
 *   setSortMode: (value: string) => void,
 *   setVolume: (level: number) => void,
 *   seekTo: (ratio: number) => void,
 *   toggleFavoriteTrack: (trackId: string) => void,
 *   toggleMute: () => void,
 *   togglePlayback: () => Promise<void>,
 *   toggleShuffle: () => void
 * }}
 */
export function createPlayerController({
  audioAdapter,
  initialPreferences = {},
  messages,
  onPreferencesChange = () => {},
  onStateChange,
  randomNumber = Math.random,
  tracks
}) {
  let selectedIndex = getInitialSelectedIndex(tracks, initialPreferences.selectedTrackId);
  let isPlaying = false;
  let isMuted = Boolean(initialPreferences.isMuted);
  let isShuffleEnabled = Boolean(initialPreferences.isShuffleEnabled);
  let filterMode = FILTER_MODES.ALL;
  let filterQuery = "";
  let repeatMode = Object.values(REPEAT_MODES).includes(initialPreferences.repeatMode)
    ? initialPreferences.repeatMode
    : REPEAT_MODES.OFF;
  let sortMode = Object.values(SORT_MODES).includes(initialPreferences.sortMode)
    ? initialPreferences.sortMode
    : SORT_MODES.DEFAULT;
  const favoriteTrackIds = new Set(
    Array.isArray(initialPreferences.favoriteTrackIds) ? initialPreferences.favoriteTrackIds : []
  );
  let message = tracks.length === 0 ? messages.EMPTY_PLAYLIST : messages.LOADING;
  let queuedTrackIds = [];
  let recentTrackIds = Array.isArray(initialPreferences.recentTrackIds)
    ? initialPreferences.recentTrackIds.filter((trackId) => tracks.some((track) => track.id === trackId))
    : [];
  const trackProgressSeconds = { ...normalizeTrackProgress(initialPreferences.trackProgressSeconds, tracks) };
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
   * Sanitizes stored per-track progress values against the known playlist.
   * @param {Record<string, number> | undefined} storedProgress The raw stored progress object.
   * @param {Array<{ id: string }>} availableTracks The known tracks.
   * @returns {Record<string, number>} The sanitized progress object.
   */
  function normalizeTrackProgress(storedProgress, availableTracks) {
    if (typeof storedProgress !== "object" || storedProgress === null) {
      return {};
    }

    const allowedTrackIds = new Set(availableTracks.map((track) => track.id));

    return Object.fromEntries(
      Object.entries(storedProgress)
        .filter(([trackId, seconds]) => {
          return allowedTrackIds.has(trackId) && Number.isFinite(Number(seconds)) && Number(seconds) >= 0;
        })
        .map(([trackId, seconds]) => [trackId, Math.floor(Number(seconds))])
    );
  }

  /**
   * Resolves the current playlist empty-state message.
   * @param {number} resultCount The number of filtered tracks.
   * @returns {string} The empty-state message for the active filters.
   */
  function getPlaylistMessage(resultCount) {
    if (resultCount > 0) {
      return "";
    }

    return filterMode === FILTER_MODES.FAVORITES ? messages.FAVORITES_EMPTY : messages.SEARCH_EMPTY;
  }

  /**
   * Converts recent IDs into display-ready track records.
   * @returns {Array<{ artist: string, id: string, resumeSeconds: number, title: string }>}
   */
  function getRecentTracks() {
    return recentTrackIds
      .map((trackId) => {
        const track = tracks.find((currentTrack) => currentTrack.id === trackId) ?? null;

        if (!track) {
          return null;
        }

        return {
          ...track,
          resumeSeconds: trackProgressSeconds[trackId] ?? 0
        };
      })
      .filter(Boolean);
  }

  /**
   * Converts queued IDs into display-ready track records.
   * @returns {Array<{ artist: string, id: string, title: string }>}
   */
  function getQueuedTracks() {
    return queuedTrackIds
      .map((trackId) => tracks.find((track) => track.id === trackId) ?? null)
      .filter(Boolean);
  }

  /**
   * Moves a queued track by one position when the new position is valid.
   * @param {string} trackId The queued track identifier.
   * @param {-1 | 1} direction The queue movement direction.
   * @returns {void}
   */
  function moveQueuedTrack(trackId, direction) {
    const currentIndex = queuedTrackIds.findIndex((currentTrackId) => currentTrackId === trackId);

    if (currentIndex < 0) {
      return;
    }

    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= queuedTrackIds.length) {
      return;
    }

    const nextQueuedTrackIds = [...queuedTrackIds];
    const [movedTrackId] = nextQueuedTrackIds.splice(currentIndex, 1);
    nextQueuedTrackIds.splice(nextIndex, 0, movedTrackId);
    queuedTrackIds = nextQueuedTrackIds;
    notify();
  }

  /**
   * Inserts a track into the bounded recent history list.
   * @param {string} trackId The played track ID.
   * @returns {void}
   */
  function registerRecentTrack(trackId) {
    recentTrackIds = updateRecentTrackIds(recentTrackIds, trackId, RECENT_TRACK_LIMIT);
  }

  /**
   * Persists a track's progress in seconds when it is meaningful to resume.
   * @param {string} trackId The current track identifier.
   * @param {number} seconds The current playback time.
   * @param {boolean} forcePersist Whether this write should always trigger persistence.
   * @returns {void}
   */
  function updateTrackProgress(trackId, seconds, forcePersist = false) {
    const nextSeconds = Math.floor(Math.max(seconds, 0));
    const previousSeconds = trackProgressSeconds[trackId] ?? 0;

    if (nextSeconds < MINIMUM_PROGRESS_SECONDS) {
      delete trackProgressSeconds[trackId];

      if (forcePersist && previousSeconds !== 0) {
        persistPreferences();
      }

      return;
    }

    trackProgressSeconds[trackId] = nextSeconds;

    if (forcePersist || Math.abs(nextSeconds - previousSeconds) >= MINIMUM_PROGRESS_SECONDS) {
      persistPreferences();
    }
  }

  /**
   * Clears saved progress after a track is effectively completed.
   * @param {string} trackId The completed track identifier.
   * @returns {void}
   */
  function clearTrackProgress(trackId) {
    if (trackId in trackProgressSeconds) {
      delete trackProgressSeconds[trackId];
      persistPreferences();
    }
  }

  /**
   * Restores saved progress when metadata becomes available for the current track.
   * @returns {void}
   */
  function restoreSavedTrackProgress() {
    const selectedTrack = tracks[selectedIndex];

    if (!selectedTrack) {
      return;
    }

    const savedSeconds = trackProgressSeconds[selectedTrack.id] ?? 0;
    const durationSeconds = audioAdapter.getDuration() || selectedTrack.durationSeconds;

    if (savedSeconds >= MINIMUM_PROGRESS_SECONDS && savedSeconds < Math.max(durationSeconds - 3, MINIMUM_PROGRESS_SECONDS)) {
      audioAdapter.seekToSeconds(savedSeconds);
    }
  }

  /**
   * Produces a short user-facing playback mode label.
   * @returns {string}
   */
  function getPlaybackModeLabel() {
    const shuffleLabel = isShuffleEnabled ? "Shuffle on" : "Shuffle off";
    const repeatLabel = repeatMode === REPEAT_MODES.ALL
      ? "Repeat all"
      : repeatMode === REPEAT_MODES.ONE
        ? "Repeat track"
        : "Repeat off";

    return `${shuffleLabel}. ${repeatLabel}.`;
  }

  /**
   * Produces the current player view model.
   * @returns {object}
   */
  function buildState() {
    const selectedTrack = tracks[selectedIndex] ?? null;
    const filteredTracks = sortTracks(
      filterTracks(tracks, filterQuery, favoriteTrackIds, filterMode),
      sortMode
    );
    const favoriteTracks = tracks.filter((track) => favoriteTrackIds.has(track.id));
    const queuedTracks = getQueuedTracks();
    const recentTracks = getRecentTracks();

    return {
      currentTimeSeconds: audioAdapter.getCurrentTime(),
      durationSeconds: audioAdapter.getDuration() || selectedTrack?.durationSeconds || 0,
      favoriteTrackIds: [...favoriteTrackIds],
      favoriteTracks,
      filterMode,
      filterQuery,
      filteredTracks,
      isPlaying,
      isMuted,
      isShuffleEnabled,
      message,
      playbackModeLabel: getPlaybackModeLabel(),
      playlistMessage: getPlaylistMessage(filteredTracks.length),
      queuedTracks,
      recentTracks,
      repeatMode,
      selectedTrack,
      sortMode,
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
      favoriteTrackIds: [...favoriteTrackIds],
      isMuted,
      isShuffleEnabled,
      recentTrackIds,
      repeatMode,
      selectedTrackId: tracks[selectedIndex]?.id ?? null,
      sortMode,
      trackProgressSeconds,
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

    registerRecentTrack(selectedTrack.id);
    message = messages.LOADING;
    audioAdapter.loadTrack(selectedTrack);
    persistPreferences();
    notify();
  }

  /**
   * Selects the next queued track when available.
   * @returns {number | null} The next queued playlist index when present.
   */
  function consumeQueuedIndex() {
    const nextQueuedTrackId = queuedTrackIds.shift();

    if (!nextQueuedTrackId) {
      return null;
    }

    const nextIndex = tracks.findIndex((track) => track.id === nextQueuedTrackId);

    return nextIndex >= 0 ? nextIndex : null;
  }

  /**
   * Returns a randomized playlist index that differs from the current track when possible.
   * @returns {number}
   */
  function getShuffledIndex() {
    if (tracks.length <= 1) {
      return selectedIndex;
    }

    const candidateIndexes = tracks
      .map((track, index) => index)
      .filter((index) => index !== selectedIndex);
    const nextPosition = Math.floor(randomNumber() * candidateIndexes.length);

    return candidateIndexes[Math.min(Math.max(nextPosition, 0), candidateIndexes.length - 1)];
  }

  /**
   * Resolves the next playback index for non-queued playback.
   * @param {"user-next" | "track-ended"} reason The playback advance reason.
   * @returns {number | null}
   */
  function resolvePlaybackAdvanceIndex(reason) {
    if (tracks.length === 0) {
      return null;
    }

    if (reason === "track-ended" && repeatMode === REPEAT_MODES.ONE) {
      return selectedIndex;
    }

    if (isShuffleEnabled) {
      return getShuffledIndex();
    }

    const lastIndex = tracks.length - 1;

    if (selectedIndex < lastIndex) {
      return selectedIndex + 1;
    }

    if (repeatMode === REPEAT_MODES.ALL || reason === "user-next") {
      return 0;
    }

    return null;
  }

  /**
   * Handles end-of-track behavior when playback should stop instead of advancing.
   * @returns {void}
   */
  function finalizePlaybackAtTrackEnd() {
    isPlaying = false;
    message = messages.READY;
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
   * Advances playback according to the queue and playback mode settings.
   * @param {"user-next" | "track-ended"} reason The playback advance reason.
   * @returns {void}
   */
  function advancePlayback(reason) {
    if (tracks.length === 0) {
      return;
    }

    const queuedIndex = consumeQueuedIndex();
    const nextIndex = queuedIndex ?? resolvePlaybackAdvanceIndex(reason);

    if (nextIndex === null) {
      finalizePlaybackAtTrackEnd();
      return;
    }

    void playIndex(nextIndex);
  }

  audioAdapter.on("ended", () => {
    const selectedTrack = tracks[selectedIndex];

    if (selectedTrack) {
      clearTrackProgress(selectedTrack.id);
    }

    advancePlayback("track-ended");
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
    const selectedTrack = tracks[selectedIndex];

    if (selectedTrack) {
      updateTrackProgress(selectedTrack.id, audioAdapter.getCurrentTime(), false);
    }

    notify();
  });

  audioAdapter.on("loadedmetadata", () => {
    restoreSavedTrackProgress();

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
     * Cycles repeat mode through off, all, and one.
     * @returns {void}
     */
    cycleRepeatMode() {
      repeatMode = repeatMode === REPEAT_MODES.OFF
        ? REPEAT_MODES.ALL
        : repeatMode === REPEAT_MODES.ALL
          ? REPEAT_MODES.ONE
          : REPEAT_MODES.OFF;
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
     * Moves a queued track one position later in the queue.
     * @param {string} trackId The queued track identifier.
     * @returns {void}
     */
    moveQueuedTrackDown(trackId) {
      moveQueuedTrack(trackId, 1);
    },

    /**
     * Moves a queued track one position earlier in the queue.
     * @param {string} trackId The queued track identifier.
     * @returns {void}
     */
    moveQueuedTrackUp(trackId) {
      moveQueuedTrack(trackId, -1);
    },

    /**
     * Advances to the next track and starts playback.
     * @returns {void}
     */
    next() {
      advancePlayback("user-next");
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
        const nextIndex = selectedIndex > 0 ? selectedIndex - 1 : tracks.length - 1;
        void playIndex(nextIndex);
      }
    },

    /**
     * Adds a track to the explicit up-next queue.
     * @param {string} trackId The track to enqueue.
     * @returns {void}
     */
    queueTrack(trackId) {
      const trackExists = tracks.some((track) => track.id === trackId);
      const selectedTrackId = tracks[selectedIndex]?.id ?? null;

      if (!trackExists || queuedTrackIds.includes(trackId) || trackId === selectedTrackId) {
        return;
      }

      queuedTrackIds = [...queuedTrackIds, trackId];
      notify();
    },

    /**
     * Removes a track from the explicit up-next queue.
     * @param {string} trackId The track to remove.
     * @returns {void}
     */
    removeQueuedTrack(trackId) {
      queuedTrackIds = queuedTrackIds.filter((currentTrackId) => currentTrackId !== trackId);
      notify();
    },

    /**
     * Updates the active playlist mode.
     * @param {string} value The requested filter mode.
     * @returns {void}
     */
    setFilterMode(value) {
      filterMode = value === FILTER_MODES.FAVORITES ? FILTER_MODES.FAVORITES : FILTER_MODES.ALL;
      notify();
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
     * Updates the active playlist sort mode and persists it.
     * @param {string} value The requested sort mode.
     * @returns {void}
     */
    setSortMode(value) {
      sortMode = Object.values(SORT_MODES).includes(value) ? value : SORT_MODES.DEFAULT;
      persistPreferences();
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

      const selectedTrack = tracks[selectedIndex];

      if (selectedTrack) {
        updateTrackProgress(selectedTrack.id, audioAdapter.getCurrentTime(), true);
      }

      notify();
    },

    /**
     * Toggles whether a track is marked as a favorite.
     * @param {string} trackId The track to update.
     * @returns {void}
     */
    toggleFavoriteTrack(trackId) {
      const trackExists = tracks.some((track) => track.id === trackId);

      if (!trackExists) {
        return;
      }

      if (favoriteTrackIds.has(trackId)) {
        favoriteTrackIds.delete(trackId);
      } else {
        favoriteTrackIds.add(trackId);
      }

      persistPreferences();
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

        const selectedTrack = tracks[selectedIndex];

        if (selectedTrack) {
          updateTrackProgress(selectedTrack.id, audioAdapter.getCurrentTime(), true);
        }

        notify();
        return;
      }

      registerRecentTrack(tracks[selectedIndex].id);
      message = messages.BUFFERING;
      persistPreferences();
      notify();

      try {
        await audioAdapter.play();
      } catch {
        isPlaying = false;
        message = messages.LOAD_ERROR;
        notify();
      }
    },

    /**
     * Toggles shuffle mode and persists the latest value.
     * @returns {void}
     */
    toggleShuffle() {
      isShuffleEnabled = !isShuffleEnabled;
      persistPreferences();
      notify();
    }
  };
}
