import type { VflowModuleOption } from "../domain/vflowTypes";
import contractBundle from "../data/generated/module-contract-bundle.json";
import { getCanonicalModuleIdSet, normalizeModuleId } from "./moduleIdCompat";

declare global {
  interface Window {
    vflowDesktop?: {
      ping?: () => string;
      getModules?: () => Promise<{ id: string; name: string }[]>;
      runDebugWorkflow?: (jsonStr: string) => Promise<{ success: boolean; error?: string }>;
      stopDebugWorkflow?: () => Promise<{ success: boolean; error?: string }>;
      syncSchemas?: () => Promise<{ success: boolean; schemas?: any; error?: string }>;
      onDebugLog?: (cb: (log: { timestamp: number, level: 'INFO'|'ERROR'|'WARN', message: string }) => void) => (() => void) | void;
      onDebugStateChanged?: (cb: (state: 'idle' | 'running' | 'stopped') => void) => (() => void) | void;
    };
  }
}

/* ---------- 分类 & 颜色 ---------- */

const DEFAULT_LOCALE = "zh-CN";
const CATEGORY_ORDER_KEYS = [
  "common",
  "category_trigger",
  "category_interaction",
  "category_logic",
  "category_data",
  "category_file",
  "category_network",
  "category_device",
  "category_core_beta",
  "category_shizuku",
  "category_template",
  "category_ui",
  "category_other"
] as const;

const CATEGORY_KEY_BY_LABEL: Record<string, string> = {
  "触发器": "category_trigger",
  "Triggers": "category_trigger",
  "界面交互": "category_interaction",
  "屏幕交互": "category_interaction",
  "Screen Interaction": "category_interaction",
  "逻辑控制": "category_logic",
  "Logic": "category_logic",
  "数据": "category_data",
  "数据处理": "category_data",
  "Data Processing": "category_data",
  "文件": "category_file",
  "File": "category_file",
  "网络": "category_network",
  "Network": "category_network",
  "应用与系统": "category_device",
  "Device & System": "category_device",
  "模板": "category_template",
  "Templates": "category_template",
  "Shizuku": "category_shizuku",
  "UI 组件": "category_ui",
  "UI控制": "category_ui",
  "UI Control": "category_ui",
  "Core (Beta)": "category_core_beta",
  "其他": "category_other",
  "Other": "category_other"
};

const CATEGORY_COLOR_BY_KEY: Record<string, string> = {
  category_trigger: "#ef6c00",
  category_interaction: "#1976d2",
  category_logic: "#7b1fa2",
  category_data: "#388e3c",
  category_file: "#5d4037",
  category_network: "#00897b",
  category_device: "#6a1b9a",
  category_core_beta: "#455a64",
  category_shizuku: "#546e7a",
  category_template: "#f57c00",
  category_ui: "#1565c0",
  category_other: "#607d8b",
  common: "#607d8b"
};

export function guessCategoryKey(id: string): string {
  if (id.startsWith("vflow.trigger.")) return "category_trigger";
  if (id.startsWith("vflow.interaction.") || id.startsWith("vflow.device.")) return "category_interaction";
  if (id.startsWith("vflow.logic.")) return "category_logic";
  if (id.startsWith("vflow.data.")) return "category_data";
  if (id.startsWith("vflow.file.")) return "category_file";
  if (id.startsWith("vflow.network.")) return "category_network";
  if (id.startsWith("vflow.system.") || id.startsWith("vflow.variable.")) return "category_device";
  if (id.startsWith("vflow.core.")) return "category_core_beta";
  if (id.startsWith("vflow.shizuku.")) return "category_shizuku";
  if (id.startsWith("vflow.snippet.")) return "category_template";
  if (id.startsWith("vflow.ui.")) return "category_ui";
  return "category_other";
}

export function guessCategory(id: string): string {
  const key = guessCategoryKey(id);
  switch (key) {
    case "category_trigger": return "触发器";
    case "category_interaction": return "界面交互";
    case "category_logic": return "逻辑控制";
    case "category_data": return "数据";
    case "category_file": return "文件";
    case "category_network": return "网络";
    case "category_device": return "应用与系统";
    case "category_core_beta": return "Core (Beta)";
    case "category_shizuku": return "Shizuku";
    case "category_template": return "模板";
    case "category_ui": return "UI 组件";
    default: return "其他";
  }
}

function normalizeCategoryKey(categoryKey?: string | null, categoryLabel?: string, moduleId?: string): string {
  if (categoryKey && categoryKey.trim()) return categoryKey;
  if (categoryLabel && CATEGORY_KEY_BY_LABEL[categoryLabel]) return CATEGORY_KEY_BY_LABEL[categoryLabel];
  return guessCategoryKey(moduleId || "");
}

