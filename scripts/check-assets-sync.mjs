#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const pairs = [
  ["assets/templates", "skills/open-design-slim/assets/templates"],
  ["assets/design-systems/default", "skills/open-design-slim/assets/design-systems/default"]
];

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

async function fingerprintTree(root) {
  const files = await listFiles(root);
  const result = new Map();
  for (const file of files) {
    const relative = path.relative(root, file).split(path.sep).join("/");
    const hash = createHash("sha256").update(await readFile(file)).digest("hex");
    result.set(relative, hash);
  }
  return result;
}

let failed = false;

for (const [packageRoot, skillRoot] of pairs) {
  const packageFiles = await fingerprintTree(packageRoot);
  const skillFiles = await fingerprintTree(skillRoot);
  const paths = new Set([...packageFiles.keys(), ...skillFiles.keys()]);
  for (const file of [...paths].sort()) {
    const packageHash = packageFiles.get(file);
    const skillHash = skillFiles.get(file);
    if (packageHash !== skillHash) {
      failed = true;
      console.error(`asset drift: ${file}`);
      console.error(`  ${packageRoot}: ${packageHash ?? "missing"}`);
      console.error(`  ${skillRoot}: ${skillHash ?? "missing"}`);
    }
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log("asset sync check passed.");
}
