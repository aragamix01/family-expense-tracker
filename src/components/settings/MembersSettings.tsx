"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/lib/database.types";

const AVATAR_GRAD = [
  "linear-gradient(135deg,#6366F1,#A78BFA)",
  "linear-gradient(135deg,#3B82F6,#60A5FA)",
  "linear-gradient(135deg,#EC4899,#F472B6)",
  "linear-gradient(135deg,#10B981,#34D399)",
];

export function MembersSettings() {
  const [members, setMembers] = useState<Member[]>([]);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => fetch("/api/members").then(r => r.json()).then(setMembers);
  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    setNewName("");
    await load();
    setAdding(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบ ${name}?`)) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" });
    await load();
  };

  const handleRename = async (id: string, current: string) => {
    const name = prompt("ชื่อใหม่:", current);
    if (!name || name === current) return;
    await fetch(`/api/members/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    await load();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="glass px-4 py-3 flex gap-3 items-center">
        <input
          type="text"
          placeholder="เพิ่มสมาชิกใหม่..."
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

      {members.map((m, i) => (
        <div key={m.id} className="glass px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center font-900 text-sm text-white"
              style={{ background: AVATAR_GRAD[i % AVATAR_GRAD.length], borderRadius: "0.75rem" }}
            >
              {m.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-700 text-white">{m.name}</p>
              {m.line_user_id && (
                <p className="text-xs font-600" style={{ color: "#34D399" }}>LINE linked ✓</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleRename(m.id, m.name)}
              className="text-xs font-700 px-3 py-1.5 rounded-xl btn-glass"
            >
              แก้ไข
            </button>
            <button
              onClick={() => handleDelete(m.id, m.name)}
              className="text-xs font-700 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.25)" }}
            >
              ลบ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
