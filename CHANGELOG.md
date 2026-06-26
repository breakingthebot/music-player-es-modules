# Changelog

## [0.18.0] - 2026-06-26
### Changed
- Simplified the interface into a sleeker, more minimal visual system with smaller typography and quieter surfaces.
- Reduced visual noise in the hero, controls, and playlist shell without removing any player features.
- Updated README architecture notes for the minimal UI pass.

## [0.17.0] - 2026-06-26
### Added
- A more polished visual shell with a redesigned hero, richer panel hierarchy, and upgraded surface styling.

### Changed
- Refined typography, spacing, controls, and playlist presentation without changing player behavior.
- Updated README architecture notes for the UI polish pass.

## [0.16.0] - 2026-06-26
### Added
- Drag-and-drop local audio importing through a dedicated playlist drop zone.
- Browser coverage for dropped-file importing alongside the existing picker-based import flow.

### Changed
- Unified file-picker and drag-and-drop imports onto one shared UI import path.
- Updated README architecture notes for the drag-and-drop import experience.

## [0.15.0] - 2026-06-26
### Added
- Imported-track removal controls directly in playlist rows for locally added audio.
- IndexedDB deletion support for imported tracks so removed local files stay gone after reload.
- Controller and browser coverage for imported-track cleanup and persistence removal behavior.

### Changed
- Extended the track model with explicit imported-track metadata instead of relying on naming conventions.
- Updated README architecture notes for imported-track lifecycle management.

## [0.14.0] - 2026-06-26
### Added
- IndexedDB-backed imported-track storage for local MP3 and WAV files.
- Startup restoration of previously imported local tracks in the same browser.
- Unit coverage for imported-track persistence plus browser coverage for reload restoration.

### Changed
- Extended the import service to return persistence-ready imported file records alongside playable tracks.
- Updated README architecture notes for browser-local imported-track persistence.

## [0.13.0] - 2026-06-26
### Added
- Local MP3 and WAV import controls in the playlist panel.
- Runtime audio import service that converts selected files into in-app tracks with blob URLs and detected durations.
- Controller, model, and browser coverage for imported local track playback.

### Changed
- Expanded the track model to accept secure blob URLs for browser-imported audio files.
- Updated README architecture notes for the local audio import flow.

## [0.12.0] - 2026-06-26
### Added
- `.vercelignore` to keep local-only files, test artifacts, editor settings, and `AGENTS.md` out of deployments.
- Preview and production deployment scripts for the Vercel CLI.

### Changed
- Updated README deployment guidance and deployment notes for the Vercel preview flow.
- Bumped the package version for the deployment-hardening iteration.
- Published the app on Vercel and documented the live deployment URL.
- Corrected the Vercel deployment path so the project is served as a static site instead of the local Node server.
- Updated the documented direct deployment URL after the static hosting fix.

## [0.11.0] - 2026-06-26
### Added
- Queue reordering controls so queued tracks can move up or down before playback.
- Controller and browser coverage for reordered queue playback order.

### Changed
- Updated the queue panel layout to support move-up, move-down, and remove actions together.
- Updated README architecture notes for the reordered queue flow.

## [0.10.0] - 2026-06-26
### Added
- Shuffle and repeat playback controls with visible state indicators in the control panel.
- Persisted playback mode preferences for shuffle and repeat behavior.
- Controller and browser tests covering shuffle, repeat-one, repeat-all, and persisted mode state.

### Changed
- Playback advance rules now resolve queue items before shuffle and repeat behavior.
- Updated README architecture notes for the playback-mode flow.

## [0.9.0] - 2026-06-25
### Added
- Explicit up-next queue controls so playlist rows can schedule tracks to play next.
- Dedicated queue panel with removable queued items and visible playback order.
- Controller and browser tests covering queue insertion, removal, and queue-first playback.

### Changed
- Updated the playlist row layout to support both favorite and queue actions without collapsing playback selection.
- Updated README architecture notes for the new queue-driven playback flow.

## [0.8.0] - 2026-06-25
### Added
- Playlist sorting options for default order, title, artist, and duration.
- Keyboard row navigation across playlist items and recent-track buttons.
- Sorting utility tests and browser assertions for sort mode and keyboard navigation.

### Changed
- Extended local preference storage to include the persisted playlist sort mode.
- Updated README architecture notes for sorting and keyboard navigation behavior.

## [0.7.0] - 2026-06-25
### Added
- GitHub Actions CI workflow for unit and browser interaction tests.
- Playwright browser test covering playback, search, favorites, and recent-track resume behavior.
- Cross-platform browser test runner that starts and stops the local server explicitly.

### Changed
- Updated README setup and architecture notes for the CI and browser test flow.
- Added Playwright test artifacts to `.gitignore`.

## [0.6.0] - 2026-06-25
### Added
- Per-track playback position persistence with saved resume timestamps.
- Recent-track resume metadata that shows whether a track resumes from a saved time.
- Controller tests covering seek persistence and restored saved playback position.

### Changed
- Extended local preference storage to include per-track progress seconds.
- Updated README architecture notes for the resume-position flow.

## [0.5.0] - 2026-06-25
### Added
- Recently played history with compact resume buttons in the player panel.
- Bounded, de-duplicated recent-track persistence in local storage.
- Utility and controller tests covering recent-history ordering and restoration.

### Changed
- Extended local preference storage to include recent track IDs.
- Updated README architecture notes for the recently played flow.

## [0.4.0] - 2026-06-25
### Added
- Favorite track toggles directly in each playlist row.
- Favorites-only playlist mode layered on top of text search.
- Persistence and controller tests for favorite state and favorite filtering behavior.

### Changed
- Extended local preference storage to include favorite track IDs.
- Updated README architecture notes for favorite-state flow and stacked filtering.

## [0.3.0] - 2026-06-25
### Added
- Search input for playlist filtering by title or artist.
- Keyboard-friendly playlist search behavior with clear and focus shortcuts.
- Filter service and controller tests covering search matches and no-result states.

### Changed
- Updated playlist rendering with a dedicated no-results message instead of a blank list.
- Refreshed README architecture notes for the searchable playlist flow.

## [0.2.0] - 2026-06-25
### Added
- Volume slider, mute toggle, and keyboard shortcuts for playback controls.
- Browser preference persistence for selected track, mute state, and volume.
- Additional controller and preferences store tests covering restored state and volume behavior.

### Changed
- Improved playback status messaging to distinguish loading, buffering, ready, paused, and error states.
- Updated README architecture notes for the new persistence and control flow.

## [0.1.0] - 2026-06-25
### Added
- Initial no-bundler ES module music player with playlist selection, playback controls, and progress display.
- Modular project structure across configuration, data, models, services, components, and utilities.
- Node-based static development server and test suite for reusable player logic.
- MIT license, environment template, and initial project documentation.
