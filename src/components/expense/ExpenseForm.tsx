"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Member, Expense, ExpenseSplit } from "@/lib/database.types";

type Split = { member_id: string; amount: number };

type Props = {
  periodId: string;
  expense?: Expense & { splits?: (ExpenseSplit & { member?: Member })[]; category?: Category };
};

const CATEGORY_CONFIG: Record<string, { bg: string; dot: string; emoji: string }> = {
  Groceries: { bg: "rgba(0,245,160,0.15)", dot: "#00C47D", emoji: "🛒" },
  Dining:    { bg: "rgba(255,107,107,0.12)", dot: "#FF6B6B", emoji: "🍽️" },
  Utilities: { bg: "rgba(167,139,250,0.15)", dot: "#A78BFA", emoji: "💡" },
  Transport: { bg: "rgba(96,165,250,0.15)", dot: "#60A5FA", emoji: "🚗" },
  Other:     { bg: "rgba(255,230,109,0.15)", dot: "#F59E0B", emoji: "📦" },
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#FF6B6B,#FF8E53)",
  "linear-gradient(135deg,#A78BFA,#818CF8)",
  "linear-gradient(135deg,#00F5A0,#00D9F5)",
  "linear-gradient(135deg,#60A5FA,#818CF8)",
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
    expense?.splits?.map((s) => s.member_id) ?? []
  );
  const [isCustomSplit, setIsCustomSplit] = useState(false);
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 100);
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
    ]).then(([cats, mems]) => {
      setCategories(cats);
      setMembers(mems);
      if (!categoryId && cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const computedSplits = (): Split[] => {
    if (isCustomSplit) {
      return selectedMemberIds.map((id) => ({
        member_id: id,
        amount: parseFloat(customSplits[id] || "0"),
      }));
    }
    const each = selectedMemberIds.length > 0
      ? Math.round((parseFloat(amount || "0") / selectedMemberIds.length) * 100) / 100
      : 0;
    return selectedMemberIds.map((id) => ({ member_id: id, amount: each }));
  };

  const handleSave = async () => {
    if (!description || !amount || !categoryId || selectedMemberIds.length === 0) return;
    setSaving(true);
    const payload = { description, amount: parseFloat(amount), category_id: categoryId, date, period_id: periodId, splits: computedSplits() };
    const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
    const method = expense ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    router.push("/");
    router.refresh();
  };

  const isValid = description && amount && selectedMemberIds.length > 0;
  const eachAmount = selectedMemberIds.length > 0 ? parseFloat(amount || "0") / selectedMemberIds.length : 0;

  return (
    <div className="flex flex-col gap-4 px-4 py-5 max-w-lg mx-auto">

      {/* Amount — hero input */}
      <div
        className="px-6 pt-6 pb-7 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#FF6B6B 0%,#FF8E53 60%,#FFB347 100%)",
          borderRadius: "1.5rem",
          boxShadow: "0 8px 32px rgba(255,107,107,0.3)",
        }}
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20" style={{ background: "white" }} />
        <p className="text-white/70 text-xs font-800 uppercase tracking-widest mb-2">จำนวนเงิน</p>
        <div className="flex items-baseline gap-2">
          <span className="text-white/80 font-800 text-2xl">฿</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 font-900 text-white outline-none bg-transparent placeholder:text-white/40"
            style={{ fontSize: "3rem", lineHeight: 1 }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="card-bubble px-5 py-4">
        <p className="text-xs font-800 uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>รายละเอียด</p>
        <input
          type="text"
          placeholder="เช่น ซื้อของที่ Makro"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full font-700 text-lg outline-none bg-transparent placeholder:font-500"
          style={{ color: "#1A1A2E" }}
        />
      </div>

      {/* Date */}
      <div className="card-bubble px-5 py-4">
        <p className="text-xs font-800 uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>วันที่</p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full font-700 text-base outline-none bg-transparent"
          style={{ color: "#1A1A2E" }}
        />
      </div>

      {/* Category chips */}
      <div className="card-bubble px-5 py-4">
        <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>หมวดหมู่</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat.name] ?? CATEGORY_CONFIG.Other;
            const isSelected = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-700 transition-all duration-150"
                style={{
                  background: isSelected ? cfg.dot : "rgba(26,26,46,0.05)",
                  color: isSelected ? "white" : "#6B7280",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                  boxShadow: isSelected ? `0 3px 12px ${cfg.dot}50` : "none",
                }}
              >
                <span>{cfg.emoji}</span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Member chips */}
      <div className="card-bubble px-5 py-4">
        <p className="text-xs font-800 uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>แบ่งกับ</p>
        <div className="flex flex-wrap gap-2">
          {members.map((m, i) => {
            const isSelected = selectedMemberIds.includes(m.id);
            const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];
            return (
              <button
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full font-700 text-sm transition-all duration-150"
                style={{
                  background: isSelected ? gradient : "rgba(26,26,46,0.05)",
                  color: isSelected ? "white" : "#6B7280",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                  boxShadow: isSelected ? "0 3px 12px rgba(255,107,107,0.3)" : "none",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-900"
                  style={{ background: isSelected ? "rgba(255,255,255,0.25)" : "rgba(26,26,46,0.08)" }}
                >
                  {m.name.slice(0, 1).toUpperCase()}
                </span>
                {m.name}
              </button>
            );
          })}
        </div>

        {selectedMemberIds.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {!isCustomSplit ? (
              <div className="flex items-center justify-between">
                <p className="font-600 text-sm" style={{ color: "#9CA3AF" }}>
                  ฿{eachAmount.toFixed(2)} ต่อคน
                </p>
                <button
                  onClick={() => setIsCustomSplit(true)}
                  className="text-xs font-700 px-3 py-1.5 rounded-xl"
                  style={{ background: "rgba(255,107,107,0.1)", color: "#FF6B6B" }}
                >
                  กำหนดเอง
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-800 uppercase tracking-widest" style={{ color: "#9CA3AF" }}>กำหนดยอดแต่ละคน</p>
                  <button
                    onClick={() => setIsCustomSplit(false)}
                    className="text-xs font-700"
                    style={{ color: "#FF6B6B" }}
                  >
                    แบ่งเท่ากัน
                  </button>
                </div>
                {selectedMemberIds.map((id) => {
                  const m = members.find((m) => m.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between gap-3 py-1">
                      <span className="font-700 text-sm" style={{ color: "#1A1A2E" }}>{m?.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-600" style={{ color: "#9CA3AF" }}>฿</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={customSplits[id] ?? ""}
                          onChange={(e) => setCustomSplits((prev) => ({ ...prev, [id]: e.target.value }))}
                          className="w-24 text-right font-700 text-sm outline-none rounded-xl px-3 py-2"
                          style={{
                            background: "rgba(26,26,46,0.04)",
                            color: "#1A1A2E",
                            border: "1.5px solid rgba(26,26,46,0.08)",
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
        disabled={saving || !isValid}
        className="btn-yellow w-full py-4 text-lg font-900 rounded-2xl disabled:opacity-40"
        style={{ letterSpacing: "-0.01em", marginTop: "0.5rem" }}
      >
        {saving ? "กำลังบันทึก..." : expense ? "บันทึกการแก้ไข" : "เพิ่มรายจ่าย"}
      </button>
    </div>
  );
}
