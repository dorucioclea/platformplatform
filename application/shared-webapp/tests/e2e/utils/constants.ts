/// <reference types="node" />

/**
 * Shared constants for End2End tests
 */

import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

function readBasePort(): number {
  // Walk up from this file (application/shared-webapp/tests/e2e/utils) to the repo root and read
  // .workspace/port.txt. E2E tests must have an explicit port file — silent defaulting would mask
  // setup problems in deterministic test environments.
  const repoRoot = resolve(__dirname, "..", "..", "..", "..", "..");
  const portFile = join(repoRoot, ".workspace", "port.txt");
  if (!existsSync(portFile)) {
    throw new Error(
      "E2E tests require .workspace/port.txt to exist. Start Aspire AppHost first to bootstrap it."
    );
  }
  const content = readFileSync(portFile, "utf8").trim();
  const parsed = Number.parseInt(content, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`.workspace/port.txt must contain a positive integer port number. Got: '${content}'`);
  }
  return parsed;
}

const BASE_PORT = readBasePort();
const DEFAULT_BASE_URL = `https://app.dev.localhost:${BASE_PORT}`;

export const isWindows = process.platform === "win32";
export const isLinux = process.platform === "linux";

/**
 * Get the base URL for tests
 */
export function getBaseUrl(): string {
  return process.env.PUBLIC_URL ?? DEFAULT_BASE_URL;
}

/**
 * Check if we're running against localhost
 */
export function isLocalhost(): boolean {
  return getBaseUrl() === DEFAULT_BASE_URL;
}
