/**
 * scripts/runPlaywrightTests.js
 * Starts the local static server, waits for readiness, runs Playwright tests, and shuts down cleanly.
 * Connects to: package.json, playwright.config.js, server.js
 * Created: 2026-06-25
 */

import { spawn } from "node:child_process";
import { get } from "node:http";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const SERVER_URL = "http://127.0.0.1:4173";
const SERVER_START_TIMEOUT_MS = 20_000;
const PLAYWRIGHT_CLI_PATH = join(process.cwd(), "node_modules", "playwright", "cli.js");

/**
 * Waits until the local server responds successfully or times out.
 * @returns {Promise<void>}
 */
async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < SERVER_START_TIMEOUT_MS) {
    const isReady = await new Promise((resolve) => {
      const request = get(SERVER_URL, (response) => {
        resolve(response.statusCode === 200);
      });

      request.on("error", () => {
        resolve(false);
      });
    });

    if (isReady) {
      return;
    }

    await delay(250);
  }

  throw new Error(`Server did not become ready within ${SERVER_START_TIMEOUT_MS}ms.`);
}

/**
 * Terminates a spawned child process and waits briefly for exit.
 * @param {import("node:child_process").ChildProcess} childProcess The process to stop.
 * @returns {Promise<void>}
 */
async function stopProcess(childProcess) {
  if (childProcess.killed) {
    return;
  }

  childProcess.kill("SIGTERM");
  await delay(500);

  if (!childProcess.killed) {
    childProcess.kill("SIGKILL");
  }
}

const serverProcess = spawn("node", ["server.js"], {
  stdio: "inherit"
});

try {
  await waitForServer();

  const playwrightExitCode = await new Promise((resolve, reject) => {
    const testProcess = spawn(process.execPath, [PLAYWRIGHT_CLI_PATH, "test"], {
      stdio: "inherit"
    });

    testProcess.on("error", reject);
    testProcess.on("exit", (code) => {
      resolve(code ?? 1);
    });
  });

  if (playwrightExitCode !== 0) {
    process.exitCode = playwrightExitCode;
  }
} finally {
  await stopProcess(serverProcess);
}
