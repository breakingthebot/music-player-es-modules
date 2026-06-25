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
  RECENT_TRACK_LIMIT
} from "../config/appConfig.js";
import { filterTracks } from "./filterTracks.js";
import { clampNumber } from "../utils/clampNumber.js";
import { updateRecentTrackIds } from "../utils/updateRecentTrackIds.js";

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
 *     recentTrackIds?: string[],
 *     selectedTrackId?: string | null,
 *     trackProgressSeconds?: Record<string, number>,
 *     volume?: number
 *   },
 *   messages: Record<string, string>,
 *   onStateChange: (state: object) => void,
 *   onPreferencesChange?: (preferences: {
 *     favoriteTrackIds: string[],
 *     isMuted: boolean,
 *     recentTrackIds: string[],
 *     selectedTrackId: string | null,
 *     trackProgressSeconds: Record<string, number>,
 *     volume: number
 *   }) => void,
 *   tracks: Array<{ id: string, title: string, artist: string, durationSeconds: number, audioUrl: string }>
 * }} dependencies The controller dependencies.
 * @returns {{
 *   bootstrap: () => void,
 *   getState: () => object,
 *   next: () => void,
 *   playSelectedTrack: (trackId: string) => Promise<void>,
 *   previous: () => void,
 *   setFilterMode: (value: string) => void,
 *   setFilterQuery: (value: string) => void,
 *   setVolume: (level: number) => void,
 *   seekTo: (ratio: number) => void,
 *   toggleFavoriteTrack: (trackId: string) => void,
 *   toggleMute: () => void,
 *   togglePlayback: () => Promise<void>
 * }}
 */
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
  let filterMode = FILTER_MODES.ALL;
  let filterQuery = "";
  const favoriteTrackIds = new Set(
    Array.isArray(initialPreferences.favoriteTrackIds) ? initialPreferences.favoriteTrackIds : []
  );
  let message = tracks.length === 0 ? messages.EMPTY_PLAYLIST : messages.LOADING;
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
      Object.entries(storedProgress).filter(([trackId, seconds]) => {
        return allowedTrackIds.has(trackId) && Number.isFinite(Number(seconds)) && Number(seconds) >= 0;
      }).map(([trackId, seconds]) => [trackId, Math.floor(Number(seconds))])
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
   * Produces the current player view model.
   * @returns {object}
   */
  function buildState() {
    const selectedTrack = tracks[selectedIndex] ?? null;
    const filteredTracks = filterTracks(tracks, filterQuery, favoriteTrackIds, filterMode);
    const favoriteTracks = tracks.filter((track) => favoriteTrackIds.has(track.id));
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
      message,
      playlistMessage: getPlaylistMessage(filteredTracks.length),
      recentTracks,
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
      favoriteTrackIds: [...favoriteTrackIds],
      isMuted,
      recentTrackIds,
      selectedTrackId: tracks[selectedIndex]?.id ?? null,
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
    const selectedTrack = tracks[selectedIndex];

    if (selectedTrack) {
      clearTrackProgress(selectedTrack.id);
    }

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
    }
  };
}
