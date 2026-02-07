import { spawnSync } from "node:child_process";
import { join } from "node:path";

const nextCli = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const result = spawnSync(
  process.execPath,
  [nextCli, "build", "--webpack", "--experimental-build-mode", "compile"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      ANALYZE: "true",
    },
  },
);

if (result.error) {
  console.error(`[analyze] Failed to run next build: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
