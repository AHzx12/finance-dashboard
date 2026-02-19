import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get_session";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // 获取用户所有交易
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        advice: "You haven't recorded any transactions yet. Start adding your income and expenses to get personalized financial advice!",
      });
    }

    // 汇总数据
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // 按分类汇总支出
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const name = t.category.name;
        categoryTotals[name] = (categoryTotals[name] || 0) + t.amount;
      });

    const categoryBreakdown = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([name, total]) => `${name}: $${total.toFixed(2)}`)
      .join("\n");

    // 最近 5 笔交易
    const recentTransactions = transactions
      .slice(0, 5)
      .map(
        (t) =>
          `${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)} - ${t.category.name}${t.description ? ` (${t.description})` : ""} on ${new Date(t.date).toLocaleDateString()}`
      )
      .join("\n");

    // 构建 prompt
    const prompt = `You are a friendly and helpful personal finance advisor. Analyze the following financial data and provide actionable advice.

## Financial Summary
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpense.toFixed(2)}
- Balance: $${(totalIncome - totalExpense).toFixed(2)}
- Number of Transactions: ${transactions.length}

## Expense Breakdown by Category
${categoryBreakdown}

## Recent Transactions
${recentTransactions}

Please provide:
1. A brief assessment of the user's financial health (2-3 sentences)
2. Top 3 specific, actionable tips to improve their finances
3. Which spending category they should watch most carefully and why
4. A suggested monthly budget split based on their income (if income data is available)

Keep the tone friendly, encouraging, and concise. Use dollar amounts where relevant. Format with clear headings.`;

    // 调用 Claude API
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // 提取文本回复
    const advice =
      message.content[0].type === "text"
        ? message.content[0].text
        : "Unable to generate advice at this time.";

    return NextResponse.json({ advice });
  } catch (error) {
    console.error("AI advice error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI advice" },
      { status: 500 }
    );
  }
}