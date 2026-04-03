#!/usr/bin/env node
/**
 * Safe Lighthouse runner.
 *
 * Usage:
 *   node scripts/lh.mjs [URL] [--output=<path>]
 *
 * Defaults:
 *   URL    http://127.0.0.1:3000
 *   output lighthouse-nav-runs/report-<timestamp>.json
 *
 * The Chrome user-data-dir temp profile is ALWAYS created inside
 * os.tmpdir() (outside the repository) and deleted after the run,
 * even on failure.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoWebDir = resolve(__dirname, "..");

// ── Parse CLI args ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const urlArg = args.find((a) => !a.startsWith("--")) ?? "http://127.0.0.1:3000";
const outputArg = args.find((a) => a.startsWith("--output="))?.slice("--output=".length);

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputDir = resolve(repoWebDir, "lighthouse-nav-runs");
const outputPath = outputArg
  ? resolve(outputArg)
  : join(outputDir, `report-${timestamp}.json`);

// ── Create output dir if needed ──────────────────────────────────────────────
mkdirSync(outputDir, { recursive: true });

// ── Create Chrome temp profile OUTSIDE the repo ──────────────────────────────
// os.tmpdir() on Windows → C:\Users\<user>\AppData\Local\Temp
// on Linux/macOS → /tmp or $TMPDIR
const chromeProfile = mkdtempSync(join(tmpdir(), "sd-lh-chrome-"));

let exitCode = 0;
try {
  console.log(`Running Lighthouse on   ${urlArg}`);
  console.log(`Chrome profile (temp)   ${chromeProfile}`);
  console.log(`Report output           ${outputPath}`);

  execFileSync(
    process.execPath, // node
    [
      join(repoWebDir, "node_modules", "lighthouse", "cli", "index.js"),
      urlArg,
      "--output=json",
      `--output-path=${outputPath}`,
      "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
      `--user-data-dir=${chromeProfile}`,
      "--quiet",
    ],
    { stdio: "inherit", cwd: repoWebDir },
  );

  console.log(`\nReport saved to: ${outputPath}`);
} catch (err) {
  console.error("\nLighthouse run failed:", err.message);
  exitCode = 1;
} finally {
  // Always remove the temp Chrome profile directory
  try {
    rmSync(chromeProfile, { recursive: true, force: true });
  } catch {
    // Non-fatal: profile cleanup failure should not mask the original error
    console.warn(`Warning: could not remove temp dir ${chromeProfile}`);
  }
}

process.exit(exitCode);
