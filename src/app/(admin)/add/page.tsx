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
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center text-lg">
            ←
          </Link>
          <h1 className="text-lg font-extrabold text-gray-900">Add Expense</h1>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full bg-[#FF6B6B] animate-bounce" />
          </div>
        ) : period ? (
          <ExpenseForm periodId={period.id} />
        ) : (
          <p className="text-center py-20 text-gray-400">No active period. Create one in Settings.</p>
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
