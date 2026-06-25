# Changelog

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
