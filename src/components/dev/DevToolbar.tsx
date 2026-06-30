"use client";

import { useLiff, type Role } from "@/contexts/LiffContext";
import { useRouter } from "next/navigation";

const ROLES: { role: Role; label: string; emoji: string }[] = [
  { role: "admin",        label: "Admin",        emoji: "👑" },
  { role: "member",       label: "Member",       emoji: "👤" },
  { role: "unregistered", label: "Unregistered", emoji: "❓" },
];

export function DevToolbar() {
  const { role, setDevRole } = useLiff();
  const router = useRouter();

  if (!setDevRole) return null; // Production — render nothing

  const handleSwitch = (newRole: Role) => {
    setDevRole(newRole);
    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="fixed bottom-24 left-1/2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-2xl"
      style={{
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <span className="text-xs font-800 px-2 mr-1" style={{ color: "rgba(255,255,255,0.35)" }}>
        DEV
      </span>
      {ROLES.map(r => {
        const isActive = role === r.role;
        return (
          <button
            key={r.role}
            onClick={() => handleSwitch(r.role)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-800 transition-all duration-150"
            style={{
              background: isActive ? "rgba(129,140,248,0.35)" : "transparent",
              color: isActive ? "#818CF8" : "rgba(255,255,255,0.45)",
              border: isActive ? "1px solid rgba(129,140,248,0.4)" : "1px solid transparent",
            }}
          >
            <span>{r.emoji}</span>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
