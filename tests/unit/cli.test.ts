import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, test } from "vitest";
import { CliExitError, runCli } from "../../src/cli";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");
const originalCwd = process.cwd();
const originalExitCode = process.exitCode;

interface CliRunResult {
  error?: unknown;
  stdout: string;
  stderr: string;
}

async function createTempDir(): Promise<string> {
  return await mkdtemp(path.join(tmpdir(), "open-design-slim-"));
}

async function withFileContent<T>(file: string, content: string, callback: () => Promise<T>): Promise<T> {
  const original = await readFile(file, "utf8");
  await writeFile(file, content, "utf8");
  try {
    return await callback();
  } finally {
    await writeFile(file, original, "utf8");
  }
}

async function withMissingFile<T>(file: string, callback: () => Promise<T>): Promise<T> {
  const moved = `${file}.test-moved`;
  await rename(file, moved);
  try {
    return await callback();
  } finally {
    await rename(moved, file);
  }
}

async function writeCleanHandoff(dir: string): Promise<void> {
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
- checked
`,
    "utf8"
  );
}

async function runCliInProcess(args: string[], cwd: string = repoRoot): Promise<CliRunResult> {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);

  process.chdir(cwd);
  process.exitCode = undefined;
  process.stdout.write = ((chunk: string | Uint8Array) => {
    stdout.push(Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk));
    return true;
  }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string | Uint8Array) => {
    stderr.push(Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk));
    return true;
  }) as typeof process.stderr.write;

  try {
    await runCli(args);
    return { stdout: stdout.join(""), stderr: stderr.join("") };
  } catch (error) {
    return { error, stdout: stdout.join(""), stderr: stderr.join("") };
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
    process.chdir(originalCwd);
  }
}

function assertCliExitError(error: unknown): asserts error is CliExitError {
  assert.ok(error instanceof CliExitError);
  assert.equal(error.exitCode, 1);
}

afterEach(() => {
  process.chdir(originalCwd);
  process.exitCode = originalExitCode;
});

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

  const result = await runCliInProcess(["validate", "prototype", "--entry", entry]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /forbidden dependency: Open Design daemon API route/);
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

  const result = await runCliInProcess(["validate", "design-system", "--dir", dir]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /manifest\.json must declare schemaVersion od-design-system-project\/v1/);
  assert.match(result.error.message, /components\.manifest\.json is missing components array/);
});

test("reports missing design-system files", async () => {
  const dir = await createTempDir();
  await mkdir(path.join(dir, "source"), { recursive: true });
  await writeFile(path.join(dir, "manifest.json"), JSON.stringify({ schemaVersion: "od-design-system-project/v1" }), "utf8");
  await writeFile(path.join(dir, "DESIGN.md"), "# Test\n", "utf8");
  await writeFile(path.join(dir, "tokens.css"), ":root { --color: red; }\n", "utf8");
  await writeFile(path.join(dir, "components.manifest.json"), JSON.stringify({ components: [] }), "utf8");
  await writeFile(path.join(dir, "source", "provenance.json"), JSON.stringify({ sources: [] }), "utf8");

  const result = await runCliInProcess(["validate", "design-system", "--dir", dir]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /Missing required design-system file: USAGE\.md/);
  assert.match(result.error.message, /source\/provenance\.json is missing schemaVersion/);
});

test("scaffolds static prototypes from package assets", async () => {
  const dir = await createTempDir();
  const output = path.join(dir, "prototype");
  const result = await runCliInProcess(["init", "prototype", "--kind", "static", "--output", output]);

  assert.equal(result.error, undefined);
  assert.match(result.stdout, /Initialized static prototype/);
  assert.match(await readFile(path.join(output, "index.html"), "utf8"), /Open Design Slim/);
  assert.match(await readFile(path.join(output, "OPEN_DESIGN_SLIM_HANDOFF.md"), "utf8"), /Uses Open Design daemon: no/);
});

test("prints usage and rejects unsupported commands", async () => {
  const sparseHelp = await runCliInProcess([undefined as unknown as string, "--help"]);
  assert.equal(sparseHelp.error, undefined);
  assert.match(sparseHelp.stdout, /Open Design Slim CLI/);

  const help = await runCliInProcess(["--help"]);
  assert.equal(help.error, undefined);
  assert.match(help.stdout, /Open Design Slim CLI/);

  const unknown = await runCliInProcess(["nope"]);
  assert.ok(unknown.error instanceof Error);
  assert.match(unknown.error.message, /Unknown command: nope/);

  const sync = await runCliInProcess(["sync", "check"]);
  assert.ok(sync.error instanceof Error);
  assert.match(sync.error.message, /reserved for a future deterministic snapshot workflow/);
});

test("scaffolds and validates each prototype kind", async () => {
  const dir = await createTempDir();

  for (const kind of ["static", "react", "deck"]) {
    const output = path.join(dir, kind);
    const init = await runCliInProcess(["init", "prototype", "--kind", kind, "--output", output]);
    assert.equal(init.error, undefined);

    const entry = kind === "react" ? "Prototype.jsx" : "index.html";
    const validate = await runCliInProcess(["validate", "prototype", "--entry", path.join(output, entry)]);
    assert.equal(validate.error, undefined);
    assert.match(validate.stdout, /prototype validation passed/);
  }
});

test("scaffolds and validates a renamed design system", async () => {
  const dir = await createTempDir();
  const output = path.join(dir, "system");
  const init = await runCliInProcess(["init", "design-system", "--output", output, "--name", "Acme Console"]);
  assert.equal(init.error, undefined);
  assert.match(init.stdout, /Initialized design system/);

  const validate = await runCliInProcess(["validate", "design-system", "--dir", output]);
  assert.equal(validate.error, undefined);
  assert.match(validate.stdout, /design-system validation passed/);

  const manifest = JSON.parse(await readFile(path.join(output, "manifest.json"), "utf8")) as { id: string; name: string };
  assert.equal(manifest.id, "acme-console");
  assert.equal(manifest.name, "Acme Console");
});

test("writes draft handoff and reports unresolved placeholders", async () => {
  const dir = await createTempDir();
  const draft = await runCliInProcess(["bundle", "handoff", "--dir", dir]);
  assert.equal(draft.error, undefined);
  assert.match(draft.stdout, /Wrote handoff template/);

  await writeFile(path.join(dir, "index.html"), await readFile(path.join(repoRoot, "assets/templates/static-html/index.html"), "utf8"));
  const validate = await runCliInProcess(["validate", "prototype", "--entry", path.join(dir, "index.html")]);
  assertCliExitError(validate.error);
  assert.match(validate.error.message, /not-recorded placeholder/);
});

test("shows manifest metadata and supports json output", async () => {
  const text = await runCliInProcess(["manifest", "show"]);
  assert.equal(text.error, undefined);
  assert.match(text.stdout, /Package: open-design-slim-cli/);

  const json = await runCliInProcess(["manifest", "show", "--json"]);
  assert.equal(json.error, undefined);
  const parsed = JSON.parse(json.stdout) as { package: { name: string }; sourceManifest: { entries: unknown[] } };
  assert.equal(parsed.package.name, "open-design-slim-cli");
  assert.equal(parsed.sourceManifest.entries.length > 0, true);
});

test("uses fallback package and runtime source manifests when files are absent", async () => {
  const packageFile = path.join(repoRoot, "package.json");
  const sourceManifest = path.join(repoRoot, "src", "manifest", "open-design-slim.sources.json");

  await withMissingFile(packageFile, async () => {
    await withMissingFile(sourceManifest, async () => {
      const result = await runCliInProcess(["manifest", "show"]);
      assert.equal(result.error, undefined);
      assert.match(result.stdout, /Binaries: open-design-slim, od-slim/);
      assert.match(result.stdout, /Source manifest: runtime assets \(generated\)/);
      assert.match(result.stdout, /runtime-snapshot/);
    });
  });
});

test("runtime source manifest tolerates missing asset roots", async () => {
  const sourceManifest = path.join(repoRoot, "src", "manifest", "open-design-slim.sources.json");
  const templatesDir = path.join(repoRoot, "assets", "templates");
  const designSystemDir = path.join(repoRoot, "assets", "design-systems", "default");
  const movedTemplates = `${templatesDir}.test-moved`;
  const movedDesignSystem = `${designSystemDir}.test-moved`;

  await withMissingFile(sourceManifest, async () => {
    await rename(templatesDir, movedTemplates);
    await rename(designSystemDir, movedDesignSystem);
    try {
      const result = await runCliInProcess(["manifest", "show", "--json"]);
      assert.equal(result.error, undefined);
      const parsed = JSON.parse(result.stdout) as { sourceManifest: { entries: unknown[] } };
      assert.deepEqual(parsed.sourceManifest.entries, []);
    } finally {
      await rename(movedDesignSystem, designSystemDir);
      await rename(movedTemplates, templatesDir);
    }
  });
});

test("reports malformed package and source manifests", async () => {
  const packageFile = path.join(repoRoot, "package.json");
  const sourceManifest = path.join(repoRoot, "src", "manifest", "open-design-slim.sources.json");

  await withFileContent(packageFile, JSON.stringify({ version: "0.1.0", bin: {} }), async () => {
    const result = await runCliInProcess(["manifest", "show"]);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /package\.json is missing name/);
  });

  await withFileContent(packageFile, JSON.stringify({ name: "x", bin: {} }), async () => {
    const result = await runCliInProcess(["manifest", "show"]);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /package\.json is missing version/);
  });

  await withFileContent(packageFile, JSON.stringify({ name: "x", version: "1.0.0" }), async () => {
    const result = await runCliInProcess(["manifest", "show"]);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /package\.json is missing bin/);
  });

  await withFileContent(packageFile, JSON.stringify({ name: "x", version: "1.0.0", bin: { x: 1 } }), async () => {
    const result = await runCliInProcess(["manifest", "show"]);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /package\.json is missing bin/);
  });

  await withFileContent(sourceManifest, JSON.stringify({ upstream: { remote: "x" }, entries: [] }), async () => {
    const result = await runCliInProcess(["manifest", "show"]);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /missing upstream remote or commit/);
  });

  await withFileContent(sourceManifest, JSON.stringify({ upstream: { remote: "x", commit: "y" } }), async () => {
    const result = await runCliInProcess(["manifest", "show"]);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /missing entries array/);
  });

  await withFileContent(sourceManifest, JSON.stringify({ upstream: { remote: "x", commit: "y" }, entries: [1] }), async () => {
    const result = await runCliInProcess(["manifest", "show"]);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /source manifest entry 0 must be an object/);
  });

  await withFileContent(sourceManifest, JSON.stringify({ upstream: { remote: "x", commit: "y" }, entries: [{}] }), async () => {
    const result = await runCliInProcess(["manifest", "show"]);
    assert.ok(result.error instanceof Error);
    assert.match(result.error.message, /missing kind, targetPath, or mode/);
  });

  await withFileContent(
    sourceManifest,
    JSON.stringify({ upstream: { remote: "x", commit: "y" }, entries: [{ kind: "asset", targetPath: "x", mode: "manual" }] }),
    async () => {
      const result = await runCliInProcess(["manifest", "show"]);
      assert.equal(result.error, undefined);
      assert.match(result.stdout, /unhashed/);
    }
  );
});

test("propagates non-missing runtime asset manifest errors", async () => {
  const sourceManifest = path.join(repoRoot, "src", "manifest", "open-design-slim.sources.json");
  const templatesDir = path.join(repoRoot, "assets", "templates");
  const movedTemplates = `${templatesDir}.test-moved`;

  await withMissingFile(sourceManifest, async () => {
    await rename(templatesDir, movedTemplates);
    await writeFile(templatesDir, "not a directory", "utf8");
    try {
      const result = await runCliInProcess(["manifest", "show"]);
      assert.ok(result.error instanceof Error);
      assert.match(result.error.message, /ENOTDIR|not a directory/i);
    } finally {
      await rm(templatesDir, { force: true });
      await rename(movedTemplates, templatesDir);
    }
  });
});

test("rejects missing and unsupported options", async () => {
  const missing = await runCliInProcess(["init", "prototype", "--kind", "static"]);
  assert.ok(missing.error instanceof Error);
  assert.match(missing.error.message, /Missing required --output/);

  const missingValue = await runCliInProcess(["init", "prototype", "--kind", "--output"]);
  assert.ok(missingValue.error instanceof Error);
  assert.match(missingValue.error.message, /Missing value for --kind/);

  const unsupported = await runCliInProcess(["init", "prototype", "--kind", "native", "--output", await createTempDir()]);
  assert.ok(unsupported.error instanceof Error);
  assert.match(unsupported.error.message, /Unsupported prototype kind/);
});

test("refuses to overwrite existing scaffold output", async () => {
  const dir = await createTempDir();
  const output = path.join(dir, "existing");
  await writeFile(output, "not a directory", "utf8");

  const result = await runCliInProcess(["init", "prototype", "--kind", "static", "--output", output]);
  assert.ok(result.error instanceof Error);
  assert.match(result.error.message, /already exists|EEXIST|EISDIR|non-directory/i);
});

test("validates explicit artifact roots outside the entry directory", async () => {
  const dir = await createTempDir();
  const artifact = path.join(dir, "artifact");
  const nested = path.join(artifact, "nested");
  await mkdir(nested, { recursive: true });

  await writeFile(path.join(nested, "index.html"), await readFile(path.join(repoRoot, "assets/templates/static-html/index.html"), "utf8"));
  await writeFile(
    path.join(artifact, "OPEN_DESIGN_SLIM_HANDOFF.md"),
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
- checked
`,
    "utf8"
  );

  const result = await runCliInProcess([
    "validate",
    "prototype",
    "--entry",
    path.join(nested, "index.html"),
    "--dir",
    artifact
  ]);
  assert.equal(result.error, undefined);
  assert.match(result.stdout, /prototype validation passed/);
  await rm(dir, { recursive: true, force: true });
});

