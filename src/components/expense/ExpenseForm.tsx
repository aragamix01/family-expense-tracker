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
  Groceries: { color: "#22C55E", emoji: "🛒" },
  Dining:    { color: "#EF4444", emoji: "🍽️" },
  Utilities: { color: "#8B5CF6", emoji: "💡" },
  Transport: { color: "#3B82F6", emoji: "🚗" },
  Other:     { color: "#F59E0B", emoji: "📦" },
};

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
    if (isCustomSplit) return selectedMemberIds.map(id => ({ member_id: id, amount: parseFloat(customSplits[id] || "0") }));
    const each = selectedMemberIds.length > 0 ? Math.round((parseFloat(amount || "0") / selectedMemberIds.length) * 100) / 100 : 0;
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
    <div className="flex flex-col gap-3 px-4 py-4 max-w-lg mx-auto">

      {/* Amount hero */}
      <div
        className="rounded-2xl px-5 pt-5 pb-6"
        style={{ background: "#111", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
      >
        <p className="text-xs font-700 uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>จำนวนเงิน</p>
        <div className="flex items-baseline gap-2">
          <span className="font-800 text-2xl" style={{ color: "rgba(255,255,255,0.5)" }}>฿</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 font-900 outline-none bg-transparent placeholder:text-white/20"
            style={{ fontSize: "3rem", lineHeight: 1, color: "#C8FF00" }}
          />
        </div>
      </div>

      {/* Description */}
      <div className="card px-4 py-3.5">
        <p className="text-xs font-700 uppercase tracking-widest mb-1.5" style={{ color: "#999" }}>รายละเอียด</p>
        <input
          type="text"
          placeholder="เช่น ซื้อของที่ Makro"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full font-700 text-base outline-none bg-transparent"
          style={{ color: "#111" }}
        />
      </div>

      {/* Date */}
      <div className="card px-4 py-3.5">
        <p className="text-xs font-700 uppercase tracking-widest mb-1.5" style={{ color: "#999" }}>วันที่</p>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full font-700 text-base outline-none bg-transparent"
          style={{ color: "#111", colorScheme: "light" }}
        />
      </div>

      {/* Category */}
      <div className="card px-4 py-3.5">
        <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: "#999" }}>หมวดหมู่</p>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const cfg = CAT_CFG[cat.name] ?? CAT_CFG.Other;
            const isSelected = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-700 transition-all duration-100"
                style={{
                  background: isSelected ? "#111" : "#F5F5F5",
                  color: isSelected ? "white" : "#555",
                  border: isSelected ? "none" : "1px solid #E2E2E2",
                }}
              >
                {cfg.emoji} {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Members */}
      <div className="card px-4 py-3.5">
        <p className="text-xs font-700 uppercase tracking-widest mb-3" style={{ color: "#999" }}>แบ่งกับ</p>
        <div className="flex flex-wrap gap-2">
          {members.map(m => {
            const isSelected = selectedMemberIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full font-700 text-sm transition-all duration-100"
                style={{
                  background: isSelected ? "#111" : "#F5F5F5",
                  color: isSelected ? "white" : "#555",
                  border: isSelected ? "none" : "1px solid #E2E2E2",
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-900"
                  style={{ background: isSelected ? "rgba(255,255,255,0.2)" : "#E0E0E0" }}
                >
                  {m.name.slice(0, 1)}
                </span>
                {m.name}
              </button>
            );
          })}
        </div>

        {selectedMemberIds.length > 0 && (
          <div className="mt-4 pt-3.5" style={{ borderTop: "1px solid #F0F0F0" }}>
            {!isCustomSplit ? (
              <div className="flex items-center justify-between">
                <p className="text-sm font-600" style={{ color: "#999" }}>฿{each.toFixed(2)} ต่อคน</p>
                <button
                  onClick={() => setIsCustomSplit(true)}
                  className="text-xs font-700 px-3 py-1.5 rounded-xl btn-ghost"
                >
                  กำหนดเอง
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-700 uppercase tracking-widest" style={{ color: "#999" }}>กำหนดยอดแต่ละคน</p>
                  <button onClick={() => setIsCustomSplit(false)} className="text-xs font-700" style={{ color: "#111" }}>
                    แบ่งเท่ากัน
                  </button>
                </div>
                {selectedMemberIds.map(id => {
                  const m = members.find(m => m.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between gap-3 py-1">
                      <span className="font-700 text-sm" style={{ color: "#111" }}>{m?.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-600" style={{ color: "#999" }}>฿</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder="0"
                          value={customSplits[id] ?? ""}
                          onChange={e => setCustomSplits(prev => ({ ...prev, [id]: e.target.value }))}
                          className="w-24 text-right font-700 text-sm outline-none rounded-xl px-3 py-2"
                          style={{ background: "#F5F5F5", border: "1px solid #E2E2E2", color: "#111", colorScheme: "light" }}
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

      <button
        onClick={handleSave}
        disabled={saving || !description || !amount || selectedMemberIds.length === 0}
        className="btn-ink w-full py-4 text-base font-900 rounded-2xl disabled:opacity-30 mt-1"
      >
        {saving ? "กำลังบันทึก..." : expense ? "บันทึกการแก้ไข" : "เพิ่มรายจ่าย →"}
      </button>
    </div>
  );
}
