import { PrismaClient, Entry } from "@prisma/client";

const prisma = new PrismaClient();

export const createEntry = async (
  data: Omit<Entry, "id" | "created_at" | "updated_at">
): Promise<Omit<Entry, "user_id" | "category_id" | "payment_type_id">> => {
  return prisma.entry.create({
    data,
    select: {
      id: true,
      description: true,
      amount: true,
      period: true,
      created_at: true,
      updated_at: true,
      category: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      payment_type: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const listEntries = async ({
  search,
  page = 1,
  items_per_page,
  sort_by,
  sort_order,
  user_id,
}: {
  search?: string;
  page?: number;
  items_per_page: number;
  sort_by?: string[];
  sort_order?: Array<"asc" | "desc">;
  user_id: number;
}) => {
  const where = {
    user_id,
    ...(search && {
      description: {
        contains: search,
      },
    }),
  };

  const orderBy =
    sort_by?.map((field, index) =>
      field.startsWith("category.")
        ? { category: { [field.split(".")[1]]: sort_order?.[index] } }
        : { [field]: sort_order?.[index] }
    ) || [];

  orderBy.sort((a, b) => {
    if (a.category && !b.category) return 1;
    if (!a.category && b.category) return -1;
    return 0;
  });

  const [entries, total] = await prisma.$transaction([
    prisma.entry.findMany({
      where,
      skip: (page - 1) * items_per_page,
      take: items_per_page,
      orderBy,
      select: {
        id: true,
        description: true,
        amount: true,
        period: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    }),
    prisma.entry.count({ where }),
  ]);

  return {
    entries,
    total,
    page,
    items_per_page,
    sort_by,
    sort_order,
  };
};

export const getEntry = async (id: number): Promise<Entry | null> => {
  return prisma.entry.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      payment_type: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const updateEntry = async (
  id: number,
  data: Partial<Entry>
): Promise<Entry> => {
  return prisma.entry.update({
    where: { id },
    data,
  });
};

export const deleteEntry = async (id: number): Promise<void> => {
  await prisma.entry.delete({
    where: { id },
  });
};

export async function getEntriesByYear(year: number, user_id: number) {
  return await prisma.entry.findMany({
    where: {
      user_id: user_id,
      period: {
        startsWith: `${year}-`,
      },
    },
    include: {
      category: true,
    },
  });
}

export async function getBalanceByYear(year: number, user_id: number) {
  const entries = await getEntriesByYear(year, user_id);

  const result = Array.from({ length: 12 }, (_, month) => ({
    month: `${year}-${String(month + 1).padStart(2, "0")}`,
    income: Number(
      entries
        .filter(
          (entry) =>
            entry.category.type === "income" &&
            new Date(`${entry.period}-02`).getMonth() === month
        )
        .reduce((sum, entry) => sum + entry.amount, 0)
        .toFixed(2)
    ),
    expense: Number(
      entries
        .filter(
          (entry) =>
            entry.category.type === "expense" &&
            new Date(`${entry.period}-02`).getMonth() === month
        )
        .reduce((sum, entry) => sum + entry.amount, 0)
        .toFixed(2)
    ),
  }));

  return result;
}

export async function getTotalsByCategoryForMonth(
  year: number,
  month: number,
  user_id: number
) {
  const entries = await prisma.entry.findMany({
    where: {
      user_id: user_id,
      period: `${year}-${String(month).padStart(2, "0")}`,
    },
    include: {
      category: true,
    },
  });

  const categories = await prisma.category.findMany({
    where: {
      user_id,
    },
  });

  const totals = categories.map((category) => {
    const total = entries
      .filter((entry) => entry.category.id === category.id)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      category_id: category.id,
      category_name: category.name,
      type: category.type,
      total,
    };
  });

  return totals;
}

export async function getMonthlyBalance(
  year: number,
  month: number,
  user_id: number
) {
  const currentMonthEntries = await prisma.entry.findMany({
    where: {
      user_id: user_id,
      period: `${year}-${String(month).padStart(2, "0")}`,
    },
    include: {
      category: true,
    },
  });

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;

  const previousMonthEntries = await prisma.entry.findMany({
    where: {
      user_id: user_id,
      period: `${previousYear}-${String(previousMonth).padStart(2, "0")}`,
    },
    include: {
      category: true,
    },
  });

  const calculateBalance = (
    entries: (Entry & { category: { type: string } })[]
  ) =>
    entries.reduce(
      (balance, entry) =>
        entry.category.type === "income"
          ? balance + entry.amount
          : balance - entry.amount,
      0
    );

  const currentMonthBalance = calculateBalance(currentMonthEntries);
  const previousMonthBalance = calculateBalance(previousMonthEntries);

  const percentageChange =
    previousMonthBalance === 0
      ? 0
      : Number(
          (
            ((currentMonthBalance - previousMonthBalance) /
              Math.abs(previousMonthBalance)) *
            100
          ).toFixed(2)
        );

  return {
    currentMonthBalance,
    previousMonthBalance,
    percentageChange,
  };
}

export async function getHighestCategoryForMonth(
  year: number,
  month: number,
  user_id: number
) {
  const period = `${year}-${String(month).padStart(2, "0")}`;

  const categoryTotals = await prisma.entry.groupBy({
    by: ["category_id"],
    where: { user_id, period },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany({
    where: { user_id },
  });

  // Encontrar a categoria com maior soma para income e expense
  const highestIncome = categoryTotals
    .map((entry) => ({
      ...entry,
      category: categories.find((cat) => cat.id === entry.category_id),
    }))
    .filter((entry) => entry.category?.type === "income")
    .reduce(
      (max, entry) =>
        entry._sum.amount !== null &&
        entry.category &&
        entry._sum.amount > max.amount
          ? { category: entry.category.name, amount: entry._sum.amount }
          : max,
      { category: "", amount: 0 }
    );

  const highestExpense = categoryTotals
    .map((entry) => ({
      ...entry,
      category: categories.find((cat) => cat.id === entry.category_id),
    }))
    .filter((entry) => entry.category?.type === "expense")
    .reduce(
      (max, entry) =>
        (entry._sum.amount ?? 0) > max.amount
          ? {
              category: entry.category?.name ?? "",
              amount: entry._sum.amount ?? 0,
            }
          : max,
      { category: "", amount: 0 }
    );

  return { highestIncome, highestExpense };
}

export async function getCategoryComparison(
  year: number,
  month: number,
  user_id: number
) {
  const currentMonthData = await getHighestCategoryForMonth(
    year,
    month,
    user_id
  );

  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;

  const previousMonthData = await getHighestCategoryForMonth(
    previousYear,
    previousMonth,
    user_id
  );

  // Calcula a variação percentual, evitando divisão por zero
  const calculateChange = (current: number, previous: number) =>
    previous === 0
      ? current > 0
        ? 100
        : 0
      : ((current - previous) / previous) * 100;

  return {
    highestIncome: {
      ...currentMonthData.highestIncome,
      percentageChange: calculateChange(
        currentMonthData.highestIncome.amount,
        previousMonthData.highestIncome.amount
      ),
    },
    highestExpense: {
      ...currentMonthData.highestExpense,
      percentageChange: calculateChange(
        currentMonthData.highestExpense.amount,
        previousMonthData.highestExpense.amount
      ),
    },
  };
}

export async function getIncomeExpenseRatioForMonth(
  year: number,
  month: number,
  user_id: number
): Promise<number> {
  const period = `${year}-${String(month).padStart(2, "0")}`;

  // Faz o cálculo direto no banco, evitando processar em memória
  const { _sum: incomeSum } = await prisma.entry.aggregate({
    _sum: { amount: true },
    where: {
      user_id,
      period,
      category: { type: "income" },
    },
  });

  const { _sum: expenseSum } = await prisma.entry.aggregate({
    _sum: { amount: true },
    where: {
      user_id,
      period,
      category: { type: "expense" },
    },
  });

  const income = incomeSum.amount ?? 0;
  const expense = expenseSum.amount ?? 0;

  return expense === 0 ? Infinity : income / expense;
}

export async function getSurvivalTime(user_id: number): Promise<number> {
  // Calcula o saldo atual (soma de todas as receitas - soma de todas as despesas)
  const { _sum: incomeSum } = await prisma.entry.aggregate({
    _sum: { amount: true },
    where: {
      user_id,
      category: { type: "income" },
    },
  });

  const { _sum: expenseSum } = await prisma.entry.aggregate({
    _sum: { amount: true },
    where: {
      user_id,
      category: { type: "expense" },
    },
  });

  const currentBalance = (incomeSum.amount ?? 0) - (expenseSum.amount ?? 0);

  // Obtém os gastos dos últimos 12 meses para calcular a média mensal corretamente
  const expensesByMonth = await prisma.entry.groupBy({
    by: ["period"],
    _sum: { amount: true },
    where: {
      user_id,
      category: { type: "expense" },
      period: {
        gte: `${new Date().getFullYear() - 1}-${String(
          new Date().getMonth() + 1
        ).padStart(2, "0")}`, // Últimos 12 meses
      },
    },
  });

  // Calcula a média mensal de despesas apenas com os meses que tiveram gastos
  const totalExpenses = expensesByMonth.reduce(
    (sum, entry) => sum + (entry._sum.amount ?? 0),
    0
  );

  const monthsWithExpenses = expensesByMonth.length || 1; // Evita divisão por zero
  const averageMonthlyExpenses = totalExpenses / monthsWithExpenses;

  // Calcula o tempo de sobrevivência (meses)
  return averageMonthlyExpenses === 0
    ? Infinity
    : currentBalance / averageMonthlyExpenses;
}

export const getTotalBalance = async (user_id: number): Promise<number> => {
  const income = await prisma.entry.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      user_id,
      category: {
        type: "income",
      },
    },
  });

  const expense = await prisma.entry.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      user_id,
      category: {
        type: "expense",
      },
    },
  });

  return (income._sum.amount || 0) - (expense._sum.amount || 0);
};

export async function getMonthlyTotalsByType(
  user_id: number,
  year: number,
  month: number
) {
  const period = `${year}-${String(month).padStart(2, "0")}`;

  const entries = await prisma.entry.groupBy({
    by: ["period", "payment_type_id"],
    where: { user_id, period },
    _sum: { amount: true },
  });

  const paymentTypes = await prisma.paymentType.findMany();

  const totalsByType = entries.reduce((acc, entry) => {
    const paymentType = paymentTypes.find(
      (pt) => pt.id === entry.payment_type_id
    );
    if (paymentType) {
      const payment_type_name = paymentType.name;
      if (!acc[payment_type_name]) {
        acc[payment_type_name] = 0;
      }
      acc[payment_type_name] += entry._sum.amount ?? 0;
    }
    return acc;
  }, {} as Record<string, number>);

  return totalsByType;
}
