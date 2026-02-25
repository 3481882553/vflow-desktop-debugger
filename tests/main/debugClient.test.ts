import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("net", () => {
  let lastSocket: any = null;

  class FakeSocket {
    public destroyed = false;
    private handlers: Record<string, (data?: any) => void> = {};
    public lastWrite: string | null = null;

    connect(_port: number, _host: string, cb: () => void) {
      lastSocket = this;
      cb();
    }

    on(event: string, handler: (data?: any) => void) {
      this.handlers[event] = handler;
    }

    write(data: string) {
      this.lastWrite = data;
    }

    destroy() {
      this.destroyed = true;
      if (this.handlers.close) {
        this.handlers.close();
      }
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

describe("DebugClient", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useRealTimers();
  });

  it("connect resolves true and sends running logs", async () => {
    const { DebugClient } = await import("../../src/main/debugClient");
    const window = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() }
    } as any;

    const client = new DebugClient(window);
    const ok = await client.connect();
    expect(ok).toBe(true);
  });

  it("sendWorkflow returns false when not connected", async () => {
    const { DebugClient } = await import("../../src/main/debugClient");
    const window = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() }
    } as any;
    const client = new DebugClient(window);
    const ok = client.sendWorkflow("{}");
    expect(ok).toBe(false);
  });

  it("getSchemas resolves with incoming schemas", async () => {
    const net = await import("net");
    const { DebugClient } = await import("../../src/main/debugClient");
    const window = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() }
    } as any;

    const client = new DebugClient(window);
    await client.connect();

    const promise = client.getSchemas();
    const socket = (net as any).__getLastSocket();
    const payload = JSON.stringify({ event: "SCHEMAS_RESULT", schemas: { a: [] } }) + "\n";
    socket.emit("data", Buffer.from(payload, "utf-8"));

    const schemas = await promise;
    expect(schemas).toEqual({ a: [] });
  });

  it("getSchemas supports split packets", async () => {
    const net = await import("net");
    const { DebugClient } = await import("../../src/main/debugClient");
    const window = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() }
    } as any;

    const client = new DebugClient(window);
    await client.connect();

    let settled = false;
    const promise = client.getSchemas().then((v) => {
      settled = true;
      return v;
    });

    const socket = (net as any).__getLastSocket();
    const chunk1 = JSON.stringify({ event: "SCHEMAS_RESULT", schemas: { split: true } });
    socket.emit("data", Buffer.from(chunk1, "utf-8"));
    await Promise.resolve();
    expect(settled).toBe(false);

    socket.emit("data", Buffer.from("\n", "utf-8"));
    const schemas = await promise;
    expect(schemas).toEqual({ split: true });
  });

  it("continues after malformed packet and processes valid packet", async () => {
    const net = await import("net");
    const { DebugClient } = await import("../../src/main/debugClient");
    const sendSpy = vi.fn();
    const window = {
      isDestroyed: () => false,
      webContents: { send: sendSpy }
    } as any;

    const client = new DebugClient(window);
    await client.connect();

    const promise = client.getSchemas();
    const socket = (net as any).__getLastSocket();
    const payload = "not-json\n" + JSON.stringify({ event: "SCHEMAS_RESULT", schemas: { ok: 1 } }) + "\n";
    socket.emit("data", Buffer.from(payload, "utf-8"));

    const schemas = await promise;
    expect(schemas).toEqual({ ok: 1 });
    expect(sendSpy).toHaveBeenCalledWith(
      "debug:log",
      expect.objectContaining({
        level: "ERROR",
        message: expect.stringContaining("Data parse error:")
      })
    );
  });

  it("getSchemas rejects on timeout", async () => {
    vi.useFakeTimers();
    const { DebugClient } = await import("../../src/main/debugClient");
    const window = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() }
    } as any;

    const client = new DebugClient(window);
    await client.connect();

    const promise = client.getSchemas();
    const rejection = expect(promise).rejects.toThrow("Timeout");
    await vi.advanceTimersByTimeAsync(5000);
    await rejection;
    vi.useRealTimers();
  });

  it("getSchemas rejects when socket closes before response", async () => {
    const net = await import("net");
    const { DebugClient } = await import("../../src/main/debugClient");
    const window = {
      isDestroyed: () => false,
      webContents: { send: vi.fn() }
    } as any;

    const client = new DebugClient(window);
    await client.connect();

    const promise = client.getSchemas();
    const socket = (net as any).__getLastSocket();
    socket.emit("close");
    await expect(promise).rejects.toThrow("Connection closed");
  });
});
