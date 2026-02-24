#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(thisFile), "..");
const bundlePath = path.join(repoRoot, "src", "renderer", "data", "generated", "module-contract-bundle.json");

function fail(msg) {
  console.error(`[consistency] FAIL: ${msg}`);
  process.exitCode = 1;
}

if (!fs.existsSync(bundlePath)) {
  fail(`missing contract bundle: ${bundlePath}`);
  process.exit(1);
}

const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
const canonicalIds = Array.isArray(bundle.canonicalModuleIds) ? bundle.canonicalModuleIds : [];
const contracts = Array.isArray(bundle.contracts) ? bundle.contracts : [];
const aliasMap = bundle.legacyAliasToCanonical || {};

if (canonicalIds.length === 0) fail("canonicalModuleIds is empty");
if (contracts.length !== canonicalIds.length) {
  fail(`contracts(${contracts.length}) != canonicalModuleIds(${canonicalIds.length})`);
}

const canonicalSet = new Set(canonicalIds);
for (const c of contracts) {
  if (!c.moduleId || !canonicalSet.has(c.moduleId)) {
    fail(`contract has non-canonical moduleId: ${String(c.moduleId)}`);
  }
}

for (const [alias, canonical] of Object.entries(aliasMap)) {
  if (!canonicalSet.has(canonical)) {
    fail(`alias maps to unknown canonical id: ${alias} -> ${canonical}`);
  }
}

const missingSchema = contracts.filter((c) => !c.hasLocalSchema).map((c) => c.moduleId);
console.log(`[consistency] canonical=${canonicalIds.length}, missingSchema=${missingSchema.length}`);
if (missingSchema.length > 0) {
  console.log("[consistency] modules without local schema (expected disabled):");
  for (const id of missingSchema) console.log(` - ${id}`);
}

if (process.exitCode !== 1) {
  console.log("[consistency] PASS");
}
