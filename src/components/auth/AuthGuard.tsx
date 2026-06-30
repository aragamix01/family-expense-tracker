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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FF6B6B] animate-bounce" />
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
