import React, { useEffect, useRef } from "react";
import { ListX, AlertTriangle, Info, Terminal } from "lucide-react";
import { Button } from "./components/Button";
import "./styles/ConsolePanel.css";

export interface LogEntry {
  timestamp: number;
  level: "INFO" | "ERROR" | "WARN";
  message: string;
}

interface ConsolePanelProps {
  logs: LogEntry[];
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({ logs, onClear, isOpen, onToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  if (!isOpen) {
    return (
      <div className="console-panel-collapsed" data-testid="console-toggle" onClick={onToggle}>
        <Terminal size={14} />
        <span>调试控制台 ({logs.length})</span>
      </div>
    );
  }

  return (
    <div className="console-panel" data-testid="console-panel">
      <div className="console-header">
        <div className="console-title" data-testid="console-toggle" onClick={onToggle}>
          <Terminal size={14} />
          <span>调试控制台</span>
        </div>
        <div className="console-actions">
          <Button variant="ghost" size="sm" data-testid="console-clear" onClick={onClear} icon={<ListX size={14} />}>
            清空
          </Button>
        </div>
      </div>
      <div className="console-body" ref={scrollRef}>
        {logs.length === 0 ? (
          <div className="console-empty">暂无日志输出。点击上方运行按钮将工作流发送至设备。</div>
        ) : (
          logs.map((log, index) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            let Icon = log.level === "ERROR" ? AlertTriangle : (log.level === "WARN" ? AlertTriangle : Info);
            return (
              <div key={index} className={`console-log-row level-${log.level.toLowerCase()}`} data-testid="console-log">
                <span className="log-time">[{timeStr}]</span>
                <span className="log-icon"><Icon size={12} /></span>
                <span className="log-msg">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
