"use client";

import { useLiff } from "@/contexts/LiffContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  require?: "admin" | "member" | "any";
};

export function AuthGuard({ children, require = "any" }: Props) {
  const { role, isReady } = useLiff();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (require === "admin" && role !== "admin") {
      router.replace("/");
    }
    if (require === "member" && role === "unregistered") {
      router.replace("/register");
    }
  }, [isReady, role, require, router]);

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

  return <>{children}</>;
}
