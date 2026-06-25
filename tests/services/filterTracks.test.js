/**
 * tests/services/filterTracks.test.js
 * Verifies playlist filtering behavior for title and artist search.
 * Connects to: src/services/filterTracks.js
 * Created: 2026-06-25
 */

import test from "node:test";
import assert from "node:assert/strict";
import { filterTracks } from "../../src/services/filterTracks.js";

const tracks = [
  { artist: "SoundHelix", title: "Sunrise Drive" },
  { artist: "SoundHelix", title: "Night Fall" },
  { artist: "Atlas Bloom", title: "Coastal Run" }
];

test("filterTracks returns all tracks for an empty query", () => {
  assert.equal(filterTracks(tracks, "").length, 3);
});

test("filterTracks matches against title and artist", () => {
  assert.deepEqual(filterTracks(tracks, "sound").map((track) => track.title), [
    "Sunrise Drive",
    "Night Fall"
  ]);
  assert.deepEqual(filterTracks(tracks, "coastal").map((track) => track.title), [
    "Coastal Run"
  ]);
});

test("filterTracks ignores case and extra whitespace", () => {
  assert.deepEqual(filterTracks(tracks, "  nIgHt  ").map((track) => track.title), [
    "Night Fall"
  ]);
});

