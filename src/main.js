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
import { createPreferencesStore } from "./services/createPreferencesStore.js";
import { createPlayerController } from "./services/createPlayerController.js";
import { importAudioFiles } from "./services/importAudioFiles.js";
import { createPlayerView } from "./components/createPlayerView.js";
import { attachKeyboardShortcuts } from "./utils/attachKeyboardShortcuts.js";
import { logger } from "./utils/logger.js";

const tracks = playlistSeed.map(createTrack);
const importedTrackUrls = new Set();
const preferencesStore = createPreferencesStore(window.localStorage);
const initialPreferences = preferencesStore.load();

const view = createPlayerView({
  onCycleRepeatMode: () => controller.cycleRepeatMode(),
  onFilterChange: (value) => controller.setFilterQuery(value),
  onFilterModeChange: (value) => controller.setFilterMode(value),
  onImportTracks: async (files) => {
    const { skippedFiles, tracks: importedTracks } = await importAudioFiles({ files });

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

const controller = createPlayerController({
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

logger.info("Bootstrapping music player.", { trackCount: tracks.length });
controller.bootstrap();

window.addEventListener("beforeunload", () => {
  for (const audioUrl of importedTrackUrls) {
    URL.revokeObjectURL(audioUrl);
  }
});
