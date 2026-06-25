/**
 * tests/services/createPreferencesStore.test.js
 * Verifies browser preference loading and saving behavior.
 * Connects to: src/services/createPreferencesStore.js
 * Created: 2026-06-25
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createPreferencesStore } from "../../src/services/createPreferencesStore.js";

test("preferences store loads defaults when storage is empty", () => {
  const storage = {
    getItem() {
      return null;
    },
    setItem() {}
  };
  const store = createPreferencesStore(storage);

  assert.deepEqual(store.load(), {
    favoriteTrackIds: [],
    isMuted: false,
    selectedTrackId: null,
    volume: 0.72
  });
});

test("preferences store clamps and saves values", () => {
  let savedKey = "";
  let savedValue = "";
  const storage = {
    getItem() {
      return JSON.stringify({
        favoriteTrackIds: ["two", 4, "one"],
        isMuted: 1,
        selectedTrackId: "two",
        volume: 3
      });
    },
    setItem(key, value) {
      savedKey = key;
      savedValue = value;
    }
  };
  const store = createPreferencesStore(storage);

  assert.deepEqual(store.load(), {
    favoriteTrackIds: ["two", "one"],
    isMuted: true,
    selectedTrackId: "two",
    volume: 1
  });

  store.save({
    favoriteTrackIds: ["one", "two"],
    isMuted: false,
    selectedTrackId: "one",
    volume: -4
  });

  assert.equal(savedKey, "music-player-preferences");
  assert.deepEqual(JSON.parse(savedValue), {
    favoriteTrackIds: ["one", "two"],
    isMuted: false,
    selectedTrackId: "one",
    volume: 0
  });
});
