"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type CategoryData = { categoryId: string; name: string; amount: number };
type Props = { data: CategoryData[] };

const COLORS = ["#818CF8", "#34D399", "#F472B6", "#60A5FA", "#FBBF24", "#A78BFA"];

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
          contentStyle={{ borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(30,56,138,0.9)", backdropFilter: "blur(16px)", fontWeight: 600, color: "white" }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={v => <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
