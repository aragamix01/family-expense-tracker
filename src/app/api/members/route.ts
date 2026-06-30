import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase-server";

export async function GET() {
  const db = getServerClient();
  const { data, error } = await db.from("members").select("*").order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const db = getServerClient();
  const { data, error } = await db.from("members").insert({ name }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
