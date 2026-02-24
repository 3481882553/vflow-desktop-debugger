import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("vflowDesktop", {
  ping: () => "ok",
  getModules: async () => {
    try {
      const modules = await ipcRenderer.invoke("vflow-desktop:get-modules");
      return Array.isArray(modules) ? modules : [];
    } catch {
      return [];
    }
  },
  
  // Debugger APIs
  runDebugWorkflow: async (jsonStr: string) => {
    try {
      return await ipcRenderer.invoke("debug:run", jsonStr);
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  stopDebugWorkflow: async () => {
    try {
      return await ipcRenderer.invoke("debug:stop");
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  syncSchemas: async () => {
    try {
      return await ipcRenderer.invoke("debug:sync-schemas");
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  
  // Events
  onDebugLog: (callback: (log: { timestamp: number, level: 'INFO'|'ERROR'|'WARN', message: string }) => void) => {
    const handler = (_event: unknown, log: { timestamp: number; level: "INFO" | "ERROR" | "WARN"; message: string }) => callback(log);
    ipcRenderer.on("debug:log", handler);
    return () => ipcRenderer.off("debug:log", handler);
  },
  onDebugStateChanged: (callback: (state: 'idle' | 'running' | 'stopped') => void) => {
    const handler = (_event: unknown, state: "idle" | "running" | "stopped") => callback(state);
    ipcRenderer.on("debug:stateChanged", handler);
    return () => ipcRenderer.off("debug:stateChanged", handler);
  }
});
