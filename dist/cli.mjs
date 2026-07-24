import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
var CliExitError = class extends Error {
  exitCode;
  constructor(message, exitCode = 1) {
    super(message);
    this.name = "CliExitError";
    this.exitCode = exitCode;
  }
};
var runtimeDir = path.dirname(fileURLToPath(import.meta.url));
var runtimeRoot = path.dirname(runtimeDir);
var assetsRoot = path.join(runtimeRoot, "assets");
var packageManifestPath = path.join(runtimeRoot, "package.json");
var sourceManifestPath = path.join(runtimeDir, "manifest", "open-design-slim.sources.json");
var fallbackPackageManifest = {
  name: "open-design-slim-cli",
  version: "0.1.0",
  bin: {
    "open-design-slim": "scripts/od-slim.mjs",
    "od-slim": "scripts/od-slim.mjs"
  }
};
var fallbackUpstream = {
  remote: "https://github.com/nexu-io/open-design",
  commit: "657fb09f3ab34f6120dcd5171ae66dbb7532d83c"
};
var productOdSubcommands = [
  "amr",
  "artifact",
  "artifacts",
  "atoms",
  "automation",
  "automations",
  "brand",
  "brands",
  "chat",
  "config",
  "conversation",
  "craft",
  "daemon",
  "deploy",
  "design-systems",
  "diagnostics",
  "doctor",
  "export",
  "figma",
  "files",
  "library",
  "marketplace",
  "mcp",
  "media",
  "memory",
  "message-center",
  "pack",
  "plugin",
  "project",
  "provider",
  "research",
  "run",
  "share",
  "skills",
  "status",
  "templates",
  "ui",
  "version",
  "whats-new"
];
var productOdCommandPattern = new RegExp(
  String.raw`(?:^|[^\w./-])od\s+(?:${productOdSubcommands.map(escapeRegExp).join("|")})\b`
);
var forbiddenPatterns = [
  { label: "Open Design daemon API route", pattern: /\/api\//, allowLine: isApiRuntimeBoundaryDenialLine },
  { label: "Open Design daemon URL", pattern: /\bOD_DAEMON_URL\b/ },
  { label: "Open Design project ID", pattern: /\bOD_PROJECT_ID\b/ },
  { label: "Open Design tool token", pattern: /\bOD_TOOL_TOKEN\b/ },
  { label: "Open Design data root", pattern: /\bOD_DATA_DIR\b/ },
  { label: "daemon source import", pattern: /apps\/daemon\/src/ },
  { label: "web source import", pattern: /apps\/web\/src/ },
  { label: "desktop source import", pattern: /apps\/desktop\/src/ },
  { label: "Electron runtime dependency", pattern: /\belectron\b/i },
  { label: "Open Design product CLI call", pattern: productOdCommandPattern }
];
var requiredDesignSystemFiles = [
  "manifest.json",
  "DESIGN.md",
  "USAGE.md",
  "tokens.css",
  "components.manifest.json",
  "source/provenance.json"
];
var textFilePattern = /\.(css|html|json|md|mjs|js|jsx|ts|tsx|txt)$/i;
var handoffSections = [
  "## Artifact",
  "## Source Files",
  "## Design System",
  "## State Coverage",
  "## Validation",
  "## Runtime Boundary",
  "## Validation Gaps"
];
function usage() {
  return `Open Design Slim CLI

Usage:
  open-design-slim --help
  open-design-slim init prototype --kind static|react|deck --output <dir>
  open-design-slim init design-system --output <dir> --name <name>
  open-design-slim validate prototype --entry <file> [--dir <dir>]
  open-design-slim validate design-system --dir <dir>
  open-design-slim bundle handoff --dir <dir>
  open-design-slim manifest show [--json]

Aliases:
  od-slim is equivalent to open-design-slim.

Boundary:
  Local filesystem only. No od command calls, no network, no daemon API, and no
  daemon data-root dependency.`;
}
async function runCli(args = process.argv.slice(2)) {
  const { options, positionals } = parseOptions(args);
  if (options.help === true || positionals.length === 0) {
    writeLine(usage());
    return;
  }
  const [command, subject] = positionals;
  if (command === "init" && subject === "prototype") {
    await initPrototype(options);
    return;
  }
  if (command === "init" && subject === "design-system") {
    await initDesignSystem(options);
    return;
  }
  if (command === "validate" && subject === "prototype") {
    await validatePrototype(options);
    return;
  }
  if (command === "validate" && subject === "design-system") {
    await validateDesignSystem(options);
    return;
  }
  if (command === "bundle" && subject === "handoff") {
    await bundleHandoff(options);
    return;
  }
  if (command === "manifest" && subject === "show") {
    await manifestShow(options);
    return;
  }
  if (command === "sync") {
    throw new Error("sync check/write are reserved for a future deterministic snapshot workflow.");
  }
  throw new Error(`Unknown command: ${positionals.join(" ")}`);
}
function parseOptions(args) {
  const options = {};
  const positionals = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === void 0) {
      continue;
    }
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (key === "help" || key === "json") {
      options[key] = true;
      continue;
    }
    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    options[key] = value;
    index += 1;
  }
  return { options, positionals };
}
function requireOption(options, key) {
  const value = options[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required --${key}`);
  }
  return value;
}
function getStringOption(options, key) {
  const value = options[key];
  return typeof value === "string" ? value : void 0;
}
function resolveOutput(target) {
  return path.resolve(process.cwd(), target);
}
async function copyDirectory(source, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, {
    recursive: true,
    force: false,
    errorOnExist: true
  });
}
async function initPrototype(options) {
  const kind = requireOption(options, "kind");
  const output = resolveOutput(requireOption(options, "output"));
  const templates = {
    static: "static-html",
    react: "react-prototype",
    deck: "deck-html"
  };
  const template = templates[kind];
  if (!template) {
    throw new Error(`Unsupported prototype kind "${kind}". Expected static, react, or deck.`);
  }
  await copyDirectory(path.join(assetsRoot, "templates", template), output);
  await writeHandoff(output, {
    kind: `${kind} prototype`,
    entry: kind === "react" ? "Prototype.jsx" : "index.html",
    supportingFiles: "Template entry plus OPEN_DESIGN_SLIM_HANDOFF.md",
    templateSource: `assets/templates/${template}/`,
    designSource: "Open Design Slim CLI default",
    designSourceFiles: "assets/design-systems/default/DESIGN.md, tokens.css, components.manifest.json",
    provenanceFile: "OPEN_DESIGN_SLIM_HANDOFF.md",
    stateCoverage: "Scaffold includes populated, loading, empty, error, selected, disabled, focus, and mobile reference states where the template supports them.",
    validationCommands: `open-design-slim validate prototype --entry ${kind === "react" ? "Prototype.jsx" : "index.html"}`,
    manualChecks: "Run quality/state-matrix.md, quality/visual-checklist.md, and quality/responsive-viewports.json before final delivery.",
    browserChecks: "Not run by scaffold; see quality/visual-qa-recipe.md for optional screenshot checks.",
    validationGaps: "Scaffold content still needs product-specific copy, source-file attribution, and browser or screenshot QA before a final handoff."
  });
  writeLine(`Initialized ${kind} prototype at ${output}`);
}
async function initDesignSystem(options) {
  const output = resolveOutput(requireOption(options, "output"));
  const name = requireOption(options, "name");
  const source = path.join(assetsRoot, "design-systems", "default");
  await copyDirectory(source, output);
  const designPath = path.join(output, "DESIGN.md");
  const packageManifestPath2 = path.join(output, "manifest.json");
  const manifestPath = path.join(output, "components.manifest.json");
  const provenancePath = path.join(output, "source", "provenance.json");
  const design = await readFile(designPath, "utf8");
  await writeFile(
    designPath,
    design.replace("# Open Design Slim Default System", `# ${name} Design System`),
    "utf8"
  );
  const packageManifest = parseJsonObject(await readFile(packageManifestPath2, "utf8"), "manifest.json");
  packageManifest.id = slugify(name);
  packageManifest.name = name;
  packageManifest.description = `Portable Open Design Slim skill bundle baseline for ${name}.`;
  await writeFile(packageManifestPath2, `${JSON.stringify(packageManifest, null, 2)}
`, "utf8");
  const manifest = parseJsonObject(await readFile(manifestPath, "utf8"), "components.manifest.json");
  manifest.name = name;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}
