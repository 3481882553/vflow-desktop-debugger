#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(thisFile), "..");
const sourcePath = path.join(repoRoot, "docs", "contracts", "vflow_module_contract_source.json");
const bundlePath = path.join(repoRoot, "src", "renderer", "data", "generated", "module-contract-bundle.json");

function fail(msg) {
  console.error(`[display-check] FAIL: ${msg}`);
  process.exitCode = 1;
}

function normalizeText(input) {
  return typeof input === "string" ? input.trim() : "";
}

if (!fs.existsSync(sourcePath)) {
  fail(`missing source contract: ${sourcePath}`);
  process.exit(1);
}
if (!fs.existsSync(bundlePath)) {
  fail(`missing desktop bundle: ${bundlePath}`);
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const bundle = JSON.parse(fs.readFileSync(bundlePath, "utf8"));

const sourceModules = Array.isArray(source.modules) ? source.modules : [];
const bundleContracts = Array.isArray(bundle.contracts) ? bundle.contracts : [];
const bundleById = new Map(bundleContracts.map((c) => [c.moduleId, c]));
const locales = Array.isArray(source.availableLocales) && source.availableLocales.length > 0
  ? source.availableLocales
  : ["zh-CN"];

if (!Array.isArray(bundle.availableLocales) || bundle.availableLocales.length === 0) {
  fail("bundle.availableLocales is empty");
}

for (const locale of locales) {
  if (!bundle.availableLocales.includes(locale)) {
    fail(`bundle missing locale: ${locale}`);
  }
}

let compared = 0;
for (const sourceModule of sourceModules) {
  const moduleId = sourceModule?.moduleId;
  if (!moduleId) continue;
  const target = bundleById.get(moduleId);
  if (!target) {
    fail(`bundle missing moduleId: ${moduleId}`);
    continue;
  }
  for (const locale of locales) {
    const sourceDisplay = sourceModule?.displayByLocale?.[locale];
    const targetDisplay = target?.displayByLocale?.[locale];
    if (!sourceDisplay) {
      fail(`source displayByLocale missing locale ${locale} for ${moduleId}`);
      continue;
    }
    if (!targetDisplay) {
      fail(`bundle displayByLocale missing locale ${locale} for ${moduleId}`);
      continue;
    }
    if (normalizeText(sourceDisplay.name) !== normalizeText(targetDisplay.name)) {
      fail(`${moduleId} locale=${locale} name mismatch: "${sourceDisplay.name}" != "${targetDisplay.name}"`);
    }
    if (normalizeText(sourceDisplay.category) !== normalizeText(targetDisplay.category)) {
      fail(
        `${moduleId} locale=${locale} category mismatch: "${sourceDisplay.category}" != "${targetDisplay.category}"`
      );
    }
    if (normalizeText(sourceDisplay.description) !== normalizeText(targetDisplay.description)) {
      fail(
        `${moduleId} locale=${locale} description mismatch`
      );
    }
    compared += 1;
  }
}

if (process.exitCode !== 1) {
  console.log(`[display-check] PASS: compared ${compared} locale displays`);
}
