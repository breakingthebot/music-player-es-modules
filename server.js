/**
 * server.js
 * Serves the static music player locally without external dependencies.
 * Connects to: index.html, styles.css, src/
 * Created: 2026-06-25
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { cwd } from "node:process";

const HOST = "127.0.0.1";
const DEFAULT_PORT = 4173;
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

/**
 * Builds a safe absolute file path for the request.
 * @param {string} requestPath The raw URL path from the request.
 * @returns {string} A normalized file path within the project root.
 */
function resolveFilePath(requestPath) {
  const cleanedPath = requestPath === "/" ? "/index.html" : requestPath;
  const normalizedPath = normalize(cleanedPath).replace(/^(\.\.[/\\])+/, "");

  return join(cwd(), normalizedPath);
}

/**
 * Determines the content type for a file extension.
 * @param {string} filePath The file path being served.
 * @returns {string} The response MIME type.
 */
function getContentType(filePath) {
  return MIME_TYPES[extname(filePath)] ?? "text/plain; charset=utf-8";
}

/**
 * Writes a text response to the client.
 * @param {import("node:http").ServerResponse} response The Node HTTP response object.
 * @param {number} statusCode The HTTP status code to write.
 * @param {string} message The response body.
 * @returns {void}
 */
function writeTextResponse(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}

/**
 * Handles all incoming HTTP requests for static assets.
 * @param {import("node:http").IncomingMessage} request The incoming HTTP request.
 * @param {import("node:http").ServerResponse} response The outgoing HTTP response.
 * @returns {Promise<void>}
 */
async function handleRequest(request, response) {
  const url = new URL(request.url ?? "/", `http://${HOST}`);
  const filePath = resolveFilePath(url.pathname);

  try {
    const contents = await readFile(filePath);
    response.writeHead(200, { "Content-Type": getContentType(filePath) });
    response.end(contents);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      writeTextResponse(response, 404, "File not found.");
      return;
    }

    writeTextResponse(response, 500, "Server error.");
  }
}

const server = createServer(handleRequest);
const port = Number.parseInt(process.env.PORT ?? `${DEFAULT_PORT}`, 10);

server.listen(port, HOST, () => {
  process.stdout.write(`Music player available at http://${HOST}:${port}\n`);
});

