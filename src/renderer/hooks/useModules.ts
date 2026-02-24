import { useState, useEffect, useCallback } from "react";
import type { VflowModuleOption } from "../domain/vflowTypes";
import {
  loadModuleOptions,
  loadUsageCounts,
  saveUsageCounts,
  applyUsageCounts
} from "../shared/moduleUtils";

/**
 * 模块加载 + 使用计数 Hook
 */
export function useModules() {
  const [moduleOptions, setModuleOptions] = useState<VflowModuleOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadModuleOptions().then(modules => {
      if (cancelled) return;
      const counts = loadUsageCounts();
      setModuleOptions(applyUsageCounts(modules, counts));
    });
    return () => { cancelled = true; };
  }, []);

  const handleModuleUsageUpdate = useCallback((moduleId: string) => {
    setModuleOptions(prev => {
      const next = prev.map(m =>
        (m.id === moduleId && !m.isDisabled) ? { ...m, usageCount: (m.usageCount ?? 0) + 1 } : m
      );
      saveUsageCounts(next);
      return next;
    });
  }, []);

  return { moduleOptions, handleModuleUsageUpdate } as const;
}
