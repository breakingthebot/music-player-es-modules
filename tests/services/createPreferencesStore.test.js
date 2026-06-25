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
    recentTrackIds: [],
    selectedTrackId: null,
    trackProgressSeconds: {},
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
        recentTrackIds: ["two", 8, "one"],
        selectedTrackId: "two",
        trackProgressSeconds: {
          one: 42,
          two: "90",
          bad: -1
        },
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
    recentTrackIds: ["two", "one"],
    selectedTrackId: "two",
    trackProgressSeconds: {
      one: 42,
      two: 90
    },
    volume: 1
  });

  store.save({
    favoriteTrackIds: ["one", "two"],
    isMuted: false,
    recentTrackIds: ["two", "one"],
    selectedTrackId: "one",
    trackProgressSeconds: {
      one: 15,
      two: 61
    },
    volume: -4
  });

  assert.equal(savedKey, "music-player-preferences");
  assert.deepEqual(JSON.parse(savedValue), {
    favoriteTrackIds: ["one", "two"],
    isMuted: false,
    recentTrackIds: ["two", "one"],
    selectedTrackId: "one",
    trackProgressSeconds: {
      one: 15,
      two: 61
    },
    volume: 0
  });
});
