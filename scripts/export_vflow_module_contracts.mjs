#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(thisFile), "..");
const outputPath = path.join(repoRoot, "docs", "contracts", "vflow_module_contract_source.json");

if (!fs.existsSync(outputPath)) {
  console.error(`[vflow-contract] missing local source contract snapshot: ${outputPath}`);
  console.error(
    "[vflow-contract] add docs/contracts/vflow_module_contract_source.json before running build in standalone repo mode"
  );
  process.exit(1);
}

const raw = fs.readFileSync(outputPath, "utf8");
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (error) {
  console.error(`[vflow-contract] invalid json at ${outputPath}`);
  console.error(String(error));
  process.exit(1);
}

const count = Array.isArray(parsed.moduleIds) ? parsed.moduleIds.length : 0;
const locales = Array.isArray(parsed.availableLocales) ? parsed.availableLocales : [];
console.log(
  `[vflow-contract] using local source snapshot: modules=${count}, locales=[${locales.join(", ")}] -> ${outputPath}`
);
