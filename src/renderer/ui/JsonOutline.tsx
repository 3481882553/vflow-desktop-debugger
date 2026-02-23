import React, { useMemo, useCallback } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import type { VflowModuleOption } from "../domain/vflowTypes";
import "./styles/JsonOutline.css";

/**
 * 目录项
 */
interface OutlineItem {
  /** 显示标签 */
  label: string;
  /** 所在行号 (1-indexed) */
  line: number;
  /** 结束行号 (1-indexed, 用于选中整块) */
  endLine: number;
  /** 缩进层级 */
  depth: number;
  /** 图标类型 */
  kind: "root" | "field" | "step" | "array";
}

interface JsonOutlineProps {
  /** 原始 JSON 文本 */
  rawJson: string;
  /** Monaco Editor 实例 */
  editorRef: MonacoEditor.IStandaloneCodeEditor | null;
  /** 当前选中行（可选，用于高亮当前目录项） */
  activeLine?: number;
  /** 模块选项列表，用于将 moduleId 映射为中文名 */
  moduleOptions?: VflowModuleOption[];
}

/**
 * 解析 JSON 文本生成目录结构
 */
function buildOutline(
  text: string,
  moduleNameMap: Map<string, string>
): OutlineItem[] {
  const lines = text.split("\n");
  const items: OutlineItem[] = [];

  const topKeyRe = /^  "(\w+)":\s*(.*)/;
  const stepStartRe = /^    \{/;
  const moduleIdRe = /^\s+"moduleId":\s*"([^"]+)"/;

  let inStepsArray = false;
  let stepStartLine = -1;
  let stepModuleId = "";
  let stepIndex = 0;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // 顶层 key
    const topMatch = line.match(topKeyRe);
    if (topMatch) {
      const key = topMatch[1];
      const valuePreview = topMatch[2];

      if (key === "steps" && valuePreview.trim().startsWith("[")) {
        inStepsArray = true;
        stepIndex = 0;

        let arrayEndLine = lineNum;
        let depth = 0;
        for (let j = i; j < lines.length; j++) {
          for (const ch of lines[j]) {
            if (ch === "[") depth++;
            else if (ch === "]") depth--;
          }
          if (depth <= 0) { arrayEndLine = j + 1; break; }
        }

        items.push({
          label: "steps",
          line: lineNum,
          endLine: arrayEndLine,
          depth: 0,
          kind: "array"
        });
        continue;
      }

      let preview = "";
      const simpleVal = valuePreview.replace(/,?\s*$/, "").trim();
      if (simpleVal.startsWith("\"")) {
        preview = simpleVal.replace(/^"|"$/g, "");
        if (preview.length > 20) preview = preview.slice(0, 20) + "…";
      } else if (simpleVal === "true" || simpleVal === "false") {
        preview = simpleVal;
      } else if (/^\d/.test(simpleVal)) {
        preview = simpleVal;
      }

      let fieldEndLine = lineNum;
      if (simpleVal.endsWith("{") || simpleVal.endsWith("[")) {
        let d = 0;
        for (let j = i; j < lines.length; j++) {
          for (const ch of lines[j]) {
            if (ch === "{" || ch === "[") d++;
            else if (ch === "}" || ch === "]") d--;
          }
          if (d <= 0) { fieldEndLine = j + 1; break; }
        }
      }

      items.push({
        label: preview ? `${key}: ${preview}` : key,
        line: lineNum,
        endLine: fieldEndLine,
        depth: 0,
        kind: "field"
      });
      continue;
    }

    // steps 数组内部
    if (inStepsArray) {
      if (stepStartRe.test(line)) {
        stepStartLine = lineNum;
        stepModuleId = "";
        braceDepth = 1;
        continue;
      }

      if (stepStartLine > 0) {
        const mMatch = line.match(moduleIdRe);
        if (mMatch) stepModuleId = mMatch[1];

        for (const ch of line) {
          if (ch === "{") braceDepth++;
          else if (ch === "}") braceDepth--;
        }

        if (braceDepth <= 0) {
          stepIndex++;
          // 优先使用中文模块名，否则用 moduleId 最后一段
          const displayName =
            moduleNameMap.get(stepModuleId) ||
            stepModuleId.split(".").pop() ||
            stepModuleId;
          const label = `#${stepIndex} ${displayName}`;
          items.push({
            label,
            line: stepStartLine,
            endLine: lineNum,
            depth: 1,
            kind: "step"
          });
          stepStartLine = -1;
        }
      }

      if (line.trim() === "]" || line.trim() === "],") {
        inStepsArray = false;
      }
    }
  }

  return items;
}

export const JsonOutline: React.FC<JsonOutlineProps> = ({
  rawJson,
  editorRef,
  activeLine,
  moduleOptions
}) => {
  // 构建 moduleId → 中文名映射
  const moduleNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (moduleOptions) {
      for (const m of moduleOptions) {
        map.set(m.id, m.name);
      }
    }
    return map;
  }, [moduleOptions]);

  const items = useMemo(
    () => buildOutline(rawJson, moduleNameMap),
    [rawJson, moduleNameMap]
  );

  const handleClick = useCallback(
    (item: OutlineItem) => {
      if (!editorRef) return;

      editorRef.revealLineInCenter(item.line);

      const endLineContent = editorRef.getModel()?.getLineContent(item.endLine) || "";
      editorRef.setSelection({
        startLineNumber: item.line,
        startColumn: 1,
        endLineNumber: item.endLine,
        endColumn: endLineContent.length + 1
      });

      editorRef.focus();
    },
    [editorRef]
  );

  if (items.length === 0) return null;

  return (
    <div className="json-outline">
      <div className="json-outline-title">目录</div>
      <div className="json-outline-list">
        {items.map((item, i) => {
          const isActive =
            activeLine !== undefined &&
            activeLine >= item.line &&
            activeLine <= item.endLine;

          return (
            <button
              key={`${item.line}-${i}`}
              className={`json-outline-item depth-${item.depth} kind-${item.kind} ${isActive ? "active" : ""}`}
              onClick={() => handleClick(item)}
              title={`行 ${item.line}–${item.endLine}`}
            >
              <span className="json-outline-icon">
                {item.kind === "array" ? "▤" : item.kind === "step" ? "◆" : "●"}
              </span>
              <span className="json-outline-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
