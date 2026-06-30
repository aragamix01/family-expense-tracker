"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { LiffProvider } from "@/contexts/LiffContext";
import { MembersSettings } from "@/components/settings/MembersSettings";
import { CategoriesSettings } from "@/components/settings/CategoriesSettings";
import { PeriodsSettings } from "@/components/settings/PeriodsSettings";
import Link from "next/link";
import { useState } from "react";

type Tab = "members" | "categories" | "periods";

const TAB_LABELS: Record<Tab, string> = {
  members: "สมาชิก",
  categories: "หมวดหมู่",
  periods: "งวด",
};

function SettingsContent() {
  const [tab, setTab] = useState<Tab>("members");

  return (
    <AuthGuard require="admin">
      <div className="min-h-screen" style={{ background: "#FFF8F5" }}>
        <div
          className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3"
          style={{ background: "rgba(255,248,245,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(26,26,46,0.06)" }}
        >
          <Link
            href="/"
            className="w-9 h-9 flex items-center justify-center font-700 text-base transition-opacity active:opacity-60"
            style={{ background: "white", borderRadius: "0.875rem", boxShadow: "0 2px 8px rgba(26,26,46,0.08)", color: "#1A1A2E" }}
          >
            ←
          </Link>
          <h1 className="font-900 text-lg" style={{ color: "#1A1A2E" }}>ตั้งค่า</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-4">
          {(["members", "categories", "periods"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-sm font-800 transition-all duration-150"
              style={{
                borderRadius: "0.875rem",
                background: tab === t
                  ? "linear-gradient(135deg,#FF6B6B,#FF8E53)"
                  : "white",
                color: tab === t ? "white" : "#9CA3AF",
                boxShadow: tab === t
                  ? "0 4px 16px rgba(255,107,107,0.3)"
                  : "0 2px 8px rgba(26,26,46,0.04)",
                border: tab === t ? "none" : "1.5px solid rgba(26,26,46,0.06)",
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
  return (
    <LiffProvider>
      <SettingsContent />
    </LiffProvider>
  );
}
