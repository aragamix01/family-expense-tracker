"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/contexts/LiffContext";
import type { Member } from "@/lib/database.types";

const AVATAR_GRAD = [
  "linear-gradient(135deg,#6366F1,#A78BFA)",
  "linear-gradient(135deg,#3B82F6,#60A5FA)",
  "linear-gradient(135deg,#EC4899,#F472B6)",
  "linear-gradient(135deg,#10B981,#34D399)",
];

export function RegisterPage() {
  const { profile } = useLiff();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/members").then(r => r.json()).then(setMembers);
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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}
        >
          🎉
        </div>
        <p className="text-2xl font-900 text-white mt-2">เข้าสู่ระบบสำเร็จ!</p>
        <p className="font-500" style={{ color: "rgba(255,255,255,0.5)" }}>กำลังโหลดแดชบอร์ด...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-5 py-12">
      {/* Orb decoration */}
      <div className="fixed pointer-events-none" style={{
        top: "-20vw", right: "-20vw", width: "70vw", height: "70vw",
        borderRadius: "50%",
        background: "radial-gradient(circle,rgba(99,102,241,0.35) 0%,transparent 70%)",
      }} />

      <div className="flex-1 flex flex-col justify-center relative z-10">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-6"
          style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)", boxShadow: "0 6px 24px rgba(99,102,241,0.4)" }}
        >
          👋
        </div>

        <h1 className="font-900 text-white mb-1" style={{ fontSize: "1.75rem", lineHeight: 1.2 }}>
          คุณคือใคร?
        </h1>
        <p className="font-500 mb-8 text-base" style={{ color: "rgba(255,255,255,0.45)" }}>
          เลือกชื่อของคุณเพื่อดูยอดค้างชำระ
        </p>

        <div className="flex flex-col gap-3">
          {members.map((m, i) => {
            const isSelected = selectedId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className="flex items-center gap-4 p-4 text-left transition-all duration-150"
                style={{
                  background: isSelected ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.07)",
                  borderRadius: "1.125rem",
                  border: isSelected ? "1.5px solid rgba(129,140,248,0.6)" : "1.5px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(16px)",
                  transform: isSelected ? "scale(1.01)" : "scale(1)",
                  boxShadow: isSelected ? "0 4px 20px rgba(99,102,241,0.25)" : "none",
                }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center font-900 text-sm text-white flex-shrink-0"
                  style={{
                    background: isSelected ? AVATAR_GRAD[i % AVATAR_GRAD.length] : "rgba(255,255,255,0.10)",
                    borderRadius: "0.875rem",
                  }}
                >
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <p className="font-800 text-white">{m.name}</p>
                {isSelected && (
                  <div
                    className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-800"
                    style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)" }}
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
        className="btn-primary w-full py-4 text-lg font-900 rounded-2xl disabled:opacity-40 mt-8 relative z-10"
      >
        {saving ? "กำลังบันทึก..." : "นี่คือฉัน ✓"}
      </button>
    </div>
  );
}
