#!/usr/bin/env node
import { mkdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import process from "node:process";

const releaseDir = "release";
const artifact = `${releaseDir}/open-design-slim-skill.tar.gz`;
const allowedRoots = [
  "SKILL.md",
  "assets",
  "contracts",
  "quality",
  "references",
  "scripts/od-slim.mjs"
];

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit"
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

await mkdir(releaseDir, { recursive: true });
await rm(artifact, { force: true });

run("tar", [
  "-czf",
  artifact,
  "-C",
  "skills/open-design-slim",
  ...allowedRoots
]);

console.log(`wrote ${artifact}`);