export function getColorByCategory(categoryKeyOrLabel: string, categoryLabel?: string): string {
  const categoryKey = normalizeCategoryKey(
    categoryKeyOrLabel.startsWith("category_") ? categoryKeyOrLabel : undefined,
    categoryKeyOrLabel.startsWith("category_") ? categoryLabel : categoryKeyOrLabel
  );
  return CATEGORY_COLOR_BY_KEY[categoryKey] || "#607d8b";
}

export function getCategoryOrderIndex(categoryKey?: string | null, categoryLabel?: string): number {
  const normalized = normalizeCategoryKey(categoryKey, categoryLabel);
  const idx = CATEGORY_ORDER_KEYS.indexOf(normalized as (typeof CATEGORY_ORDER_KEYS)[number]);
  return idx >= 0 ? idx : CATEGORY_ORDER_KEYS.length + 1;
}

/* ---------- Fallback 模块列表 ---------- */

export const FALLBACK_MODULE_OPTIONS: VflowModuleOption[] = [
  { id: "vflow.device.delay", name: "延迟", category: "界面交互", color: "#1976d2", usageCount: 0 },
  { id: "vflow.interaction.screen_operation", name: "屏幕操作", category: "界面交互", color: "#1976d2", usageCount: 0 },
  { id: "vflow.interaction.input_text", name: "输入文本", category: "界面交互", color: "#1976d2", usageCount: 0 },
  { id: "vflow.network.http_request", name: "HTTP 请求", category: "网络", color: "#00897b", usageCount: 0 },
  { id: "vflow.system.wifi", name: "Wi-Fi 设置", category: "应用与系统", color: "#6a1b9a", usageCount: 0 }
];

/* ---------- 分类排序 ---------- */

export const CATEGORY_ORDER = [...CATEGORY_ORDER_KEYS];

/* ---------- 模块名称/颜色查找 ---------- */

export function getModuleName(modules: VflowModuleOption[], id: string): string {
  return modules.find(m => m.id === id)?.name ?? id;
}

export function getModuleColor(modules: VflowModuleOption[], id: string): string {
  return modules.find(m => m.id === id)?.color ?? "#607d8b";
}

/* ---------- 模块加载 ---------- */

function toModuleOptions(list: { id: string; name: string; category?: string; description?: string; icon?: string; color?: string }[]): VflowModuleOption[] {
  const canonical = getCanonicalModuleIdSet();
  return list.map(m => {
    const normalizedId = normalizeModuleId(m.id);
    const category = m.category || guessCategory(normalizedId);
    const categoryKey = normalizeCategoryKey(undefined, category, normalizedId);
    const isCanonical = canonical.has(normalizedId);
    return {
      id: normalizedId,
      name: m.name,
      category,
      categoryKey,
      color: m.color || getColorByCategory(categoryKey, category),
      description: m.description,
      icon: m.icon,
      usageCount: 0,
      isDisabled: !isCanonical,
      disabledReason: !isCanonical ? "该模块不在 Android 主项目契约中" : undefined
    };
  });
}

function getSystemLocale(): string {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    return navigator.languages[0] || DEFAULT_LOCALE;
  }
  return navigator.language || DEFAULT_LOCALE;
}

function normalizeLocaleTag(tag: string): string {
  if (!tag) return "";
  return tag.toLowerCase();
}

function localeVariants(locale: string): string[] {
  if (!locale) return [];
  const normalized = locale.replace("_", "-");
  const languageOnly = normalized.split("-")[0];
  return [normalized, languageOnly].filter(Boolean);
}

function getLocaleFallbackChain(
  locale: string,
  availableLocales: string[],
  defaultLocale: string
): string[] {
  const normalizedMap = new Map(availableLocales.map((it) => [normalizeLocaleTag(it), it]));
  const chain: string[] = [];
  const pushLocale = (candidate: string) => {
    if (!candidate) return;
    const found = normalizedMap.get(normalizeLocaleTag(candidate));
    if (found && !chain.includes(found)) chain.push(found);
  };
  for (const variant of localeVariants(locale)) pushLocale(variant);
  for (const variant of localeVariants(defaultLocale || DEFAULT_LOCALE)) pushLocale(variant);
  pushLocale("zh-CN");
  pushLocale("zh");
  pushLocale("en");
  return chain;
}

type ContractDisplay = { name?: string; category?: string; description?: string };
type ContractWithDisplay = {
  moduleId: string;
  categoryKey?: string | null;
  display?: ContractDisplay;
  displayByLocale?: Record<string, ContractDisplay>;
};

function resolveContractDisplay(
  contract: ContractWithDisplay,
  locale: string,
  availableLocales: string[],
  defaultLocale: string
): { name: string; category: string; description: string } {
  const chain = getLocaleFallbackChain(locale, availableLocales, defaultLocale);
  for (const localeTag of chain) {
    const display = contract.displayByLocale?.[localeTag];
    if (display && typeof display.name === "string" && display.name.trim()) {
      return {
        name: display.name,
        category: display.category || guessCategory(contract.moduleId),
        description: display.description || ""
      };
    }
  }
  return {
    name: contract.display?.name || contract.moduleId,
    category: contract.display?.category || guessCategory(contract.moduleId),
    description: contract.display?.description || ""
  };
}

