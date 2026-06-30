"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ExpenseForm } from "@/components/expense/ExpenseForm";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Expense, ExpenseSplit, Member, Category } from "@/lib/database.types";

type FullExpense = Expense & { splits?: (ExpenseSplit & { member?: Member })[]; category?: Category };

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [expense, setExpense] = useState<FullExpense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/expenses?period_id=all`)
        .then(() => fetch(`/api/expenses/by-id/${id}`))
        .catch(() => null);
    });
  }, [params]);

  useEffect(() => {
    if (!id) return;
    // Load expense list from active period to find this expense
    fetch("/api/periods")
      .then((r) => r.json())
      .then(async (periods) => {
        for (const period of periods) {
          const res = await fetch(`/api/expenses?period_id=${period.id}`);
          const expenses: FullExpense[] = await res.json();
          const found = expenses.find((e) => e.id === id);
          if (found) { setExpense(found); break; }
        }
      });
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this expense?")) return;
    setDeleting(true);
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  return (
    <AuthGuard require="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center text-lg">←</Link>
            <h1 className="text-lg font-extrabold text-gray-900">Edit Expense</h1>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
        {expense ? (
          <ExpenseForm periodId={expense.period_id} expense={expense} />
        ) : (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full bg-[#FF6B6B] animate-bounce" />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
