/**
 * tests/services/createPlayerController.test.js
 * Verifies playlist transitions and playback state updates.
 * Connects to: src/services/createPlayerController.js
 * Created: 2026-06-25
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createPlayerController } from "../../src/services/createPlayerController.js";

/**
 * Creates a lightweight fake audio adapter for controller testing.
 * @returns {object}
 */
function createFakeAudioAdapter() {
  const eventHandlers = new Map();
  let currentTime = 0;
  let duration = 180;
  let isMuted = false;
  let lastLoadedTrackId = null;
  let volume = 1;

  return {
    getCurrentTime() {
      return currentTime;
    },
    getDuration() {
      return duration;
    },
    loadTrack(track) {
      lastLoadedTrackId = track.id;
      currentTime = 0;
    },
    on(eventName, handler) {
      eventHandlers.set(eventName, handler);
    },
    pause() {},
    async play() {
      const handler = eventHandlers.get("playing");

      if (handler) {
        handler(new Event("playing"));
      }
    },
    setMuted(value) {
      isMuted = value;
    },
    setVolume(value) {
      volume = value;
    },
    seekToRatio(ratio) {
      currentTime = duration * ratio;
    },
    trigger(eventName) {
      const handler = eventHandlers.get(eventName);

      if (handler) {
        handler(new Event(eventName));
      }
    },
    getLastLoadedTrackId() {
      return lastLoadedTrackId;
    },
    getMuted() {
      return isMuted;
    },
    getVolume() {
      return volume;
    }
  };
}

const tracks = [
  {
    artist: "Artist One",
    audioUrl: "https://example.com/one.mp3",
    durationSeconds: 180,
    id: "one",
    title: "Track One"
  },
  {
    artist: "Artist Two",
    audioUrl: "https://example.com/two.mp3",
    durationSeconds: 200,
    id: "two",
    title: "Track Two"
  }
];

const messages = {
  EMPTY_PLAYLIST: "No tracks available.",
  FAVORITES_EMPTY: "No favorites available.",
  LOAD_ERROR: "Track failed.",
  LOADING: "Loading tracks.",
  PAUSED: "Paused.",
  PLAYING: "Playing."
};

test("controller bootstrap loads the first track", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();

  assert.equal(audioAdapter.getLastLoadedTrackId(), "one");
  assert.equal(states.at(-1).selectedTrack.id, "one");
});

test("controller plays a selected track and updates message", async () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  await controller.playSelectedTrack("two");

  assert.equal(audioAdapter.getLastLoadedTrackId(), "two");
  assert.equal(states.at(-1).isPlaying, true);
  assert.equal(states.at(-1).message, "Playing.");
});

test("controller seeks within the current track", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  controller.seekTo(0.5);

  assert.equal(states.at(-1).currentTimeSeconds, 90);
});

test("controller applies and persists saved preferences", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const savedPreferences = [];
  const controller = createPlayerController({
    audioAdapter,
    initialPreferences: {
      isMuted: true,
      selectedTrackId: "two",
      volume: 0.35
    },
    messages,
    onPreferencesChange: (preferences) => savedPreferences.push(preferences),
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();

  assert.equal(audioAdapter.getLastLoadedTrackId(), "two");
  assert.equal(audioAdapter.getMuted(), true);
  assert.equal(audioAdapter.getVolume(), 0.35);
  assert.equal(states.at(-1).selectedTrack.id, "two");
  assert.deepEqual(savedPreferences.at(-1), {
    favoriteTrackIds: [],
    isMuted: true,
    recentTrackIds: ["two"],
    selectedTrackId: "two",
    volume: 0.35
  });
});

test("controller updates volume and unmutes when needed", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    initialPreferences: {
      isMuted: true,
      volume: 0.2
    },
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  controller.setVolume(0.6);

  assert.equal(audioAdapter.getVolume(), 0.6);
  assert.equal(audioAdapter.getMuted(), false);
  assert.equal(states.at(-1).isMuted, false);
  assert.equal(states.at(-1).volume, 0.6);
});

test("controller toggles mute without changing volume", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  controller.setVolume(0.5);
  controller.toggleMute();

  assert.equal(audioAdapter.getMuted(), true);
  assert.equal(states.at(-1).isMuted, true);
  assert.equal(states.at(-1).volume, 0.5);
});

test("controller filters playlist results without changing the selected track", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages: {
      ...messages,
      SEARCH_EMPTY: "No matches."
    },
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  controller.setFilterQuery("two");

  assert.equal(states.at(-1).selectedTrack.id, "one");
  assert.deepEqual(states.at(-1).filteredTracks.map((track) => track.id), ["two"]);
});

test("controller exposes empty playlist search messaging", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages: {
      ...messages,
      SEARCH_EMPTY: "No matches."
    },
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  controller.setFilterQuery("missing");

  assert.equal(states.at(-1).playlistMessage, "No matches.");
  assert.equal(states.at(-1).filteredTracks.length, 0);
});

test("controller persists favorite track selections", () => {
  const audioAdapter = createFakeAudioAdapter();
  const savedPreferences = [];
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages,
    onPreferencesChange: (preferences) => savedPreferences.push(preferences),
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  controller.toggleFavoriteTrack("two");

  assert.deepEqual(states.at(-1).favoriteTrackIds, ["two"]);
  assert.deepEqual(savedPreferences.at(-1).favoriteTrackIds, ["two"]);
});

test("controller filters to favorites mode", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  controller.toggleFavoriteTrack("two");
  controller.setFilterMode("favorites");

  assert.equal(states.at(-1).filterMode, "favorites");
  assert.deepEqual(states.at(-1).filteredTracks.map((track) => track.id), ["two"]);
});

test("controller exposes favorites empty messaging", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  controller.setFilterMode("favorites");

  assert.equal(states.at(-1).playlistMessage, "No favorites available.");
  assert.equal(states.at(-1).filteredTracks.length, 0);
});

test("controller records recently played tracks in most-recent order", async () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();
  await controller.playSelectedTrack("two");
  await controller.playSelectedTrack("one");

  assert.deepEqual(states.at(-1).recentTracks.map((track) => track.id), ["one", "two"]);
});

test("controller restores recent history from preferences", () => {
  const audioAdapter = createFakeAudioAdapter();
  const states = [];
  const controller = createPlayerController({
    audioAdapter,
    initialPreferences: {
      recentTrackIds: ["two", "one"]
    },
    messages,
    onStateChange: (state) => states.push(state),
    tracks
  });

  controller.bootstrap();

  assert.deepEqual(states.at(-1).recentTracks.map((track) => track.id), ["one", "two"]);
});
