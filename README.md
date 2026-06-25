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
This iteration adds searchable playlist navigation without collapsing business logic into the UI. Search matching lives in its own filtering service, the controller owns the current query and filtered result set, and the view stays responsible for presentation and DOM events. That keeps playlist behavior testable and makes it straightforward to extend later with sorting, favorites, or grouped results.

The search experience is intentionally small but practical. Users can filter by title or artist, jump from the search box into the results with the keyboard, clear the query quickly, and get an explicit no-results state instead of an empty list that looks broken. Playback behavior stays independent from filtering, so searching the playlist does not interrupt the currently selected track.

## Notes
- Sample audio streams are loaded over HTTPS from SoundHelix for local demo playback.
- The local server is dependency-free so the project can run from a fresh clone without package installation.
- Player preferences are saved in `localStorage` under a single project-specific key.
- Playlist search matches against both track title and artist text.
