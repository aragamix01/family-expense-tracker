"use client";

import { LiffProvider } from "@/contexts/LiffContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Member, Expense, Category, ExpenseSplit } from "@/lib/database.types";

type FullSplit = ExpenseSplit & { expense: (Expense & { category?: Category }) | null };

type PageData = {
  splits: FullSplit[];
  totalOwed: number;
  page: number;
  totalPages: number;
  total: number;
};

const CAT_COLOR: Record<string, string> = {
  Groceries: "#22C55E", Dining: "#FF6B6B", Utilities: "#8B5CF6",
  Transport: "#4F9EFF", Other: "#FFD166",
};
const CAT_EMOJI: Record<string, string> = {
  Groceries: "🛒", Dining: "🍽️", Utilities: "💡", Transport: "🚗", Other: "📦",
};

function MemberDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { period } = useActivePeriod();
  const [memberId, setMemberId] = useState<string>("");
  const [member, setMember] = useState<Member | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Resolve params
  useEffect(() => {
    params.then(({ id }) => {
      setMemberId(id);
      fetch(`/api/members/${id}`)
        .then(r => r.json())
        .then(setMember)
        .catch(console.error);
    });
  }, [params]);

  // Load page data whenever member, period, or page changes
  useEffect(() => {
    if (!memberId || !period) return;
    setLoading(true);
    const url = `/api/members/${memberId}/expenses?period_id=${period.id}&page=${page}`;
    fetch(url)
      .then(r => r.json())
      .then(setPageData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [memberId, period, page]);

  const initials = member?.name?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <AuthGuard require="admin">
      <div className="min-h-screen" style={{ background: "#EFEFEF" }}>
        {/* Header */}
        <div className="app-header sticky top-0 z-10 px-4 py-3.5 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center font-700 text-base btn-ghost rounded-2xl active:opacity-60"
            style={{ color: "#111" }}
          >
            ←
          </Link>
          <h1 className="font-900 text-base" style={{ color: "#111" }}>
            {member?.name ?? "โหลด..."}
          </h1>
        </div>

        <div className="px-4 pt-4 flex flex-col gap-3 pb-10">
          {/* Member hero */}
          <div
            className="rounded-2xl px-5 pt-5 pb-6"
            style={{ background: "#111", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
          >
            <div className="flex items-center gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-900 text-lg text-white flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                {initials}
              </div>
              <div>
                <p className="font-900 text-xl text-white">{member?.name}</p>
                <p className="text-xs font-600 mt-0.5" style={{ color: member?.line_user_id ? "#C8FF00" : "rgba(255,255,255,0.4)" }}>
                  {member?.line_user_id ? "LINE linked ✓" : "ยังไม่ได้เชื่อม LINE"}
                </p>
              </div>
            </div>
            <div className="divider" style={{ background: "rgba(255,255,255,0.1)" }} />
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-xs font-700 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                  ค้างชำระงวดนี้
                </p>
                <p
                  className="font-900 leading-none mt-1"
                  style={{ fontSize: "2.25rem", color: "#C8FF00", letterSpacing: "-0.03em" }}
                >
                  ฿{(pageData?.totalOwed ?? 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-700 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
                  รายการทั้งหมด
                </p>
                <p className="font-900 text-2xl text-white mt-1">{pageData?.total ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Expense list */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-800 uppercase tracking-widest" style={{ color: "#999" }}>รายการค้างชำระ</p>
              {pageData && pageData.totalPages > 1 && (
                <p className="text-xs font-700" style={{ color: "#999" }}>
                  หน้า {pageData.page} / {pageData.totalPages}
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 rounded-xl animate-bounce" style={{ background: "#111" }} />
              </div>
            ) : pageData?.splits.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-700 text-sm" style={{ color: "#999" }}>ไม่มีรายการในงวดนี้</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {pageData?.splits.map((s, i) => {
                  const catName = s.expense?.category?.name ?? "Other";
                  const dot = CAT_COLOR[catName] ?? "#999";
                  const emoji = CAT_EMOJI[catName] ?? "📦";
                  return (
                    <div key={s.id}>
                      {i > 0 && <div className="divider my-3" />}
                      <Link
                        href={`/expenses/${s.expense_id}/edit`}
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
                            <p className="font-700 text-sm" style={{ color: "#111" }}>
                              {s.expense?.description}
                            </p>
                            <p className="text-xs font-500 mt-0.5 flex items-center gap-1.5" style={{ color: "#999" }}>
                              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: dot }} />
                              {s.expense?.date} · {catName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-900 text-sm" style={{ color: "#111" }}>
                            ฿{Number(s.amount).toLocaleString()}
                          </p>
                          <p className="text-xs font-500 mt-0.5" style={{ color: "#999" }}>
                            จาก ฿{Number(s.expense?.amount).toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pageData && pageData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid #F0F0F0" }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost px-4 py-2 text-sm font-800 rounded-xl disabled:opacity-30"
                >
                  ← ก่อนหน้า
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pageData.totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="w-8 h-8 rounded-lg text-xs font-800 transition-all"
                      style={{
                        background: p === page ? "#111" : "#F5F5F5",
                        color: p === page ? "white" : "#555",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(pageData.totalPages, p + 1))}
                  disabled={page === pageData.totalPages}
                  className="btn-ghost px-4 py-2 text-sm font-800 rounded-xl disabled:opacity-30"
                >
                  ถัดไป →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <LiffProvider>
      <MemberDetailContent params={params} />
    </LiffProvider>
  );
}
