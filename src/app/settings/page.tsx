"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { LiffProvider } from "@/contexts/LiffContext";
import { MembersSettings } from "@/components/settings/MembersSettings";
import { CategoriesSettings } from "@/components/settings/CategoriesSettings";
import { PeriodsSettings } from "@/components/settings/PeriodsSettings";
import Link from "next/link";
import { useState } from "react";

type Tab = "members" | "categories" | "periods";
const TAB_LABELS: Record<Tab, string> = { members: "สมาชิก", categories: "หมวดหมู่", periods: "งวด" };

function SettingsContent() {
  const [tab, setTab] = useState<Tab>("members");

  return (
    <AuthGuard require="admin">
      <div className="min-h-screen">
        <div className="glass-header sticky top-0 z-10 px-4 py-4 flex items-center gap-3">
          <Link href="/" className="w-9 h-9 flex items-center justify-center font-700 text-base text-white btn-glass rounded-2xl active:opacity-60">
            ←
          </Link>
          <h1 className="font-900 text-lg text-white">ตั้งค่า</h1>
        </div>

        <div className="flex gap-2 px-4 py-4">
          {(["members", "categories", "periods"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-sm font-800 transition-all duration-150 rounded-2xl"
              style={{
                background: tab === t ? "linear-gradient(135deg,#6366F1,#818CF8)" : "rgba(255,255,255,0.07)",
                color: tab === t ? "white" : "rgba(255,255,255,0.45)",
                boxShadow: tab === t ? "0 4px 16px rgba(99,102,241,0.4)" : "none",
                border: tab === t ? "none" : "1.5px solid rgba(255,255,255,0.08)",
              }}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <div className="px-4 pb-10">
          {tab === "members" && <MembersSettings />}
          {tab === "categories" && <CategoriesSettings />}
          {tab === "periods" && <PeriodsSettings />}
        </div>
      </div>
    </AuthGuard>
  );
}

export default function SettingsPage() {
  return <LiffProvider><SettingsContent /></LiffProvider>;
}
