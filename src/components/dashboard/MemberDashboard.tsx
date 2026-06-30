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
  Groceries: "#00F5A0",
  Dining: "#FF6B6B",
  Utilities: "#A78BFA",
  Transport: "#60A5FA",
  Other: "#D1D5DB",
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
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-6 border-b border-gray-100">
        <p className="text-sm text-gray-400 font-medium">Hello, {firstName} 👋</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-0.5">Your Balance</h1>
        {period && (
          <span className="inline-block mt-1 text-xs font-bold bg-[#FFE66D] text-gray-800 px-3 py-1 rounded-full">
            {period.name}
          </span>
        )}
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Total owed card */}
        <div className="card-bubble p-6 text-center" style={{ borderLeft: "4px solid #FF6B6B" }}>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">You Owe</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">
            ฿{(data?.totalOwed ?? 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-1">to {data?.member?.name ?? "..."}</p>
        </div>

        {/* Expense breakdown */}
        {data?.splits && data.splits.length > 0 && (
          <div className="card-bubble p-5">
            <h2 className="text-sm font-extrabold text-gray-900 mb-4">Breakdown</h2>
            <div className="flex flex-col gap-3">
              {data.splits
                .filter((s) => s.expense !== null)
                .map((s) => {
                  const catName = s.expense?.category?.name ?? "Other";
                  const catColor = CATEGORY_COLORS[catName] ?? "#D1D5DB";
                  return (
                    <div key={s.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-10 rounded-full" style={{ backgroundColor: catColor }} />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{s.expense?.description}</p>
                          <p className="text-xs text-gray-400">{s.expense?.date} · {catName}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-gray-900 text-sm">฿{Number(s.amount).toLocaleString()}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {data?.splits?.length === 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-semibold text-gray-400">You&apos;re all clear!</p>
            <p className="text-sm text-gray-300 mt-1">No expenses this period</p>
          </div>
        )}
      </div>
    </div>
  );
}
