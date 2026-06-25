/**
 * tests/utils/updateRecentTrackIds.test.js
 * Verifies bounded recent-track history updates and duplicate removal.
 * Connects to: src/utils/updateRecentTrackIds.js
 * Created: 2026-06-25
 */

import test from "node:test";
import assert from "node:assert/strict";
import { updateRecentTrackIds } from "../../src/utils/updateRecentTrackIds.js";

test("updateRecentTrackIds adds a new track to the front", () => {
  assert.deepEqual(updateRecentTrackIds(["two", "three"], "one", 5), ["one", "two", "three"]);
});

test("updateRecentTrackIds removes duplicates and enforces the limit", () => {
  assert.deepEqual(
    updateRecentTrackIds(["one", "two", "three", "four", "five"], "three", 3),
    ["three", "one", "two"]
  );
});