`, "utf8");
  const provenance = parseJsonObject(await readFile(provenancePath, "utf8"), "source/provenance.json");
  provenance.bundleName = name;
  provenance.localization = {
    renamedByHelper: true,
    requestedName: name
  };
  await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}
`, "utf8");
  await writeHandoff(output, {
    kind: "design-system",
    entry: "DESIGN.md",
    supportingFiles: "manifest.json, tokens.css, components.manifest.json, USAGE.md, preview/index.html, ui_kits/app/index.html, source/provenance.json",
    templateSource: "assets/design-systems/default/",
    designSource: "Open Design Slim CLI default, renamed locally",
    designSourceFiles: "manifest.json, DESIGN.md, tokens.css, components.manifest.json, USAGE.md, source/provenance.json",
    provenanceFile: "source/provenance.json",
    stateCoverage: "Default preview and app UI kit include component states for buttons, panels, tables, status, focus, disabled, empty, loading, error, selected, and mobile layout references.",
    validationCommands: "open-design-slim validate design-system --dir .",
    manualChecks: "Review DESIGN.md, USAGE.md, preview/index.html, and quality/visual-checklist.md against the target product before final use.",
    browserChecks: "Not run by scaffold; see quality/visual-qa-recipe.md for optional screenshot checks.",
    validationGaps: "The helper renamed the default bundle but did not inspect a host repository or perform browser visual QA."
  });
  writeLine(`Initialized design system "${name}" at ${output}`);
}
async function validatePrototype(options) {
  const entry = path.resolve(process.cwd(), requireOption(options, "entry"));
  const dirOption = getStringOption(options, "dir");
  const dir = dirOption ? path.resolve(process.cwd(), dirOption) : path.dirname(entry);
  const text = await readFile(entry, "utf8");
  const failures = [];
  const extension = path.extname(entry);
  const textFiles = await listTextFiles(dir);
  if (![".html", ".jsx", ".tsx"].includes(extension)) {
    failures.push(`Unsupported prototype entry extension: ${extension || "(none)"}`);
  }
  if (extension === ".html") {
    if (!/<!doctype html>/i.test(text)) failures.push("HTML entry is missing <!doctype html>.");
    if (!/name=["']viewport["']/i.test(text)) failures.push("HTML entry is missing viewport metadata.");
    if (!/<html\b[^>]*\blang=/i.test(text)) failures.push("HTML entry is missing an html lang attribute.");
    if (!/<title>[^<]+<\/title>/i.test(text)) failures.push("HTML entry is missing a non-empty title.");
    validateHtmlA11y(text, entry, failures);
  }
  if (extension === ".jsx" || extension === ".tsx") {
    if (!/export\s+default/.test(text)) failures.push("React entry is missing a default export.");
    validateReactPrototypeA11y(text, entry, failures);
    validateReactPrototypeStateCoverage(text, failures);
  }
  for (const file of textFiles) {
    const fileText = await readFile(file, "utf8");
    failures.push(...findForbidden(fileText, file));
  }
  validatePrototypeStateCoverage(text, failures);
  await validateHandoff(path.join(dir, "OPEN_DESIGN_SLIM_HANDOFF.md"), failures, { required: true });
  reportValidation("prototype", failures);
}
async function validateDesignSystem(options) {
  const dir = path.resolve(process.cwd(), requireOption(options, "dir"));
  const failures = [];
  for (const file of requiredDesignSystemFiles) {
    const fullPath = path.join(dir, file);
    try {
      await stat(fullPath);
    } catch {
      failures.push(`Missing required design-system file: ${file}`);
    }
  }
  const packageManifestPath2 = path.join(dir, "manifest.json");
  try {
    const packageManifest = parseJsonObject(await readFile(packageManifestPath2, "utf8"), "manifest.json");
    if (packageManifest.schemaVersion !== "od-design-system-project/v1") {
      failures.push("manifest.json must declare schemaVersion od-design-system-project/v1.");
    }
    if (!packageManifest.id) failures.push("manifest.json is missing id.");
    if (!packageManifest.name) failures.push("manifest.json is missing name.");
    const source = getJsonObject(packageManifest, "source");
    if (!source?.type) failures.push("manifest.json is missing source.type.");
    const files2 = getJsonObject(packageManifest, "files");
    if (files2?.design !== "DESIGN.md") {
      failures.push("manifest.json files.design must point at DESIGN.md.");
    }
    if (files2?.tokens !== "tokens.css") {
      failures.push("manifest.json files.tokens must point at tokens.css.");
    }
    if (packageManifest.componentsManifest !== "components.manifest.json") {
      failures.push("manifest.json componentsManifest must point at components.manifest.json.");
    }
    const sourceFiles = getJsonObject(packageManifest, "sourceFiles");
    if (sourceFiles?.evidence !== "source/provenance.json") {
      failures.push("manifest.json sourceFiles.evidence must point at source/provenance.json.");
    }
  } catch (error) {
    failures.push(`manifest.json is not valid JSON: ${formatError(error)}`);
  }
  const manifestPath = path.join(dir, "components.manifest.json");
  try {
    const manifest = parseJsonObject(await readFile(manifestPath, "utf8"), "components.manifest.json");
    if (!manifest.name) failures.push("components.manifest.json is missing name.");
    if (!Array.isArray(manifest.components)) {
      failures.push("components.manifest.json is missing components array.");
    }
  } catch (error) {
    failures.push(`components.manifest.json is not valid JSON: ${formatError(error)}`);
  }
  const provenancePath = path.join(dir, "source", "provenance.json");
  try {
    const provenance = parseJsonObject(await readFile(provenancePath, "utf8"), "source/provenance.json");
    if (!provenance.schemaVersion) failures.push("source/provenance.json is missing schemaVersion.");
    if (!Array.isArray(provenance.sources) || provenance.sources.length === 0) {
      failures.push("source/provenance.json must include at least one source record.");
    }
    if (!Array.isArray(provenance.validationGaps)) {
      failures.push("source/provenance.json must include validationGaps array.");
    }
  } catch (error) {
    failures.push(`source/provenance.json is not valid JSON: ${formatError(error)}`);
  }
  const files = await listTextFiles(dir);
  for (const file of files) {
    const text = await readFile(file, "utf8");
    failures.push(...findForbidden(text, file));
  }
  await validateHandoff(path.join(dir, "OPEN_DESIGN_SLIM_HANDOFF.md"), failures, { required: false });
  reportValidation("design-system", failures);
}
async function bundleHandoff(options) {
  const dir = path.resolve(process.cwd(), requireOption(options, "dir"));
  await mkdir(dir, { recursive: true });
  await writeHandoff(dir, {
    kind: "draft prototype or design-system handoff",
    entry: "Not recorded by helper; set this to the generated entry before final delivery.",
    supportingFiles: "Not recorded by helper; list generated supporting files before final delivery.",
    templateSource: "Not recorded by helper; cite the copied template or host source before final delivery.",
    designSource: "Not recorded by helper; cite the design-system source before final delivery.",
    designSourceFiles: "Not recorded by helper; list DESIGN.md, tokens, screenshots, or host files used.",
    provenanceFile: "Not recorded by helper; add source/provenance.json or equivalent notes when needed.",
    stateCoverage: "Not recorded by helper; map populated, empty, loading, error, selected, disabled, focus, and mobile states before final delivery.",
    validationCommands: "Not run by helper during handoff creation; add exact commands after validation.",
    manualChecks: "Not run by helper during handoff creation; add checklist results before final delivery.",
    browserChecks: "Not run by helper; use quality/visual-qa-recipe.md when screenshot QA is available.",
    validationGaps: "Draft handoff only. Replace these not-recorded notes with artifact-specific evidence before final delivery."
  });
  writeLine(`Wrote handoff template at ${path.join(dir, "OPEN_DESIGN_SLIM_HANDOFF.md")}`);
}
async function manifestShow(options) {
  const packageManifest = await readPackageManifest();
  const sourceManifestResult = await readSourceManifest();
  const sourceManifest = sourceManifestResult.manifest;
  const output = {
    package: {
      name: packageManifest.name,
      version: packageManifest.version,
      bins: packageManifest.bin
    },
    sourceManifest
  };
  if (options.json === true) {
    writeLine(`${JSON.stringify(output, null, 2)}`);
    return;
  }
  writeLine(`Open Design Slim ${packageManifest.version}`);
  writeLine(`Package: ${packageManifest.name}`);
  writeLine(`Binaries: ${Object.keys(packageManifest.bin).join(", ")}`);
  writeLine(`Source manifest: ${sourceManifestResult.label}`);
  writeLine(`Upstream: ${sourceManifest.upstream.remote}`);
  writeLine(`Pinned upstream commit: ${sourceManifest.upstream.commit}`);
  writeLine(`Entries: ${sourceManifest.entries.length}`);
  for (const entry of sourceManifest.entries) {
    const hash = entry.hash ? entry.hash.slice(0, 12) : "unhashed";
    writeLine(`- ${entry.kind}: ${entry.targetPath} (${entry.mode}, ${hash})`);
  }
}
async function writeHandoff(dir, values) {
  const content = `# Open Design Slim Handoff

## Artifact
- Kind: ${values.kind}
- Entry: ${values.entry}
- Supporting files: ${values.supportingFiles}

## Source Files
- Template source: ${values.templateSource}
- Design source files: ${values.designSourceFiles}
- Provenance file: ${values.provenanceFile}

## Design System
- Source: ${values.designSource}
- Tokens used: Semantic Open Design Slim tokens unless a host repository source overrides them.
- Deviations: None recorded by helper.

## State Coverage
- Coverage summary: ${values.stateCoverage}
- Populated: Evidence required in artifact or final response.
- Empty: Evidence required in artifact or final response.
- Loading: Evidence required when the workflow has async or data-heavy states.
- Error: Recoverable error state required for forms, imports, publishing, or validation flows.
- Selected: Evidence required for lists, tables, galleries, inspectors, or active deck slides.
- Disabled: Evidence required for gated actions or slide endpoints.
- Focus: Visible focus treatment required for interactive controls.
- Mobile: Narrow viewport strategy required for web artifacts.

## Validation
- Commands: ${values.validationCommands}
- Manual checks: ${values.manualChecks}
- Browser or screenshot checks: ${values.browserChecks}

## Runtime Boundary
- Uses Open Design daemon: no
- Calls /api/*: no
- Requires artifact DB or daemon data root: no

## Validation Gaps
- ${values.validationGaps}
`;
  await writeFile(path.join(dir, "OPEN_DESIGN_SLIM_HANDOFF.md"), content, "utf8");
}
function slugify(value) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "local-design-system";
}
function findForbidden(text, file) {
  const failures = [];
  for (const item of forbiddenPatterns) {
    const offendingLine = text.split(/\r?\n/).find((line) => item.pattern.test(line) && !item.allowLine?.(line));
    if (offendingLine !== void 0) {
      failures.push(`${path.relative(process.cwd(), file)} contains forbidden dependency: ${item.label}`);
    }
  }
  return failures;
}
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isApiRuntimeBoundaryDenialLine(line) {
  return /^[-*]\s*Calls\s+`?\/api\/\*`?:\s*no\.?\s*$/i.test(line.trim());
}
async function listTextFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...await listTextFiles(fullPath));
      continue;
    }
    if (entry.isFile() && textFilePattern.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}
