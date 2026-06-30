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
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FFF8F5" }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-3xl animate-bounce"
            style={{ background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", boxShadow: "0 6px 24px rgba(255,107,107,0.3)" }}
          />
          <p className="font-700 text-sm" style={{ color: "#9CA3AF" }}>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
