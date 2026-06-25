/**
 * src/utils/attachKeyboardShortcuts.js
 * Registers global keyboard shortcuts for common player actions.
 * Connects to: src/main.js
 * Created: 2026-06-25
 */

/**
 * Determines whether keyboard shortcuts should be ignored for the target.
 * @param {EventTarget | null} target The event target from the keyboard event.
 * @returns {boolean} Whether the target is editable.
 */
function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ["BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
}

/**
 * Attaches keyboard shortcuts for the player and returns a cleanup callback.
 * @param {{
 *   onNext: () => void,
 *   onPrevious: () => void,
 *   onToggleMute: () => void,
 *   onTogglePlayback: () => Promise<void>
 * }} callbacks The keyboard-triggered player actions.
 * @returns {() => void} A function that removes the keyboard listener.
 */
export function attachKeyboardShortcuts(callbacks) {
  /**
   * Handles key presses for global playback shortcuts.
   * @param {KeyboardEvent} event The browser keyboard event.
   * @returns {void}
   */
  function handleKeydown(event) {
    if (isEditableTarget(event.target)) {
      return;
    }

    if (event.code === "Space") {
      event.preventDefault();
      void callbacks.onTogglePlayback();
      return;
    }

    if (event.code === "ArrowRight") {
      event.preventDefault();
      callbacks.onNext();
      return;
    }

    if (event.code === "ArrowLeft") {
      event.preventDefault();
      callbacks.onPrevious();
      return;
    }

    if (event.code === "KeyM") {
      event.preventDefault();
      callbacks.onToggleMute();
    }
  }

  window.addEventListener("keydown", handleKeydown);

  return () => {
    window.removeEventListener("keydown", handleKeydown);
  };
}

