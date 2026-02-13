// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultCategories = [
    { name: "Dining", icon: "🍔", color: "#EF4444" },
    { name: "Transport", icon: "🚗", color: "#F59E0B" },
    { name: "Shopping", icon: "🛍️", color: "#8B5CF6" },
    { name: "Housing", icon: "🏠", color: "#3B82F6" },
    { name: "Entertainment", icon: "🎬", color: "#EC4899" },
    { name: "Healthcare", icon: "🏥", color: "#10B981" },
    { name: "Education", icon: "📚", color: "#6366F1" },
    { name: "Salary", icon: "💰", color: "#22C55E" },
    { name: "Freelance", icon: "💼", color: "#14B8A6" },
    { name: "Other", icon: "📦", color: "#6B7280" },
  ];

  await prisma.$executeRaw`DELETE FROM "Category" WHERE "userId" IS NULL`;

  for (const cat of defaultCategories) {
    await prisma.$executeRaw`
      INSERT INTO "Category" ("id", "name", "icon", "color")
      VALUES (gen_random_uuid(), ${cat.name}, ${cat.icon}, ${cat.color})
    `;
  }

  console.log("✅ Seed data created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });