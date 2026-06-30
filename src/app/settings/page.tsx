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
      <div className="min-h-screen" style={{ background: "#EFEFEF" }}>
        <div className="app-header sticky top-0 z-10 px-4 py-3.5 flex items-center gap-3">
          <Link href="/" className="w-9 h-9 flex items-center justify-center font-700 text-base btn-ghost rounded-2xl active:opacity-60" style={{ color: "#111" }}>
            ←
          </Link>
          <h1 className="font-900 text-base" style={{ color: "#111" }}>ตั้งค่า</h1>
        </div>

        <div className="flex gap-2 px-4 py-3">
          {(["members", "categories", "periods"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-sm font-800 rounded-2xl transition-all duration-100"
              style={{
                background: tab === t ? "#111" : "#F5F5F5",
                color: tab === t ? "white" : "#555",
                border: tab === t ? "none" : "1px solid #E2E2E2",
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
