import contractBundle from "../data/generated/module-contract-bundle.json";

type BundleShape = {
  canonicalModuleIds: string[];
  legacyAliasToCanonical: Record<string, string>;
};

const bundle = contractBundle as BundleShape;
const canonicalIds = new Set(bundle.canonicalModuleIds || []);
const aliasMap: Record<string, string> = {
  ...(bundle.legacyAliasToCanonical || {})
};

function signature(id: string): string {
  return String(id || "")
    .split(/[._]/g)
    .filter(Boolean)
    .join("|");
}

const signatureToCanonical = new Map<string, string>();
for (const id of canonicalIds) {
  signatureToCanonical.set(signature(id), id);
}

export function getCanonicalModuleIdSet(): Set<string> {
  return canonicalIds;
}

export function normalizeModuleId(id: string): string {
  if (!id) return id;
  if (canonicalIds.has(id)) return id;
  if (aliasMap[id]) return aliasMap[id];

  const bySig = signatureToCanonical.get(signature(id));
  return bySig || id;
}

export function denormalizeForDisplay(id: string): string {
  return normalizeModuleId(id);
}

