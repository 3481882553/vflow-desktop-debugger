import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "node:path";
import { AdbClient } from "./adbClient";
import { DebugClient } from "./debugClient";
import { createIpcHandlers } from "./ipcHandlers";

let mainWindow: BrowserWindow | null = null;
let debugClient: DebugClient | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // 生产环境加载 dist/renderer/index.html
    // main.js 在 dist/ 下，所以 renderer 文件夹与其同级
    mainWindow.loadFile(path.join(__dirname, "renderer/index.html"));
  }

  debugClient = new DebugClient(mainWindow);
}

app.whenReady().then(() => {
  const handlers = createIpcHandlers({
    adbClient: AdbClient,
    getDebugClient: () => debugClient
  });

  ipcMain.handle("vflow-desktop:get-modules", handlers.handleGetModules);
  ipcMain.handle("debug:run", (_, jsonStr: string) => handlers.handleRun(jsonStr));
  ipcMain.handle("debug:sync-schemas", handlers.handleSyncSchemas);
  ipcMain.handle("debug:stop", handlers.handleStop);

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
