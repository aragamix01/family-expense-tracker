"use client";

import { LiffProvider } from "@/contexts/LiffContext";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { MemberDashboard } from "@/components/dashboard/MemberDashboard";
import { RegisterPage } from "@/components/auth/RegisterPage";
import { useLiff } from "@/contexts/LiffContext";

function AppRouter() {
  const { role, isReady } = useLiff();

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FF6B6B] animate-bounce" />
          <p className="text-gray-400 font-semibold text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (role === "admin") return <AdminDashboard />;
  if (role === "member") return <MemberDashboard />;
  return <RegisterPage />;
}

export default function HomePage() {
  return (
    <LiffProvider>
      <AppRouter />
    </LiffProvider>
  );
}