export function resolveModuleDisplay(
  moduleId: string,
  locale: string
): { name: string; category: string; description: string } {
  const bundle = contractBundle as {
    defaultLocale?: string;
    availableLocales?: string[];
    contracts?: ContractWithDisplay[];
  };
  const normalized = normalizeModuleId(moduleId);
  const contract = Array.isArray(bundle.contracts)
    ? bundle.contracts.find((c) => normalizeModuleId(c.moduleId) === normalized)
    : undefined;
  if (!contract) {
    return {
      name: normalized,
      category: guessCategory(normalized),
      description: ""
    };
  }
  return resolveContractDisplay(
    contract,
    locale,
    Array.isArray(bundle.availableLocales) ? bundle.availableLocales : [DEFAULT_LOCALE],
    bundle.defaultLocale || DEFAULT_LOCALE
  );
}

/**
 * 加载模块列表：优先内置 JSON → Electron Bridge → Fallback
 */
export async function loadModuleOptions(): Promise<VflowModuleOption[]> {
  const canonicalIds = getCanonicalModuleIdSet();
  const locale = getSystemLocale();
  const bundle = contractBundle as {
    defaultLocale?: string;
    availableLocales?: string[];
    contracts?: Array<{
      moduleId: string;
      hasLocalSchema: boolean;
      categoryKey?: string | null;
      display?: { name?: string; category?: string; description?: string };
      displayByLocale?: Record<string, { name?: string; category?: string; description?: string }>;
    }>;
  };

  if (Array.isArray(bundle.contracts) && bundle.contracts.length > 0) {
    const availableLocales = Array.isArray(bundle.availableLocales) ? bundle.availableLocales : [DEFAULT_LOCALE];
    const defaultLocale = bundle.defaultLocale || DEFAULT_LOCALE;
    return bundle.contracts.map((c) => {
      const id = normalizeModuleId(c.moduleId);
      const resolvedDisplay = resolveContractDisplay(c, locale, availableLocales, defaultLocale);
      const categoryKey = normalizeCategoryKey(c.categoryKey, resolvedDisplay.category, id);
      const hasSchema = Boolean(c.hasLocalSchema);
      return {
        id,
        name: resolvedDisplay.name || id,
        category: resolvedDisplay.category,
        categoryKey,
        color: getColorByCategory(categoryKey, resolvedDisplay.category),
        description: resolvedDisplay.description,
        usageCount: 0,
        isDisabled: !canonicalIds.has(id) || !hasSchema,
        disabledReason: !canonicalIds.has(id)
          ? "该模块不在 Android 主项目契约中"
          : (!hasSchema ? "该模块缺少本地参数协议(schema)，已禁用拖拽" : undefined)
      };
    });
  }

  // 1. 尝试内置中文模块（兜底）
  try {
    // @ts-ignore dynamic import of JSON
    const mod = await import("../data/modules_zh.json");
    const list = mod.default || mod;
    if (Array.isArray(list) && list.length > 0) {
      return toModuleOptions(list);
    }
  } catch {
    // 中文加载失败，尝试英文
    try {
      // @ts-ignore dynamic import of JSON
      const modEn = await import("../data/modules.json");
      const listEn = modEn.default || modEn;
      if (Array.isArray(listEn) && listEn.length > 0) {
        return toModuleOptions(listEn);
      }
    } catch {
      // ignore
    }
  }

  // 2. 尝试 Electron Bridge
  if (window.vflowDesktop?.getModules) {
    try {
      const modules = await window.vflowDesktop.getModules();
      if (Array.isArray(modules) && modules.length > 0) {
        return toModuleOptions(modules);
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback
  return [...FALLBACK_MODULE_OPTIONS].map((m) => ({
    ...m,
    id: normalizeModuleId(m.id)
  }));
}

/* ---------- 使用计数持久化 ---------- */

const USAGE_STORAGE_KEY = "vflowDesktop.moduleUsage";

export function loadUsageCounts(): Record<string, number> {
  try {
    const stored = window.localStorage.getItem(USAGE_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {};
}

export function saveUsageCounts(modules: VflowModuleOption[]): void {
  try {
    const data: Record<string, number> = {};
    modules.forEach(m => {
      if (m.usageCount && m.usageCount > 0) {
        data[m.id] = m.usageCount;
      }
    });
    window.localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function applyUsageCounts(modules: VflowModuleOption[], counts: Record<string, number>): VflowModuleOption[] {
  return modules.map(m => ({
    ...m,
    usageCount: counts[m.id] ?? m.usageCount ?? 0
  }));
}
