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
import { createPlayerController } from "./services/createPlayerController.js";
import { createPlayerView } from "./components/createPlayerView.js";
import { logger } from "./utils/logger.js";

const tracks = playlistSeed.map(createTrack);

const view = createPlayerView({
  onNext: () => controller.next(),
  onPrevious: () => controller.previous(),
  onSeek: (ratio) => controller.seekTo(ratio),
  onTogglePlayback: () => controller.togglePlayback(),
  onTrackSelect: (trackId) => controller.playSelectedTrack(trackId)
});

const controller = createPlayerController({
  audioAdapter: createAudioAdapter(),
  messages: APP_MESSAGES,
  onStateChange: (state) => {
    view.render(state);
  },
  tracks
});

logger.info("Bootstrapping music player.", { trackCount: tracks.length });
controller.bootstrap();

