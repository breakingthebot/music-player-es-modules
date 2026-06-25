/**
 * playwright.config.js
 * Configures Playwright for local and CI browser interaction tests.
 * Connects to: tests/browser/music-player.spec.js, server.js
 * Created: 2026-06-25
 */

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true
  }
});

