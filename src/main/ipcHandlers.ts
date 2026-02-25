export interface DebugClientLike {
  connect: () => Promise<boolean>;
  sendWorkflow: (workflowJson: string) => boolean;
  getSchemas: () => Promise<any>;
  disconnect: () => void;
}

export interface AdbClientLike {
  checkDeviceConnected: () => Promise<boolean>;
  forwardPort: (pcPort: number, devicePort: number) => Promise<boolean>;
}

export function createIpcHandlers(deps: {
  adbClient: AdbClientLike;
  getDebugClient: () => DebugClientLike | null;
}) {
  const handleGetModules = async () => [];

  const handleRun = async (jsonStr: string) => {
    const debugClient = deps.getDebugClient();
    if (!debugClient) return { success: false, error: "内部错误：未初始化调试客户端" };

    const hasDevice = await deps.adbClient.checkDeviceConnected();
    if (!hasDevice) {
      return { success: false, error: "未检测到 Android 设备，请确保已打开 USB 调试并同意授权。" };
    }

    const forwardOk = await deps.adbClient.forwardPort(9999, 9999);
    if (!forwardOk) {
      return { success: false, error: "ADB 端口映射失败，请检查 ADB 工具路径。" };
    }

    const connected = await debugClient.connect();
    if (!connected) {
      return { success: false, error: "无法连接到手机端 DebugServer。请确保 vFlow App 运行在前台并开启调试服务。" };
    }

    const sent = debugClient.sendWorkflow(jsonStr);
    return { success: sent, error: sent ? undefined : "发送工作流指令失败，Socket 不可用。" };
  };

  const handleSyncSchemas = async () => {
    const debugClient = deps.getDebugClient();
    if (!debugClient) return { success: false, error: "内部错误：未初始化调试客户端" };

    const hasDevice = await deps.adbClient.checkDeviceConnected();
    if (!hasDevice) {
      return { success: false, error: "未检测到 Android 设备，请验证 USB 调试" };
    }

    const forwardOk = await deps.adbClient.forwardPort(9999, 9999);
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
  };

  const handleStop = async () => {
    const debugClient = deps.getDebugClient();
    if (debugClient) {
      debugClient.disconnect();
    }
    return { success: true };
  };

  return {
    handleGetModules,
    handleRun,
    handleSyncSchemas,
    handleStop
  };
}
