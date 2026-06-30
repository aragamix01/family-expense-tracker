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

  if (!setDevRole) return null;

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
        background: "#111",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <span className="text-xs font-800 px-2 mr-1" style={{ color: "rgba(255,255,255,0.3)" }}>DEV</span>
      {ROLES.map(r => {
        const isActive = role === r.role;
        return (
          <button
            key={r.role}
            onClick={() => handleSwitch(r.role)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-800 transition-all duration-100"
            style={{
              background: isActive ? "#C8FF00" : "transparent",
              color: isActive ? "#111" : "rgba(255,255,255,0.4)",
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
