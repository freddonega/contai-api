import { PrismaClient, RecurringEntry } from "@prisma/client";

const prisma = new PrismaClient();

export const createRecurringEntry = async (
  data: Omit<RecurringEntry, "id" | "created_at" | "updated_at">
): Promise<RecurringEntry> => {
  return prisma.recurringEntry.create({
    data,
  });
};

export const listRecurringEntries = async ({
  user_id,
  search,
  page = 1,
  items_per_page,
  sort_by,
  sort_order,
}: {
  user_id: number;
  search?: string;
  page?: number;
  items_per_page: number;
  sort_by?: string[];
  sort_order?: Array<"asc" | "desc">;
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
    prisma.recurringEntry.findMany({
      where,
      skip: (page - 1) * items_per_page,
      take: items_per_page,
      orderBy,
      select: {
        id: true,
        amount: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        description: true,
        frequency: true,
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        next_run: true,
        created_at: true,
        updated_at: true,
      },
    }),
    prisma.recurringEntry.count({ where }),
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

export const getRecurringEntry = async (
  id: number
): Promise<
  | (Omit<RecurringEntry, "user_id" | "category_id"> & {
      user: any;
      category: any;
    })
  | null
> => {
  return prisma.recurringEntry.findUnique({
    where: { id },
    select: {
      id: true,
      amount: true,
      user: true,
      description: true,
      frequency: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      next_run: true,
      created_at: true,
      updated_at: true,
    },
  });
};

export const updateRecurringEntry = async (
  id: number,
  data: Partial<RecurringEntry>
): Promise<RecurringEntry> => {
  return prisma.recurringEntry.update({
    where: { id },
    data,
  });
};

export const deleteRecurringEntry = async (id: number): Promise<void> => {
  await prisma.recurringEntry.delete({
    where: { id },
  });
};
