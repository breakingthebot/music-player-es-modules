# Modular Music Player

A browser-based music player built with native ES modules, modular JavaScript files, and no bundler.

## Stack
- HTML5 and CSS3
- Vanilla JavaScript with native ES modules
- Node.js for the local static server and test runner
- Playwright for browser interaction testing

## Setup
1. Install Node.js 22 or newer.
2. Clone the repository.
3. From the project root, run `node server.js`.
4. Open the local URL printed in the terminal.

## Environment Variables
This project does not currently require environment variables.
See `.env.example` for the canonical placeholder.

## Running Locally
- Start the app: `node server.js`
- Run the test suite: `node --test`
- Run the browser interaction test: `npm run test:browser`
- Run the combined CI-equivalent checks: `npm run test:ci`

## Deployed
Not deployed in this iteration.

## Architecture Notes
This iteration improves how users move through the library rather than adding another playback feature. The controller now owns a persisted playlist sort mode in addition to filtering, favorites, recents, and resume state, while a dedicated sorting service keeps presentation ordering separate from the underlying playlist data. That means sorting is predictable, testable, and easy to extend without introducing state drift between the UI and the player logic.

Keyboard navigation is also more deliberate now. Playlist rows and recent-track buttons support directional and boundary navigation, so users can move through results with Arrow keys, Home, and End instead of tabbing through every control. Combined with the existing browser test coverage, that gives the app a more deliberate accessibility baseline and a better interaction model for larger playlists.

## Notes
- Sample audio streams are loaded over HTTPS from SoundHelix for local demo playback.
- The local server is dependency-free so the project can run from a fresh clone without package installation.
- Player preferences are saved in `localStorage` under a single project-specific key.
- Playlist search matches against both track title and artist text.
- Favorite tracks are persisted locally and can be filtered as their own playlist view.
- Recently played tracks are persisted locally in a bounded, de-duplicated history.
- Track playback position is persisted per track so recent items can resume from their saved timestamp.
- GitHub Actions runs both unit tests and a Playwright browser interaction test on pushes and pull requests.
- Playlist sort mode is persisted locally and keyboard navigation now supports Arrow, Home, and End movement across playlist and recent rows.
