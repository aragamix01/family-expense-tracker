"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type CategoryData = { categoryId: string; name: string; amount: number };

type Props = { data: CategoryData[] };

const COLORS = ["#FF6B6B", "#00F5A0", "#FFE66D", "#A78BFA", "#60A5FA", "#FB923C"];

export function CategoryDonut({ data }: Props) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [`฿${Number(v).toLocaleString()}`, ""]}
          contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontWeight: 600 }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, fontWeight: 600 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
