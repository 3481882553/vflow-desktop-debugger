#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(thisFile), "..");
const appModuleRoot = path.join(repoRoot, "_external", "app", "src", "main", "java");
const appExportContractPath = path.join(repoRoot, "docs", "contracts", "vflow_module_contract_source.json");
const schemaRoot = path.join(repoRoot, "src", "renderer", "data", "schemas");
const outputPath = path.join(repoRoot, "src", "renderer", "data", "generated", "module-contract-bundle.json");
const DEFAULT_LOCALE = "zh-CN";

const CATEGORY_KEY_BY_RAW = {
  "触发器": "category_trigger",
  "界面交互": "category_interaction",
  "逻辑控制": "category_logic",
  "数据": "category_data",
  "文件": "category_file",
  "网络": "category_network",
  "应用与系统": "category_device",
  "模板": "category_template",
  "Shizuku": "category_shizuku"
};

function walkFiles(root, filterExt) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  const stack = [root];
  while (stack.length > 0) {
    const cur = stack.pop();
    for (const entry of fs.readdirSync(cur, { withFileTypes: true })) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && full.endsWith(filterExt)) out.push(full);
    }
  }
  return out;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function readAppSourceContract() {
  if (!fs.existsSync(appExportContractPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(appExportContractPath, "utf8"));
  } catch {
    return null;
  }
}

function extractAppModuleIds(sourceContract) {
  if (sourceContract && Array.isArray(sourceContract.moduleIds) && sourceContract.moduleIds.length > 0) {
    return [...new Set(sourceContract.moduleIds)].sort();
  }
  if (sourceContract && Array.isArray(sourceContract.modules) && sourceContract.modules.length > 0) {
    return [...new Set(sourceContract.modules.map((m) => m.moduleId).filter(Boolean))].sort();
  }
  if (fs.existsSync(appExportContractPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(appExportContractPath, "utf8"));
      if (Array.isArray(parsed.moduleIds) && parsed.moduleIds.length > 0) {
        return [...new Set(parsed.moduleIds)].sort();
      }
    } catch {
      // fallback to source scan
    }
  }

  const ids = new Set();
  const files = walkFiles(appModuleRoot, ".kt");
  const re = /override\s+val\s+id\s*=\s*"(vflow\.[^"]+)"/g;
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(re)) ids.add(m[1]);
  }
  return [...ids].sort();
}

function extractSchemaIds() {
  const ids = new Set();
  const files = walkFiles(schemaRoot, ".ts");
  const re = /"(vflow\.[a-zA-Z0-9._]+)"\s*:/g;
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(re)) ids.add(m[1]);
  }
  return [...ids].sort();
}

function tokenSignature(id) {
  return id.split(/[._]/g).join("|");
}

function buildLegacyAlias(id) {
  if (!id.includes("_")) return [];
  const legacy = id.replaceAll("_", ".");
  return legacy === id ? [] : [legacy];
}

function normalizeDisplay(display, fallbackId, fallbackCategory = "其他") {
  return {
    name: typeof display?.name === "string" && display.name.trim() ? display.name : fallbackId,
    category:
      typeof display?.category === "string" && display.category.trim() ? display.category : fallbackCategory,
    description: typeof display?.description === "string" ? display.description : ""
  };
}

