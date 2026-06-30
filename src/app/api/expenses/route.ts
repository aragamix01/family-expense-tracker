import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const periodId = req.nextUrl.searchParams.get("period_id");
  if (!periodId) return NextResponse.json({ error: "period_id required" }, { status: 400 });

  const db = getServerClient();
  const { data, error } = await db
    .from("expenses")
    .select("*, category:categories(*), splits:expense_splits(*, member:members(*))")
    .eq("period_id", periodId)
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { description, amount, category_id, date, period_id, splits } = body;

  if (!description || !amount || !category_id || !period_id || !splits?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = getServerClient();

  const { data: expense, error: expenseError } = await db
    .from("expenses")
    .insert({ description, amount, category_id, date, period_id })
    .select()
    .single();

  if (expenseError) return NextResponse.json({ error: expenseError.message }, { status: 500 });

  const splitRows = splits.map((s: { member_id: string; amount: number }) => ({
    expense_id: expense.id,
    member_id: s.member_id,
    amount: s.amount,
  }));

  const { error: splitError } = await db.from("expense_splits").insert(splitRows);
  if (splitError) return NextResponse.json({ error: splitError.message }, { status: 500 });

  return NextResponse.json(expense, { status: 201 });
}
