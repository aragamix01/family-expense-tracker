"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import type { Expense, Category, ExpenseSplit, Member } from "@/lib/database.types";

type FullSplit = ExpenseSplit & { expense: (Expense & { category?: Category }) | null };
type MemberData = { member: Member; totalOwed: number; splits: FullSplit[] };

const CAT_DOT: Record<string, string> = {
  Groceries: "#34D399", Dining: "#F472B6", Utilities: "#818CF8",
  Transport: "#60A5FA", Other: "#FBBF24",
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
    <div className="min-h-screen pb-10">
      <div className="fixed pointer-events-none" style={{
        top: "-20vw", right: "-20vw", width: "70vw", height: "70vw", borderRadius: "50%",
        background: "radial-gradient(circle,rgba(99,102,241,0.35) 0%,transparent 70%)",
      }} />

      {/* Header */}
      <div className="glass-header sticky top-0 z-10 px-5 py-4">
        <p className="text-xs font-700" style={{ color: "rgba(255,255,255,0.5)" }}>สวัสดี {firstName} 👋</p>
        <p className="font-900 text-base text-white">ยอดของฉัน</p>
      </div>

      {/* Hero number */}
      <div className="px-6 pt-10 pb-8">
        {period && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-xs font-700"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {period.name}
          </div>
        )}
        <p className="text-sm font-600 mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>คุณค้างชำระ</p>
        <p
          className="font-900 glow-number leading-none"
          style={{ fontSize: "clamp(3rem,14vw,4.5rem)", color: "white", letterSpacing: "-0.02em" }}
        >
          ฿{(data?.totalOwed ?? 0).toLocaleString()}
        </p>
        {data?.member && (
          <p className="text-sm font-600 mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            ให้ {data.member.name}
          </p>
        )}
      </div>

      <div className="px-4 flex flex-col gap-4">
        {data?.splits && data.splits.length > 0 && (
          <div className="glass p-5">
            <p className="text-xs font-800 uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>รายละเอียด</p>
            <div className="flex flex-col gap-1">
              {data.splits.filter(s => s.expense !== null).map(s => {
                const catName = s.expense?.category?.name ?? "Other";
                const dot = CAT_DOT[catName] ?? "#818CF8";
                const emoji = CAT_EMOJI[catName] ?? "📦";
                return (
                  <div key={s.id} className="flex items-center justify-between py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        {emoji}
                      </div>
                      <div>
                        <p className="font-700 text-sm text-white">{s.expense?.description}</p>
                        <p className="text-xs font-500 mt-0.5 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: dot }} />
                          {s.expense?.date} · {catName}
                        </p>
                      </div>
                    </div>
                    <p className="font-900 text-sm" style={{ color: "#F472B6" }}>
                      ฿{Number(s.amount).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {data?.splits?.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl glass">
              ✅
            </div>
            <p className="font-800 text-lg text-white">ไม่มีรายการค้างชำระ!</p>
            <p className="text-sm font-500 mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>ไม่มีรายการในงวดนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
