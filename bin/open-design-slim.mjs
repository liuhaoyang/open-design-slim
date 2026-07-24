#!/usr/bin/env node
import { runCli } from "../dist/cli.mjs";

runCli(process.argv.slice(2)).catch((error) => {
  console.error(error.message);
  process.exitCode = typeof error.exitCode === "number" ? error.exitCode : 1;
});
