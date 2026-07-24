import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..");
const cli = path.join(repoRoot, "bin", "open-design-slim.mjs");

async function runCli(args: string[], cwd: string = repoRoot): Promise<{ code: number | null; output: string }> {
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
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

async function createTempDir(): Promise<string> {
  return await mkdtemp(path.join(tmpdir(), "open-design-slim-"));
}

test("rejects prototypes with forbidden Open Design runtime dependencies", async () => {
  const dir = await createTempDir();
  const entry = path.join(dir, "index.html");
  await writeFile(
    entry,
    `<!doctype html>
<html lang="en">
<head><title>Bad</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body><main><button>Run</button></main><script>fetch("/api/projects")</script></body>
</html>`,
    "utf8"
  );
  await writeFile(
    path.join(dir, "OPEN_DESIGN_SLIM_HANDOFF.md"),
    `# Open Design Slim Handoff

## Artifact
## Source Files
## Design System
## State Coverage
## Validation
## Runtime Boundary
- Uses Open Design daemon: no
- Calls /api/*: no
- Requires artifact DB or daemon data root: no
## Validation Gaps
- none
`,
    "utf8"
  );

  const result = await runCli(["validate", "prototype", "--entry", entry]);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /forbidden dependency: Open Design daemon API route/);
});

test("rejects invalid design-system metadata", async () => {
  const dir = await createTempDir();
  await mkdir(path.join(dir, "source"), { recursive: true });

  await writeFile(path.join(dir, "manifest.json"), JSON.stringify({ schemaVersion: "wrong" }), "utf8");
  await writeFile(path.join(dir, "DESIGN.md"), "# Test\n", "utf8");
  await writeFile(path.join(dir, "USAGE.md"), "# Usage\n", "utf8");
  await writeFile(path.join(dir, "tokens.css"), ":root { --color: red; }\n", "utf8");
  await writeFile(path.join(dir, "components.manifest.json"), JSON.stringify({ name: "Test" }), "utf8");
  await writeFile(path.join(dir, "source", "provenance.json"), JSON.stringify({ schemaVersion: "x" }), "utf8");

  const result = await runCli(["validate", "design-system", "--dir", dir]);
  assert.notEqual(result.code, 0);
  assert.match(result.output, /manifest\.json must declare schemaVersion od-design-system-project\/v1/);
  assert.match(result.output, /components\.manifest\.json is missing components array/);
});

test("scaffolds static prototypes from package assets", async () => {
  const dir = await createTempDir();
  const output = path.join(dir, "prototype");
  const result = await runCli(["init", "prototype", "--kind", "static", "--output", output]);

  assert.equal(result.code, 0, result.output);
  assert.match(await readFile(path.join(output, "index.html"), "utf8"), /Open Design Slim/);
  assert.match(await readFile(path.join(output, "OPEN_DESIGN_SLIM_HANDOFF.md"), "utf8"), /Uses Open Design daemon: no/);
});
