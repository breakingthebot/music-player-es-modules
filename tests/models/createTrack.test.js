/**
 * tests/models/createTrack.test.js
 * Verifies track normalization and validation rules.
 * Connects to: src/models/createTrack.js
 * Created: 2026-06-25
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createTrack } from "../../src/models/createTrack.js";

test("createTrack returns an immutable normalized track", () => {
  const track = createTrack({
    artist: " Example Artist ",
    audioUrl: "https://example.com/song.mp3",
    durationSeconds: "245",
    id: "demo",
    title: " Example Song "
  });

  assert.deepEqual(track, {
    artist: "Example Artist",
    audioUrl: "https://example.com/song.mp3",
    durationSeconds: 245,
    id: "demo",
    title: "Example Song"
  });
  assert.throws(() => {
    track.title = "Changed";
  });
});

test("createTrack rejects non-https audio URLs", () => {
  assert.throws(() => {
    createTrack({
      artist: "Example Artist",
      audioUrl: "http://example.com/song.mp3",
      durationSeconds: 245,
      id: "demo",
      title: "Example Song"
    });
  }, /HTTPS/);
});

