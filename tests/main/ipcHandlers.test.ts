import { describe, it, expect, vi } from "vitest";
import { createIpcHandlers } from "../../src/main/ipcHandlers";

describe("ipcHandlers", () => {
  it("handleRun returns error when no debug client", async () => {
    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(true),
        forwardPort: vi.fn().mockResolvedValue(true)
      },
      getDebugClient: () => null
    });

    const res = await handlers.handleRun("{}");
    expect(res.success).toBe(false);
  });

  it("handleRun succeeds when device and connection are ok", async () => {
    const debugClient = {
      connect: vi.fn().mockResolvedValue(true),
      sendWorkflow: vi.fn().mockReturnValue(true),
      getSchemas: vi.fn(),
      disconnect: vi.fn()
    };

    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(true),
        forwardPort: vi.fn().mockResolvedValue(true)
      },
      getDebugClient: () => debugClient
    });

    const res = await handlers.handleRun("{}");
    expect(res.success).toBe(true);
    expect(debugClient.connect).toHaveBeenCalled();
    expect(debugClient.sendWorkflow).toHaveBeenCalled();
  });

  it("handleRun returns device error when no device", async () => {
    const debugClient = {
      connect: vi.fn().mockResolvedValue(true),
      sendWorkflow: vi.fn().mockReturnValue(true),
      getSchemas: vi.fn(),
      disconnect: vi.fn()
    };

    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(false),
        forwardPort: vi.fn().mockResolvedValue(true)
      },
      getDebugClient: () => debugClient
    });

    const res = await handlers.handleRun("{}");
    expect(res.success).toBe(false);
    expect(res.error).toContain("未检测到 Android 设备");
  });

  it("handleRun returns forward error when adb forward fails", async () => {
    const debugClient = {
      connect: vi.fn().mockResolvedValue(true),
      sendWorkflow: vi.fn().mockReturnValue(true),
      getSchemas: vi.fn(),
      disconnect: vi.fn()
    };

    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(true),
        forwardPort: vi.fn().mockResolvedValue(false)
      },
      getDebugClient: () => debugClient
    });

    const res = await handlers.handleRun("{}");
    expect(res.success).toBe(false);
    expect(res.error).toContain("端口映射失败");
  });

  it("handleRun returns connect error when debug server is not reachable", async () => {
    const debugClient = {
      connect: vi.fn().mockResolvedValue(false),
      sendWorkflow: vi.fn().mockReturnValue(true),
      getSchemas: vi.fn(),
      disconnect: vi.fn()
    };

    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(true),
        forwardPort: vi.fn().mockResolvedValue(true)
      },
      getDebugClient: () => debugClient
    });

    const res = await handlers.handleRun("{}");
    expect(res.success).toBe(false);
    expect(res.error).toContain("无法连接到手机端 DebugServer");
  });

  it("handleRun returns send error when socket send fails", async () => {
    const debugClient = {
      connect: vi.fn().mockResolvedValue(true),
      sendWorkflow: vi.fn().mockReturnValue(false),
      getSchemas: vi.fn(),
      disconnect: vi.fn()
    };

    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(true),
        forwardPort: vi.fn().mockResolvedValue(true)
      },
      getDebugClient: () => debugClient
    });

    const res = await handlers.handleRun("{}");
    expect(res.success).toBe(false);
    expect(res.error).toContain("发送工作流指令失败");
  });

  it("handleSyncSchemas returns schemas on success", async () => {
    const debugClient = {
      connect: vi.fn().mockResolvedValue(true),
      sendWorkflow: vi.fn(),
      getSchemas: vi.fn().mockResolvedValue({ a: [] }),
      disconnect: vi.fn()
    };

    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(true),
        forwardPort: vi.fn().mockResolvedValue(true)
      },
      getDebugClient: () => debugClient
    });

    const res = await handlers.handleSyncSchemas();
    expect(res.success).toBe(true);
    expect(res.schemas).toEqual({ a: [] });
  });

  it("handleSyncSchemas returns schema error when getSchemas fails", async () => {
    const debugClient = {
      connect: vi.fn().mockResolvedValue(true),
      sendWorkflow: vi.fn(),
      getSchemas: vi.fn().mockRejectedValue(new Error("Timeout waiting for schemas from device.")),
      disconnect: vi.fn()
    };

    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(true),
        forwardPort: vi.fn().mockResolvedValue(true)
      },
      getDebugClient: () => debugClient
    });

    const res = await handlers.handleSyncSchemas();
    expect(res.success).toBe(false);
    expect(res.error).toContain("Timeout");
  });

  it("handleStop disconnects when client exists", async () => {
    const debugClient = {
      connect: vi.fn(),
      sendWorkflow: vi.fn(),
      getSchemas: vi.fn(),
      disconnect: vi.fn()
    };

    const handlers = createIpcHandlers({
      adbClient: {
        checkDeviceConnected: vi.fn().mockResolvedValue(true),
        forwardPort: vi.fn().mockResolvedValue(true)
      },
      getDebugClient: () => debugClient
    });

    const res = await handlers.handleStop();
    expect(res.success).toBe(true);
    expect(debugClient.disconnect).toHaveBeenCalled();
  });
});
