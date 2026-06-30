"use client";

import { LiffProvider, useLiff } from "@/contexts/LiffContext";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { MemberDashboard } from "@/components/dashboard/MemberDashboard";
import { RegisterPage } from "@/components/auth/RegisterPage";
import { DevToolbar } from "@/components/dev/DevToolbar";

function AppRouter() {
  const { role, isReady } = useLiff();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-3xl animate-bounce"
            style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", boxShadow: "0 6px 24px rgba(99,102,241,0.4)" }}
          />
          <p className="font-700 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {role === "admin" && <AdminDashboard />}
      {role === "member" && <MemberDashboard />}
      {role === "unregistered" && <RegisterPage />}
      <DevToolbar />
    </>
  );
}

export default function HomePage() {
  return (
    <LiffProvider>
      <AppRouter />
    </LiffProvider>
  );
}
