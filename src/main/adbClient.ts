import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class AdbClient {
  /**
   * 检查是否连接了至少一个 Android 设备
   */
  static async checkDeviceConnected(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('adb devices');
      // adb devices output looks like:
      // List of devices attached
      // emulator-5554   device
      const lines = stdout.trim().split('\n').slice(1); // skip the first header line
      const devices = lines.filter(line => line.includes('device') && !line.includes('offline'));
      return devices.length > 0;
    } catch (e) {
      console.error('Failed to run adb devices:', e);
      return false;
    }
  }

  /**
   * 建立端口转发
   */
  static async forwardPort(pcPort: number, devicePort: number): Promise<boolean> {
    try {
      await execAsync(`adb forward tcp:${pcPort} tcp:${devicePort}`);
      return true;
    } catch (e) {
      console.error(`Failed to forward port ${pcPort} to ${devicePort}:`, e);
      return false;
    }
  }

  /**
   * 取消指定的端口转发
   */
  static async removeForward(pcPort: number): Promise<boolean> {
    try {
      await execAsync(`adb forward --remove tcp:${pcPort}`);
      return true;
    } catch (e) {
      console.error(`Failed to remove forward for port ${pcPort}:`, e);
      return false;
    }
  }
}
