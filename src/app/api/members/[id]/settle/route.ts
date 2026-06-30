import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const periodId = req.nextUrl.searchParams.get("period_id");
  if (!periodId) return NextResponse.json({ error: "period_id required" }, { status: 400 });

  const db = getServerClient();

  // Get all expense IDs in this period
  const { data: expenses } = await db
    .from("expenses")
    .select("id")
    .eq("period_id", periodId);

  if (!expenses?.length) return NextResponse.json({ success: true });

  const expenseIds = expenses.map((e: { id: string }) => e.id);

  // Delete all splits for this member in those expenses
  const { error } = await db
    .from("expense_splits")
    .delete()
    .eq("member_id", id)
    .in("expense_id", expenseIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
