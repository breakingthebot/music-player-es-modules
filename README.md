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
- Create a Vercel preview deployment: `npm run deploy:preview`
- Create a Vercel production deployment: `npm run deploy:prod`
- Load local audio files in the app with the `Load MP3 or WAV` control in the playlist panel.

## Deployed
Live deployment: `https://music-player-es-modules.vercel.app`
Latest direct deployment URL: `https://music-player-es-modules-kb9tyc0wq-b-bots-projects-bcdcaeb1.vercel.app`

## Architecture Notes
This iteration adds local audio import without replacing the seeded demo playlist or weakening the current playback model. Imported `.mp3` and `.wav` files are normalized through a dedicated import service that creates blob URLs, reads metadata for track duration, and converts the files into the same track shape used everywhere else in the app. That means imported tracks participate in the existing search, sort, queue, favorites, and playback flows instead of creating a second-track system just for local files.

On the UI side, the playlist panel now includes a focused local-audio import control with a visible status message for importing, skipping unsupported files, or reporting failures. The controller only needed one new capability here: appending tracks into the active playlist at runtime. That keeps the import path modular and testable while preserving the seeded playlist, the queue behavior, and the deployed static app structure.

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
- Queue reordering is also session-only and changes only the explicit up-next order, not the playlist itself.
- Deployments are intended to run through the Vercel CLI, with `.vercelignore` and `vercel.json` forcing a static hosting path instead of the local Node server entrypoint.
- The current live Vercel deployment is available at `music-player-es-modules.vercel.app`.
- Imported local tracks are session-only because blob URLs are browser-local and are not valid across reloads or devices.
