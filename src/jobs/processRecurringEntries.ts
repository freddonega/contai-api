import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const processRecurringEntries = async () => {
  console.log("Processando recorrências");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const recurringEntries = await prisma.recurringEntry.findMany({
    where: {
      next_run: { lte: today }, // Pega todas as recorrências que precisam ser executadas
    },
  });

  for (const entry of recurringEntries) {
    await prisma.entry.create({
      data: {
        user_id: entry.user_id,
        category_id: entry.category_id,
        amount: entry.amount,
        description: entry.description,
        period: today.toISOString().slice(0, 7), // Formato YYYY-MM
      },
    });

    let nextRun = new Date(entry.next_run);
    switch (entry.frequency) {
      case "daily":
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case "monthly":
        const currentDate = nextRun.getDate();
        nextRun.setMonth(nextRun.getMonth() + 1);
        nextRun.setDate(currentDate);
        break;
      case "weekly":
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case "yearly":
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
    }

    await prisma.recurringEntry.update({
      where: { id: entry.id },
      data: { next_run: nextRun },
    });
  }
};
