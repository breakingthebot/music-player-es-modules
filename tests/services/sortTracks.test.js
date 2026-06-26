/**
 * tests/services/sortTracks.test.js
 * Verifies playlist sorting behavior across supported sort modes.
 * Connects to: src/services/sortTracks.js
 * Created: 2026-06-25
 */

import test from "node:test";
import assert from "node:assert/strict";
import { SORT_MODES } from "../../src/config/appConfig.js";
import { sortTracks } from "../../src/services/sortTracks.js";

const tracks = [
  { artist: "SoundHelix", durationSeconds: 356, title: "Sunrise Drive" },
  { artist: "Atlas Bloom", durationSeconds: 221, title: "Coastal Run" },
  { artist: "SoundHelix", durationSeconds: 298, title: "Night Fall" }
];

test("sortTracks preserves the default order", () => {
  assert.deepEqual(sortTracks(tracks, SORT_MODES.DEFAULT).map((track) => track.title), [
    "Sunrise Drive",
    "Coastal Run",
    "Night Fall"
  ]);
});

test("sortTracks orders tracks by title, artist, and duration", () => {
  assert.deepEqual(sortTracks(tracks, SORT_MODES.TITLE_ASC).map((track) => track.title), [
    "Coastal Run",
    "Night Fall",
    "Sunrise Drive"
  ]);
  assert.deepEqual(sortTracks(tracks, SORT_MODES.ARTIST_ASC).map((track) => track.title), [
    "Coastal Run",
    "Night Fall",
    "Sunrise Drive"
  ]);
  assert.deepEqual(sortTracks(tracks, SORT_MODES.DURATION_ASC).map((track) => track.title), [
    "Coastal Run",
    "Night Fall",
    "Sunrise Drive"
  ]);
});

