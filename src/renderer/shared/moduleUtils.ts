import type { VflowModuleOption } from "../domain/vflowTypes";

declare global {
  interface Window {
    vflowDesktop?: {
      ping?: () => string;
      getModules?: () => Promise<{ id: string; name: string }[]>;
      runDebugWorkflow?: (jsonStr: string) => Promise<{ success: boolean; error?: string }>;
      stopDebugWorkflow?: () => Promise<{ success: boolean; error?: string }>;
      syncSchemas?: () => Promise<{ success: boolean; schemas?: any; error?: string }>;
      onDebugLog?: (cb: (log: { timestamp: number, level: 'INFO'|'ERROR'|'WARN', message: string }) => void) => void;
      onDebugStateChanged?: (cb: (state: 'idle' | 'running' | 'stopped') => void) => void;
    };
  }
}

/* ---------- 分类 & 颜色 ---------- */

export function guessCategory(id: string): string {
  if (id.startsWith("vflow.trigger.")) return "触发器";
  if (id.startsWith("vflow.interaction.") || id.startsWith("vflow.device.")) return "界面交互";
  if (id.startsWith("vflow.logic.")) return "逻辑控制";
  if (id.startsWith("vflow.data.")) return "数据";
  if (id.startsWith("vflow.file.")) return "文件";
  if (id.startsWith("vflow.network.")) return "网络";
  if (id.startsWith("vflow.system.") || id.startsWith("vflow.variable.")) return "应用与系统";
  if (id.startsWith("vflow.core.")) return "Core (Beta)";
  return "其他";
}

export function getColorByCategory(category: string): string {
  switch (category) {
    case "触发器": return "#ef6c00";
    case "界面交互": return "#1976d2";
    case "逻辑控制": return "#7b1fa2";
    case "数据": return "#388e3c";
    case "文件": return "#5d4037";
    case "网络": return "#00897b";
    case "应用与系统": return "#6a1b9a";
    case "Core (Beta)": return "#455a64";
    default: return "#607d8b";
  }
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

export const CATEGORY_ORDER = ["常用", "触发器", "界面交互", "逻辑控制", "数据", "文件", "网络", "应用与系统", "Core (Beta)", "Shizuku", "模板", "UI 组件", "其他"];

/* ---------- 模块名称/颜色查找 ---------- */

export function getModuleName(modules: VflowModuleOption[], id: string): string {
  return modules.find(m => m.id === id)?.name ?? id;
}

export function getModuleColor(modules: VflowModuleOption[], id: string): string {
  return modules.find(m => m.id === id)?.color ?? "#607d8b";
}

/* ---------- 模块加载 ---------- */

function toModuleOptions(list: { id: string; name: string; category?: string; description?: string; icon?: string; color?: string }[]): VflowModuleOption[] {
  return list.map(m => {
    const category = m.category || guessCategory(m.id);
    return {
      id: m.id,
      name: m.name,
      category,
      color: m.color || getColorByCategory(category),
      description: m.description,
      icon: m.icon,
      usageCount: 0
    };
  });
}

/**
 * 加载模块列表：优先内置 JSON → Electron Bridge → Fallback
 */
export async function loadModuleOptions(): Promise<VflowModuleOption[]> {
  // 1. 尝试内置中文模块
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
  return [...FALLBACK_MODULE_OPTIONS];
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
