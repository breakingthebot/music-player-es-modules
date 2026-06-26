/**
 * src/services/createImportedTrackStore.js
 * Persists imported local audio files in IndexedDB and restores them as playable tracks.
 * Connects to: src/main.js, src/models/createTrack.js, src/utils/logger.js
 * Created: 2026-06-26
 */

import { createTrack } from "../models/createTrack.js";
import { logger } from "../utils/logger.js";

const DATABASE_NAME = "music-player-imports";
const DATABASE_VERSION = 1;
const STORE_NAME = "tracks";

/**
 * Creates an IndexedDB-backed store for imported local tracks.
 * @param {{
 *   createObjectUrl?: (blob: Blob) => string,
 *   indexedDb?: IDBFactory | undefined
 * }} [dependencies] Optional browser dependency overrides.
 * @returns {{
 *   loadTracks: () => Promise<Array<{ id: string, title: string, artist: string, durationSeconds: number, audioUrl: string }>>,
 *   saveTracks: (records: Array<{ blob: Blob, durationSeconds: number, fileName: string, id: string, mimeType: string, title: string }>) => Promise<void>
 * }}
 */
export function createImportedTrackStore({
  createObjectUrl = (blob) => URL.createObjectURL(blob),
  indexedDb = globalThis.indexedDB
} = {}) {
  /**
   * Loads imported tracks from IndexedDB and recreates playable object URLs.
   * @returns {Promise<Array<{ id: string, title: string, artist: string, durationSeconds: number, audioUrl: string }>>}
   */
  async function loadTracks() {
    if (!indexedDb) {
      logger.warn("Imported track storage is unavailable because IndexedDB is not supported.");
      return [];
    }

    try {
      const database = await openDatabase(indexedDb);
      const records = await runReadOnlyTransaction(database, STORE_NAME, (store) => store.getAll());

      return records.map((record) => {
        return createTrack({
          artist: "Local file",
          audioUrl: createObjectUrl(record.blob),
          durationSeconds: record.durationSeconds,
          id: record.id,
          title: record.title
        });
      });
    } catch (error) {
      logger.warn("Failed to restore imported tracks from IndexedDB.", {
        error: error instanceof Error ? error.message : "Unknown error"
      });

      return [];
    }
  }

  return {
    loadTracks,

    /**
     * Saves imported local track records for future browser sessions.
     * @param {Array<{ blob: Blob, durationSeconds: number, fileName: string, id: string, mimeType: string, title: string }>} records The imported track records to persist.
     * @returns {Promise<void>}
     */
    async saveTracks(records) {
      if (!indexedDb || records.length === 0) {
        return;
      }

      try {
        const database = await openDatabase(indexedDb);

        await runReadWriteTransaction(database, STORE_NAME, async (store) => {
          for (const record of records) {
            store.put({
              blob: record.blob,
              durationSeconds: record.durationSeconds,
              fileName: record.fileName,
              id: record.id,
              mimeType: record.mimeType,
              title: record.title
            });
          }
        });
      } catch (error) {
        logger.warn("Failed to save imported tracks to IndexedDB.", {
          count: records.length,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }
  };
}

/**
 * Opens the imported-track database and ensures the object store exists.
 * @param {IDBFactory} indexedDb The IndexedDB factory implementation.
 * @returns {Promise<IDBDatabase>}
 */
function openDatabase(indexedDb) {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open(DATABASE_NAME, DATABASE_VERSION);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => {
      resolve(request.result);
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("IndexedDB database could not be opened."));
    });
  });
}

/**
 * Runs a read-only IndexedDB transaction and resolves with the request result.
 * @template Result
 * @param {IDBDatabase} database The open database handle.
 * @param {string} storeName The target object store name.
 * @param {(store: IDBObjectStore) => IDBRequest<Result>} action The request to perform.
 * @returns {Promise<Result>}
 */
function runReadOnlyTransaction(database, storeName, action) {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = action(store);

    request.addEventListener("success", () => {
      resolve(request.result);
    });
    request.addEventListener("error", () => {
      reject(request.error ?? new Error("IndexedDB read request failed."));
    });
    transaction.addEventListener("error", () => {
      reject(transaction.error ?? new Error("IndexedDB read transaction failed."));
    });
  });
}

/**
 * Runs a write transaction and resolves when IndexedDB commits it.
 * @param {IDBDatabase} database The open database handle.
 * @param {string} storeName The target object store name.
 * @param {(store: IDBObjectStore) => void | Promise<void>} action The write operations to perform.
 * @returns {Promise<void>}
 */
async function runReadWriteTransaction(database, storeName, action) {
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    Promise.resolve(action(store)).catch(reject);
    transaction.addEventListener("complete", () => {
      resolve();
    });
    transaction.addEventListener("error", () => {
      reject(transaction.error ?? new Error("IndexedDB write transaction failed."));
    });
  });
}