test("rejects unsupported prototype files and malformed html accessibility", async () => {
  const dir = await createTempDir();
  const extensionlessEntry = path.join(dir, "artifact");
  await writeFile(extensionlessEntry, "plain text", "utf8");
  await writeCleanHandoff(dir);

  const extensionless = await runCliInProcess(["validate", "prototype", "--entry", extensionlessEntry]);
  assertCliExitError(extensionless.error);
  assert.match(extensionless.error.message, /Unsupported prototype entry extension: \(none\)/);

  const textEntry = path.join(dir, "artifact.txt");
  await writeFile(textEntry, "plain text", "utf8");

  const unsupported = await runCliInProcess(["validate", "prototype", "--entry", textEntry]);
  assertCliExitError(unsupported.error);
  assert.match(unsupported.error.message, /Unsupported prototype entry extension: \.txt/);

  const htmlEntry = path.join(dir, "index.html");
  await writeFile(
    htmlEntry,
    `<html><head></head><body><main><input><button><span aria-hidden="true"></span></button></main></body></html>`,
    "utf8"
  );

  const html = await runCliInProcess(["validate", "prototype", "--entry", htmlEntry]);
  assertCliExitError(html.error);
  assert.match(html.error.message, /missing <!doctype html>/);
  assert.match(html.error.message, /missing viewport metadata/);
  assert.match(html.error.message, /missing an html lang attribute/);
  assert.match(html.error.message, /missing a non-empty title/);
  assert.match(html.error.message, /missing visible focus-state CSS/);
  assert.match(html.error.message, /includes inputs but no labels/);
  assert.match(html.error.message, /button without visible text/);
});

