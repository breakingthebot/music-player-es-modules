/**
 * src/utils/logger.js
 * Provides lightweight structured logging wrappers for browser diagnostics.
 * Connects to: src/main.js, src/services/createAudioAdapter.js
 * Created: 2026-06-25
 */

/**
 * Logs a structured message at the requested level.
 * @param {"debug" | "info" | "warn" | "error"} level The browser console method to invoke.
 * @param {string} message The human-readable message.
 * @param {Record<string, unknown>} [context] Extra structured context for the event.
 * @returns {void}
 */
function log(level, message, context = {}) {
  console[level]({
    context,
    level: level.toUpperCase(),
    message,
    timestamp: new Date().toISOString()
  });
}

export const logger = {
  /**
   * Writes a debug-level browser log entry.
   * @param {string} message The message to emit.
   * @param {Record<string, unknown>} [context] Extra structured context.
   * @returns {void}
   */
  debug(message, context) {
    log("debug", message, context);
  },

  /**
   * Writes an info-level browser log entry.
   * @param {string} message The message to emit.
   * @param {Record<string, unknown>} [context] Extra structured context.
   * @returns {void}
   */
  info(message, context) {
    log("info", message, context);
  },

  /**
   * Writes a warning-level browser log entry.
   * @param {string} message The message to emit.
   * @param {Record<string, unknown>} [context] Extra structured context.
   * @returns {void}
   */
  warn(message, context) {
    log("warn", message, context);
  },

  /**
   * Writes an error-level browser log entry.
   * @param {string} message The message to emit.
   * @param {Record<string, unknown>} [context] Extra structured context.
   * @returns {void}
   */
  error(message, context) {
    log("error", message, context);
  }
};

