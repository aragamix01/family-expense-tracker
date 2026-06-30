import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getServerClient();

  const { data, error } = await db
    .from("periods")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
