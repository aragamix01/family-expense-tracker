import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lineUserId: string }> }
) {
  const { lineUserId } = await params;
  const periodId = req.nextUrl.searchParams.get("period_id");
  if (!periodId) return NextResponse.json({ error: "period_id required" }, { status: 400 });

  const db = getServerClient();

  // Find member by LINE user ID
  const { data: member, error: memberError } = await db
    .from("members")
    .select("*")
    .eq("line_user_id", lineUserId)
    .single();

  if (memberError || !member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

  // Get all splits for this member in this period
  const { data: splits, error: splitError } = await db
    .from("expense_splits")
    .select("*, expense:expenses(*, category:categories(*))")
    .eq("member_id", member.id)
    .eq("expense.period_id", periodId);

  if (splitError) return NextResponse.json({ error: splitError.message }, { status: 500 });

  const validSplits = splits.filter((s) => s.expense !== null);
  const totalOwed = validSplits.reduce((sum, s) => sum + Number(s.amount), 0);

  return NextResponse.json({
    member,
    totalOwed,
    splits: validSplits,
  });
}
