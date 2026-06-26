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
This iteration adds explicit playback modes without letting them fight the queue or the rest of the player state. The controller now persists shuffle and repeat preferences alongside the selected track, volume, sort mode, favorites, recents, and resume data. Queue items still win first, then the controller applies the playback mode rules: shuffle picks a non-current random track when possible, repeat one replays the current track on natural track end, and repeat all wraps the playlist when the end is reached.

On the UI side, shuffle and repeat live in the controls card as first-class playback settings with a plain-English status indicator, so the user can see the current mode without guessing from behavior alone. That keeps the feature visible and makes the persisted state easy to verify in both the browser tests and the controller tests.

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
- The up-next queue is intentionally session-only in this iteration so queue interactions stay simple while playback order rules are being established.
- Shuffle and repeat preferences are persisted locally, while queue order remains session-only and higher priority than playback-mode rules.
