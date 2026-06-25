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
This iteration adds favorites as a persisted playlist layer rather than a one-off visual toggle. The controller now owns favorite track IDs alongside the existing playback and search state, while the preferences store persists those IDs with the rest of the player settings. That keeps the business rules for favorites in the same state boundary as playback, not scattered across DOM event handlers.

The playlist UI now supports two complementary filters: free-text search and favorites-only mode. Those filters stack cleanly, so users can search within favorites and still get explicit empty-state messaging when nothing matches. Track starring stays local to each playlist row, which makes the action quick without interrupting playback or forcing a separate management screen.

## Notes
- Sample audio streams are loaded over HTTPS from SoundHelix for local demo playback.
- The local server is dependency-free so the project can run from a fresh clone without package installation.
- Player preferences are saved in `localStorage` under a single project-specific key.
- Playlist search matches against both track title and artist text.
- Favorite tracks are persisted locally and can be filtered as their own playlist view.
