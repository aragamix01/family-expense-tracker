"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { LiffProvider } from "@/contexts/LiffContext";
import { MembersSettings } from "@/components/settings/MembersSettings";
import { CategoriesSettings } from "@/components/settings/CategoriesSettings";
import { PeriodsSettings } from "@/components/settings/PeriodsSettings";
import Link from "next/link";
import { useState } from "react";

type Tab = "members" | "categories" | "periods";

function SettingsContent() {
  const [tab, setTab] = useState<Tab>("members");

  return (
    <AuthGuard require="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
          <Link href="/" className="w-9 h-9 rounded-2xl bg-gray-100 flex items-center justify-center text-lg">←</Link>
          <h1 className="text-lg font-extrabold text-gray-900">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-4">
          {(["members", "categories", "periods"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-bold capitalize transition-all ${
                tab === t ? "bg-[#FF6B6B] text-white shadow-md" : "bg-white text-gray-500 border border-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-4">
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
