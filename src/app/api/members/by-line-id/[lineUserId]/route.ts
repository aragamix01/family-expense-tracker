import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lineUserId: string }> }
) {
  const { lineUserId } = await params;
  const db = getServerClient();
  const { data, error } = await db
    .from("members")
    .select("*")
    .eq("line_user_id", lineUserId)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
