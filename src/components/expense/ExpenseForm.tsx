"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Member, Expense, ExpenseSplit } from "@/lib/database.types";

type Split = { member_id: string; amount: number };

type Props = {
  periodId: string;
  expense?: Expense & { splits?: (ExpenseSplit & { member?: Member })[]; category?: Category };
};

const CATEGORY_COLORS: Record<string, string> = {
  Groceries: "bg-[#00F5A0] text-gray-900",
  Dining: "bg-[#FF6B6B] text-white",
  Utilities: "bg-[#A78BFA] text-white",
  Transport: "bg-[#60A5FA] text-white",
  Other: "bg-gray-200 text-gray-700",
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
    expense?.splits?.map((s) => s.member_id) ?? []
  );
  const [isCustomSplit, setIsCustomSplit] = useState(false);
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    amountRef.current?.focus();
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

    const payload = {
      description,
      amount: parseFloat(amount),
      category_id: categoryId,
      date,
      period_id: periodId,
      splits: computedSplits(),
    };

    const url = expense ? `/api/expenses/${expense.id}` : "/api/expenses";
    const method = expense ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    router.push("/");
    router.refresh();
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const colorClass = selectedCategory ? (CATEGORY_COLORS[selectedCategory.name] ?? "bg-gray-200 text-gray-700") : "";

  return (
    <div className="flex flex-col gap-5 px-4 py-6 max-w-lg mx-auto">
      {/* Amount — big and prominent */}
      <div className="card-bubble p-5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount (฿)</label>
        <input
          ref={amountRef}
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full text-4xl font-extrabold text-gray-900 outline-none mt-1 bg-transparent"
        />
      </div>

      {/* Description */}
      <div className="card-bubble p-5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
        <input
          type="text"
          placeholder="e.g. Makro groceries"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-lg font-semibold text-gray-900 outline-none mt-1 bg-transparent"
        />
      </div>

      {/* Date */}
      <div className="card-bubble p-5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full text-base font-semibold text-gray-900 outline-none mt-1 bg-transparent"
        />
      </div>

      {/* Category chips */}
      <div className="card-bubble p-5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Category</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const color = CATEGORY_COLORS[cat.name] ?? "bg-gray-200 text-gray-700";
            const isSelected = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`chip-active px-4 py-2 text-sm font-bold rounded-full border-2 transition-all ${
                  isSelected ? `${color} border-transparent scale-105 shadow-md` : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Member chips */}
      <div className="card-bubble p-5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Split with</label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const isSelected = selectedMemberIds.includes(m.id);
            const initials = m.name.slice(0, 2).toUpperCase();
            return (
              <button
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold text-sm transition-all ${
                  isSelected
                    ? "bg-[#FF6B6B] border-[#FF6B6B] text-white scale-105 shadow-md"
                    : "bg-white border-gray-200 text-gray-500"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? "bg-white/20" : "bg-gray-100"}`}>
                  {initials}
                </span>
                {m.name}
              </button>
            );
          })}
        </div>

        {selectedMemberIds.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setIsCustomSplit((v) => !v)}
              className="text-xs font-semibold text-[#FF6B6B] underline"
            >
              {isCustomSplit ? "Switch to equal split" : "Custom split amounts"}
            </button>

            {isCustomSplit ? (
              <div className="mt-3 flex flex-col gap-2">
                {selectedMemberIds.map((id) => {
                  const m = members.find((m) => m.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-700">{m?.name}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={customSplits[id] ?? ""}
                        onChange={(e) => setCustomSplits((prev) => ({ ...prev, [id]: e.target.value }))}
                        className="w-28 text-right border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none focus:border-[#FF6B6B]"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                ฿{(parseFloat(amount || "0") / selectedMemberIds.length).toFixed(2)} each
              </p>
            )}
          </div>
        )}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !description || !amount || selectedMemberIds.length === 0}
        className="btn-yellow w-full py-4 text-lg font-extrabold rounded-2xl shadow-lg disabled:opacity-40 active:scale-95 transition-all"
      >
        {saving ? "Saving..." : expense ? "Save Changes" : "Add Expense"}
      </button>
    </div>
  );
}
