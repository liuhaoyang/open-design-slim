#!/usr/bin/env node
import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const skillOnly = process.argv.includes("--skill-only");

const buildOptions = {
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  legalComments: "none"
};

async function stripEsbuildSourceComments(file) {
  const generated = await readFile(file, "utf8");
  await writeFile(file, generated.replace(/^\/\/ (?:src|bin|dist)\/.*\n/gm, ""), "utf8");
}

async function buildPackageCli() {
  await mkdir("dist", { recursive: true });
  await build({
    ...buildOptions,
    entryPoints: ["src/cli.ts"],
    outfile: "dist/cli.mjs"
  });
  await stripEsbuildSourceComments("dist/cli.mjs");
}

async function buildSkillHelper() {
  await mkdir("skills/open-design-slim/scripts", { recursive: true });
  await build({
    ...buildOptions,
    entryPoints: ["bin/open-design-slim.mjs"],
    outfile: "skills/open-design-slim/scripts/od-slim.mjs"
  });
  await stripEsbuildSourceComments("skills/open-design-slim/scripts/od-slim.mjs");
}

if (!skillOnly) {
  await buildPackageCli();
}
await buildSkillHelper();
