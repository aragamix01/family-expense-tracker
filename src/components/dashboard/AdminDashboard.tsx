"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLiff } from "@/contexts/LiffContext";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import { SpendingChart } from "./SpendingChart";
import { CategoryDonut } from "./CategoryDonut";
import type { Expense, Category, ExpenseSplit, Member } from "@/lib/database.types";

type MemberDebt = { memberId: string; name: string; amount: number };
type CategoryBreakdown = { categoryId: string; name: string; amount: number };
type FullExpense = Expense & { category?: Category; splits?: (ExpenseSplit & { member?: Member })[] };

type DashboardData = {
  totalSpent: number;
  totalOwed: number;
  memberDebts: MemberDebt[];
  categoryBreakdown: CategoryBreakdown[];
  recentExpenses: FullExpense[];
};

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "#00F5A0",
  Dining: "#FF6B6B",
  Utilities: "#A78BFA",
  Transport: "#60A5FA",
  Other: "#D1D5DB",
};

export function AdminDashboard() {
  const { profile } = useLiff();
  const { period } = useActivePeriod();
  const [data, setData] = useState<DashboardData | null>(null);
  const [settlingMember, setSettlingMember] = useState<string | null>(null);

  useEffect(() => {
    if (!period) return;
    fetch(`/api/dashboard?period_id=${period.id}`)
      .then((r) => r.json())
      .then(setData);
  }, [period]);

  const handleSettleUp = async (memberId: string, memberName: string) => {
    if (!confirm(`Mark all of ${memberName}'s debt as settled?`)) return;
    setSettlingMember(memberId);
    // Remove all splits for this member in the current period
    // We do this by deleting splits via member expenses
    const res = await fetch(`/api/members/${memberId}/settle?period_id=${period?.id}`, { method: "POST" });
    if (res.ok) {
      const refreshed = await fetch(`/api/dashboard?period_id=${period?.id}`).then((r) => r.json());
      setData(refreshed);
    }
    setSettlingMember(null);
  };

  const firstName = profile?.displayName?.split(" ")[0] ?? "Hey";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 font-medium">Hello, {firstName} 👋</p>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-0.5">Family Tracker</h1>
            {period && (
              <span className="inline-block mt-1 text-xs font-bold bg-[#FFE66D] text-gray-800 px-3 py-1 rounded-full">
                {period.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings" className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-lg">⚙️</Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 flex flex-col gap-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-bubble p-5" style={{ borderLeft: "4px solid #FF6B6B" }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Owed</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">
              ฿{(data?.totalOwed ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="card-bubble p-5" style={{ borderLeft: "4px solid #00F5A0" }}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">This Period</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">
              ฿{(data?.totalSpent ?? 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Per-member debt */}
        {data?.memberDebts && data.memberDebts.length > 0 && (
          <div className="card-bubble p-5">
            <h2 className="text-sm font-extrabold text-gray-900 mb-4">Who Owes You</h2>
            <div className="flex flex-col gap-3">
              {data.memberDebts.map((m) => (
                <div key={m.memberId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-[#FFF0F0] flex items-center justify-center font-bold text-[#FF6B6B] text-sm">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900">฿{m.amount.toLocaleString()}</span>
                    <button
                      onClick={() => handleSettleUp(m.memberId, m.name)}
                      disabled={settlingMember === m.memberId}
                      className="text-xs font-bold bg-[#E6FFF7] text-[#00C47D] px-3 py-1.5 rounded-xl"
                    >
                      Settle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category breakdown donut */}
        {data?.categoryBreakdown && data.categoryBreakdown.length > 0 && (
          <div className="card-bubble p-5">
            <h2 className="text-sm font-extrabold text-gray-900 mb-2">Spending by Category</h2>
            <CategoryDonut data={data.categoryBreakdown} />
          </div>
        )}

        {/* Recent expenses */}
        {data?.recentExpenses && data.recentExpenses.length > 0 && (
          <div className="card-bubble p-5">
            <h2 className="text-sm font-extrabold text-gray-900 mb-4">Recent Expenses</h2>
            <div className="flex flex-col gap-3">
              {data.recentExpenses.map((e) => {
                const catColor = CATEGORY_COLORS[e.category?.name ?? "Other"] ?? "#D1D5DB";
                return (
                  <Link key={e.id} href={`/expenses/${e.id}/edit`} className="flex items-center justify-between active:opacity-70">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-10 rounded-full"
                        style={{ backgroundColor: catColor }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{e.description}</p>
                        <p className="text-xs text-gray-400">{e.date} · {e.category?.name}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-gray-900 text-sm">฿{Number(e.amount).toLocaleString()}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly chart placeholder — would need multi-period data */}
        <div className="card-bubble p-5">
          <h2 className="text-sm font-extrabold text-gray-900 mb-3">Monthly Trend</h2>
          <SpendingChart data={[{ month: period?.name?.slice(0, 3) ?? "Now", amount: data?.totalSpent ?? 0 }]} />
        </div>

        {/* Empty state */}
        {data?.recentExpenses?.length === 0 && (
          <div className="text-center py-10">
            <p className="text-4xl mb-3">🧾</p>
            <p className="font-semibold text-gray-400">No expenses yet</p>
            <p className="text-sm text-gray-300 mt-1">Tap + to add your first one</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/add"
        className="fixed bottom-6 right-5 w-16 h-16 rounded-3xl btn-coral flex items-center justify-center text-3xl shadow-xl active:scale-95 transition-all"
        style={{ boxShadow: "0 8px 30px rgba(255,107,107,0.4)" }}
      >
        +
      </Link>
    </div>
  );
}
