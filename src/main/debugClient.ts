import * as net from 'net';
import { BrowserWindow } from 'electron';

export class DebugClient {
  private socket: net.Socket | null = null;
  private isConnected = false;
  private readonly port = 9999;
  private window: BrowserWindow;
  private receiveBuffer = "";
  private requestSeq = 0;
  private pendingSchemasResolve: ((schemas: any) => void) | null = null;
  private pendingSchemasReject: ((reason: any) => void) | null = null;
  private pendingSchemasRequestId: string | null = null;

  constructor(window: BrowserWindow) {
    this.window = window;
  }

  public async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isConnected && this.socket) {
        resolve(true);
        return;
      }

      this.socket = new net.Socket();

      this.socket.connect(this.port, '127.0.0.1', () => {
        console.log(`[DebugClient] Connected to local port ${this.port}`);
        this.isConnected = true;
        resolve(true);
      });

      this.socket.on('data', (data) => {
        try {
          this.receiveBuffer += data.toString('utf-8');
          const lines = this.receiveBuffer.split('\n');
          this.receiveBuffer = lines.pop() ?? "";
          for (const line of lines.filter((l) => l.trim().length > 0)) {
            const parsed = JSON.parse(line);
            this.handleIncoming(parsed);
          }
        } catch (e) {
          console.error('[DebugClient] Parse error:', e);
          this.sendLog('ERROR', `Data parse error: ${data.toString('utf-8')}`);
        }
      });

      this.socket.on('close', () => {
        console.log('[DebugClient] Connection closed');
        this.isConnected = false;
        this.socket = null;
        this.receiveBuffer = "";
        this.pendingSchemasRequestId = null;
        this.window.webContents.send('debug:stateChanged', 'stopped');
        this.sendLog('INFO', 'Disconnected from device.');
      });

      this.socket.on('error', (err) => {
        console.error('[DebugClient] Socket error:', err.message);
        this.isConnected = false;
        this.sendLog('ERROR', `Socket Error: ${err.message}`);
        resolve(false);
      });
    });
  }

  public disconnect() {
    if (this.socket && !this.socket.destroyed) {
      this.socket.destroy();
    }
    this.isConnected = false;
    this.socket = null;
    this.receiveBuffer = "";
    this.pendingSchemasRequestId = null;
  }

  public sendWorkflow(workflowJson: string) {
    if (!this.isConnected || !this.socket) {
      this.sendLog('ERROR', 'Cannot send workflow: Not connected to device');
      return false;
    }
    try {
      // Build a JSON RPC payload
      const payload = JSON.stringify({
        action: 'run_workflow',
        workflow: JSON.parse(workflowJson)
      });
      this.socket.write(payload + '\n');
      this.sendLog('INFO', 'Workflow sent to device successfully.');
      this.window.webContents.send('debug:stateChanged', 'running');
      return true;
    } catch (e: any) {
      this.sendLog('ERROR', `Failed to send workflow: ${e.message}`);
      return false;
    }
  }

  public async getSchemas(): Promise<any> {
    if (!this.isConnected || !this.socket) {
      throw new Error('Not connected to device. Please ensure the vFlow app is running and debugging is enabled.');
    }
    
    return new Promise((resolve, reject) => {
      const requestId = `schemas_${Date.now()}_${++this.requestSeq}`;
      this.pendingSchemasResolve = resolve;
      this.pendingSchemasReject = reject;
      this.pendingSchemasRequestId = requestId;
      
      try {
        const payload = JSON.stringify({ action: 'get_schemas', requestId });
        this.socket!.write(payload + '\n');
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.pendingSchemasReject && this.pendingSchemasRequestId === requestId) {
            this.pendingSchemasReject(new Error('Timeout waiting for schemas from device.'));
            this.pendingSchemasReject = null;
            this.pendingSchemasResolve = null;
            this.pendingSchemasRequestId = null;
          }
        }, 5000);
      } catch (e: any) {
        reject(e);
      }
    });
  }

  private handleIncoming(data: any) {
    // Expected incoming: { event: "LOG" | "STEP_START" | "STEP_END", message: string, stepId?: string }
    if (data.event) {
      switch(data.event) {
        case 'LOG':
          this.sendLog('INFO', data.message || JSON.stringify(data));
          break;
        case 'ERROR':
          this.sendLog('ERROR', data.message || JSON.stringify(data));
          break;
        case 'DONE':
          this.sendLog('INFO', 'Workflow execution completed on device.');
          this.window.webContents.send('debug:stateChanged', 'stopped');
          this.disconnect();
          break;
        case 'SCHEMAS_RESULT':
          if (this.pendingSchemasResolve) {
            if (this.pendingSchemasRequestId && data.requestId && data.requestId !== this.pendingSchemasRequestId) {
              break;
            }
            this.pendingSchemasResolve(data.schemas);
            this.pendingSchemasResolve = null;
            this.pendingSchemasReject = null;
            this.pendingSchemasRequestId = null;
          }
          break;
        default:
          this.sendLog('INFO', `[${data.event}] ${data.message || JSON.stringify(data)}`);
          break;
      }
    }
  }

  private sendLog(level: 'INFO' | 'ERROR' | 'WARN', message: string) {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('debug:log', { timestamp: Date.now(), level, message });
    }
  }
}
