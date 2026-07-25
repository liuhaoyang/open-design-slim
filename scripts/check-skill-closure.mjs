#!/usr/bin/env node
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const tempRoot = await mkdtemp(path.join(tmpdir(), "open-design-slim-skill-closure-"));
const skillRoot = path.join(tempRoot, "open-design-slim");
const artifactRoot = path.join(tempRoot, "artifact");

function runNode(args, cwd = skillRoot) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    throw new Error(`command failed: node ${args.join(" ")}`);
  }
  return {
    stdout: result.stdout,
    stderr: result.stderr
  };
}

try {
  await cp("skills/open-design-slim", skillRoot, {
    recursive: true,
    errorOnExist: true,
    force: false
  });

  const helper = await readFile(path.join(skillRoot, "scripts", "od-slim.mjs"), "utf8");
  const forbidden = [
    "../../../src",
    "../../src",
    "../src",
    "/Users/",
    "bin/open-design-slim",
    "dist/cli.mjs"
  ];
  const leaked = forbidden.filter((value) => helper.includes(value));
  if (leaked.length > 0) {
    throw new Error(`skill helper references files outside the skill bundle: ${leaked.join(", ")}`);
  }

  runNode(["scripts/od-slim.mjs", "--help"]);
  const manifest = runNode(["scripts/od-slim.mjs", "manifest", "show"]);
  if (!manifest.stdout.includes("Source manifest: runtime assets (generated)")) {
    throw new Error("skill helper did not use runtime assets from the copied skill bundle");
  }

  runNode(["scripts/od-slim.mjs", "validate", "design-system", "--dir", "assets/design-systems/default"]);
  runNode(["scripts/od-slim.mjs", "init", "prototype", "--kind", "static", "--output", artifactRoot]);
  runNode(["scripts/od-slim.mjs", "validate", "prototype", "--entry", path.join(artifactRoot, "index.html")]);

  console.log("skill closure check passed.");
} finally {
  await rm(tempRoot, { recursive: true, force: true });
}
