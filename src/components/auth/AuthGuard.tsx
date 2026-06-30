"use client";

import { useLiff } from "@/contexts/LiffContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === "true";

type Props = { children: React.ReactNode; require?: "admin" | "member" | "any" };

export function AuthGuard({ children, require = "any" }: Props) {
  const { role, isReady } = useLiff();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || IS_DEV) return;
    if (require === "admin" && role !== "admin") router.replace("/");
    if (require === "member" && role === "unregistered") router.replace("/register");
  }, [isReady, role, require, router]);

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

  return <>{children}</>;
}
