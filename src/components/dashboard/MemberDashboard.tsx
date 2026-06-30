"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import type { Expense, Category, ExpenseSplit, Member } from "@/lib/database.types";

type FullSplit = ExpenseSplit & { expense: (Expense & { category?: Category }) | null };
type MemberData = { member: Member; totalOwed: number; splits: FullSplit[] };

const CAT_COLOR: Record<string, string> = {
  Groceries: "#22C55E", Dining: "#EF4444", Utilities: "#8B5CF6",
  Transport: "#3B82F6", Other: "#F59E0B",
};
const CAT_EMOJI: Record<string, string> = {
  Groceries: "🛒", Dining: "🍽️", Utilities: "💡", Transport: "🚗", Other: "📦",
};

export function MemberDashboard() {
  const { profile } = useLiff();
  const { period } = useActivePeriod();
  const [data, setData] = useState<MemberData | null>(null);

  useEffect(() => {
    if (!period || !profile?.userId) return;
    fetch(`/api/dashboard/member/${profile.userId}?period_id=${period.id}`)
      .then(r => r.json()).then(setData);
  }, [period, profile?.userId]);

  const firstName = profile?.displayName?.split(" ")[0] ?? "คุณ";

  return (
    <div className="min-h-screen pb-10" style={{ background: "#EFEFEF" }}>
      {/* Header */}
      <div className="app-header sticky top-0 z-10 px-5 py-3.5">
        <p className="text-xs font-600" style={{ color: "#999" }}>สวัสดี {firstName} 👋</p>
        <p className="font-900 text-sm" style={{ color: "#111" }}>ยอดของฉัน</p>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* Hero black card */}
        <div
          className="rounded-2xl px-5 pt-5 pb-6"
          style={{ background: "#111", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
        >
          <div className="flex items-start justify-between mb-1">
            <p className="text-xs font-700 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
              คุณค้างชำระ
            </p>
            {period && <span className="pill-lime">{period.name}</span>}
          </div>
          <p
            className="font-900 leading-none mt-1"
            style={{ fontSize: "clamp(2.5rem,12vw,3.75rem)", color: "#C8FF00", letterSpacing: "-0.03em" }}
          >
            ฿{(data?.totalOwed ?? 0).toLocaleString()}
          </p>
          {data?.member && (
            <p className="text-sm font-600 mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              ให้ {data.member.name}
            </p>
          )}
        </div>

        {/* Breakdown */}
        {data?.splits && data.splits.length > 0 && (
          <div className="card p-4">
            <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#999" }}>รายละเอียด</p>
            <div className="flex flex-col">
              {data.splits.filter(s => s.expense !== null).map((s, i) => {
                const catName = s.expense?.category?.name ?? "Other";
                const dot = CAT_COLOR[catName] ?? "#999";
                const emoji = CAT_EMOJI[catName] ?? "📦";
                return (
                  <div key={s.id}>
                    {i > 0 && <div className="divider my-3" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: "#F5F5F5" }}>
                          {emoji}
                        </div>
                        <div>
                          <p className="font-700 text-sm" style={{ color: "#111" }}>{s.expense?.description}</p>
                          <p className="text-xs font-500 mt-0.5 flex items-center gap-1.5" style={{ color: "#999" }}>
                            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: dot }} />
                            {s.expense?.date} · {catName}
                          </p>
                        </div>
                      </div>
                      <p className="font-900 text-sm" style={{ color: "#111" }}>฿{Number(s.amount).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data?.splits?.length === 0 && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: "#F5F5F5" }}>✅</div>
            <p className="font-800 text-base" style={{ color: "#111" }}>ไม่มีรายการค้างชำระ!</p>
            <p className="text-sm font-500 mt-1" style={{ color: "#999" }}>ไม่มีรายการในงวดนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
