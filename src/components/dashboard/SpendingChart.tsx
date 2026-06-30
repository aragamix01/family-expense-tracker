"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type MonthData = { month: string; amount: number };

type Props = { data: MonthData[] };

const COLORS = ["#FF6B6B", "#00F5A0", "#FFE66D", "#A78BFA", "#60A5FA", "#FB923C"];

export function SpendingChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [`฿${Number(v).toLocaleString()}`, "Spent"]}
          contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 600 }}
        />
        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
