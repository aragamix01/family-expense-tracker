"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

type MonthData = { month: string; amount: number };
type Props = { data: MonthData[] };

const COLORS = ["#111111", "#555555", "#999999", "#C8FF00", "#E2E2E2", "#888888"];

export function SpendingChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 8, left: 8, bottom: 5 }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fontWeight: 700, fill: "#999" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fontWeight: 600, fill: "#999" }}
          axisLine={false}
          tickLine={false}
          width={48}
          tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`}
        />
        <Tooltip
          formatter={(v) => [`฿${Number(v).toLocaleString()}`, "ใช้ไป"]}
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid #E2E2E2",
            background: "white",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            fontWeight: 700,
            color: "#111",
          }}
        />
        <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
