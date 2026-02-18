import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get_session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // 获取该用户所有交易
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "asc" },
    });

    // 1. 按分类汇总支出
    const categoryMap: Record<string, { name: string; icon: string; color: string; total: number }> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const key = t.categoryId;
        if (!categoryMap[key]) {
          categoryMap[key] = {
            name: t.category.name,
            icon: t.category.icon,
            color: t.category.color,
            total: 0,
          };
        }
        categoryMap[key].total += t.amount;
      });

    const byCategory = Object.values(categoryMap)
      .sort((a, b) => b.total - a.total);

    // 2. 按月份汇总收入和支出
    const monthMap: Record<string, { month: string; income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) {
        monthMap[key] = { month: key, income: 0, expense: 0 };
      }
      if (t.type === "income") {
        monthMap[key].income += t.amount;
      } else {
        monthMap[key].expense += t.amount;
      }
    });

    const byMonth = Object.values(monthMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // 3. 总计
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      byCategory,
      byMonth,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: transactions.length,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}