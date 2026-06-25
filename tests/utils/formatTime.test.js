/**
 * tests/utils/formatTime.test.js
 * Verifies player time formatting for normal and edge-case values.
 * Connects to: src/utils/formatTime.js
 * Created: 2026-06-25
 */

import test from "node:test";
import assert from "node:assert/strict";
import { formatTime } from "../../src/utils/formatTime.js";

test("formatTime formats whole minutes and seconds", () => {
  assert.equal(formatTime(125), "2:05");
});

test("formatTime clamps invalid input to zero", () => {
  assert.equal(formatTime(-10), "0:00");
  assert.equal(formatTime(Number.NaN), "0:00");
});

