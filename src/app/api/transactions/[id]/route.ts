import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/transactions/:id — 获取单条交易
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}

// PUT /api/transactions/:id — 修改交易
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { amount, type, description, date, categoryId } = body;

    // 验证 type
    if (type && type !== "income" && type !== "expense") {
      return NextResponse.json(
        { error: "type must be 'income' or 'expense'" },
        { status: 400 }
      );
    }

    // 验证金额
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { error: "amount must be greater than 0" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
      },
      include: { category: true },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return NextResponse.json(
      { error: "Failed to update transaction" },
      { status: 500 }
    );
  }
}

// DELETE /api/transactions/:id — 删除交易
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.transaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction" },
      { status: 500 }
    );
  }
}