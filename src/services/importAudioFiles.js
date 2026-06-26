/**
 * src/services/importAudioFiles.js
 * Converts local audio files into normalized in-app tracks with object URLs.
 * Connects to: src/main.js, src/models/createTrack.js
 * Created: 2026-06-26
 */

import { createTrack } from "../models/createTrack.js";

const SUPPORTED_FILE_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav"
]);

const SUPPORTED_EXTENSIONS = [".mp3", ".wav"];

/**
 * Builds imported track records from user-selected files.
 * @param {{
 *   files: File[],
 *   createObjectUrl?: (file: File) => string,
 *   getAudioDuration?: (audioUrl: string) => Promise<number>,
 *   now?: () => number
 * }} dependencies Import dependencies.
 * @returns {Promise<{
 *   skippedFiles: string[],
 *   storedTracks: Array<{ blob: File, durationSeconds: number, fileName: string, id: string, mimeType: string, title: string }>,
 *   tracks: Array<{ id: string, title: string, artist: string, audioUrl: string, durationSeconds: number, isImported: boolean }>
 * }>}
 */
export async function importAudioFiles({
  createObjectUrl = (file) => URL.createObjectURL(file),
  files,
  getAudioDuration = loadAudioDuration,
  now = () => Date.now()
}) {
  const importedTracks = [];
  const skippedFiles = [];
  const storedTracks = [];

  for (const [index, file] of files.entries()) {
    if (!isSupportedAudioFile(file)) {
      skippedFiles.push(file.name);
      continue;
    }

    const audioUrl = createObjectUrl(file);

    try {
      const durationSeconds = await getAudioDuration(audioUrl);
      const importedTrack = createTrack({
        artist: "Local file",
        audioUrl,
        durationSeconds: Math.max(Math.round(durationSeconds), 1),
        id: buildImportedTrackId(file, index, now()),
        isImported: true,
        title: getTrackTitleFromFileName(file.name)
      });

      importedTracks.push(importedTrack);
      storedTracks.push({
        blob: file,
        durationSeconds: importedTrack.durationSeconds,
        fileName: file.name,
        id: importedTrack.id,
        mimeType: file.type,
        title: importedTrack.title
      });
    } catch (error) {
      URL.revokeObjectURL(audioUrl);
      throw error;
    }
  }

  return {
    skippedFiles,
    storedTracks,
    tracks: importedTracks
  };
}

/**
 * Determines whether a file should be treated as a supported local audio source.
 * @param {File} file The selected file.
 * @returns {boolean}
 */
function isSupportedAudioFile(file) {
  const lowerCaseName = file.name.toLowerCase();

  return SUPPORTED_FILE_TYPES.has(file.type) || SUPPORTED_EXTENSIONS.some((extension) => lowerCaseName.endsWith(extension));
}

/**
 * Loads audio metadata to determine the track duration in seconds.
 * @param {string} audioUrl The object URL for the local audio file.
 * @returns {Promise<number>}
 */
function loadAudioDuration(audioUrl) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();

    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        resolve(audio.duration);
        return;
      }

      reject(new Error("Imported audio duration could not be determined."));
    }, { once: true });
    audio.addEventListener("error", () => {
      reject(new Error("Imported audio file could not be loaded."));
    }, { once: true });
    audio.src = audioUrl;
    audio.load();
  });
}

/**
 * Derives a user-facing track title from a local filename.
 * @param {string} fileName The original file name.
 * @returns {string}
 */
function getTrackTitleFromFileName(fileName) {
  const cleanedName = fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();

  return cleanedName || "Imported track";
}

/**
 * Builds a stable imported-track identifier from file metadata.
 * @param {File} file The imported file.
 * @param {number} index The selection index.
 * @param {number} timestamp The import timestamp.
 * @returns {string}
 */
function buildImportedTrackId(file, index, timestamp) {
  const normalizedName = file.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  return `local-${normalizedName || "track"}-${file.size}-${file.lastModified}-${timestamp}-${index}`;
}
