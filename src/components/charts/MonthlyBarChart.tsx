"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type MonthlyData = {
  month: string;
  income: number;
  expense: number;
};

export default function MonthlyBarChart({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No monthly data yet
      </div>
    );
  }

  const chartData = data.map((item) => ({
    month: item.month.slice(5), // "2026-02" → "02"
    income: Math.round(item.income * 100) / 100,
    expense: Math.round(item.expense * 100) / 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
        formatter={(value) => `$${Number(value).toFixed(2)}`}
        />
        <Legend />
        <Bar dataKey="income" fill="#22C55E" name="Income" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}