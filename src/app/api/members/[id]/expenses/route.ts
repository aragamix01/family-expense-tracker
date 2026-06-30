import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

const PAGE_SIZE = 10;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const periodId = req.nextUrl.searchParams.get("period_id");
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1", 10);
  const offset = (page - 1) * PAGE_SIZE;

  const db = getServerClient();

  // Base query — all splits for this member
  let splitsQuery = db
    .from("expense_splits")
    .select("*, expense:expenses(*, category:categories(*))", { count: "exact" })
    .eq("member_id", id)
    .order("created_at", { referencedTable: "expenses", ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  // Filter by period if provided
  if (periodId) {
    splitsQuery = splitsQuery.eq("expense.period_id", periodId);
  }

  const { data: splits, count, error } = await splitsQuery;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const validSplits = (splits ?? []).filter((s) => s.expense !== null);
  const totalOwed = validSplits.reduce((sum, s) => sum + Number(s.amount), 0);

  return NextResponse.json({
    splits: validSplits,
    totalOwed,
    page,
    pageSize: PAGE_SIZE,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  });
}
