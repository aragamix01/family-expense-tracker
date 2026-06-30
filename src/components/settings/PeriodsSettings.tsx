"use client";

import { useEffect, useState } from "react";
import type { Period } from "@/lib/database.types";

export function PeriodsSettings() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [closing, setClosing] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = () => fetch("/api/periods").then(r => r.json()).then(setPeriods);
  useEffect(() => { load(); }, []);

  const openPeriod = periods.find(p => p.status === "open");
  const closedPeriods = periods.filter(p => p.status === "closed");

  const handleClose = async () => {
    if (!openPeriod || !confirm(`ปิดงวด "${openPeriod.name}"?`)) return;
    setClosing(true);
    await fetch(`/api/periods/${openPeriod.id}/close`, { method: "PUT" }); await load(); setClosing(false);
  };

  const handleNew = async () => {
    const name = prompt("ชื่องวด (เช่น July 2026):");
    if (!name) return;
    setCreating(true);
    await fetch("/api/periods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    await load(); setCreating(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {openPeriod && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-700 uppercase tracking-widest mb-1" style={{ color: "#999" }}>งวดปัจจุบัน</p>
              <p className="font-900 text-base" style={{ color: "#111" }}>{openPeriod.name}</p>
              <p className="text-xs font-500 mt-0.5" style={{ color: "#999" }}>เริ่ม {openPeriod.created_at.slice(0, 10)}</p>
            </div>
            <span className="pill-lime">เปิด</span>
          </div>
          <button
            onClick={handleClose}
            disabled={closing}
            className="w-full py-3 text-sm font-800 rounded-2xl disabled:opacity-40"
            style={{ background: "#FEE2E2", color: "#EF4444", border: "1px solid #FECACA" }}
          >
            {closing ? "กำลังปิด..." : "ปิดงวดนี้ ✓"}
          </button>
        </div>
      )}

      {!openPeriod && (
        <button onClick={handleNew} disabled={creating} className="btn-ink w-full py-4 text-base font-900 rounded-2xl disabled:opacity-30">
          {creating ? "กำลังสร้าง..." : "+ เริ่มงวดใหม่"}
        </button>
      )}

      {closedPeriods.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: "#999" }}>งวดที่ผ่านมา</p>
          <div className="flex flex-col">
            {closedPeriods.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <div className="divider my-3" />}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-700 text-sm" style={{ color: "#111" }}>{p.name}</p>
                    <p className="text-xs font-500 mt-0.5" style={{ color: "#999" }}>ปิดเมื่อ {p.closed_at?.slice(0, 10)}</p>
                  </div>
                  <span className="pill-gray">ปิด</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
