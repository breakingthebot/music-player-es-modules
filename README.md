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
This iteration keeps the original structure intact and adds the first real layer of product polish. The player now remembers which track you last selected and what volume you used, which makes it feel like an actual tool instead of a disposable demo. That persistence stays outside the rendering layer in a dedicated preferences service, while the controller remains responsible for playback state, messaging, and UI updates.

Keyboard shortcuts and volume controls were added without collapsing logic into the DOM layer. The browser view only handles user interactions and presentation, the audio adapter still isolates media APIs, and the controller coordinates state transitions like mute, buffering, and restore-on-load behavior. That keeps the app easy to extend in later iterations for filtering, favorites, or more advanced playback states.

## Notes
- Sample audio streams are loaded over HTTPS from SoundHelix for local demo playback.
- The local server is dependency-free so the project can run from a fresh clone without package installation.
- Player preferences are saved in `localStorage` under a single project-specific key.
