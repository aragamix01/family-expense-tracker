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
      <div className="min-h-screen">
        <div className="glass-header sticky top-0 z-10 px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center font-700 text-base text-white transition-opacity active:opacity-60 btn-glass rounded-2xl"
          >
            ←
          </Link>
          <h1 className="font-900 text-lg text-white">เพิ่มรายจ่าย</h1>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-2xl animate-bounce" style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)" }} />
          </div>
        ) : period ? (
          <ExpenseForm periodId={period.id} />
        ) : (
          <p className="text-center py-20 font-600" style={{ color: "rgba(255,255,255,0.4)" }}>
            ยังไม่มีงวดที่เปิดอยู่ กรุณาสร้างในหน้าตั้งค่า
          </p>
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
