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
  Other: "#FFE66D",
};

const CATEGORY_BG: Record<string, string> = {
  Groceries: "rgba(0,245,160,0.15)",
  Dining: "rgba(255,107,107,0.12)",
  Utilities: "rgba(167,139,250,0.15)",
  Transport: "rgba(96,165,250,0.15)",
  Other: "rgba(255,230,109,0.15)",
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
    const res = await fetch(`/api/members/${memberId}/settle?period_id=${period?.id}`, { method: "POST" });
    if (res.ok) {
      const refreshed = await fetch(`/api/dashboard?period_id=${period?.id}`).then((r) => r.json());
      setData(refreshed);
    }
    setSettlingMember(null);
  };

  const firstName = profile?.displayName?.split(" ")[0] ?? "Hey";

  return (
    <div className="min-h-screen pb-28" style={{ background: "#FFF8F5" }}>

      {/* Hero Header — coral gradient with big number */}
      <div className="card-hero mx-4 mt-5 px-6 pt-6 pb-8 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20" style={{ background: "white" }} />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10" style={{ background: "white" }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/70 text-sm font-600">สวัสดี {firstName} 👋</p>
              <p className="text-white font-900 text-xl mt-0.5">Family Tracker</p>
            </div>
            <Link
              href="/settings"
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/80 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </Link>
          </div>

          <p className="text-white/70 text-xs font-700 uppercase tracking-widest mb-1">ยอดที่ค้างชำระ</p>
          <p className="text-white font-900 leading-none" style={{ fontSize: "3.5rem" }}>
            ฿{(data?.totalOwed ?? 0).toLocaleString()}
          </p>

          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.2)" }}>
              <p className="text-white/70 text-xs font-700">ใช้ไปทั้งหมด</p>
              <p className="text-white font-800 text-lg">฿{(data?.totalSpent ?? 0).toLocaleString()}</p>
            </div>
            {period && (
              <div className="flex-1 rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.2)" }}>
                <p className="text-white/70 text-xs font-700">งวด</p>
                <p className="text-white font-800 text-base truncate">{period.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4">

        {/* Who owes you */}
        {data?.memberDebts && data.memberDebts.length > 0 && (
          <div className="card-bubble p-5">
            <p className="text-xs font-800 uppercase tracking-widest mb-4" style={{ color: "#9CA3AF" }}>ใครค้างชำระบ้าง</p>
            <div className="flex flex-col gap-3">
              {data.memberDebts.map((m, i) => (
                <div key={m.memberId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 text-sm font-900"
                      style={{
                        background: i % 2 === 0
                          ? "linear-gradient(135deg,#FF6B6B,#FF8E53)"
                          : "linear-gradient(135deg,#A78BFA,#818CF8)",
                        color: "white",
                        borderRadius: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-700 text-[#1A1A2E]">{m.name}</p>
                      <p className="text-xs font-600" style={{ color: "#9CA3AF" }}>ค้างชำระ</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-900 text-lg" style={{ color: "#1A1A2E" }}>฿{m.amount.toLocaleString()}</p>
                    <button
                      onClick={() => handleSettleUp(m.memberId, m.name)}
                      disabled={settlingMember === m.memberId}
                      className="text-xs font-800 px-3 py-1.5 rounded-xl disabled:opacity-40"
                      style={{ background: "rgba(0,245,160,0.15)", color: "#00A86B" }}
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
          <div className="card-bubble p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-800 uppercase tracking-widest" style={{ color: "#9CA3AF" }}>รายการล่าสุด</p>
            </div>
            <div className="flex flex-col gap-1">
              {data.recentExpenses.map((e) => {
                const catName = e.category?.name ?? "Other";
                const dotColor = CATEGORY_COLORS[catName] ?? "#D1D5DB";
                const dotBg = CATEGORY_BG[catName] ?? "rgba(209,213,219,0.2)";
                return (
                  <Link
                    key={e.id}
                    href={`/expenses/${e.id}/edit`}
                    className="flex items-center justify-between py-3 px-1 rounded-xl active:opacity-60 transition-opacity"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: dotBg }}
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: dotColor }} />
                      </div>
                      <div>
                        <p className="font-700 text-sm" style={{ color: "#1A1A2E" }}>{e.description}</p>
                        <p className="text-xs font-500 mt-0.5" style={{ color: "#9CA3AF" }}>
                          {e.date} · {catName}
                        </p>
                      </div>
                    </div>
                    <p className="font-900 text-sm" style={{ color: "#1A1A2E" }}>
                      ฿{Number(e.amount).toLocaleString()}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Category donut */}
        {data?.categoryBreakdown && data.categoryBreakdown.length > 0 && (
          <div className="card-bubble p-5">
            <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>หมวดหมู่</p>
            <CategoryDonut data={data.categoryBreakdown} />
          </div>
        )}

        {/* Monthly chart */}
        <div className="card-bubble p-5">
          <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>แนวโน้ม</p>
          <SpendingChart data={[{ month: period?.name?.slice(0, 3) ?? "Now", amount: data?.totalSpent ?? 0 }]} />
        </div>

        {/* Empty state */}
        {data?.recentExpenses?.length === 0 && (
          <div className="text-center py-12">
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-3xl"
              style={{ background: "rgba(255,107,107,0.1)" }}
            >
              🧾
            </div>
            <p className="font-800 text-lg" style={{ color: "#1A1A2E" }}>ยังไม่มีรายการ</p>
            <p className="text-sm font-500 mt-1" style={{ color: "#9CA3AF" }}>แตะ + เพื่อเพิ่มรายการแรก</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/add"
        className="btn-coral fixed bottom-6 right-5 w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-900"
        style={{ boxShadow: "0 8px 32px rgba(255,107,107,0.45)" }}
      >
        +
      </Link>
    </div>
  );
}
