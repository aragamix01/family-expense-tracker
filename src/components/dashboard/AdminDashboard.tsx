"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const CAT_COLOR: Record<string, string> = {
  Groceries: "#22C55E", Dining: "#EF4444", Utilities: "#8B5CF6",
  Transport: "#3B82F6", Other: "#F59E0B",
};
const CAT_EMOJI: Record<string, string> = {
  Groceries: "🛒", Dining: "🍽️", Utilities: "💡", Transport: "🚗", Other: "📦",
};

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

  const router = useRouter();
  const firstName = profile?.displayName?.split(" ")[0] ?? "คุณ";

  return (
    <div className="min-h-screen pb-28" style={{ background: "#EFEFEF" }}>

      {/* Header */}
      <div className="app-header sticky top-0 z-10 px-5 py-3.5 flex items-center justify-between">
        <div>
          <p className="text-xs font-600" style={{ color: "#999" }}>สวัสดี {firstName} 👋</p>
          <p className="font-900 text-sm" style={{ color: "#111" }}>Family Tracker</p>
        </div>
        <Link
          href="/settings"
          className="w-9 h-9 flex items-center justify-center rounded-2xl btn-ghost"
        >
          <svg width="15" height="15" fill="none" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </Link>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* Hero — black card, lime total */}
        <div
          className="rounded-2xl px-5 pt-5 pb-6"
          style={{ background: "#111111", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-700 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                ยอดที่ค้างชำระ
              </p>
              <p
                className="font-900 leading-none mt-1"
                style={{ fontSize: "clamp(2.5rem,12vw,3.75rem)", color: "#C8FF00", letterSpacing: "-0.03em" }}
              >
                ฿{(data?.totalOwed ?? 0).toLocaleString()}
              </p>
            </div>
            {period && (
              <span className="pill-lime mt-1">{period.name}</span>
            )}
          </div>
          <div className="divider" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center justify-between mt-4">
            <div>
              <p className="text-xs font-600" style={{ color: "rgba(255,255,255,0.4)" }}>ใช้ไปทั้งหมด</p>
              <p className="font-800 text-lg" style={{ color: "white" }}>฿{(data?.totalSpent ?? 0).toLocaleString()}</p>
            </div>
            <Link
              href="/add"
              className="btn-lime px-5 py-2.5 text-sm font-800 rounded-2xl"
            >
              + เพิ่มรายจ่าย
            </Link>
          </div>
        </div>

        {/* Who owes */}
        {data?.memberDebts && data.memberDebts.length > 0 && (
          <div className="card p-4">
            <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#999" }}>
              ใครค้างชำระบ้าง
            </p>
            <div className="flex flex-col">
              {data.memberDebts.map((m, i) => (
                <div key={m.memberId}>
                  {i > 0 && <div className="divider my-3" />}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/members/${m.memberId}`}
                      className="flex items-center gap-3 flex-1 active:opacity-60"
                    >
                      <div className="avatar w-9 h-9 text-sm font-900" style={{ borderRadius: "0.625rem" }}>
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-700 text-sm" style={{ color: "#111" }}>{m.name}</p>
                        <p className="text-xs font-500" style={{ color: "#999" }}>
                          ฿{m.amount.toLocaleString()} · ดูรายละเอียด →
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleSettle(m.memberId, m.name)}
                      disabled={settling === m.memberId}
                      className="pill-lime disabled:opacity-40 ml-2"
                      style={{ cursor: "pointer" }}
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
          <div className="card p-4">
            <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#999" }}>
              รายการล่าสุด
            </p>
            <div className="flex flex-col">
              {data.recentExpenses.map((e, i) => {
                const catName = e.category?.name ?? "Other";
                const dot = CAT_COLOR[catName] ?? "#999";
                const emoji = CAT_EMOJI[catName] ?? "📦";
                return (
                  <div key={e.id}>
                    {i > 0 && <div className="divider my-3" />}
                    <Link
                      href={`/expenses/${e.id}/edit`}
                      className="flex items-center justify-between active:opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                          style={{ background: "#F5F5F5" }}
                        >
                          {emoji}
                        </div>
                        <div>
                          <p className="font-700 text-sm" style={{ color: "#111" }}>{e.description}</p>
                          <p className="text-xs font-500 mt-0.5 flex items-center gap-1.5" style={{ color: "#999" }}>
                            <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: dot }} />
                            {e.date} · {catName}
                          </p>
                        </div>
                      </div>
                      <p className="font-900 text-sm" style={{ color: "#111" }}>฿{Number(e.amount).toLocaleString()}</p>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category donut */}
        {data?.categoryBreakdown && data.categoryBreakdown.length > 0 && (
          <div className="card p-4">
            <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#999" }}>หมวดหมู่</p>
            <CategoryDonut data={data.categoryBreakdown} />
          </div>
        )}

        {/* Trend chart — extra bottom padding so Y-axis numbers show */}
        <div className="card p-4 mb-4">
          <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#999" }}>แนวโน้ม</p>
          <SpendingChart data={[{ month: period?.name?.slice(0, 3) ?? "Now", amount: data?.totalSpent ?? 0 }]} />
        </div>

        {/* Empty state */}
        {data?.recentExpenses?.length === 0 && (
          <div className="card p-10 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl" style={{ background: "#F5F5F5" }}>
              🧾
            </div>
            <p className="font-800 text-base" style={{ color: "#111" }}>ยังไม่มีรายการ</p>
            <p className="text-sm font-500 mt-1" style={{ color: "#999" }}>แตะ + เพื่อเพิ่มรายการแรก</p>
          </div>
        )}
      </div>
    </div>
  );
}
