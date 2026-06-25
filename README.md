# Modular Music Player

A browser-based music player built with native ES modules, modular JavaScript files, and no bundler.

## Stack
- HTML5 and CSS3
- Vanilla JavaScript with native ES modules
- Node.js for the local static server and test runner

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

## Deployed
Not deployed in this iteration.

## Architecture Notes
This iteration adds a small, persistent recently played system so the app remembers what you listened to and makes it easy to jump back in. The controller now maintains a bounded most-recent-first history, the preferences store persists that history beside the rest of the player state, and the UI renders a compact recent list without mixing storage rules into the DOM layer.

The recent list is intentionally lightweight instead of turning into a full activity feed. It only keeps a short, de-duplicated history of tracks, which is enough to support a “resume listening” workflow while staying predictable and easy to test. Playback, favorites, filtering, and recents now all flow through the same controller boundary, so later iterations can add track-position resume or richer history without rewriting the state model.

## Notes
- Sample audio streams are loaded over HTTPS from SoundHelix for local demo playback.
- The local server is dependency-free so the project can run from a fresh clone without package installation.
- Player preferences are saved in `localStorage` under a single project-specific key.
- Playlist search matches against both track title and artist text.
- Favorite tracks are persisted locally and can be filtered as their own playlist view.
- Recently played tracks are persisted locally in a bounded, de-duplicated history.
