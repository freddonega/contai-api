import { PrismaClient, Entry } from "@prisma/client";

const prisma = new PrismaClient();

export const createEntry = async (
  data: Omit<Entry, "id" | "created_at" | "updated_at">
): Promise<Omit<Entry, "user_id" | "category_id">> => {
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
  sort_by?: string;
  sort_order?: "asc" | "desc";
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

  const orderBy = sort_by ? { [sort_by]: sort_order } : {};

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

  const categories = await prisma.category.findMany();

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
