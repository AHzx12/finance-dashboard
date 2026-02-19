"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import CategoryPieChart from "@/components/charts/CategoryPieChart";
import MonthlyBarChart from "@/components/charts/MonthlyBarChart";
import AiAdvisor from "@/components/AiAdvisor";
import AiRecommend from "@/components/AiRecommend";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  date: string;
  category: Category;
};

type Stats = {
  byCategory: { name: string; icon: string; color: string; total: number }[];
  byMonth: { month: string; income: number; expense: number }[];
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    amount: "",
    type: "expense",
    description: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, txRes, statsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/transactions"),
        fetch("/api/stats"),
      ]);
      const cats = await catRes.json();
      const txs = await txRes.json();
      const statsData = await statsRes.json();
      setCategories(cats);
      setTransactions(txs);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      });

      if (res.ok) {
        setForm({
          amount: "",
          type: "expense",
          description: "",
          categoryId: "",
          date: new Date().toISOString().split("T")[0],
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">💰 Finance Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session?.user?.name || session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-red-600 hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <p className="text-sm text-gray-500 mb-1">Balance</p>
            <p className={`text-2xl font-bold ${(stats?.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${(stats?.balance ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <p className="text-sm text-gray-500 mb-1">Income</p>
            <p className="text-2xl font-bold text-green-600">
              +${(stats?.totalIncome ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <p className="text-sm text-gray-500 mb-1">Expenses</p>
            <p className="text-2xl font-bold text-red-600">
              -${(stats?.totalExpense ?? 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-4">Expenses by Category</h2>
            <CategoryPieChart data={stats?.byCategory ?? []} />
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-4">Monthly Overview</h2>
            <MonthlyBarChart data={stats?.byMonth ?? []} />
          </div>
        </div>

        {/* AI 功能区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AiAdvisor />
          <AiRecommend />
        </div>

        {/* 添加交易 + 交易列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 添加交易表单 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-4">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "expense" })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    form.type === "expense"
                      ? "bg-red-100 text-red-700 border-2 border-red-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: "income" })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                    form.type === "income"
                      ? "bg-green-100 text-green-700 border-2 border-green-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  Income
                </button>
              </div>

              <input
                type="number"
                step="0.01"
                required
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Add Transaction
              </button>
            </form>
          </div>

          {/* 交易记录列表 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border">
            <h2 className="text-lg font-semibold mb-4">
              Recent Transactions
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({transactions.length} total)
              </span>
            </h2>

            {transactions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No transactions yet. Add your first one!
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tx.category?.icon}</span>
                      <div>
                        <p className="font-medium">
                          {tx.description || tx.category?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.date).toLocaleDateString()} ·{" "}
                          {tx.category?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${
                          tx.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}$
                        {tx.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-gray-300 hover:text-red-500 transition text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}