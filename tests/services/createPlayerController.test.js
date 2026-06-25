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
  let lastLoadedTrackId = null;

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
    async play() {},
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

