"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/lib/database.types";

export function MembersSettings() {
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => fetch("/api/members").then((r) => r.json()).then(setMembers);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    await load();
    setAdding(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name}? This cannot be undone.`)) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    await load();
  };

  const handleRename = async (id: string, current: string) => {
    const name = prompt("New name:", current);
    if (!name || name === current) return;
    await fetch(`/api/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await load();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Add member */}
      <div className="card-bubble p-4 flex gap-3">
        <input
          type="text"
          placeholder="Add member name..."
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

      {/* Member list */}
      <div className="flex flex-col gap-2">
        {members.map((m) => (
          <div key={m.id} className="card-bubble p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFF0F0] flex items-center justify-center font-bold text-[#FF6B6B] text-sm">
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{m.name}</p>
                {m.line_user_id && (
                  <p className="text-xs text-[#00C47D] font-medium">LINE linked ✓</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRename(m.id, m.name)}
                className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl"
              >
                Rename
              </button>
              <button
                onClick={() => handleDelete(m.id, m.name)}
                className="text-xs font-bold text-red-400 bg-red-50 px-3 py-1.5 rounded-xl"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
