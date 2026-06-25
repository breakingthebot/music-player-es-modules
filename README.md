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
This iteration adds per-track resume positions on top of the recent-history system. The controller now keeps a small map of saved playback seconds by track ID, restores those values when metadata is available, and persists updated progress alongside favorites, recents, and the selected track. That keeps resume logic in the same state boundary as playback rather than scattering it between the audio element and the view.

The recent list is now more useful because it shows whether a track resumes from a saved timestamp or starts fresh. Resume persistence is intentionally bounded to meaningful playback progress, so the app avoids cluttering storage with a few accidental seconds at the start of a track. This sets up the player for stronger long-form listening behavior without changing the modular file boundaries.

## Notes
- Sample audio streams are loaded over HTTPS from SoundHelix for local demo playback.
- The local server is dependency-free so the project can run from a fresh clone without package installation.
- Player preferences are saved in `localStorage` under a single project-specific key.
- Playlist search matches against both track title and artist text.
- Favorite tracks are persisted locally and can be filtered as their own playlist view.
- Recently played tracks are persisted locally in a bounded, de-duplicated history.
- Track playback position is persisted per track so recent items can resume from their saved timestamp.
