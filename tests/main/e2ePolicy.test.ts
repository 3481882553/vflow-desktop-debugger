import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../e2e/utils/adb", () => ({
  checkDevice: vi.fn()
}));

describe("E2E runtime policy", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.E2E_MODE;
    delete process.env.E2E_DEVICE_POLICY;
    delete process.env.E2E_REQUIRE_DEVICE_FOR;
  });

  it("auto mode without device falls back to mock flow", async () => {
    const adb = await import("../e2e/utils/adb");
    (adb.checkDevice as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      devices: [],
      error: "no device"
    });
    const { resolveRuntime } = await import("../e2e/utils/mode");
    const runtime = await resolveRuntime();
    expect(runtime.shouldRunRealFlow).toBe(false);
    expect(runtime.shouldRunMockFlow).toBe(true);
    expect(runtime.shouldFailWithoutDevice).toBe(false);
  });

  it("real + strict_fail without device fails", async () => {
    process.env.E2E_MODE = "real";
    process.env.E2E_DEVICE_POLICY = "strict_fail";
    const adb = await import("../e2e/utils/adb");
    (adb.checkDevice as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      devices: [],
      error: "no device"
    });
    const { resolveRuntime } = await import("../e2e/utils/mode");
    const runtime = await resolveRuntime();
    expect(runtime.shouldFailWithoutDevice).toBe(true);
  });

  it("release requirement forces fail when no device", async () => {
    process.env.E2E_MODE = "auto";
    process.env.E2E_REQUIRE_DEVICE_FOR = "release";
    const adb = await import("../e2e/utils/adb");
    (adb.checkDevice as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      devices: [],
      error: "no device"
    });
    const { resolveRuntime } = await import("../e2e/utils/mode");
    const runtime = await resolveRuntime();
    expect(runtime.shouldFailWithoutDevice).toBe(true);
  });
});
