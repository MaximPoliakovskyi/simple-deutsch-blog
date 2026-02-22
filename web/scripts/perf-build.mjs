import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

const cwd = process.cwd();
const nextCli = join(cwd, "node_modules", "next", "dist", "bin", "next");

const build = spawnSync(process.execPath, [nextCli, "build", "--turbopack"], {
  stdio: "inherit",
});

if (build.error) {
  console.error(`[perf:build] Failed to run next build: ${build.error.message}`);
  process.exit(1);
}

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const nextDir = join(cwd, ".next");
if (!existsSync(nextDir)) {
  console.log("\n[perf:build] .next directory not found; skipping stats summary.");
  process.exit(0);
}

/** @type {Map<string, number>} */
const fileSizeByAsset = new Map();

/**
 * @param {string} asset
 * @returns {string}
 */
function normalizeAsset(asset) {
  const cleaned = String(asset).replace(/\\/g, "/").replace(/^\/+/, "");
  return cleaned.startsWith("_next/") ? cleaned.replace(/^_next\//, "") : cleaned;
}

/**
 * @param {string} asset
 * @returns {string[]}
 */
function getAssetCandidates(asset) {
  const normalized = normalizeAsset(asset);
  return [join(nextDir, normalized)];
}

/**
 * @param {string} asset
 * @returns {number}
 */
function getAssetSize(asset) {
  const normalized = normalizeAsset(asset);
  if (!normalized.endsWith(".js")) return 0;
  if (fileSizeByAsset.has(normalized)) {
    return fileSizeByAsset.get(normalized) ?? 0;
  }

  for (const candidate of getAssetCandidates(normalized)) {
    if (!existsSync(candidate)) continue;
    const size = statSync(candidate).size;
    fileSizeByAsset.set(normalized, size);
    return size;
  }

  fileSizeByAsset.set(normalized, 0);
  return 0;
}

/**
 * @param {string} dir
 * @param {string[]} output
 * @returns {string[]}
 */
function collectClientReferenceManifestFiles(dir, output = []) {
  if (!existsSync(dir)) return output;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const target = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectClientReferenceManifestFiles(target, output);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith("_client-reference-manifest.js")) {
      output.push(target);
    }
  }

  return output;
}

/**
 * @param {string} route
 * @returns {string}
 */
function normalizeRoute(route) {
  const withoutLeaf = route.replace(/\/(page|route)$/, "");
  return withoutLeaf === "" ? "/" : withoutLeaf;
}

/**
 * @returns {Map<string, Set<string>>}
 */
function collectRouteAssetsFromClientReferenceManifests() {
  const routeAssets = new Map();
  const manifestFiles = collectClientReferenceManifestFiles(join(nextDir, "server", "app"));

  for (const manifestPath of manifestFiles) {
    const code = readFileSync(manifestPath, "utf8");
    const sandbox = { globalThis: {} };
    runInNewContext(code, sandbox, { timeout: 1000 });

    const manifests = sandbox.globalThis.__RSC_MANIFEST ?? {};
    for (const [routeKey, manifest] of Object.entries(manifests)) {
      if (!manifest || typeof manifest !== "object") continue;
      const route = normalizeRoute(routeKey);
      const assets = routeAssets.get(route) ?? new Set();

      const entryJSFiles = manifest.entryJSFiles ?? {};
      for (const chunks of Object.values(entryJSFiles)) {
        if (!Array.isArray(chunks)) continue;
        for (const chunk of chunks) {
          if (typeof chunk === "string" && chunk.endsWith(".js")) {
            assets.add(normalizeAsset(chunk));
          }
        }
      }

      const clientModules = manifest.clientModules ?? {};
      for (const moduleInfo of Object.values(clientModules)) {
        const chunks = moduleInfo?.chunks;
        if (!Array.isArray(chunks)) continue;
        for (const chunk of chunks) {
          if (typeof chunk === "string" && chunk.endsWith(".js")) {
            assets.add(normalizeAsset(chunk));
          }
        }
      }

      routeAssets.set(route, assets);
    }
  }

  return routeAssets;
}

/**
 * @returns {Map<string, Set<string>>}
 */
function collectRouteAssetsFromBuildManifest() {
  const manifestPath = join(nextDir, "build-manifest.json");
  if (!existsSync(manifestPath)) {
    return new Map();
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const pages = manifest.pages ?? {};
  const routeAssets = new Map();

  for (const [route, assets] of Object.entries(pages)) {
    const chunkSet = new Set();
    if (Array.isArray(assets)) {
      for (const asset of assets) {
        if (typeof asset === "string" && asset.endsWith(".js")) {
          chunkSet.add(normalizeAsset(asset));
        }
      }
    }
    routeAssets.set(route, chunkSet);
  }

  return routeAssets;
}

const routeAssetSets = collectRouteAssetsFromClientReferenceManifests();
if (routeAssetSets.size === 0) {
  for (const [route, assets] of collectRouteAssetsFromBuildManifest()) {
    routeAssetSets.set(route, assets);
  }
}

const routeRows = [...routeAssetSets.entries()]
  .map(([route, assets]) => {
    const bytes = [...assets].reduce((total, asset) => total + getAssetSize(asset), 0);
    return { route, kb: bytes / 1024 };
  })
  .sort((a, b) => b.kb - a.kb)
  .slice(0, 20);

const topChunks = [...fileSizeByAsset.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

if (routeRows.length === 0) {
  console.log("\n[perf:build] No route JS stats were found in .next manifests.");
} else {
  console.log("\n[perf:build] Top routes by JS payload (manifest-based estimate):");
  for (const row of routeRows) {
    console.log(`- ${row.route}: ${row.kb.toFixed(1)} KB`);
  }
}

if (topChunks.length === 0) {
  console.log("\n[perf:build] No JS chunk files were detected.");
} else {
  console.log("\n[perf:build] Top 10 largest JS chunks:");
  for (const [asset, bytes] of topChunks) {
    console.log(`- ${asset}: ${(bytes / 1024).toFixed(1)} KB`);
  }
}
