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
    await fetch(`/api/periods/${openPeriod.id}/close`, { method: "PUT" });
    await load();
    setClosing(false);
  };

  const handleNew = async () => {
    const name = prompt("ชื่องวด (เช่น July 2026):");
    if (!name) return;
    setCreating(true);
    await fetch("/api/periods", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    await load();
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {openPeriod && (
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-800 uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>งวดปัจจุบัน</p>
              <p className="font-900 text-lg text-white">{openPeriod.name}</p>
              <p className="text-xs font-500 mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                เริ่ม {openPeriod.created_at.slice(0, 10)}
              </p>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-800"
              style={{ background: "rgba(52,211,153,0.18)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)" }}
            >
              เปิด
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={closing}
            className="w-full py-3 text-sm font-800 rounded-2xl disabled:opacity-40"
            style={{
              background: "rgba(248,113,113,0.18)",
              color: "#F87171",
              border: "1px solid rgba(248,113,113,0.3)",
            }}
          >
            {closing ? "กำลังปิด..." : "ปิดงวดนี้ ✓"}
          </button>
        </div>
      )}

      {!openPeriod && (
        <button
          onClick={handleNew}
          disabled={creating}
          className="btn-primary w-full py-4 text-base font-900 rounded-2xl disabled:opacity-40"
        >
          {creating ? "กำลังสร้าง..." : "+ เริ่มงวดใหม่"}
        </button>
      )}

      {closedPeriods.length > 0 && (
        <div className="glass p-5">
          <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>งวดที่ผ่านมา</p>
          <div className="flex flex-col gap-2">
            {closedPeriods.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p className="font-700 text-white">{p.name}</p>
                  <p className="text-xs font-500 mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    ปิดเมื่อ {p.closed_at?.slice(0, 10)}
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-700"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" }}
                >
                  ปิด
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
