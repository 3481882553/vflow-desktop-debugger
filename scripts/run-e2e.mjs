import { spawnSync, execSync } from "node:child_process";

function resolveMode(raw) {
  const val = (raw || "auto").toLowerCase();
  return val === "real" || val === "mock" || val === "auto" ? val : "auto";
}

function resolvePolicy(raw) {
  return (raw || "warn_skip").toLowerCase() === "strict_fail" ? "strict_fail" : "warn_skip";
}

function resolveRequireDeviceFor(raw) {
  return (raw || "none").toLowerCase() === "release" ? "release" : "none";
}

function checkDevice() {
  try {
    const stdout = execSync("adb devices", { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    const lines = stdout.trim().split("\n").slice(1);
    const devices = lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => line.includes("device") && !line.includes("offline"))
      .map((line) => line.split(/\s+/)[0]);
    return { ok: devices.length > 0, error: "" };
  } catch (e) {
    return { ok: false, error: e?.message || "failed to run adb devices" };
  }
}

function printWarningBlock(args) {
  const lines = [
    "HIGH WARNING: REAL DEVICE NOT AVAILABLE, DEVICE-DEPENDENT E2E STEPS WILL BE SKIPPED.",
    `mode=${args.mode} policy=${args.policy} require_device_for=${args.requireDeviceFor}`,
    `device_status=offline error=${args.error || "none"}`,
    "skipped_tests=full device flow",
    "next_steps=1) connect device by USB or network adb 2) authorize device 3) verify adb devices",
    "diagnostics=adb kill-server && adb start-server && adb devices",
    "debugserver_check=ensure device-side DebugServer is running on port 9999"
  ];
  console.warn(lines.join("\n"));
}

const e2eMode = resolveMode(process.argv[2]);
const devicePolicy = resolvePolicy(process.argv[3] || process.env.E2E_DEVICE_POLICY);
const requireDeviceFor = resolveRequireDeviceFor(process.argv[4] || process.env.E2E_REQUIRE_DEVICE_FOR);

const needDevice = e2eMode !== "mock";
const device = needDevice ? checkDevice() : { ok: false, error: "" };

const shouldFailWithoutDevice =
  !device.ok &&
  (
    (e2eMode === "real" && devicePolicy === "strict_fail") ||
    (requireDeviceFor === "release" && e2eMode !== "mock")
  );

if (needDevice && !device.ok) {
  printWarningBlock({
    mode: e2eMode,
    policy: devicePolicy,
    requireDeviceFor,
    error: device.error
  });
}

if (shouldFailWithoutDevice) {
  process.exit(2);
}

const isWin = process.platform === "win32";
const cmd = isWin ? "cmd.exe" : "npx";
const args = isWin
  ? ["/d", "/s", "/c", "npx", "playwright", "test"]
  : ["playwright", "test"];
const result = spawnSync(cmd, args, {
  stdio: "inherit",
  env: {
    ...process.env,
    E2E_MODE: e2eMode,
    E2E_DEVICE_POLICY: devicePolicy,
    E2E_REQUIRE_DEVICE_FOR: requireDeviceFor
  }
});

if (result.error) {
  console.error(`[run-e2e] failed to launch playwright test: ${result.error.message}`);
}

if (typeof result.status === "number") process.exit(result.status);
process.exit(1);
