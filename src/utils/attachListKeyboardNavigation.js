/**
 * src/utils/attachListKeyboardNavigation.js
 * Adds vertical keyboard navigation across button-like rows inside a list container.
 * Connects to: src/components/createPlayerView.js
 * Created: 2026-06-25
 */

/**
 * Attaches arrow and boundary navigation for buttons within a container.
 * @param {HTMLElement} container The list container that owns the focusable buttons.
 * @param {string} itemSelector The selector for navigable focus targets.
 * @returns {void}
 */
export function attachListKeyboardNavigation(container, itemSelector) {
  container.addEventListener("keydown", (event) => {
    const activeTarget = event.target;

    if (!(activeTarget instanceof HTMLElement) || !activeTarget.matches(itemSelector)) {
      return;
    }

    const items = [...container.querySelectorAll(itemSelector)].filter((item) => item instanceof HTMLElement);
    const currentIndex = items.indexOf(activeTarget);

    if (currentIndex < 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      const nextItem = items[currentIndex + 1];

      if (nextItem instanceof HTMLElement) {
        event.preventDefault();
        nextItem.focus();
      }
      return;
    }

    if (event.key === "ArrowUp") {
      const previousItem = items[currentIndex - 1];

      if (previousItem instanceof HTMLElement) {
        event.preventDefault();
        previousItem.focus();
      }
      return;
    }

    if (event.key === "Home") {
      const firstItem = items[0];

      if (firstItem instanceof HTMLElement) {
        event.preventDefault();
        firstItem.focus();
      }
      return;
    }

    if (event.key === "End") {
      const lastItem = items.at(-1);

      if (lastItem instanceof HTMLElement) {
        event.preventDefault();
        lastItem.focus();
      }
    }
  });
}
