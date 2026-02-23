import { useState, useCallback, useEffect } from "react";

/**
 * 暗色模式 Hook
 * - 初始化时检测系统偏好并设置 body.dark 类
 * - 提供 toggleDark 切换函数
 */
export function useTheme() {
  const [darkMode, setDarkMode] = useState(() => {
    // 优先读取已有类名，否则读取系统偏好
    if (document.body.classList.contains("dark")) return true;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) document.body.classList.add("dark");
    return prefersDark;
  });

  // 监听系统偏好变化
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
      document.body.classList.toggle("dark", e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleDark = useCallback(() => {
    setDarkMode(prev => {
      const next = !prev;
      document.body.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return { darkMode, toggleDark } as const;
}
