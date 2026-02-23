import { useState, useEffect, useCallback } from "react";
import { PARAM_SCHEMAS as DEFAULT_SCHEMAS } from "../data/schemas";
import type { InputDefinition } from "../domain/vflowTypes";

const SCHEMAS_STORAGE_KEY = "vflowDesktop.dynamicSchemas";

function migrateSchema(list: any[]): InputDefinition[] {
  if (!Array.isArray(list)) return [];
  return list.map(f => ({
    ...f,
    // Prefer new keys, fallback to old keys
    name: f.name || f.label,
    staticType: f.staticType || f.type,
    options: f.options || f.enumValues,
    hint: f.hint || f.placeholder,
    isFolded: f.isFolded !== undefined ? f.isFolded : f.advanced,
    // Pass through other fields
  })) as InputDefinition[];
}

export function useSchemas() {
  const [schemas, setSchemas] = useState<Record<string, InputDefinition[]>>(DEFAULT_SCHEMAS);
  const [isSyncing, setIsSyncing] = useState(false);

  // 初始化时从本地缓存加载
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SCHEMAS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object" && parsed !== null) {
          const migrated: Record<string, InputDefinition[]> = {};
          Object.keys(parsed).forEach(k => {
            migrated[k] = migrateSchema(parsed[k]);
          });
          setSchemas((prev) => ({ ...prev, ...migrated }));
        }
      }
    } catch (e) {
      console.warn("Failed to load cached schemas", e);
    }
  }, []);

  // 同步方法
  const syncSchemas = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!window.vflowDesktop?.syncSchemas) {
      return { success: false, error: "当前环境不支持同步设备 Schema，请检查 Electron IPC 接口。" };
    }

    setIsSyncing(true);
    try {
      const res = await window.vflowDesktop.syncSchemas();
      if (res.success && res.schemas) {
        const migrated: Record<string, InputDefinition[]> = {};
        Object.keys(res.schemas).forEach(k => {
          migrated[k] = migrateSchema(res.schemas[k]);
        });
        
        setSchemas(migrated);
        window.localStorage.setItem(SCHEMAS_STORAGE_KEY, JSON.stringify(migrated));
        setIsSyncing(false);
        return { success: true };
      } else {
        setIsSyncing(false);
        return { success: false, error: res.error || "获取 Schema 失败：返回值为空或格式不正确" };
      }
    } catch (error: any) {
      setIsSyncing(false);
      return { success: false, error: error.message };
    }
  }, []);

  return {
    schemas,
    isSyncing,
    syncSchemas
  };
}
