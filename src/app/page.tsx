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
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#EFEFEF" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl animate-bounce" style={{ background: "#111" }} />
          <p className="text-xs font-700" style={{ color: "#999" }}>กำลังโหลด...</p>
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
