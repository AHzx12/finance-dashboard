import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions — 获取交易记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "income" 或 "expense"
    const categoryId = searchParams.get("categoryId");

    // 构建查询条件
    const where: any = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true }, // 同时返回分类信息
      orderBy: { date: "desc" },   // 最新的排前面
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST /api/transactions — 创建新交易
export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { amount, type, description, date, categoryId, userId } = body;

    // 验证必填字段
    if (!amount || !type || !categoryId || !userId) {
      return NextResponse.json(
        { error: "amount, type, categoryId, and userId are required" },
        { status: 400 }
      );
    }

    // 验证 type 只能是 income 或 expense
    if (type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "type must be 'income' or 'expense'" },
        { status: 400 }
      );
    }

    // 验证金额必须大于 0
    if (amount <= 0) {
      return NextResponse.json(
        { error: "amount must be greater than 0" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        description: description || "",
        date: date ? new Date(date) : new Date(),
        categoryId,
        userId,
      },
      include: { category: true },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}