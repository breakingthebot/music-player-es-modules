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
This iteration adds the first real CI path instead of treating local testing as enough. The project now has a GitHub Actions workflow that installs dependencies, provisions Playwright’s Chromium browser, and runs both the existing unit suite and a browser-level interaction spec. That browser spec stubs audio deterministically, which keeps the test focused on app behavior instead of network audio quirks or autoplay restrictions.

The browser test covers the core user flows that now define the app: playback controls, playlist search, favorites filtering, and recently played resume metadata. The test harness starts the local server explicitly and shuts it down cleanly, which keeps the no-bundler architecture intact while still giving the repo a dependable automated gate for future iterations.

## Notes
- Sample audio streams are loaded over HTTPS from SoundHelix for local demo playback.
- The local server is dependency-free so the project can run from a fresh clone without package installation.
- Player preferences are saved in `localStorage` under a single project-specific key.
- Playlist search matches against both track title and artist text.
- Favorite tracks are persisted locally and can be filtered as their own playlist view.
- Recently played tracks are persisted locally in a bounded, de-duplicated history.
- Track playback position is persisted per track so recent items can resume from their saved timestamp.
- GitHub Actions runs both unit tests and a Playwright browser interaction test on pushes and pull requests.
