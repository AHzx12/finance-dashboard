import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/get_session";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { question } = body;

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // 获取用户财务数据作为上下文
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 20,
    });

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryTotals[t.category.name] =
          (categoryTotals[t.category.name] || 0) + t.amount;
      });

    const financialContext = `
User's Financial Context:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpense.toFixed(2)}
- Balance: $${(totalIncome - totalExpense).toFixed(2)}
- Transaction Count: ${transactions.length}
- Top Spending Categories: ${Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, total]) => `${name}: $${total.toFixed(2)}`)
      .join(", ")}
`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        },
      ],
      system: `You are a knowledgeable and friendly personal finance assistant. You have access to the user's financial data and can search the web for current financial information.

${financialContext}

When answering:
- Be concise and practical
- Use the user's actual financial data when relevant
- Search the web for current rates, prices, or financial news when needed
- Give specific, actionable advice
- Use dollar amounts when possible`,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
    });

    const answer = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to get answer" },
      { status: 500 }
    );
  }
}