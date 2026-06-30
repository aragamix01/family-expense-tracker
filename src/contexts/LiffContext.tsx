"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type Liff from "@line/liff";

type LiffProfile = {
  userId: string;
  displayName: string;
  pictureUrl?: string;
};

export type Role = "admin" | "member" | "unregistered" | "loading";

type LiffContextValue = {
  liff: typeof Liff | null;
  profile: LiffProfile | null;
  role: Role;
  isReady: boolean;
  // Dev mode only — no-op in production
  setDevRole?: (role: Role) => void;
};

const LiffContext = createContext<LiffContextValue>({
  liff: null,
  profile: null,
  role: "loading",
  isReady: false,
});

const IS_DEV = process.env.NEXT_PUBLIC_DEV_MODE === "true";

const DEV_PROFILE: LiffProfile = {
  userId: "dev-user-id",
  displayName: "Dev User",
};

export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [liff, setLiff] = useState<typeof Liff | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [role, setRole] = useState<Role>("loading");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (IS_DEV) {
      // Skip LIFF init entirely — start as admin in dev mode
      const stored = localStorage.getItem("dev_role") as Role | null;
      setProfile(DEV_PROFILE);
      setRole(stored ?? "admin");
      setIsReady(true);
      return;
    }

    const init = async () => {
      const liffModule = (await import("@line/liff")).default;
      await liffModule.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

      if (!liffModule.isLoggedIn()) {
        liffModule.login();
        return;
      }

      const p = await liffModule.getProfile();
      const lineProfile: LiffProfile = {
        userId: p.userId,
        displayName: p.displayName,
        pictureUrl: p.pictureUrl,
      };

      setLiff(liffModule);
      setProfile(lineProfile);

      const adminId = process.env.NEXT_PUBLIC_ADMIN_LINE_USER_ID;
      if (p.userId === adminId) {
        setRole("admin");
      } else {
        const res = await fetch(`/api/members/by-line-id/${p.userId}`);
        setRole(res.ok ? "member" : "unregistered");
      }

      setIsReady(true);
    };

    init().catch(console.error);
  }, []);

  const setDevRole = IS_DEV
    ? (newRole: Role) => {
        localStorage.setItem("dev_role", newRole);
        setRole(newRole);
      }
    : undefined;

  return (
    <LiffContext.Provider value={{ liff, profile, role, isReady, setDevRole }}>
      {children}
    </LiffContext.Provider>
  );
}

export const useLiff = () => useContext(LiffContext);
