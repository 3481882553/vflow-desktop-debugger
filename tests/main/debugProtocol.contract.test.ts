import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("net", () => {
  let lastSocket: any = null;

  class FakeSocket {
    public destroyed = false;
    private handlers: Record<string, (data?: any) => void> = {};

    connect(_port: number, _host: string, cb: () => void) {
      lastSocket = this;
      cb();
    }

    on(event: string, handler: (data?: any) => void) {
      this.handlers[event] = handler;
    }

    write(_data: string) {
      // no-op for contract tests
    }

    destroy() {
      this.destroyed = true;
      this.handlers.close?.();
    }

    emit(event: string, data?: any) {
      this.handlers[event]?.(data);
    }
  }

  return {
    Socket: FakeSocket,
    __getLastSocket: () => lastSocket
  };
});

describe("DebugServer protocol contract", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("maps LOG and ERROR events to debug logs", async () => {
    const net = await import("net");
    const { DebugClient } = await import("../../src/main/debugClient");
    const send = vi.fn();
    const window = {
      isDestroyed: () => false,
      webContents: { send }
    } as any;
    const client = new DebugClient(window);
    await client.connect();
    const socket = (net as any).__getLastSocket();

    socket.emit("data", Buffer.from(JSON.stringify({ event: "LOG", message: "hello" }) + "\n", "utf-8"));
    socket.emit("data", Buffer.from(JSON.stringify({ event: "ERROR", message: "boom" }) + "\n", "utf-8"));

    expect(send).toHaveBeenCalledWith(
      "debug:log",
      expect.objectContaining({ level: "INFO", message: "hello" })
    );
    expect(send).toHaveBeenCalledWith(
      "debug:log",
      expect.objectContaining({ level: "ERROR", message: "boom" })
    );
  });

  it("treats unknown event as info log", async () => {
    const net = await import("net");
    const { DebugClient } = await import("../../src/main/debugClient");
    const send = vi.fn();
    const window = {
      isDestroyed: () => false,
      webContents: { send }
    } as any;
    const client = new DebugClient(window);
    await client.connect();
    const socket = (net as any).__getLastSocket();

    socket.emit(
      "data",
      Buffer.from(JSON.stringify({ event: "STEP_START", message: "step 1" }) + "\n", "utf-8")
    );

    expect(send).toHaveBeenCalledWith(
      "debug:log",
      expect.objectContaining({ level: "INFO", message: "[STEP_START] step 1" })
    );
  });

  it("handles DONE event and emits stopped state", async () => {
    const net = await import("net");
    const { DebugClient } = await import("../../src/main/debugClient");
    const send = vi.fn();
    const window = {
      isDestroyed: () => false,
      webContents: { send }
    } as any;
    const client = new DebugClient(window);
    await client.connect();
    const socket = (net as any).__getLastSocket();

    socket.emit("data", Buffer.from(JSON.stringify({ event: "DONE" }) + "\n", "utf-8"));

    expect(send).toHaveBeenCalledWith("debug:stateChanged", "stopped");
    expect(send).toHaveBeenCalledWith(
      "debug:log",
      expect.objectContaining({
        level: "INFO",
        message: expect.stringContaining("Workflow execution completed")
      })
    );
  });
});
