import { PrismaClient, RecurringEntry } from "@prisma/client";

const prisma = new PrismaClient();

export const createRecurringEntry = async (
  data: Omit<RecurringEntry, "id" | "created_at" | "updated_at">
): Promise<RecurringEntry> => {
  return prisma.recurringEntry.create({
    data,
  });
};

export const listRecurringEntries = async (user_id: number) => {
  return prisma.recurringEntry.findMany({
    where: { user_id },
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
        },
      },
      next_run: true,
      created_at: true,
      updated_at: true,
    },
  });
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