test("rejects malformed react prototypes", async () => {
  const dir = await createTempDir();
  const entry = path.join(dir, "Prototype.jsx");
  await writeFile(
    entry,
    `function Prototype() {
  return <section><input /><button>Run</button></section>;
}`,
    "utf8"
  );
  await writeCleanHandoff(dir);

  const result = await runCliInProcess(["validate", "prototype", "--entry", entry]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /React entry is missing a default export/);
  assert.match(result.error.message, /missing a semantic main landmark/);
  assert.match(result.error.message, /missing accessible region or control labels/);
  assert.match(result.error.message, /missing interactive state semantics/);
  assert.match(result.error.message, /missing loading status semantics/);
  assert.match(result.error.message, /missing explicit state management/);
});

test("reports missing main landmark and missing handoff", async () => {
  const dir = await createTempDir();
  const entry = path.join(dir, "index.html");
  await writeFile(
    entry,
    `<!doctype html><html lang="en"><head><title>No Main</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>:focus-visible{outline:2px solid red}</style></head><body><button>Run</button></body></html>`,
    "utf8"
  );

  const result = await runCliInProcess(["validate", "prototype", "--entry", entry]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /missing a semantic <main> landmark/);
  assert.match(result.error.message, /Missing required handoff file/);
});

test("rejects incomplete deck prototypes", async () => {
  const dir = await createTempDir();
  const entry = path.join(dir, "index.html");
  await writeFile(
    entry,
    `<!doctype html><html lang="en"><head><title>Deck</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>:focus-visible{outline:2px solid red}</style></head><body><main><section class="slide">Only one slide</section></main></body></html>`,
    "utf8"
  );
  await writeCleanHandoff(dir);

  const result = await runCliInProcess(["validate", "prototype", "--entry", entry]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /Deck prototype is missing active slide state/);
  assert.match(result.error.message, /Deck prototype is missing disabled slide endpoint/);
});

