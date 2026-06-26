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

test("createTrack allows blob URLs for imported local audio", () => {
  const track = createTrack({
    artist: "Local file",
    audioUrl: "blob:example-track",
    durationSeconds: 245,
    id: "local-track",
    title: "Imported Song"
  });

  assert.equal(track.audioUrl, "blob:example-track");
});

test("createTrack rejects unsupported audio URL schemes", () => {
  assert.throws(() => {
    createTrack({
      artist: "Example Artist",
      audioUrl: "http://example.com/song.mp3",
      durationSeconds: 245,
      id: "demo",
      title: "Example Song"
    });
  }, /HTTPS or a browser blob URL/);
});
