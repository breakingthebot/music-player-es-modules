/**
 * tests/services/importAudioFiles.test.js
 * Verifies local audio file imports and normalization behavior.
 * Connects to: src/services/importAudioFiles.js
 * Created: 2026-06-26
 */

import test from "node:test";
import assert from "node:assert/strict";
import { importAudioFiles } from "../../src/services/importAudioFiles.js";

test("importAudioFiles creates playable tracks from supported files", async () => {
  const files = [
    {
      lastModified: 100,
      name: "My Song.mp3",
      size: 2048,
      type: "audio/mpeg"
    }
  ];

  const result = await importAudioFiles({
    createObjectUrl: () => "blob:track-one",
    files,
    getAudioDuration: async () => 181.4,
    now: () => 12345
  });

  assert.deepEqual(result.skippedFiles, []);
  assert.deepEqual(result.tracks, [
    {
      artist: "Local file",
      audioUrl: "blob:track-one",
      durationSeconds: 181,
      id: "local-my-song-mp3-2048-100-12345-0",
      isImported: true,
      title: "My Song"
    }
  ]);
  assert.deepEqual(result.storedTracks, [
    {
      blob: files[0],
      durationSeconds: 181,
      fileName: "My Song.mp3",
      id: "local-my-song-mp3-2048-100-12345-0",
      mimeType: "audio/mpeg",
      title: "My Song"
    }
  ]);
});

test("importAudioFiles skips unsupported file types", async () => {
  const files = [
    {
      lastModified: 100,
      name: "notes.txt",
      size: 512,
      type: "text/plain"
    }
  ];

  const result = await importAudioFiles({
    files,
    getAudioDuration: async () => 1
  });

  assert.deepEqual(result.tracks, []);
  assert.deepEqual(result.skippedFiles, ["notes.txt"]);
  assert.deepEqual(result.storedTracks, []);
});
