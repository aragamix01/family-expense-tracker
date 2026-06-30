"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/contexts/LiffContext";
import type { Member } from "@/lib/database.types";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#FF6B6B,#FF8E53)",
  "linear-gradient(135deg,#A78BFA,#818CF8)",
  "linear-gradient(135deg,#00F5A0,#00D9F5)",
  "linear-gradient(135deg,#60A5FA,#818CF8)",
];

export function RegisterPage() {
  const { profile } = useLiff();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/members").then((r) => r.json()).then(setMembers);
  }, []);

  const handleRegister = async () => {
    if (!selectedId || !profile?.userId) return;
    setSaving(true);
    await fetch(`/api/members/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ line_user_id: profile.userId }),
    });
    setDone(true);
    window.location.reload();
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6" style={{ background: "#FFF8F5" }}>
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", boxShadow: "0 8px 32px rgba(255,107,107,0.3)" }}
        >
          🎉
        </div>
        <p className="text-2xl font-900 mt-2" style={{ color: "#1A1A2E" }}>เข้าสู่ระบบสำเร็จ!</p>
        <p className="font-500" style={{ color: "#9CA3AF" }}>กำลังโหลดแดชบอร์ด...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-5 py-10" style={{ background: "#FFF8F5" }}>
      {/* Top section */}
      <div className="flex-1 flex flex-col justify-center">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-6"
          style={{ background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", boxShadow: "0 6px 24px rgba(255,107,107,0.3)" }}
        >
          👋
        </div>

        <h1 className="font-900 mb-1" style={{ fontSize: "1.75rem", color: "#1A1A2E", lineHeight: 1.2 }}>
          คุณคือใคร?
        </h1>
        <p className="font-500 mb-8 text-base" style={{ color: "#9CA3AF" }}>
          เลือกชื่อของคุณเพื่อดูยอดค้างชำระ
        </p>

        <div className="flex flex-col gap-3">
          {members.map((m, i) => {
            const isSelected = selectedId === m.id;
            const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className="flex items-center gap-4 p-4 text-left transition-all duration-150"
                style={{
                  background: isSelected ? "white" : "white",
                  borderRadius: "1.125rem",
                  border: isSelected ? "2px solid #FF6B6B" : "2px solid rgba(26,26,46,0.06)",
                  boxShadow: isSelected
                    ? "0 4px 20px rgba(255,107,107,0.18)"
                    : "0 2px 8px rgba(26,26,46,0.04)",
                  transform: isSelected ? "scale(1.01)" : "scale(1)",
                }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center font-900 text-sm flex-shrink-0"
                  style={{
                    background: isSelected ? gradient : "rgba(26,26,46,0.06)",
                    color: isSelected ? "white" : "#6B7280",
                    borderRadius: "0.875rem",
                  }}
                >
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-800 text-base" style={{ color: "#1A1A2E" }}>{m.name}</p>
                </div>
                {isSelected && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-800"
                    style={{ background: "#FF6B6B" }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleRegister}
        disabled={!selectedId || saving}
        className="btn-yellow w-full py-4 text-lg font-900 rounded-2xl disabled:opacity-40 mt-8"
        style={{ letterSpacing: "-0.01em" }}
      >
        {saving ? "กำลังบันทึก..." : "นี่คือฉัน ✓"}
      </button>
    </div>
  );
}
