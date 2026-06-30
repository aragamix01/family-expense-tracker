import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { description, amount, category_id, date, splits } = body;

  const db = getServerClient();

  const { error: updateError } = await db
    .from("expenses")
    .update({ description, amount, category_id, date })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // Replace splits
  await db.from("expense_splits").delete().eq("expense_id", id);

  const splitRows = splits.map((s: { member_id: string; amount: number }) => ({
    expense_id: id,
    member_id: s.member_id,
    amount: s.amount,
  }));

  const { error: splitError } = await db.from("expense_splits").insert(splitRows);
  if (splitError) return NextResponse.json({ error: splitError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getServerClient();
  const { error } = await db.from("expenses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