test("reports missing handoff sections and runtime boundary statements", async () => {
  const dir = await createTempDir();
  const output = path.join(dir, "prototype");
  await runCliInProcess(["init", "prototype", "--kind", "static", "--output", output]);
  await writeFile(path.join(output, "OPEN_DESIGN_SLIM_HANDOFF.md"), "# Broken\n\n## Artifact\n", "utf8");

  const result = await runCliInProcess(["validate", "prototype", "--entry", path.join(output, "index.html")]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /missing handoff section: ## Source Files/);
  assert.match(result.error.message, /must state that it does not use the Open Design daemon/);
  assert.match(result.error.message, /must state that it does not call \/api\/\*/);
});

test("rejects malformed design-system json and optional handoff placeholders", async () => {
  const dir = await createTempDir();
  await mkdir(path.join(dir, "source"), { recursive: true });
  await writeFile(path.join(dir, "manifest.json"), "{", "utf8");
  await writeFile(path.join(dir, "DESIGN.md"), "# Test\n", "utf8");
  await writeFile(path.join(dir, "USAGE.md"), "# Usage\n", "utf8");
  await writeFile(path.join(dir, "tokens.css"), ":root { --color: red; }\n", "utf8");
  await writeFile(path.join(dir, "components.manifest.json"), "[1]", "utf8");
  await writeFile(path.join(dir, "source", "provenance.json"), "{", "utf8");
  await writeFile(path.join(dir, "OPEN_DESIGN_SLIM_HANDOFF.md"), "TODO\n", "utf8");

  const result = await runCliInProcess(["validate", "design-system", "--dir", dir]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /manifest\.json is not valid JSON/);
  assert.match(result.error.message, /components\.manifest\.json is not valid JSON/);
  assert.match(result.error.message, /source\/provenance\.json is not valid JSON/);
  assert.match(result.error.message, /TODO placeholder/);
});

test("rejects incomplete design-system metadata", async () => {
  const dir = await createTempDir();
  await mkdir(path.join(dir, "source"), { recursive: true });
  await writeFile(
    path.join(dir, "manifest.json"),
    JSON.stringify({
      schemaVersion: "od-design-system-project/v1",
      id: "x",
      name: "X",
      source: {},
      files: { design: "wrong.md", tokens: "wrong.css" },
      componentsManifest: "wrong.json",
      sourceFiles: { evidence: "wrong.json" }
    }),
    "utf8"
  );
  await writeFile(path.join(dir, "DESIGN.md"), "# Test\n", "utf8");
  await writeFile(path.join(dir, "USAGE.md"), "# Usage\n", "utf8");
  await writeFile(path.join(dir, "tokens.css"), ":root { --color: red; }\n", "utf8");
  await writeFile(path.join(dir, "components.manifest.json"), JSON.stringify({ components: [] }), "utf8");
  await writeFile(path.join(dir, "source", "provenance.json"), JSON.stringify({ schemaVersion: "x", sources: [], validationGaps: "none" }), "utf8");

  const result = await runCliInProcess(["validate", "design-system", "--dir", dir]);
  assertCliExitError(result.error);
  assert.match(result.error.message, /manifest\.json is missing source\.type/);
  assert.match(result.error.message, /files\.design must point at DESIGN\.md/);
  assert.match(result.error.message, /files\.tokens must point at tokens\.css/);
  assert.match(result.error.message, /componentsManifest must point at components\.manifest\.json/);
  assert.match(result.error.message, /sourceFiles\.evidence must point at source\/provenance\.json/);
  assert.match(result.error.message, /components\.manifest\.json is missing name/);
  assert.match(result.error.message, /must include at least one source record/);
  assert.match(result.error.message, /must include validationGaps array/);
});

test("uses local-design-system slug fallback", async () => {
  const dir = await createTempDir();
  const output = path.join(dir, "system");

  const result = await runCliInProcess(["init", "design-system", "--output", output, "--name", "!!!"]);
  assert.equal(result.error, undefined);

  const manifest = JSON.parse(await readFile(path.join(output, "manifest.json"), "utf8")) as { id: string; name: string };
  assert.equal(manifest.id, "local-design-system");
  assert.equal(manifest.name, "!!!");
});

test("skips ignored traversal directories while scanning text files", async () => {
  const dir = await createTempDir();
  const output = path.join(dir, "prototype");
  await runCliInProcess(["init", "prototype", "--kind", "static", "--output", output]);
  await mkdir(path.join(output, "dist"), { recursive: true });
  await writeFile(path.join(output, "dist", "ignored.txt"), "OD_DAEMON_URL=/tmp/daemon", "utf8");
  await writeFile(path.join(output, "ignored.bin"), "OD_DAEMON_URL=/tmp/daemon", "utf8");

  const result = await runCliInProcess(["validate", "prototype", "--entry", path.join(output, "index.html")]);
  assert.equal(result.error, undefined);
  assert.match(result.stdout, /prototype validation passed/);
});
