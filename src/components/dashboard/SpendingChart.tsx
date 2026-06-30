"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type MonthData = { month: string; amount: number };

type Props = { data: MonthData[] };

const COLORS = ["#818CF8", "#34D399", "#F472B6", "#60A5FA", "#FBBF24", "#A78BFA"];

export function SpendingChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [`฿${Number(v).toLocaleString()}`, "ใช้ไป"]}
          contentStyle={{ borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(30,56,138,0.9)", backdropFilter: "blur(16px)", fontWeight: 600, color: "white" }}
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
