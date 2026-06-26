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

## Deployed
Live deployment: `https://music-player-es-modules.vercel.app`
Latest direct deployment URL: `https://music-player-es-modules-2v3o3fwiu-b-bots-projects-bcdcaeb1.vercel.app`

## Architecture Notes
This iteration makes the queue more useful by letting users reorder it without changing the underlying playlist or the persisted playback preferences. The controller now exposes small, explicit queue movement operations that only affect the session queue, and the playback path still consumes the queue from the front before any shuffle or repeat logic runs. That keeps the queue deterministic even as the player gains more playback modes.

On the UI side, the queue panel now exposes move-up, move-down, and remove controls directly on each queued item, so the user can see and adjust the exact upcoming order without dragging or leaving the main player surface. The browser and controller tests now prove not just that items can be queued, but that a reordered queue is the order playback actually uses.

This deployment-hardening pass keeps that behavior intact while making the repo safer to ship. Vercel now ignores local-only instructions, test output, editor state, and other non-deploy artifacts, and the package scripts expose a consistent preview and production deployment path from the CLI.

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
- Deployments are intended to run through the Vercel CLI, with `.vercelignore` mirroring the local-only exclusions needed for a clean hosted build.
- The current live Vercel deployment is available at `music-player-es-modules.vercel.app`.
