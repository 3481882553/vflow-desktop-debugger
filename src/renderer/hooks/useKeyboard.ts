import { useEffect, useRef, MutableRefObject } from "react";

interface UseKeyboardOptions {
  onUndo: () => void;
  onRedo: () => void;
  saveRef: MutableRefObject<() => void>;
  copyRef?: MutableRefObject<() => void>;
  pasteRef?: MutableRefObject<() => void>;
}

/**
 * 全局键盘快捷键 Hook
 * - Ctrl+Z → Undo
 * - Ctrl+Y / Ctrl+Shift+Z → Redo
 * - Ctrl+S → Save
 * - Ctrl+C → Copy
 * - Ctrl+V → Paste
 */
export function useKeyboard({ onUndo, onRedo, saveRef, copyRef, pasteRef }: UseKeyboardOptions) {
  // 通过 ref 保持回调最新，避免 effect 依赖变化
  const undoRef = useRef(onUndo);
  const redoRef = useRef(onRedo);
  undoRef.current = onUndo;
  redoRef.current = onRedo;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Monaco Editor 有自己的按键处理，不拦截
      if (document.activeElement?.closest(".monaco-editor")) return;
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undoRef.current();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redoRef.current();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveRef.current();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        const selection = window.getSelection();
        if (!selection || selection.toString().length === 0) {
          if (copyRef?.current) {
            e.preventDefault();
            copyRef.current();
          }
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        if (pasteRef?.current) {
          e.preventDefault();
          pasteRef.current();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveRef, copyRef, pasteRef]);
}
