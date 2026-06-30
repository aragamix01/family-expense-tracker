"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/database.types";

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "bg-[#00F5A0] text-gray-900",
  Dining: "bg-[#FF6B6B] text-white",
  Utilities: "bg-[#A78BFA] text-white",
  Transport: "bg-[#60A5FA] text-white",
  Other: "bg-gray-200 text-gray-700",
};

export function CategoriesSettings() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => fetch("/api/categories").then((r) => r.json()).then(setCategories);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    await load();
    setAdding(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="card-bubble p-4 flex gap-3">
        <input
          type="text"
          placeholder="Add custom category..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="flex-1 font-semibold text-gray-900 outline-none bg-transparent placeholder:text-gray-300"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          className="btn-coral px-4 py-2 text-sm disabled:opacity-40"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat.name] ?? "bg-[#FFE66D] text-gray-900";
          return (
            <div key={cat.id} className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm ${color}`}>
              {cat.name}
              {cat.is_default && <span className="text-xs opacity-60 ml-1">default</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
