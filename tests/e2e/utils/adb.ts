import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export interface DeviceCheckResult {
  ok: boolean;
  devices: string[];
  error?: string;
}

export async function checkDevice(): Promise<DeviceCheckResult> {
  try {
    const { stdout } = await execAsync("adb devices");
    const lines = stdout.trim().split("\n").slice(1);
    const devices = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => line.includes("device") && !line.includes("offline"))
      .map(line => line.split(/\s+/)[0]);
    return { ok: devices.length > 0, devices };
  } catch (e: any) {
    return { ok: false, devices: [], error: e?.message || "Failed to run adb devices" };
  }
}
