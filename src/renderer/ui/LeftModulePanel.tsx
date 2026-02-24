import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, Inbox } from "lucide-react";
import { VflowModuleOption } from "../domain/vflowTypes";
import { getCategoryOrderIndex } from "../shared/moduleUtils";
import "./styles/LeftModulePanel.css";

interface LeftModulePanelProps {
  modules: VflowModuleOption[];
  onDragStart: (e: React.DragEvent, moduleId: string) => void;
}

export const LeftModulePanel: React.FC<LeftModulePanelProps> = ({
  modules,
  onDragStart
}) => {
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(["常用"]));

  const grouped = useMemo(() => {
    const map = new Map<string, VflowModuleOption[]>();
    modules.forEach(m => {
      const list = map.get(m.category) || [];
      list.push(m);
      map.set(m.category, list);
    });
    // 常用分组
    const frequent = modules
      .filter(m => (m.usageCount ?? 0) > 0)
      .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
      .slice(0, 12);
    if (frequent.length) map.set("常用", frequent);
    // 排序
    return Array.from(map.entries()).sort((a, b) => {
      if (a[0] === "常用") return -1;
      if (b[0] === "常用") return 1;
      const sampleA = a[1][0];
      const sampleB = b[1][0];
      const ia = getCategoryOrderIndex(sampleA?.categoryKey, a[0]);
      const ib = getCategoryOrderIndex(sampleB?.categoryKey, b[0]);
      return ia - ib;
    });
  }, [modules]);

  const toggleCat = (cat: string) => {
    setOpenCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const highlight = (text: string) => {
    if (!search) return text;
    // 不区分大小写匹配
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return parts.map((p, i) =>
      regex.test(p) ? (
        <span key={i} style={{ color: "var(--color-primary-dark)", backgroundColor: "var(--color-primary-bg)", borderRadius: 2 }}>{p}</span>
      ) : (
        <span key={i}>{p}</span>
      )
    );
  };

  const filteredGroups = useMemo(() => {
    if (!search) return grouped;
    return grouped
      .map(([cat, list]) => {
        const filtered = list.filter(m =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.id.toLowerCase().includes(search.toLowerCase())
        );
        return [cat, filtered] as [string, VflowModuleOption[]];
      })
      .filter(([_, list]) => list.length > 0);
  }, [grouped, search]);

  // 自动展开搜索结果
  useEffect(() => {
    if (search) {
      setOpenCats(new Set(filteredGroups.map(([cat]) => cat)));
    }
  }, [search, filteredGroups]);

  useEffect(() => {
    if (search || grouped.length === 0) return;
    const defaults = grouped
      .filter(([cat]) => cat !== "常用")
      .slice(0, 3)
      .map(([cat]) => cat);
    setOpenCats(new Set(["常用", ...defaults]));
  }, [grouped, search]);

  return (
    <div className="module-panel-container">
      <div className="module-panel-header">
        <Search size={16} color="var(--color-text-secondary)" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索模块..."
          className="module-panel-search-input"
        />
      </div>

      <div className="module-panel-list">
        {filteredGroups.length === 0 && (
          <div className="module-panel-empty">
            <Inbox size={32} />
            <div className="module-panel-empty-text">无匹配模块</div>
          </div>
        )}
        
        {filteredGroups.length > 0 && (
          <div style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "bold", color: "var(--color-text-secondary)", letterSpacing: 0.5 }}>
            内置应用模块
          </div>
        )}

        {filteredGroups.map(([cat, list]) => {
          const open = openCats.has(cat);
          return (
            <div key={cat} style={{ marginBottom: 4 }}>
              <button
                onClick={() => toggleCat(cat)}
                className="module-panel-group-toggle"
              >
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>{cat}</span>
                <span className="module-panel-group-badge">{list.length}</span>
              </button>
              
              <div 
                className="module-panel-group-content"
                style={{ 
                  height: open ? "auto" : 0
                }}
              >
                <div className="module-panel-group-inner">
                  {list.map(m => (
                      <div
                        key={m.id}
                        draggable={!m.isDisabled}
                        onDragStart={e => {
                          if (m.isDisabled) return;
                          onDragStart(e, m.id);
                        }}
                        title={m.isDisabled ? (m.disabledReason || "模块不可用") : (m.description || m.id)}
                        className="module-panel-item"
                        style={{
                          opacity: m.isDisabled ? 0.45 : 1,
                          cursor: m.isDisabled ? "not-allowed" : "grab"
                        }}
                      >
                      <div
                        aria-hidden="true"
                        className="module-panel-item-dot"
                        style={{
                          background: m.color
                        }}
                      />
                      <div className="module-panel-item-text">
                        <div className="module-panel-item-name">
                          {highlight(m.name)}
                        </div>
                        {m.usageCount ? (
                          <div className="module-panel-item-usage">使用 {m.usageCount} 次</div>
                        ) : null}
                        {m.isDisabled ? (
                          <div className="module-panel-item-usage">不可用</div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* 自定义导入分类预留区 */}
        <div style={{ marginTop: 12 }}>
          <div style={{ padding: "8px 12px", fontSize: "12px", fontWeight: "bold", color: "var(--color-text-secondary)", letterSpacing: 0.5, display: "flex", justifyContent: "space-between" }}>
            <span>自定义导入模块</span>
            <span style={{ fontSize: "10px", fontWeight: "normal", opacity: 0.6 }}>暂无</span>
          </div>
        </div>

      </div>
    </div>
  );
};
