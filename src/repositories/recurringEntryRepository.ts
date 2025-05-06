import { PrismaClient, RecurringEntry, Prisma } from "@prisma/client";
import { removeAccents } from "../utils/stringUtils";

const prisma = new PrismaClient();

export const createRecurringEntry = async (
  data: Omit<RecurringEntry, "id" | "created_at" | "updated_at">
): Promise<Omit<RecurringEntry, "user_id" | "category_id" | "payment_type_id">> => {
  return prisma.recurringEntry.create({
    data,
    select: {
      id: true,
      amount: true,
      description: true,
      frequency: true,
      next_run: true,
      last_run: true,
      created_at: true,
      updated_at: true,
      category: {
        select: {
          id: true,
          name: true,
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

interface ListRecurringEntriesParams {
  user_id: string;
  search?: string;
  page?: number;
  items_per_page?: number;
  sort_by?: string[];
  sort_order?: Array<"asc" | "desc">;
}

export const listRecurringEntries = async ({
  user_id,
  search,
  page = 1,
  items_per_page = 10,
  sort_by,
  sort_order,
}: ListRecurringEntriesParams) => {
  const where = {
    user_id,
  };

  const order_by = sort_by?.map((field, index) => ({
    [field]: sort_order?.[index] || "asc",
  })) || [];

  const [recurring_entries, total] = await prisma.$transaction([
    prisma.recurringEntry.findMany({
      where,
      orderBy: order_by,
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
    }),
    prisma.recurringEntry.count({ where }),
  ]);

  // Filtra os resultados para garantir que a busca sem acentos funcione
  const filteredEntries = search
    ? recurring_entries.filter((entry) => {
        const descriptionWithoutAccents = removeAccents(entry.description?.toLowerCase() || '');
        const searchWithoutAccents = removeAccents(search.toLowerCase());
        return descriptionWithoutAccents.includes(searchWithoutAccents);
      })
    : recurring_entries;

  // Aplica a paginação após a filtragem
  const paginatedEntries = filteredEntries.slice(
    (page - 1) * items_per_page,
    page * items_per_page
  );

  return {
    recurring_entries: paginatedEntries,
    total: filteredEntries.length,
    page,
    items_per_page,
    sort_by,
    sort_order,
  };
};

export const getRecurringEntry = async (
  id: string
): Promise<
  | (Omit<RecurringEntry, "user_id" | "category_id" | "payment_type_id"> & {
      user: any;
      category: any;
      payment_type: any;
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
      payment_type: {
        select: {
          id: true,
          name: true,
        },
      },
      next_run: true,
      last_run: true,
      created_at: true,
      updated_at: true,
    },
  });
};

export const updateRecurringEntry = async (
  id: string,
  data: Partial<RecurringEntry>
): Promise<RecurringEntry> => {
  return prisma.recurringEntry.update({
    where: { id },
    data,
  });
};

export const deleteRecurringEntry = async (id: string): Promise<void> => {
  await prisma.recurringEntry.delete({
    where: { id },
  });
};
