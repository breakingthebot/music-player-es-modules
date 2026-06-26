/**
 * tests/services/createImportedTrackStore.test.js
 * Verifies IndexedDB-backed persistence and restoration for imported local tracks.
 * Connects to: src/services/createImportedTrackStore.js
 * Created: 2026-06-26
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createImportedTrackStore } from "../../src/services/createImportedTrackStore.js";

test("imported track store saves and restores imported tracks", async () => {
  const indexedDb = createFakeIndexedDb();
  const blob = new Blob(["audio-bytes"], { type: "audio/mpeg" });
  const store = createImportedTrackStore({
    createObjectUrl: () => "blob:restored-track",
    indexedDb
  });

  await store.saveTracks([
    {
      blob,
      durationSeconds: 182,
      fileName: "Local Demo.mp3",
      id: "local-demo-1",
      mimeType: "audio/mpeg",
      title: "Local Demo"
    }
  ]);

  const restoredTracks = await store.loadTracks();

  assert.deepEqual(restoredTracks, [
    {
      artist: "Local file",
      audioUrl: "blob:restored-track",
      durationSeconds: 182,
      id: "local-demo-1",
      title: "Local Demo"
    }
  ]);
});

test("imported track store returns an empty list when IndexedDB is unavailable", async () => {
  const store = createImportedTrackStore({
    indexedDb: undefined
  });

  assert.deepEqual(await store.loadTracks(), []);
});

/**
 * Creates a tiny in-memory IndexedDB fake for persistence unit tests.
 * @returns {IDBFactory}
 */
function createFakeIndexedDb() {
  const recordStore = new Map();

  return {
    /**
     * Opens a fake IndexedDB database handle.
     * @returns {FakeRequest}
     */
    open() {
      const request = createRequest();
      const database = createDatabase(recordStore);

      queueMicrotask(() => {
        request.result = database;
        request.dispatch("upgradeneeded");
        request.dispatch("success");
      });

      return request;
    }
  };
}

/**
 * Creates a fake database that exposes one object store.
 * @param {Map<string, object>} recordStore The underlying record map.
 * @returns {IDBDatabase}
 */
function createDatabase(recordStore) {
  const objectStoreNames = [];

  return {
    createObjectStore(storeName) {
      if (!objectStoreNames.includes(storeName)) {
        objectStoreNames.push(storeName);
      }

      return createObjectStore(recordStore);
    },
    objectStoreNames: {
      contains(storeName) {
        return objectStoreNames.includes(storeName);
      }
    },
    transaction() {
      return createTransaction(recordStore);
    }
  };
}

/**
 * Creates a fake IndexedDB transaction wrapper.
 * @param {Map<string, object>} recordStore The underlying record map.
 * @returns {IDBTransaction}
 */
function createTransaction(recordStore) {
  const listeners = new Map();
  const transaction = {
    error: null,
    addEventListener(eventName, handler) {
      const handlers = listeners.get(eventName) ?? [];
      handlers.push(handler);
      listeners.set(eventName, handlers);
    },
    dispatch(eventName) {
      for (const handler of listeners.get(eventName) ?? []) {
        handler();
      }
    },
    objectStore() {
      return createObjectStore(recordStore, () => {
        queueMicrotask(() => {
          transaction.dispatch("complete");
        });
      });
    }
  };

  return transaction;
}

/**
 * Creates a fake IndexedDB object store.
 * @param {Map<string, object>} recordStore The underlying record map.
 * @param {() => void} [onWrite] Optional callback after writes.
 * @returns {IDBObjectStore}
 */
function createObjectStore(recordStore, onWrite = () => {}) {
  return {
    getAll() {
      const request = createRequest();

      queueMicrotask(() => {
        request.result = Array.from(recordStore.values());
        request.dispatch("success");
      });

      return request;
    },
    put(value) {
      recordStore.set(value.id, structuredClone(value));
      onWrite();
      return createRequest();
    }
  };
}

/**
 * Creates a minimal evented request object.
 * @returns {FakeRequest}
 */
function createRequest() {
  const listeners = new Map();

  return {
    error: null,
    result: undefined,
    addEventListener(eventName, handler) {
      const handlers = listeners.get(eventName) ?? [];
      handlers.push(handler);
      listeners.set(eventName, handlers);
    },
    dispatch(eventName) {
      for (const handler of listeners.get(eventName) ?? []) {
        handler();
      }
    }
  };
}
