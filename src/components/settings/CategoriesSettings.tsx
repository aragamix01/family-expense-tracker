"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/database.types";

const CAT_CFG: Record<string, { color: string; emoji: string }> = {
  Groceries: { color: "#34D399", emoji: "🛒" },
  Dining:    { color: "#F472B6", emoji: "🍽️" },
  Utilities: { color: "#818CF8", emoji: "💡" },
  Transport: { color: "#60A5FA", emoji: "🚗" },
  Other:     { color: "#FBBF24", emoji: "📦" },
};

export function CategoriesSettings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => fetch("/api/categories").then(r => r.json()).then(setCategories);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    setNewName("");
    await load();
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="glass px-4 py-3 flex gap-3 items-center">
        <input
          type="text"
          placeholder="เพิ่มหมวดหมู่ใหม่..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          className="flex-1 font-700 text-white outline-none bg-transparent placeholder:text-white/25"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="btn-primary px-4 py-2 text-sm rounded-xl disabled:opacity-40"
        >
          เพิ่ม
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const cfg = CAT_CFG[cat.name] ?? { color: "#818CF8", emoji: "✨" };
          return (
            <div
              key={cat.id}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-700 text-sm"
              style={{
                background: `${cfg.color}20`,
                color: cfg.color,
                border: `1.5px solid ${cfg.color}40`,
              }}
            >
              {cfg.emoji} {cat.name}
              {cat.is_default && <span className="text-xs opacity-50 ml-1">·ค่าเริ่มต้น</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
