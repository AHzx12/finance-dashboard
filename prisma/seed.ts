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

  await prisma.category.deleteMany({ where: { userId: null } });

  for (const cat of defaultCategories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
      },
    });
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