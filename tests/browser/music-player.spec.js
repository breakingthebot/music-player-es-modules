/**
 * tests/browser/music-player.spec.js
 * Verifies core browser interactions for playback controls, queueing, playback modes, search, favorites, and recents.
 * Connects to: playwright.config.js, index.html, src/main.js
 * Created: 2026-06-25
 */

import { expect, test } from "@playwright/test";

/**
 * Registers a deterministic fake Audio implementation for browser tests.
 * @param {import("@playwright/test").Page} page The Playwright page instance.
 * @returns {Promise<void>}
 */
async function installFakeAudio(page) {
  await page.addInitScript(() => {
    class FakeAudio {
      constructor() {
        this.currentTime = 0;
        this.duration = 180;
        this.muted = false;
        this.preload = "metadata";
        this.src = "";
        this.volume = 1;
        this._listeners = new Map();
      }

      addEventListener(eventName, handler) {
        const handlers = this._listeners.get(eventName) ?? [];
        handlers.push(handler);
        this._listeners.set(eventName, handlers);
      }

      removeEventListener(eventName, handler) {
        const handlers = this._listeners.get(eventName) ?? [];
        this._listeners.set(
          eventName,
          handlers.filter((currentHandler) => currentHandler !== handler)
        );
      }

      _dispatch(eventName) {
        const event = new Event(eventName);
        const handlers = this._listeners.get(eventName) ?? [];

        for (const handler of handlers) {
          handler(event);
        }
      }

      load() {
        queueMicrotask(() => {
          this._dispatch("loadedmetadata");
        });
      }

      async play() {
        this._dispatch("playing");
      }

      pause() {}
    }

    window.Audio = FakeAudio;
  });
}

test("music player supports playback controls, queueing, playback modes, search, favorites, and recents", async ({ page }) => {
  await installFakeAudio(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Modular Music Player" })).toBeVisible();

  await page.locator("#play-button").click();
  await expect(page.locator("#play-button")).toHaveText("Pause");

  await page.getByLabel("Seek within the current track").fill("50");
  await expect(page.locator("#current-time")).toHaveText("1:30");

  const playlistButtons = page.locator(".playlist-button");

  await page.getByRole("button", { name: "Play Night Fall next" }).click();
  await expect(page.locator("#queue-section")).toBeVisible();
  await expect(page.locator("#queue-list")).toContainText("Night Fall");
  await page.getByRole("button", { name: "Remove Night Fall from queue" }).click();
  await expect(page.locator("#queue-section")).toBeHidden();

  await page.getByRole("button", { name: "Play Night Fall next" }).click();
  await page.getByRole("button", { name: "Play City Lights next" }).click();
  await expect(page.locator("#queue-list")).toContainText("Night Fall");
  await expect(page.locator("#queue-list")).toContainText("City Lights");
  await page.getByRole("button", { name: "Move City Lights up in queue" }).click();
  await expect(page.locator(".queue-item").first()).toContainText("City Lights");
  await page.locator("#next-button").click();
  await expect(page.locator("#track-title")).toHaveText("City Lights");
  await expect(page.locator("#queue-list")).toContainText("Night Fall");

  await page.locator("#shuffle-button").click();
  await expect(page.locator("#shuffle-button")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#repeat-button").click();
  await expect(page.locator("#repeat-button")).toHaveText("Repeat: All");
  await expect(page.locator("#playback-mode-indicator")).toContainText("Shuffle on");
  await expect(page.locator("#playback-mode-indicator")).toContainText("Repeat all");

  await page.locator("#playlist-import-input").setInputFiles({
    mimeType: "audio/mpeg",
    name: "Local Demo.mp3",
    buffer: Buffer.from("fake-audio")
  });
  await expect(page.locator("#playlist-import-status")).toContainText("Imported 1 track");
  await expect(playlistButtons.filter({ hasText: "Local Demo" })).toBeVisible();

  await page.getByLabel("Sort playlist tracks").selectOption("title-asc");
  await expect(playlistButtons.first()).toContainText("City Lights");

  await page.getByLabel("Search tracks").fill("Night");
  await expect(playlistButtons.filter({ hasText: "Night Fall" })).toBeVisible();
  await expect(playlistButtons.filter({ hasText: "Sunrise Drive" })).toHaveCount(0);
  await page.getByLabel("Search tracks").press("ArrowDown");
  await expect(playlistButtons.filter({ hasText: "Night Fall" })).toBeFocused();

  await page.getByRole("button", { name: "Clear" }).click();
  await page.getByRole("button", { name: "Add Night Fall to favorites" }).click();
  await page.getByRole("button", { name: /^Favorites \(1\)$/ }).click();
  await expect(playlistButtons.filter({ hasText: "Night Fall" })).toBeVisible();
  await expect(playlistButtons.filter({ hasText: "Sunrise Drive" })).toHaveCount(0);

  await page.getByRole("button", { name: "All tracks" }).click();
  await playlistButtons.first().focus();
  await playlistButtons.first().press("End");
  await expect(playlistButtons.last()).toBeFocused();
  await playlistButtons.filter({ hasText: "Night Fall" }).click();
  await expect(page.locator("#recent-tracks-section")).toBeVisible();
  await expect(page.locator("#recent-tracks")).toContainText("Resume at 1:30");
  const recentTrackButtons = page.locator(".recent-track-button");
  await recentTrackButtons.first().focus();
  await recentTrackButtons.first().press("End");
  await expect(recentTrackButtons.last()).toBeFocused();

  await page.reload();
  await expect(page.locator("#recent-tracks")).toContainText("Resume at 1:30");
  await expect(page.getByRole("button", { name: /^Favorites \(1\)$/ })).toBeVisible();
  await expect(page.getByLabel("Sort playlist tracks")).toHaveValue("title-asc");
  await expect(page.locator("#shuffle-button")).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#repeat-button")).toHaveText("Repeat: All");
  await expect(playlistButtons.filter({ hasText: "Local Demo" })).toBeVisible();

  await page.getByRole("button", { name: "Remove imported track Local Demo" }).click();
  await expect(page.locator("#playlist-import-status")).toContainText("Removed imported track");
  await expect(playlistButtons.filter({ hasText: "Local Demo" })).toHaveCount(0);

  await page.reload();
  await expect(playlistButtons.filter({ hasText: "Local Demo" })).toHaveCount(0);
});
