import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { beforeAll, test } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

async function run(
  command: string,
  args: string[],
  cwd: string = repoRoot
): Promise<{ code: number | null; output: string }> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });
    const chunks: Buffer[] = [];
    child.stdout.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, output: Buffer.concat(chunks).toString("utf8") }));
  });
}

async function runNode(args: string[], cwd: string = repoRoot): Promise<{ code: number | null; output: string }> {
  return await run(process.execPath, args, cwd);
}

beforeAll(async () => {
  const result = await run("pnpm", ["run", "build"]);
  assert.equal(result.code, 0, result.output);
});

test("package bin commands run against generated dist output", async () => {
  const help = await runNode(["bin/open-design-slim.mjs", "--help"]);
  assert.equal(help.code, 0, help.output);
  assert.match(help.output, /Open Design Slim CLI/);

  const alias = await runNode(["bin/od-slim.mjs", "manifest", "show"]);
  assert.equal(alias.code, 0, alias.output);
  assert.match(alias.output, /Source manifest: dist\/manifest\/open-design-slim\.sources\.json/);
});

test("skill helper runs from the skill root and uses skill-local assets", async () => {
  const skillRoot = path.join(repoRoot, "skills", "open-design-slim");
  const manifest = await runNode(["scripts/od-slim.mjs", "manifest", "show"], skillRoot);
  assert.equal(manifest.code, 0, manifest.output);
  assert.match(manifest.output, /Source manifest: runtime assets \(generated\)/);
  assert.match(manifest.output, /assets\/templates\/static-html\/index\.html/);

  const validate = await runNode(
    ["scripts/od-slim.mjs", "validate", "design-system", "--dir", "assets/design-systems/default"],
    skillRoot
  );
  assert.equal(validate.code, 0, validate.output);
  assert.match(validate.output, /design-system validation passed/);
});

test("scaffolded package and skill artifacts use their own asset roots", async () => {
  const temp = await mkdtemp(path.join(tmpdir(), "open-design-slim-e2e-"));
  const packageOutput = path.join(temp, "package-static");
  const packageInit = await runNode([
    "bin/open-design-slim.mjs",
    "init",
    "prototype",
    "--kind",
    "static",
    "--output",
    packageOutput
  ]);
  assert.equal(packageInit.code, 0, packageInit.output);
  assert.match(await readFile(path.join(packageOutput, "index.html"), "utf8"), /Open Design Slim/);

  const skillRoot = path.join(repoRoot, "skills", "open-design-slim");
  const skillOutput = path.join(temp, "skill-static");
  const skillInit = await runNode(
    ["scripts/od-slim.mjs", "init", "prototype", "--kind", "static", "--output", skillOutput],
    skillRoot
  );
  assert.equal(skillInit.code, 0, skillInit.output);
  assert.match(await readFile(path.join(skillOutput, "index.html"), "utf8"), /Open Design Slim/);
});

test("packed CLI tarball ships dist and excludes source and skill bundle", async () => {
  const result = await run("pnpm", ["pack", "--dry-run", "--json"]);
  assert.equal(result.code, 0, result.output);

  const parsed = JSON.parse(result.output) as { files: Array<{ path: string }> };
  const files = parsed.files.map((file) => file.path);

  assert.ok(files.includes("dist/cli.mjs"));
  assert.ok(files.includes("dist/manifest/open-design-slim.sources.json"));
  assert.ok(files.includes("bin/open-design-slim.mjs"));
  assert.ok(files.includes("assets/templates/static-html/index.html"));
  assert.equal(files.some((file) => file.startsWith("src/")), false);
  assert.equal(files.some((file) => file.startsWith("skills/")), false);
});
