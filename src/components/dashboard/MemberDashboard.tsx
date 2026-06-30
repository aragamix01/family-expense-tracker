"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/contexts/LiffContext";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import type { Expense, Category, ExpenseSplit, Member } from "@/lib/database.types";

type FullSplit = ExpenseSplit & {
  expense: (Expense & { category?: Category }) | null;
};

type MemberData = {
  member: Member;
  totalOwed: number;
  splits: FullSplit[];
};

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#00C47D",
  Dining: "#FF6B6B",
  Utilities: "#A78BFA",
  Transport: "#60A5FA",
  Other: "#F59E0B",
};

const CATEGORY_BG: Record<string, string> = {
  Groceries: "rgba(0,196,125,0.12)",
  Dining: "rgba(255,107,107,0.12)",
  Utilities: "rgba(167,139,250,0.15)",
  Transport: "rgba(96,165,250,0.15)",
  Other: "rgba(245,158,11,0.12)",
};

export function MemberDashboard() {
  const { profile } = useLiff();
  const { period } = useActivePeriod();
  const [data, setData] = useState<MemberData | null>(null);

  useEffect(() => {
    if (!period || !profile?.userId) return;
    fetch(`/api/dashboard/member/${profile.userId}?period_id=${period.id}`)
      .then((r) => r.json())
      .then(setData);
  }, [period, profile?.userId]);

  const firstName = profile?.displayName?.split(" ")[0] ?? "Hey";

  return (
    <div className="min-h-screen pb-10" style={{ background: "#FFF8F5" }}>

      {/* Hero */}
      <div
        className="mx-4 mt-5 px-6 pt-6 pb-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#FF6B6B 0%,#FF8E53 60%,#FFB347 100%)",
          borderRadius: "1.5rem",
          boxShadow: "0 8px 32px rgba(255,107,107,0.3)",
        }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20" style={{ background: "white" }} />

        <div className="relative z-10">
          <p className="text-white/70 text-sm font-600 mb-5">สวัสดี {firstName} 👋</p>

          <p className="text-white/70 text-xs font-800 uppercase tracking-widest mb-1">คุณค้างชำระ</p>
          <p className="text-white font-900 leading-none" style={{ fontSize: "3.5rem" }}>
            ฿{(data?.totalOwed ?? 0).toLocaleString()}
          </p>

          {period && (
            <div
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <p className="text-white/80 text-sm font-700">{period.name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {data?.splits && data.splits.length > 0 && (
          <div className="card-bubble p-5">
            <p className="text-xs font-800 uppercase tracking-widest mb-4" style={{ color: "#9CA3AF" }}>รายละเอียด</p>
            <div className="flex flex-col gap-1">
              {data.splits
                .filter((s) => s.expense !== null)
                .map((s) => {
                  const catName = s.expense?.category?.name ?? "Other";
                  const dotColor = CATEGORY_COLORS[catName] ?? "#D1D5DB";
                  const dotBg = CATEGORY_BG[catName] ?? "rgba(209,213,219,0.15)";
                  return (
                    <div key={s.id} className="flex items-center justify-between py-3 px-1">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ background: dotBg }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
                        </div>
                        <div>
                          <p className="font-700 text-sm" style={{ color: "#1A1A2E" }}>{s.expense?.description}</p>
                          <p className="text-xs font-500 mt-0.5" style={{ color: "#9CA3AF" }}>
                            {s.expense?.date} · {catName}
                          </p>
                        </div>
                      </div>
                      <p className="font-900 text-sm" style={{ color: "#1A1A2E" }}>
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
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ background: "rgba(0,196,125,0.12)" }}
            >
              ✅
            </div>
            <p className="font-800 text-lg" style={{ color: "#1A1A2E" }}>ไม่มีรายการค้างชำระ!</p>
            <p className="text-sm font-500 mt-1" style={{ color: "#9CA3AF" }}>ไม่มีรายการในงวดนี้</p>
          </div>
        )}
      </div>
    </div>
  );
}
