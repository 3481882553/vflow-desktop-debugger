import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          padding: 32,
          fontFamily: "system-ui, sans-serif",
          color: "var(--color-text-primary, #212121)",
          backgroundColor: "var(--color-bg-primary, #fff)"
        }}>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>出错了</h1>
          <p style={{ color: "var(--color-text-secondary, #757575)", marginBottom: 16 }}>
            应用遇到了一个意外错误，请尝试重置。
          </p>
          <pre style={{
            maxWidth: 600,
            padding: 16,
            borderRadius: 8,
            backgroundColor: "var(--color-bg-secondary, #f5f5f5)",
            fontSize: 13,
            overflow: "auto",
            marginBottom: 24,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={this.handleReset}
            style={{
              padding: "10px 24px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "var(--color-primary, #1976d2)",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            重置应用
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
