"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ExpenseForm } from "@/components/expense/ExpenseForm";
import { useActivePeriod } from "@/hooks/useActivePeriod";
import { LiffProvider } from "@/contexts/LiffContext";
import Link from "next/link";

function AddExpenseContent() {
  const { period, loading } = useActivePeriod();

  return (
    <AuthGuard require="admin">
      <div className="min-h-screen" style={{ background: "#FFF8F5" }}>
        <div
          className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3"
          style={{ background: "rgba(255,248,245,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(26,26,46,0.06)" }}
        >
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center font-700 text-base transition-opacity active:opacity-60"
            style={{ background: "white", borderRadius: "0.875rem", boxShadow: "0 2px 8px rgba(26,26,46,0.08)", color: "#1A1A2E" }}
          >
            ←
          </Link>
          <h1 className="font-900 text-lg" style={{ color: "#1A1A2E" }}>เพิ่มรายจ่าย</h1>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full animate-bounce" style={{ background: "linear-gradient(135deg,#FF6B6B,#FF8E53)" }} />
          </div>
        ) : period ? (
          <ExpenseForm periodId={period.id} />
        ) : (
          <p className="text-center py-20 font-600" style={{ color: "#9CA3AF" }}>ยังไม่มีงวดที่เปิดอยู่ กรุณาสร้างในหน้าตั้งค่า</p>
        )}
      </div>
    </AuthGuard>
  );
}

export default function AddExpensePage() {
  return (
    <LiffProvider>
      <AddExpenseContent />
    </LiffProvider>
  );
}
