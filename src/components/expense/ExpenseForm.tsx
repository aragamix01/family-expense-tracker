"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Member, Expense, ExpenseSplit } from "@/lib/database.types";

type Split = { member_id: string; amount: number };
type Props = {
  periodId: string;
  expense?: Expense & { splits?: (ExpenseSplit & { member?: Member })[]; category?: Category };
};

const CAT_CFG: Record<string, { color: string; emoji: string }> = {
  Groceries: { color: "#34D399", emoji: "🛒" },
  Dining:    { color: "#F472B6", emoji: "🍽️" },
  Utilities: { color: "#818CF8", emoji: "💡" },
  Transport: { color: "#60A5FA", emoji: "🚗" },
  Other:     { color: "#FBBF24", emoji: "📦" },
};

const AVATAR_GRAD = [
  "linear-gradient(135deg,#6366F1,#A78BFA)",
  "linear-gradient(135deg,#3B82F6,#60A5FA)",
  "linear-gradient(135deg,#EC4899,#F472B6)",
  "linear-gradient(135deg,#10B981,#34D399)",
];

export function ExpenseForm({ periodId, expense }: Props) {
  const router = useRouter();
  const amountRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState(expense?.amount?.toString() ?? "");
  const [date, setDate] = useState(expense?.date ?? new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState(expense?.category_id ?? "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    expense?.splits?.map(s => s.member_id) ?? []
  );
  const [isCustomSplit, setIsCustomSplit] = useState(false);
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 100);
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/members").then(r => r.json()),
    ]).then(([cats, mems]) => {
      setCategories(cats);
      setMembers(mems);
      if (!categoryId && cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

  const toggleMember = (id: string) =>
    setSelectedMemberIds(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  const computedSplits = (): Split[] => {
    if (isCustomSplit) {
      return selectedMemberIds.map(id => ({ member_id: id, amount: parseFloat(customSplits[id] || "0") }));
    }
    const each = selectedMemberIds.length > 0
      ? Math.round((parseFloat(amount || "0") / selectedMemberIds.length) * 100) / 100 : 0;
    return selectedMemberIds.map(id => ({ member_id: id, amount: each }));
  };

  const handleSave = async () => {
    if (!description || !amount || !categoryId || selectedMemberIds.length === 0) return;
    setSaving(true);
    const payload = { description, amount: parseFloat(amount), category_id: categoryId, date, period_id: periodId, splits: computedSplits() };
    const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
    await fetch(url, { method: expense ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    router.push("/");
    router.refresh();
  };

  const each = selectedMemberIds.length > 0 ? parseFloat(amount || "0") / selectedMemberIds.length : 0;

  return (
    <div className="flex flex-col gap-4 px-4 py-5 max-w-lg mx-auto">

      {/* Amount — big glass input */}
      <div
        className="px-6 pt-5 pb-6 relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: "1.5rem",
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(129,140,248,0.25) 0%,transparent 70%)" }}
        />
        <p className="text-xs font-800 uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.45)" }}>จำนวนเงิน</p>
        <div className="flex items-baseline gap-2">
          <span className="font-800 text-2xl" style={{ color: "rgba(255,255,255,0.6)" }}>฿</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 font-900 text-white outline-none bg-transparent placeholder:text-white/20 glow-number"
            style={{ fontSize: "3.25rem", lineHeight: 1 }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="glass px-5 py-4">
        <p className="text-xs font-800 uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>รายละเอียด</p>
        <input
          type="text"
          placeholder="เช่น ซื้อของที่ Makro"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full font-700 text-lg text-white outline-none bg-transparent placeholder:font-500 placeholder:text-white/20"
        />
      </div>

      {/* Date */}
      <div className="glass px-5 py-4">
        <p className="text-xs font-800 uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>วันที่</p>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full font-700 text-base text-white outline-none bg-transparent"
          style={{ colorScheme: "dark" }}
        />
      </div>

      {/* Category */}
      <div className="glass px-5 py-4">
        <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>หมวดหมู่</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const cfg = CAT_CFG[cat.name] ?? CAT_CFG.Other;
            const isSelected = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-700 transition-all duration-150"
                style={{
                  background: isSelected ? `${cfg.color}28` : "rgba(255,255,255,0.07)",
                  color: isSelected ? cfg.color : "rgba(255,255,255,0.5)",
                  border: isSelected ? `1.5px solid ${cfg.color}60` : "1.5px solid rgba(255,255,255,0.08)",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                  boxShadow: isSelected ? `0 3px 12px ${cfg.color}30` : "none",
                }}
              >
                <span>{cfg.emoji}</span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Members */}
      <div className="glass px-5 py-4">
        <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>แบ่งกับ</p>
        <div className="flex flex-wrap gap-2">
          {members.map((m, i) => {
            const isSelected = selectedMemberIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full font-700 text-sm transition-all duration-150"
                style={{
                  background: isSelected ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.07)",
                  color: isSelected ? "white" : "rgba(255,255,255,0.5)",
                  border: isSelected ? "1.5px solid rgba(129,140,248,0.5)" : "1.5px solid rgba(255,255,255,0.08)",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                  boxShadow: isSelected ? "0 3px 12px rgba(99,102,241,0.3)" : "none",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-900 text-white"
                  style={{ background: isSelected ? AVATAR_GRAD[i % AVATAR_GRAD.length] : "rgba(255,255,255,0.15)" }}
                >
                  {m.name.slice(0, 1)}
                </span>
                {m.name}
              </button>
            );
          })}
        </div>

        {selectedMemberIds.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {!isCustomSplit ? (
              <div className="flex items-center justify-between">
                <p className="font-600 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
                  ฿{each.toFixed(2)} ต่อคน
                </p>
                <button
                  onClick={() => setIsCustomSplit(true)}
                  className="text-xs font-700 px-3 py-1.5 rounded-xl"
                  style={{ background: "rgba(129,140,248,0.18)", color: "#818CF8", border: "1px solid rgba(129,140,248,0.25)" }}
                >
                  กำหนดเอง
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-800 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>กำหนดยอดแต่ละคน</p>
                  <button onClick={() => setIsCustomSplit(false)} className="text-xs font-700" style={{ color: "#818CF8" }}>
                    แบ่งเท่ากัน
                  </button>
                </div>
                {selectedMemberIds.map(id => {
                  const m = members.find(m => m.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between gap-3 py-1">
                      <span className="font-700 text-sm text-white">{m?.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-600" style={{ color: "rgba(255,255,255,0.4)" }}>฿</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={customSplits[id] ?? ""}
                          onChange={e => setCustomSplits(prev => ({ ...prev, [id]: e.target.value }))}
                          className="w-24 text-right font-700 text-sm text-white outline-none rounded-xl px-3 py-2"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1.5px solid rgba(255,255,255,0.12)",
                            colorScheme: "dark",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving || !description || !amount || selectedMemberIds.length === 0}
        className="btn-primary w-full py-4 text-lg font-900 rounded-2xl disabled:opacity-40 mt-2"
      >
        {saving ? "กำลังบันทึก..." : expense ? "บันทึกการแก้ไข" : "เพิ่มรายจ่าย"}
      </button>
    </div>
  );
}
