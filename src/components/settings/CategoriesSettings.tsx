"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/database.types";

const CAT_CFG: Record<string, { color: string; emoji: string }> = {
  Groceries: { color: "#22C55E", emoji: "🛒" },
  Dining:    { color: "#EF4444", emoji: "🍽️" },
  Utilities: { color: "#8B5CF6", emoji: "💡" },
  Transport: { color: "#3B82F6", emoji: "🚗" },
  Other:     { color: "#F59E0B", emoji: "📦" },
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
    setNewName(""); await load(); setAdding(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="card px-4 py-3 flex gap-3 items-center">
        <input
          type="text"
          placeholder="เพิ่มหมวดหมู่ใหม่..."
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          className="flex-1 font-700 text-sm outline-none bg-transparent placeholder:text-gray-300"
          style={{ color: "#111" }}
        />
        <button onClick={handleAdd} disabled={adding || !newName.trim()} className="btn-ink px-4 py-2 text-sm rounded-xl disabled:opacity-30">
          เพิ่ม
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const cfg = CAT_CFG[cat.name] ?? { color: "#555", emoji: "✨" };
          return (
            <div
              key={cat.id}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-700 text-sm"
              style={{ background: "#F5F5F5", color: "#111", border: "1px solid #E2E2E2" }}
            >
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: cfg.color }} />
              {cfg.emoji} {cat.name}
              {cat.is_default && <span className="text-xs opacity-40 ml-1">·default</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
