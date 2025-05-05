import { PrismaClient, Entry } from "@prisma/client";
import { PrismaPromise } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

interface ListEntriesParams {
  search?: string;
  page?: number;
  items_per_page: number;
  sort_by?: string[];
  sort_order?: Array<"asc" | "desc">;
  user_id: string;
  category_id?: string[];
  category_type?: string[];
  payment_type_id?: string[];
  cost_center_id?: string[];
  from?: string;
  to?: string;
}

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
  category_id,
  category_type,
  payment_type_id,
  cost_center_id,
  from,
  to,
}: ListEntriesParams) => {
  const where = {
    user_id,
    ...(search && {
      description: {
        contains: search,
      },
    }),
    ...(category_id && { category_id: { in: category_id } }),
    ...(category_type && {
      category: {
        type: { in: category_type },
      },
    }),
    ...(payment_type_id && { payment_type_id: { in: payment_type_id } }),
    ...(cost_center_id && {
      category: {
        cost_center_id: { in: cost_center_id },
      },
    }),
    ...(from &&
      to && {
        period: {
          gte: from,
          lte: to,
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

  // Condicionalmente, determinamos qual agregação buscar
  let incomeResult = null;
  let expenseResult = null;

  if (category_type?.includes("income") || !category_type) {
    incomeResult = prisma.entry.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        ...where,
        category: {
          type: "income",
        },
      },
    });
  }

  if (category_type?.includes("expense") || !category_type) {
    expenseResult = prisma.entry.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        ...where,
        category: {
          type: "expense",
        },
      },
    });
  }

  // Filtragem principal
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
            cost_center: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.entry.count({ where }),
  ]);

  // Espera as agregações
  const [incomeResultData, expenseResultData] = await Promise.all([
    incomeResult,
    expenseResult,
  ]);

  const income = incomeResultData?._sum?.amount ?? 0;
  const expense = expenseResultData?._sum?.amount ?? 0;
  const total_amount = income - expense; // Income - Expense

  return {
    entries,
    total,
    page,
    items_per_page,
    sort_by,
    sort_order,
    total_amount,
  };
};

export const getEntry = async (id: string): Promise<Entry | null> => {
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
  id: string,
  data: Partial<Entry>
): Promise<Entry> => {
  return prisma.entry.update({
    where: { id },
    data,
  });
};

export const deleteEntry = async (id: string): Promise<void> => {
  await prisma.entry.delete({
    where: { id },
  });
};

export async function getEntriesByYear(year: number, user_id: string) {
  return await prisma.entry.findMany({
    where: {
      user_id,
      period: {
        startsWith: `${year}-`,
      },
    },
    include: {
      category: true,
    },
  });
}

export const getBalanceByYear = async (
  year: number,
  user_id: string
): Promise<{
  income: number;
  expense: number;
  balance: number;
  monthlyData: {
    month: number;
    income: number;
    expense: number;
    balance: number;
  }[];
}> => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const entries = await prisma.entry.findMany({
    where: {
      user_id,
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
    balance: 0,
  }));

  let totalIncome = 0;
  let totalExpense = 0;

  entries.forEach((entry) => {
    const month = entry.created_at.getMonth();
    const amount = entry.amount;

    if (entry.category.type === "income") {
      monthlyData[month].income += amount;
      totalIncome += amount;
    } else {
      monthlyData[month].expense += amount;
      totalExpense += amount;
    }

    monthlyData[month].balance =
      monthlyData[month].income - monthlyData[month].expense;
  });

  return {
    income: totalIncome,
    expense: totalExpense,
    balance: totalIncome - totalExpense,
    monthlyData,
  };
};

export const getTotalsByCategoryForMonth = async (
  year: number,
  month: number,
  user_id: string
): Promise<
  {
    category_id: string;
    category_name: string;
    category_type: string;
    total: number;
  }[]
> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const entries = await prisma.entry.findMany({
    where: {
      user_id,
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  const categoryTotals = new Map<
    string,
    {
      category_name: string;
      category_type: string;
      total: number;
    }
  >();

  entries.forEach((entry) => {
    const categoryId = entry.category_id;
    const currentTotal = categoryTotals.get(categoryId);

    if (currentTotal) {
      currentTotal.total += entry.amount;
    } else {
      categoryTotals.set(categoryId, {
        category_name: entry.category.name,
        category_type: entry.category.type,
        total: entry.amount,
      });
    }
  });

  return Array.from(categoryTotals.entries()).map(([category_id, data]) => ({
    category_id,
    ...data,
  }));
};

export const getMonthlyBalance = async (
  year: number,
  month: number,
  user_id: string
): Promise<{
  currentMonthBalance: number;
  previousMonthBalance: number;
  percentageChange: number;
}> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  const previousStartDate = new Date(year, month - 2, 1);
  const previousEndDate = new Date(year, month - 1, 0, 23, 59, 59);

  const [currentMonthEntries, previousMonthEntries] = await Promise.all([
    prisma.entry.findMany({
      where: {
        user_id,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    }),
    prisma.entry.findMany({
      where: {
        user_id,
        created_at: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      include: {
        category: true,
      },
    }),
  ]);

  const calculateBalance = (entries: typeof currentMonthEntries) => {
    return entries.reduce((acc, entry) => {
      return (
        acc +
        (entry.category.type === "income" ? entry.amount : -entry.amount)
      );
    }, 0);
  };

  const currentMonthBalance = calculateBalance(currentMonthEntries);
  const previousMonthBalance = calculateBalance(previousMonthEntries);

  const percentageChange =
    previousMonthBalance === 0
      ? 100
      : ((currentMonthBalance - previousMonthBalance) /
          Math.abs(previousMonthBalance)) *
        100;

  return {
    currentMonthBalance,
    previousMonthBalance,
    percentageChange,
  };
};

export const getCategoryComparison = async (
  year: number,
  month: number,
  user_id: string
): Promise<
  {
    category_name: string;
    current_month: number;
    previous_month: number;
    percentage_change: number;
  }[]
> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  const previousStartDate = new Date(year, month - 2, 1);
  const previousEndDate = new Date(year, month - 1, 0, 23, 59, 59);

  const [currentMonthEntries, previousMonthEntries] = await Promise.all([
    prisma.entry.findMany({
      where: {
        user_id,
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    }),
    prisma.entry.findMany({
      where: {
        user_id,
        created_at: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      include: {
        category: true,
      },
    }),
  ]);

  const categoryTotals = new Map<
    string,
    {
      category_name: string;
      current_month: number;
      previous_month: number;
    }
  >();

  currentMonthEntries.forEach((entry) => {
    const categoryName = entry.category.name;
    const current = categoryTotals.get(categoryName);

    if (current) {
      current.current_month += entry.amount;
    } else {
      categoryTotals.set(categoryName, {
        category_name: categoryName,
        current_month: entry.amount,
        previous_month: 0,
      });
    }
  });

  previousMonthEntries.forEach((entry) => {
    const categoryName = entry.category.name;
    const current = categoryTotals.get(categoryName);

    if (current) {
      current.previous_month += entry.amount;
    } else {
      categoryTotals.set(categoryName, {
        category_name: categoryName,
        current_month: 0,
        previous_month: entry.amount,
      });
    }
  });

  return Array.from(categoryTotals.values()).map((data) => ({
    ...data,
    percentage_change:
      data.previous_month === 0
        ? 100
        : ((data.current_month - data.previous_month) /
            Math.abs(data.previous_month)) *
          100,
  }));
};

export const getIncomeExpenseRatioForMonth = async (
  year: number,
  month: number,
  user_id: string
): Promise<number> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const entries = await prisma.entry.findMany({
    where: {
      user_id,
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;

  entries.forEach((entry) => {
    if (entry.category.type === "income") {
      totalIncome += entry.amount;
    } else {
      totalExpense += entry.amount;
    }
  });

  return totalExpense === 0 ? totalIncome : totalIncome / totalExpense;
};

export const getSurvivalTime = async (user_id: string): Promise<number> => {
  const totalExpensePerMonth = await prisma.entry.aggregate({
    _avg: {
      amount: true,
    },
    where: {
      user_id,
      category: {
        type: "expense",
      },
    },
  });

  const totalBalance = await getTotalBalance(user_id);

  const averageExpensePerMonth = totalExpensePerMonth._avg?.amount ?? 0;

  return averageExpensePerMonth === 0
    ? Infinity
    : totalBalance / averageExpensePerMonth;
};

export const getTotalBalance = async (user_id: string): Promise<number> => {
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

  return (income._sum?.amount ?? 0) - (expense._sum?.amount ?? 0);
};

export const getMonthlyTotalsByType = async (
  user_id: string,
  year: number,
  month: number
): Promise<Record<string, number>> => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const entries = await prisma.entry.findMany({
    where: {
      user_id,
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      payment_type: true,
    },
  });

  const totals: Record<string, number> = {};

  entries.forEach((entry) => {
    const paymentTypeName = entry.payment_type?.name || "Sem tipo de pagamento";
    totals[paymentTypeName] = (totals[paymentTypeName] || 0) + entry.amount;
  });

  return totals;
};
