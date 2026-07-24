#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import process from "node:process";

const generatedFiles = [
  "dist/cli.mjs",
  "skills/open-design-slim/scripts/od-slim.mjs"
];

async function readGeneratedFiles() {
  const files = new Map();
  for (const file of generatedFiles) {
    try {
      files.set(file, await readFile(file, "utf8"));
    } catch {
      files.set(file, null);
    }
  }
  return files;
}

const before = await readGeneratedFiles();
const build = spawnSync("node", ["scripts/build-cli.mjs"], {
  stdio: "inherit"
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const after = await readGeneratedFiles();
const staleFiles = [];

for (const file of generatedFiles) {
  if (before.get(file) !== after.get(file)) {
    staleFiles.push(file);
  }
}

if (staleFiles.length > 0) {
  console.error(`stale generated files: ${staleFiles.join(", ")}`);
  console.error("generated CLI artifacts are stale; run `pnpm run build` and commit the result.");
  process.exit(1);
}

console.log("generated CLI artifact check passed.");
