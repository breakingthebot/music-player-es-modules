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
import { createPlayerView } from "./components/createPlayerView.js";
import { attachKeyboardShortcuts } from "./utils/attachKeyboardShortcuts.js";
import { logger } from "./utils/logger.js";

const tracks = playlistSeed.map(createTrack);
const preferencesStore = createPreferencesStore(window.localStorage);
const initialPreferences = preferencesStore.load();

const view = createPlayerView({
  onCycleRepeatMode: () => controller.cycleRepeatMode(),
  onFilterChange: (value) => controller.setFilterQuery(value),
  onFilterModeChange: (value) => controller.setFilterMode(value),
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
