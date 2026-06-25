# Changelog

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
