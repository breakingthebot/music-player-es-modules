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

## Architecture Notes
This iteration improves scanability without adding more persistent UI text. The shell now uses subtle section-specific color accents so the playback, transport, and library areas separate more clearly at a glance, while the controls and generated track rows expose more detail through hover titles instead of packing that information into the visible layout.

Most of the work still lives in the view and stylesheet layers rather than the controller. The important structural choice here is that tooltip behavior is attached where controls are rendered, including dynamic playlist, queue, and recent-track rows, so the interface stays minimal but still explains itself on demand.

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
- Imported local tracks are persisted in IndexedDB for the current browser, can be added either by file picker or drag and drop, can be removed individually from the playlist, and still do not sync across devices or browsers.