function validateHtmlA11y(text, entry, failures) {
  const label = path.relative(process.cwd(), entry);
  if (!/<main\b/i.test(text)) failures.push(`${label} is missing a semantic <main> landmark.`);
  if (!/:focus-visible\b|focus-visible/i.test(text)) {
    failures.push(`${label} is missing visible focus-state CSS or equivalent focus-visible marker.`);
  }
  if (/<input\b/i.test(text) && !/<label\b/i.test(text)) {
    failures.push(`${label} includes inputs but no labels.`);
  }
  const buttonPattern = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let match;
  while ((match = buttonPattern.exec(text)) !== null) {
    const attrs = match[1] ?? "";
    const content = (match[2] ?? "").replace(/<[^>]+>/g, "").replace(/&(?:lt|gt|amp|nbsp);/g, " ").trim();
    if (!content && !/\baria-label\s*=/.test(attrs) && !/\btitle\s*=/.test(attrs)) {
      failures.push(`${label} contains a button without visible text, aria-label, or title.`);
    }
  }
}
function validateReactPrototypeA11y(text, entry, failures) {
  const label = path.relative(process.cwd(), entry);
  const requiredSignals = [
    { label: "a semantic main landmark", pattern: /<main\b|role=["']main["']/i },
    { label: "accessible region or control labels", pattern: /aria-label=|aria-labelledby=/i },
    { label: "interactive state semantics", pattern: /aria-pressed=|aria-selected=|aria-current=|aria-disabled=/i },
    { label: "loading status semantics", pattern: /aria-busy=|role=["']status["']|role=["']alert["']/i },
    { label: "visible focus-state styling", pattern: /:focus-visible\b|focus-visible/i }
  ];
  for (const signal of requiredSignals) {
    if (!signal.pattern.test(text)) {
      failures.push(`${label} is missing ${signal.label}.`);
    }
  }
  if (/<input\b/i.test(text) && !(/<label\b/i.test(text) || /aria-label=|aria-labelledby=/i.test(text))) {
    failures.push(`${label} includes inputs but no labels or aria label references.`);
  }
}
function validatePrototypeStateCoverage(text, failures) {
  const isDeck = /\bdeck\b|class=["'][^"']*\bslide\b/i.test(text);
  if (isDeck) {
    const requiredDeckSignals = [
      { label: "active slide state", pattern: /\bis-active\b|\baria-current\b/i },
      { label: "disabled slide endpoint", pattern: /\bdisabled\b/i },
      { label: "focus treatment", pattern: /focus-visible|\bfocus\b/i },
      { label: "mobile or narrow viewport strategy", pattern: /@media|viewport|mobile|max-width/i }
    ];
    for (const signal of requiredDeckSignals) {
      if (!signal.pattern.test(text)) failures.push(`Deck prototype is missing ${signal.label}.`);
    }
    return;
  }
  const stateSignals = [
    { label: "populated content", pattern: /aria-selected|data-state=["']populated|populated|table|row|queue/i },
    { label: "loading state", pattern: /aria-busy|loading|skeleton/i },
    { label: "empty state", pattern: /\bempty\b|no .*match|no .*items|clear filters/i },
    { label: "error state", pattern: /\berror\b|retry|could not/i },
    { label: "selected state", pattern: /aria-selected|\bselected\b/i },
    { label: "disabled state", pattern: /\bdisabled\b|aria-disabled/i },
    { label: "focus state", pattern: /focus-visible|\bfocus\b/i },
    { label: "mobile or viewport strategy", pattern: /@media|viewport|mobile|max-width/i }
  ];
  const present = stateSignals.filter((signal) => signal.pattern.test(text));
  if (present.length < 5) {
    const missing = stateSignals.filter((signal) => !signal.pattern.test(text)).map((signal) => signal.label).join(", ");
    failures.push(`Prototype state coverage is too thin; missing signals include: ${missing}`);
  }
}
function validateReactPrototypeStateCoverage(text, failures) {
  if (!/\buseState\s*\(|\buseReducer\s*\(/.test(text)) {
    failures.push("React prototype is missing explicit state management for interactive states.");
  }
  const stateSignals = [
    { label: "populated content", pattern: /aria-selected|data-state=["']populated|populated|table|row|queue/i },
    { label: "loading state", pattern: /aria-busy|loading|skeleton/i },
    { label: "empty state", pattern: /\bempty\b|no .*match|no .*items|clear filters/i },
    { label: "error state", pattern: /\berror\b|retry|could not/i },
    { label: "selected state", pattern: /aria-selected|\bselected\b/i },
    { label: "disabled state", pattern: /\bdisabled\b|aria-disabled/i },
    { label: "focus state", pattern: /focus-visible|\bfocus\b/i },
    { label: "mobile or viewport strategy", pattern: /@media|viewport|mobile|max-width/i }
  ];
  const missing = stateSignals.filter((signal) => !signal.pattern.test(text));
  if (missing.length > 0) {
    failures.push(`React prototype is missing state coverage signals: ${missing.map((signal) => signal.label).join(", ")}`);
  }
}
async function validateHandoff(file, failures, { required }) {
  let text;
  try {
    text = await readFile(file, "utf8");
  } catch {
    if (required) failures.push(`Missing required handoff file: ${path.relative(process.cwd(), file)}`);
    return;
  }
  for (const section of handoffSections) {
    if (!text.includes(section)) {
      failures.push(`${path.relative(process.cwd(), file)} is missing handoff section: ${section}`);
    }
  }
  const placeholderPatterns = [
    { label: "square-bracket placeholder", pattern: /\[[^\]\n]*(?:fill|todo|tbd|placeholder|path|file|command|source|check|\.{3})[^\]\n]*\]/i },
    { label: "fill-in placeholder", pattern: /\bfill\s+in\b/i },
    { label: "TODO placeholder", pattern: /\bTODO\b/i },
    { label: "TBD placeholder", pattern: /\bTBD\b/i },
    { label: "not-recorded placeholder", pattern: /\bNot recorded by helper\b/i },
    { label: "generic lorem placeholder", pattern: /\bLorem ipsum\b/i },
    { label: "generic card placeholder", pattern: /\bCard 1\b/i },
    { label: "generic feature placeholder", pattern: /\bFeature goes here\b/i }
  ];
  for (const item of placeholderPatterns) {
    if (item.pattern.test(text)) {
      failures.push(`${path.relative(process.cwd(), file)} contains ${item.label}.`);
    }
  }
  if (!/- Uses Open Design daemon: no/i.test(text)) {
    failures.push(`${path.relative(process.cwd(), file)} must state that it does not use the Open Design daemon.`);
  }
  if (!/- Calls \/api\/\*: no/i.test(text)) {
    failures.push(`${path.relative(process.cwd(), file)} must state that it does not call /api/*.`);
  }
}
function reportValidation(label, failures) {
  if (failures.length > 0) {
    throw new CliExitError(`${label} validation failed:
${failures.map((failure) => `- ${failure}`).join("\n")}`);
  }
  writeLine(`${label} validation passed.`);
}
function hashText(text) {
  return createHash("sha256").update(text).digest("hex");
}
function parseJsonObject(text, label) {
  const value = JSON.parse(text);
  if (!isJsonObject(value)) {
    throw new Error(`${label} must contain a JSON object.`);
  }
  return value;
}
function parsePackageManifest(text) {
  const value = parseJsonObject(text, "package.json");
  if (typeof value.name !== "string") {
    throw new Error("package.json is missing name.");
  }
  if (typeof value.version !== "string") {
    throw new Error("package.json is missing version.");
  }
  const bin = getStringRecord(value, "bin");
  if (!bin) {
    throw new Error("package.json is missing bin.");
  }
  return {
    name: value.name,
    version: value.version,
    bin
  };
}
async function readPackageManifest() {
  try {
    return parsePackageManifest(await readFile(packageManifestPath, "utf8"));
  } catch (error) {
    if (isNotFound(error)) {
      return fallbackPackageManifest;
    }
    throw error;
  }
}
async function readSourceManifest() {
  try {
    return {
      label: path.relative(process.cwd(), sourceManifestPath),
      manifest: parseSourceManifest(await readFile(sourceManifestPath, "utf8"))
    };
  } catch (error) {
    if (isNotFound(error)) {
      return {
        label: "runtime assets (generated)",
        manifest: await buildRuntimeSourceManifest()
      };
    }
    throw error;
  }
}
async function buildRuntimeSourceManifest() {
  const roots = [
    path.join(assetsRoot, "templates"),
    path.join(assetsRoot, "design-systems", "default")
  ];
  const entries = [];
  for (const root of roots) {
    let files;
    try {
      files = await listTextFiles(root);
    } catch (error) {
      if (isNotFound(error)) {
        continue;
      }
      throw error;
    }
    for (const file of files) {
      const targetPath = path.relative(runtimeRoot, file).split(path.sep).join("/");
      entries.push({
        kind: targetPath.includes("/templates/") ? "template" : "asset",
        targetPath,
        mode: "runtime-snapshot",
        hash: hashText(await readFile(file, "utf8"))
      });
    }
  }
  entries.sort((left, right) => left.targetPath.localeCompare(right.targetPath));
  return {
    upstream: fallbackUpstream,
    entries
  };
}
function parseSourceManifest(text) {
  const value = parseJsonObject(text, "open-design-slim.sources.json");
  const upstream = getJsonObject(value, "upstream");
  if (!upstream || typeof upstream.remote !== "string" || typeof upstream.commit !== "string") {
    throw new Error("open-design-slim.sources.json is missing upstream remote or commit.");
  }
  if (!Array.isArray(value.entries)) {
    throw new Error("open-design-slim.sources.json is missing entries array.");
  }
  const entries = value.entries.map((entry, index) => {
    if (!isJsonObject(entry)) {
      throw new Error(`source manifest entry ${index} must be an object.`);
    }
    if (typeof entry.kind !== "string" || typeof entry.targetPath !== "string" || typeof entry.mode !== "string") {
      throw new Error(`source manifest entry ${index} is missing kind, targetPath, or mode.`);
    }
    const parsedEntry = {
      kind: entry.kind,
      targetPath: entry.targetPath,
      mode: entry.mode
    };
    if (typeof entry.hash === "string") {
      parsedEntry.hash = entry.hash;
    }
    return parsedEntry;
  });
  return {
    upstream: {
      remote: upstream.remote,
      commit: upstream.commit
    },
    entries
  };
}
function isNotFound(error) {
  return isJsonObjectLike(error) && error.code === "ENOENT";
}
function getJsonObject(value, key) {
  const child = value[key];
  return isJsonObject(child) ? child : void 0;
}
function getStringRecord(value, key) {
  const child = getJsonObject(value, key);
  if (!child) {
    return void 0;
  }
  const result = {};
  for (const [recordKey, recordValue] of Object.entries(child)) {
    if (typeof recordValue !== "string") {
      return void 0;
    }
    result[recordKey] = recordValue;
  }
  return result;
}
function isJsonObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isJsonObjectLike(value) {
  return typeof value === "object" && value !== null;
}
function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}
function writeLine(message) {
  process.stdout.write(`${message}
`);
}
export {
  CliExitError,
  hashText,
  runCli
};
