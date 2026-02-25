import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("child_process", () => {
  const exec = vi.fn();
  return {
    exec,
    default: { exec }
  };
});

describe("AdbClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("checkDeviceConnected returns true when device exists", async () => {
    const { exec } = await import("child_process");
    (exec as unknown as ReturnType<typeof vi.fn>).mockImplementation((_cmd, cb) => {
      cb(null, "List of devices attached\nemulator-5554\tdevice\n", "");
    });

    const { AdbClient } = await import("../../src/main/adbClient");
    const ok = await AdbClient.checkDeviceConnected();
    expect(ok).toBe(true);
  });

  it("checkDeviceConnected returns false when no device", async () => {
    const { exec } = await import("child_process");
    (exec as unknown as ReturnType<typeof vi.fn>).mockImplementation((_cmd, cb) => {
      cb(null, "List of devices attached\n\n", "");
    });

    const { AdbClient } = await import("../../src/main/adbClient");
    const ok = await AdbClient.checkDeviceConnected();
    expect(ok).toBe(false);
  });

  it("forwardPort returns false on error", async () => {
    const { exec } = await import("child_process");
    (exec as unknown as ReturnType<typeof vi.fn>).mockImplementation((_cmd, cb) => {
      cb(new Error("fail"), "", "");
    });

    const { AdbClient } = await import("../../src/main/adbClient");
    const ok = await AdbClient.forwardPort(1, 2);
    expect(ok).toBe(false);
  });

  it("checkDeviceConnected returns false when adb command throws", async () => {
    const { exec } = await import("child_process");
    (exec as unknown as ReturnType<typeof vi.fn>).mockImplementation((_cmd, cb) => {
      cb(new Error("adb not found"), "", "");
    });

    const { AdbClient } = await import("../../src/main/adbClient");
    const ok = await AdbClient.checkDeviceConnected();
    expect(ok).toBe(false);
  });

  it("removeForward returns true on success and false on error", async () => {
    const { exec } = await import("child_process");
    (exec as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce((_cmd, cb) => {
      cb(null, "", "");
    });

    const { AdbClient } = await import("../../src/main/adbClient");
    const ok = await AdbClient.removeForward(9999);
    expect(ok).toBe(true);

    (exec as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce((_cmd, cb) => {
      cb(new Error("remove failed"), "", "");
    });
    const failed = await AdbClient.removeForward(9999);
    expect(failed).toBe(false);
  });
});
