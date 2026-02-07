#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const durationSec = Number(process.argv[3] ?? 20);
const intervalMs = Number(process.argv[4] ?? 1000);

const excludedDirNames = new Set([".next", "node_modules", ".git"]);

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (excludedDirNames.has(entry.name)) continue;
      walk(full, files);
      continue;
    }
    if (!entry.isFile()) continue;
    files.push(full);
  }
  return files;
}

function snapshot() {
  const map = new Map();
  for (const file of walk(root)) {
    try {
      const st = fs.statSync(file);
      map.set(file, { mtimeMs: st.mtimeMs, size: st.size });
    } catch {
      // File may disappear during scan; safe to ignore for diagnostics.
    }
  }
  return map;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const changes = new Map();
let prev = snapshot();
const samples = Math.max(1, Math.ceil((durationSec * 1000) / intervalMs));

for (let i = 0; i < samples; i++) {
  await sleep(intervalMs);
  const next = snapshot();
  for (const [file, now] of next) {
    const before = prev.get(file);
    if (!before) {
      const item = changes.get(file) ?? { count: 0, reason: "created" };
      item.count += 1;
      changes.set(file, item);
      continue;
    }
    if (before.mtimeMs !== now.mtimeMs || before.size !== now.size) {
      const item = changes.get(file) ?? { count: 0, reason: "modified" };
      item.count += 1;
      changes.set(file, item);
    }
  }
  prev = next;
}

const top = [...changes.entries()]
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 30)
  .map(([file, info]) => ({
    count: info.count,
    reason: info.reason,
    path: path.relative(root, file),
  }));

if (top.length === 0) {
  console.log("No file changes detected in watched source tree.");
} else {
  console.table(top);
}
