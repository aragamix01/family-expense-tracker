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
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <div className="text-5xl">🎉</div>
        <p className="text-xl font-extrabold text-gray-900">You&apos;re in!</p>
        <p className="text-gray-400 text-center">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12">
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-4xl mb-4">👋</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Who are you?</h1>
        <p className="text-gray-400 mb-8">Select your name to see what you owe.</p>

        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                selectedId === m.id
                  ? "border-[#FF6B6B] bg-[#FFF0F0]"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                selectedId === m.id ? "bg-[#FF6B6B] text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {m.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="font-bold text-gray-900">{m.name}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleRegister}
        disabled={!selectedId || saving}
        className="btn-yellow w-full py-4 text-lg font-extrabold rounded-2xl shadow-lg disabled:opacity-40 mt-8"
      >
        {saving ? "Saving..." : "This is me ✓"}
      </button>
    </div>
  );
}
