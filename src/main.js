/**
 * src/main.js
 * Composes configuration, models, services, and UI modules into the running app.
 * Connects to: src/config/appConfig.js, src/data/playlist.js, src/services/, src/components/
 * Created: 2026-06-25
 */

import { APP_MESSAGES } from "./config/appConfig.js";
import { playlistSeed } from "./data/playlist.js";
import { createTrack } from "./models/createTrack.js";
import { createAudioAdapter } from "./services/createAudioAdapter.js";
import { createImportedTrackStore } from "./services/createImportedTrackStore.js";
import { createPreferencesStore } from "./services/createPreferencesStore.js";
import { createPlayerController } from "./services/createPlayerController.js";
import { importAudioFiles } from "./services/importAudioFiles.js";
import { createPlayerView } from "./components/createPlayerView.js";
import { attachKeyboardShortcuts } from "./utils/attachKeyboardShortcuts.js";
import { logger } from "./utils/logger.js";

void bootstrapApplication().catch((error) => {
  logger.error("Music player bootstrap failed.", {
    error: error instanceof Error ? error.message : "Unknown error"
  });
});

/**
 * Bootstraps the player after restoring persisted browser state.
 * @returns {Promise<void>}
 */
async function bootstrapApplication() {
  const importedTrackUrls = new Set();
  const preferencesStore = createPreferencesStore(window.localStorage);
  const importedTrackStore = createImportedTrackStore();
  const initialPreferences = preferencesStore.load();
  const restoredImportedTracks = await importedTrackStore.loadTracks();
  const tracks = [
    ...playlistSeed.map(createTrack),
    ...restoredImportedTracks
  ];
  let controller;

  for (const track of restoredImportedTracks) {
    importedTrackUrls.add(track.audioUrl);
  }

  const view = createPlayerView({
    onCycleRepeatMode: () => controller.cycleRepeatMode(),
    onFilterChange: (value) => controller.setFilterQuery(value),
    onFilterModeChange: (value) => controller.setFilterMode(value),
    onImportTracks: async (files) => {
      const {
        skippedFiles,
        storedTracks,
        tracks: importedTracks
      } = await importAudioFiles({ files });

      await importedTrackStore.saveTracks(storedTracks);

      for (const track of importedTracks) {
        importedTrackUrls.add(track.audioUrl);
      }

      controller.addTracks(importedTracks);

      if (importedTracks.length === 0) {
        return skippedFiles.length > 0
          ? "No supported MP3 or WAV files were imported."
          : "No files were selected.";
      }

      if (skippedFiles.length > 0) {
        return `Imported ${importedTracks.length} track(s). Skipped ${skippedFiles.length} unsupported file(s).`;
      }

      return `Imported ${importedTracks.length} track(s) into the playlist.`;
    },
    onMoveQueuedTrackDown: (trackId) => controller.moveQueuedTrackDown(trackId),
    onMoveQueuedTrackUp: (trackId) => controller.moveQueuedTrackUp(trackId),
    onNext: () => controller.next(),
    onPrevious: () => controller.previous(),
    onQueueTrack: (trackId) => controller.queueTrack(trackId),
    onRemoveImportedTrack: async (trackId) => {
      const importedTrack = controller.getState().tracks.find((track) => track.id === trackId);

      if (!importedTrack?.isImported) {
        return "Only imported local tracks can be removed.";
      }

      await importedTrackStore.deleteTrack(trackId);
      controller.removeTrack(trackId);

      if (importedTrackUrls.has(importedTrack.audioUrl)) {
        URL.revokeObjectURL(importedTrack.audioUrl);
        importedTrackUrls.delete(importedTrack.audioUrl);
      }

      return `Removed imported track "${importedTrack.title}".`;
    },
    onRemoveQueuedTrack: (trackId) => controller.removeQueuedTrack(trackId),
    onSetSortMode: (value) => controller.setSortMode(value),
    onSetVolume: (level) => controller.setVolume(level),
    onSeek: (ratio) => controller.seekTo(ratio),
    onToggleFavoriteTrack: (trackId) => controller.toggleFavoriteTrack(trackId),
    onToggleMute: () => controller.toggleMute(),
    onTogglePlayback: () => controller.togglePlayback(),
    onToggleShuffle: () => controller.toggleShuffle(),
    onTrackSelect: (trackId) => controller.playSelectedTrack(trackId)
  });

  controller = createPlayerController({
    audioAdapter: createAudioAdapter(),
    initialPreferences,
    messages: APP_MESSAGES,
    onPreferencesChange: (preferences) => {
      preferencesStore.save(preferences);
    },
    onStateChange: (state) => {
      view.render(state);
    },
    tracks
  });

  attachKeyboardShortcuts({
    onNext: () => controller.next(),
    onPrevious: () => controller.previous(),
    onToggleMute: () => controller.toggleMute(),
    onTogglePlayback: () => controller.togglePlayback()
  });

  logger.info("Bootstrapping music player.", {
    importedTrackCount: restoredImportedTracks.length,
    trackCount: tracks.length
  });
  controller.bootstrap();

  window.addEventListener("beforeunload", () => {
    for (const audioUrl of importedTrackUrls) {
      URL.revokeObjectURL(audioUrl);
    }
  });
}