function buildBundle() {
  const sourceContract = readAppSourceContract();
  const appIds = extractAppModuleIds(sourceContract);
  const schemaIds = extractSchemaIds();
  const schemaSigToId = new Map(schemaIds.map((id) => [tokenSignature(id), id]));
  const schemaSet = new Set(schemaIds);
  const sourceModulesById = new Map(
    Array.isArray(sourceContract?.modules)
      ? sourceContract.modules.filter((m) => typeof m?.moduleId === "string").map((m) => [m.moduleId, m])
      : []
  );
  const availableLocales = Array.isArray(sourceContract?.availableLocales) && sourceContract.availableLocales.length > 0
    ? [...new Set(sourceContract.availableLocales)]
    : [DEFAULT_LOCALE];
  const defaultLocale =
    typeof sourceContract?.defaultLocale === "string" && sourceContract.defaultLocale
      ? sourceContract.defaultLocale
      : DEFAULT_LOCALE;

  const modulesZhPath = path.join(repoRoot, "src", "renderer", "data", "modules_zh.json");
  const modulesEnPath = path.join(repoRoot, "src", "renderer", "data", "modules.json");
  const modulesZh = fs.existsSync(modulesZhPath) ? readJson(modulesZhPath) : [];
  const modulesEn = fs.existsSync(modulesEnPath) ? readJson(modulesEnPath) : [];
  const metadataBySignature = new Map();
  for (const item of [...modulesZh, ...modulesEn]) {
    if (!item?.id || typeof item.id !== "string") continue;
    const sig = tokenSignature(item.id);
    if (!metadataBySignature.has(sig)) metadataBySignature.set(sig, item);
  }

  const contracts = appIds.map((moduleId) => {
    const sig = tokenSignature(moduleId);
    const schemaId = schemaSet.has(moduleId) ? moduleId : schemaSigToId.get(sig) || null;
    const metadata = metadataBySignature.get(sig) || {};
    const sourceModule = sourceModulesById.get(moduleId) || {};
    const sourceDisplayByLocale = sourceModule.displayByLocale && typeof sourceModule.displayByLocale === "object"
      ? sourceModule.displayByLocale
      : {};
    const displayByLocale = {};
    for (const locale of availableLocales) {
      const fallbackCategory = metadata.category || sourceModule?.fallback?.category || "其他";
      displayByLocale[locale] = normalizeDisplay(sourceDisplayByLocale[locale], metadata.name || moduleId, fallbackCategory);
    }
    const display = normalizeDisplay(
      displayByLocale[defaultLocale] || displayByLocale[DEFAULT_LOCALE],
      metadata.name || moduleId,
      metadata.category || sourceModule?.fallback?.category || "其他"
    );
    return {
      moduleId,
      inputs: [],
      outputs: [],
      hasLocalSchema: Boolean(schemaId),
      schemaId,
      deprecatedAliases: buildLegacyAlias(moduleId),
      categoryKey: sourceModule?.categoryKey || CATEGORY_KEY_BY_RAW[display.category] || null,
      display,
      displayByLocale
    };
  });

  const contractSet = new Set(appIds);
  const missingSchemaIds = contracts.filter((c) => !c.hasLocalSchema).map((c) => c.moduleId);

  const legacyAliasToCanonical = {};
  for (const c of contracts) {
    for (const a of c.deprecatedAliases) legacyAliasToCanonical[a] = c.moduleId;
  }
  legacyAliasToCanonical["vflow.trigger.receive_share"] = "vflow.trigger.share";
  legacyAliasToCanonical["vflow.trigger.app.start"] = "vflow.trigger.app_start";
  legacyAliasToCanonical["vflow.ui.interaction.get.value"] = "vflow.ui.interaction.get_value";

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      source: "app/src/main/.../workflow/module/*.kt + docs/contracts/vflow_module_contract_source.json",
      version: 2,
      appModuleCount: appIds.length,
      schemaModuleCount: schemaIds.length
    },
    defaultLocale,
    availableLocales,
    contracts,
    canonicalModuleIds: appIds,
    missingSchemaIds,
    legacyAliasToCanonical,
    stats: {
      missingSchemaCount: missingSchemaIds.length,
      missingSchemaIds
    },
    diagnostics: {
      schemaWithoutApp: schemaIds.filter((id) => !contractSet.has(id))
    }
  };
}

function main() {
  const bundle = buildBundle();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(bundle, null, 2), "utf8");
  console.log(`[contracts] generated: ${outputPath}`);
  console.log(
    `[contracts] app=${bundle.meta.appModuleCount}, missingSchema=${bundle.stats.missingSchemaCount}`
  );
}

main();
