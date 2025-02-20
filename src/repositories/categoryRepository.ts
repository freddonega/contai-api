import { PrismaClient, Category, Prisma } from "@prisma/client";
import { CategoryException } from "../exceptions/CategoryException";

const prisma = new PrismaClient();

export const createCategory = async (
  data: Omit<Category, "id" | "created_at" | "updated_at">
): Promise<Omit<Category, "user_id">> => {
  const existingCategory = await prisma.category.findFirst({
    where: {
      name: data.name,
      type: data.type,
      user_id: data.user_id,
    },
  });

  if (existingCategory) {
    throw new CategoryException("Categoria com o mesmo nome e tipo já existe");
  }

  return prisma.category.create({
    data,
    select: {
      id: true,
      name: true,
      type: true,
      created_at: true,
      updated_at: true,
    },
  });
};

export const listCategories = async ({
  search,
  page = 1,
  items_per_page,
  user_id,
  sort_by,
  sort_order,
}: {
  search?: string;
  page: number;
  items_per_page: number;
  user_id: number;
  sort_by?: string[];
  sort_order?: Prisma.SortOrder;
}) => {
  const where = {
    user_id,
    ...(search && {
      name: {
        contains: search,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
  };

  const orderBy = sort_by
    ? sort_by.map((field) => ({ [field]: sort_order || "asc" }))
    : [{ created_at: Prisma.SortOrder.desc }];

  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      skip: (page - 1) * items_per_page,
      take: items_per_page,
      orderBy,
    }),
    prisma.category.count({ where }),
  ]);
  return {
    categories,
    total,
    page,
    items_per_page,
  };
};

export const getCategory = async (id: number): Promise<Category | null> => {
  return prisma.category.findUnique({
    where: { id },
  });
};

export const updateCategory = async (
  id: number,
  data: Partial<Category>
): Promise<Category> => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: number): Promise<void> => {
  const linkedEntries = await prisma.entry.findMany({
    where: { category_id: id },
  });

  if (linkedEntries.length > 0) {
    throw new CategoryException(
      "Categoria não pode ser excluída pois está vinculada a uma ou mais entradas"
    );
  }

  await prisma.category.delete({
    where: { id },
  });
};
