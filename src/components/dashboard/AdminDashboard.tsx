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
  totalSpent: number; totalOwed: number;
  memberDebts: MemberDebt[]; categoryBreakdown: CategoryBreakdown[]; recentExpenses: FullExpense[];
};

const CAT_DOT: Record<string, string> = {
  Groceries: "#34D399", Dining: "#F472B6", Utilities: "#818CF8",
  Transport: "#60A5FA", Other: "#FBBF24",
};
const CAT_EMOJI: Record<string, string> = {
  Groceries: "🛒", Dining: "🍽️", Utilities: "💡", Transport: "🚗", Other: "📦",
};
const AVATAR_GRAD = [
  "linear-gradient(135deg,#6366F1,#A78BFA)",
  "linear-gradient(135deg,#3B82F6,#60A5FA)",
  "linear-gradient(135deg,#EC4899,#F472B6)",
  "linear-gradient(135deg,#10B981,#34D399)",
];

export function AdminDashboard() {
  const { profile } = useLiff();
  const { period } = useActivePeriod();
  const [data, setData] = useState<DashboardData | null>(null);
  const [settling, setSettling] = useState<string | null>(null);

  useEffect(() => {
    if (!period) return;
    fetch(`/api/dashboard?period_id=${period.id}`).then(r => r.json()).then(setData);
  }, [period]);

  const handleSettle = async (memberId: string, name: string) => {
    if (!confirm(`ยืนยันว่า ${name} ชำระแล้ว?`)) return;
    setSettling(memberId);
    const res = await fetch(`/api/members/${memberId}/settle?period_id=${period?.id}`, { method: "POST" });
    if (res.ok) {
      const refreshed = await fetch(`/api/dashboard?period_id=${period?.id}`).then(r => r.json());
      setData(refreshed);
    }
    setSettling(null);
  };

  const firstName = profile?.displayName?.split(" ")[0] ?? "คุณ";

  return (
    <div className="min-h-screen pb-28">
      {/* Floating orbs for depth */}
      <div className="fixed pointer-events-none" style={{
        top: "-20vw", right: "-20vw", width: "70vw", height: "70vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
      }} />
      <div className="fixed pointer-events-none" style={{
        bottom: "10vw", left: "-15vw", width: "55vw", height: "55vw",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)",
      }} />

      {/* Header */}
      <div className="glass-header sticky top-0 z-10 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-700" style={{ color: "rgba(255,255,255,0.5)" }}>สวัสดี {firstName} 👋</p>
          <p className="font-900 text-base" style={{ color: "white" }}>Family Tracker</p>
        </div>
        <Link
          href="/settings"
          className="w-10 h-10 flex items-center justify-center rounded-2xl btn-glass"
        >
          <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </Link>
      </div>

      {/* Hero — naked number on gradient, no card */}
      <div className="px-6 pt-10 pb-8 relative">
        {period && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-xs font-700"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {period.name}
          </div>
        )}
        <p className="text-sm font-600 mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>ยอดที่ค้างชำระ</p>
        <p
          className="font-900 glow-number leading-none"
          style={{ fontSize: "clamp(3rem,14vw,4.5rem)", color: "white", letterSpacing: "-0.02em" }}
        >
          ฿{(data?.totalOwed ?? 0).toLocaleString()}
        </p>
        <p className="text-sm font-600 mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
          ใช้ไปทั้งหมด ฿{(data?.totalSpent ?? 0).toLocaleString()} งวดนี้
        </p>
      </div>

      <div className="px-4 flex flex-col gap-4">

        {/* Who owes */}
        {data?.memberDebts && data.memberDebts.length > 0 && (
          <div className="glass p-5">
            <p className="text-xs font-800 uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
              ใครค้างชำระบ้าง
            </p>
            <div className="flex flex-col gap-4">
              {data.memberDebts.map((m, i) => (
                <div key={m.memberId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center text-white font-900 text-sm flex-shrink-0"
                      style={{ background: AVATAR_GRAD[i % AVATAR_GRAD.length], borderRadius: "0.875rem" }}
                    >
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-700 text-white">{m.name}</p>
                      <p className="text-xs font-500" style={{ color: "rgba(255,255,255,0.4)" }}>ค้างชำระ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-900 text-lg" style={{ color: "#F472B6" }}>
                      ฿{m.amount.toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleSettle(m.memberId, m.name)}
                      disabled={settling === m.memberId}
                      className="text-xs font-800 px-3 py-1.5 rounded-xl disabled:opacity-40 transition-opacity"
                      style={{ background: "rgba(52,211,153,0.18)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)" }}
                    >
                      ชำระแล้ว
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent expenses */}
        {data?.recentExpenses && data.recentExpenses.length > 0 && (
          <div className="glass p-5">
            <p className="text-xs font-800 uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
              รายการล่าสุด
            </p>
            <div className="flex flex-col gap-1">
              {data.recentExpenses.map((e) => {
                const catName = e.category?.name ?? "Other";
                const dot = CAT_DOT[catName] ?? "#818CF8";
                const emoji = CAT_EMOJI[catName] ?? "📦";
                return (
                  <Link
                    key={e.id}
                    href={`/expenses/${e.id}/edit`}
                    className="flex items-center justify-between py-3 px-2 rounded-xl transition-all active:opacity-60"
                    style={{ background: "rgba(255,255,255,0)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        {emoji}
                      </div>
                      <div>
                        <p className="font-700 text-sm text-white">{e.description}</p>
                        <p className="text-xs font-500 mt-0.5 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: dot }} />
                          {e.date} · {catName}
                        </p>
                      </div>
                    </div>
                    <p className="font-900 text-sm text-white">฿{Number(e.amount).toLocaleString()}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Category donut */}
        {data?.categoryBreakdown && data.categoryBreakdown.length > 0 && (
          <div className="glass p-5">
            <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
              หมวดหมู่
            </p>
            <CategoryDonut data={data.categoryBreakdown} />
          </div>
        )}

        {/* Trend chart */}
        <div className="glass p-5">
          <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
            แนวโน้ม
          </p>
          <SpendingChart data={[{ month: period?.name?.slice(0, 3) ?? "Now", amount: data?.totalSpent ?? 0 }]} />
        </div>

        {/* Empty state */}
        {data?.recentExpenses?.length === 0 && (
          <div className="text-center py-12">
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl glass"
            >
              🧾
            </div>
            <p className="font-800 text-lg text-white">ยังไม่มีรายการ</p>
            <p className="text-sm font-500 mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>แตะ + เพื่อเพิ่มรายการแรก</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/add"
        className="btn-primary fixed bottom-6 right-5 w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-900"
        style={{ boxShadow: "0 8px 32px rgba(99,102,241,0.5)" }}
      >
        +
      </Link>
    </div>
  );
}
