import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const periodId = req.nextUrl.searchParams.get("period_id");
  if (!periodId) return NextResponse.json({ error: "period_id required" }, { status: 400 });

  const db = getServerClient();

  // All expenses with splits for this period
  const { data: expenses, error } = await db
    .from("expenses")
    .select("*, category:categories(*), splits:expense_splits(*, member:members(*))")
    .eq("period_id", periodId)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Total spent this period
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Per-member debt (sum of their splits)
  const memberDebt: Record<string, { memberId: string; name: string; amount: number }> = {};
  for (const expense of expenses) {
    for (const split of expense.splits ?? []) {
      const memberId = split.member_id;
      if (!memberDebt[memberId]) {
        memberDebt[memberId] = {
          memberId,
          name: split.member?.name ?? "Unknown",
          amount: 0,
        };
      }
      memberDebt[memberId].amount += Number(split.amount);
    }
  }

  // Per-category breakdown
  const categoryBreakdown: Record<string, { categoryId: string; name: string; amount: number }> = {};
  for (const expense of expenses) {
    const catId = expense.category_id;
    if (!categoryBreakdown[catId]) {
      categoryBreakdown[catId] = {
        categoryId: catId,
        name: expense.category?.name ?? "Other",
        amount: 0,
      };
    }
    categoryBreakdown[catId].amount += Number(expense.amount);
  }

  return NextResponse.json({
    totalSpent,
    totalOwed: Object.values(memberDebt).reduce((s, m) => s + m.amount, 0),
    memberDebts: Object.values(memberDebt).sort((a, b) => b.amount - a.amount),
    categoryBreakdown: Object.values(categoryBreakdown).sort((a, b) => b.amount - a.amount),
    recentExpenses: expenses.slice(0, 10),
  });
}
