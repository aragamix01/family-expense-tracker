"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/lib/database.types";

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
    setNewName(""); await load(); setAdding(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบ ${name}?`)) return;
    await fetch(`/api/members/${id}`, { method: "DELETE" }); await load();
  };

  const handleRename = async (id: string, current: string) => {
    const name = prompt("ชื่อใหม่:", current);
    if (!name || name === current) return;
    await fetch(`/api/members/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    await load();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="card px-4 py-3 flex gap-3 items-center">
        <input
          type="text"
          placeholder="เพิ่มสมาชิกใหม่..."
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

      {members.map((m, i) => (
        <div key={m.id} className="card px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar w-9 h-9 text-sm font-900" style={{ borderRadius: "0.625rem" }}>
              {m.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-700 text-sm" style={{ color: "#111" }}>{m.name}</p>
              {m.line_user_id && <p className="text-xs font-600" style={{ color: "#22C55E" }}>LINE linked ✓</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleRename(m.id, m.name)} className="text-xs font-700 px-3 py-1.5 rounded-xl btn-ghost">แก้ไข</button>
            <button onClick={() => handleDelete(m.id, m.name)} className="text-xs font-700 px-3 py-1.5 rounded-xl" style={{ background: "#FEE2E2", color: "#EF4444", border: "1px solid #FECACA" }}>ลบ</button>
          </div>
        </div>
      ))}
    </div>
  );
}
