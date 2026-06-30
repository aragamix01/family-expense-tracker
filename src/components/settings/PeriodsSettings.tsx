"use client";

import { useEffect, useState } from "react";
import type { Period } from "@/lib/database.types";

export function PeriodsSettings() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [closing, setClosing] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = () => fetch("/api/periods").then((r) => r.json()).then(setPeriods);
  useEffect(() => { load(); }, []);

  const openPeriod = periods.find((p) => p.status === "open");
  const closedPeriods = periods.filter((p) => p.status === "closed");

  const handleClose = async () => {
    if (!openPeriod) return;
    if (!confirm(`Close "${openPeriod.name}"? This will archive the current period.`)) return;
    setClosing(true);
    await fetch(`/api/periods/${openPeriod.id}/close`, { method: "PUT" });
    await load();
    setClosing(false);
  };

  const handleNewPeriod = async () => {
    const name = prompt("Period name (e.g. July 2026):");
    if (!name) return;
    setCreating(true);
    await fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    await load();
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Active period */}
      {openPeriod && (
        <div className="card-bubble p-5" style={{ borderLeft: "4px solid #FFE66D" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Period</p>
              <p className="text-lg font-extrabold text-gray-900 mt-1">{openPeriod.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Started {openPeriod.created_at.slice(0, 10)}</p>
            </div>
            <span className="text-xs font-bold bg-[#E6FFF7] text-[#00C47D] px-3 py-1.5 rounded-xl">OPEN</span>
          </div>
          <button
            onClick={handleClose}
            disabled={closing}
            className="mt-4 w-full btn-coral py-3 text-sm font-bold rounded-2xl disabled:opacity-40"
          >
            {closing ? "Closing..." : "Close Month ✓"}
          </button>
        </div>
      )}

      {!openPeriod && (
        <button
          onClick={handleNewPeriod}
          disabled={creating}
          className="btn-yellow w-full py-4 text-base font-extrabold rounded-2xl disabled:opacity-40"
        >
          {creating ? "Creating..." : "+ Start New Period"}
        </button>
      )}

      {/* Past periods */}
      {closedPeriods.length > 0 && (
        <div className="card-bubble p-5">
          <h2 className="text-sm font-extrabold text-gray-900 mb-3">Past Periods</h2>
          <div className="flex flex-col gap-2">
            {closedPeriods.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-semibold text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">Closed {p.closed_at?.slice(0, 10)}</p>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl">CLOSED</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
