import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "node:path";
import { AdbClient } from "./adbClient";
import { DebugClient } from "./debugClient";

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
  ipcMain.handle("vflow-desktop:get-modules", () => []);

  ipcMain.handle("debug:run", async (event, jsonStr) => {
    if (!debugClient) return { success: false, error: "内部错误：未初始化调试客户端" };
    
    // 检查是否有设备
    const hasDevice = await AdbClient.checkDeviceConnected();
    if (!hasDevice) {
      return { success: false, error: "未检测到 Android 设备，请确保已打开 USB 调试并同意授权。" };
    }

    // 设置 ADB 转发
    const forwardOk = await AdbClient.forwardPort(9999, 9999);
    if (!forwardOk) {
      return { success: false, error: "ADB 端口映射失败，请检查 ADB 工具路径。" };
    }

    // 连接 DebugServer
    const connected = await debugClient.connect();
    if (!connected) {
      return { success: false, error: "无法连接到手机端 DebugServer。请确保 vFlow App 运行在前台并开启调试服务。" };
    }

    // 发送 JSON 数据跑流
    const sent = debugClient.sendWorkflow(jsonStr);
    return { success: sent, error: sent ? undefined : "发送工作流指令失败，Socket 不可用。" };
  });

  ipcMain.handle("debug:sync-schemas", async () => {
    if (!debugClient) return { success: false, error: "内部错误：未初始化调试客户端" };
    
    const hasDevice = await AdbClient.checkDeviceConnected();
    if (!hasDevice) {
      return { success: false, error: "未检测到 Android 设备，请验证 USB 调试" };
    }
    
    const forwardOk = await AdbClient.forwardPort(9999, 9999);
    if (!forwardOk) {
      return { success: false, error: "ADB 端口映射失败" };
    }

    const connected = await debugClient.connect();
    if (!connected) {
      return { success: false, error: "无法连接到手机端 DebugServer" };
    }

    try {
      const schemas = await debugClient.getSchemas();
      return { success: true, schemas };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle("debug:stop", async () => {
    if (debugClient) {
      debugClient.disconnect();
    }
    return { success: true };
  });

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
