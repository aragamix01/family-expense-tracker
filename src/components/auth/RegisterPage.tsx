"use client";

import { useEffect, useState } from "react";
import { useLiff } from "@/contexts/LiffContext";
import type { Member } from "@/lib/database.types";

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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6" style={{ background: "#EFEFEF" }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ background: "#111" }}>
          🎉
        </div>
        <p className="text-xl font-900" style={{ color: "#111" }}>เข้าสู่ระบบสำเร็จ!</p>
        <p className="font-500 text-sm" style={{ color: "#999" }}>กำลังโหลดแดชบอร์ด...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-4 py-10" style={{ background: "#EFEFEF" }}>
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6" style={{ background: "#111" }}>
          👋
        </div>
        <h1 className="font-900 mb-1" style={{ fontSize: "1.625rem", color: "#111", lineHeight: 1.2 }}>
          คุณคือใคร?
        </h1>
        <p className="font-500 mb-7 text-sm" style={{ color: "#999" }}>
          เลือกชื่อเพื่อดูยอดค้างชำระของคุณ
        </p>

        <div className="flex flex-col gap-2">
          {members.map((m) => {
            const isSelected = selectedId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className="flex items-center gap-3 p-4 text-left card transition-all duration-100"
                style={{
                  borderWidth: isSelected ? "2px" : "1px",
                  borderColor: isSelected ? "#111" : "#E2E2E2",
                  transform: isSelected ? "scale(1.01)" : "scale(1)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-900 text-sm flex-shrink-0"
                  style={{ background: isSelected ? "#111" : "#F0F0F0", color: isSelected ? "white" : "#555" }}
                >
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <p className="font-800 text-sm flex-1" style={{ color: "#111" }}>{m.name}</p>
                {isSelected && (
                  <span className="pill-ink">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleRegister}
        disabled={!selectedId || saving}
        className="btn-ink w-full py-4 text-base font-900 rounded-2xl disabled:opacity-30 mt-8"
      >
        {saving ? "กำลังบันทึก..." : "นี่คือฉัน →"}
      </button>
    </div>
  );
}
