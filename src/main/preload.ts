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
    ipcRenderer.on("debug:log", (_event, log) => callback(log));
  },
  onDebugStateChanged: (callback: (state: 'idle' | 'running' | 'stopped') => void) => {
    ipcRenderer.on("debug:stateChanged", (_event, state) => callback(state));
  }
});
