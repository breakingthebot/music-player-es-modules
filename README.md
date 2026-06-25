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
This build starts with the smallest complete version of the player rather than a pile of disconnected files. The app loads a curated playlist, normalizes that data through a track model, pushes playback through an audio service, and keeps browser rendering inside dedicated UI modules. That separation keeps the music logic testable without a bundler and gives the next iterations clear extension points for features like progress persistence, filtering, or volume control.

## Notes
- Sample audio streams are loaded over HTTPS from SoundHelix for local demo playback.
- The local server is dependency-free so the project can run from a fresh clone without package installation.

