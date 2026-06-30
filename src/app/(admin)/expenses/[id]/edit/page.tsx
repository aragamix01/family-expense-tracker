"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { ExpenseForm } from "@/components/expense/ExpenseForm";
import { LiffProvider } from "@/contexts/LiffContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Expense, ExpenseSplit, Member, Category } from "@/lib/database.types";

type FullExpense = Expense & { splits?: (ExpenseSplit & { member?: Member })[]; category?: Category };

function EditExpenseContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [expense, setExpense] = useState<FullExpense | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/expenses/${id}`).then(r => r.json()).then(setExpense).catch(console.error);
    });
  }, [params]);

  const handleDelete = async () => {
    if (!confirm("ลบรายการนี้?")) return;
    setDeleting(true);
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  return (
    <AuthGuard require="admin">
      <div className="min-h-screen" style={{ background: "#EFEFEF" }}>
        <div className="app-header sticky top-0 z-10 px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-9 h-9 flex items-center justify-center font-700 text-base btn-ghost rounded-2xl active:opacity-60" style={{ color: "#111" }}>
              ←
            </Link>
            <h1 className="font-900 text-base" style={{ color: "#111" }}>แก้ไขรายจ่าย</h1>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-800 px-3 py-1.5 rounded-xl disabled:opacity-40"
            style={{ background: "#FEE2E2", color: "#EF4444", border: "1px solid #FECACA" }}
          >
            {deleting ? "กำลังลบ..." : "ลบ"}
          </button>
        </div>
        {expense ? (
          <ExpenseForm periodId={expense.period_id} expense={expense} />
        ) : (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-2xl animate-bounce" style={{ background: "#111" }} />
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  return <LiffProvider><EditExpenseContent params={params} /></LiffProvider>;
}
