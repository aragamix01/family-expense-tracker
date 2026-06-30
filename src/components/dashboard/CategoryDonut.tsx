"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type CategoryData = { categoryId: string; name: string; amount: number };
type Props = { data: CategoryData[] };

const COLORS = ["#FF6B6B", "#4F9EFF", "#FFD166", "#06D6A0", "#C77DFF", "#FF9F43"];

export function CategoryDonut({ data }: Props) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="amount" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip
          formatter={(v) => [`฿${Number(v).toLocaleString()}`, ""]}
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid #E2E2E2",
            background: "white",
            boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
            fontWeight: 700,
            color: "#111",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={v => <span style={{ fontSize: 12, fontWeight: 600, color: "#555" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
