import { PrismaClient, Category, Prisma } from "@prisma/client";
import { CategoryException } from "../exceptions/CategoryException";
import { removeAccents } from "../utils/stringUtils";

const prisma = new PrismaClient();

export const createCategory = async (
  data: Omit<Category, "id" | "created_at" | "updated_at">
): Promise<Category> => {
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
  });
};

interface ListCategoriesParams {
  user_id: string;
  search?: string;
  type?: string;
  page?: number;
  items_per_page?: number;
  sort_by?: string[];
  sort_order?: Array<"asc" | "desc">;
}

export const listCategories = async ({
  user_id,
  search,
  type,
  page = 1,
  items_per_page = 10,
  sort_by,
  sort_order,
}: ListCategoriesParams) => {
  const where = {
    user_id,
    ...(type && { type }),
  };

  const orderBy = sort_by?.map((field, index) => ({
    [field]: sort_order?.[index] || "asc",
  })) || [];

  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy,
    }),
    prisma.category.count({ where }),
  ]);

  // Filtra os resultados para garantir que a busca sem acentos funcione
  const filteredCategories = search
    ? categories.filter((category) => {
        const categoryNameWithoutAccents = removeAccents(category.name.toLowerCase());
        const searchWithoutAccents = removeAccents(search.toLowerCase());
        return categoryNameWithoutAccents.includes(searchWithoutAccents);
      })
    : categories;

  // Aplica a paginação após a filtragem
  const paginatedCategories = filteredCategories.slice(
    (page - 1) * items_per_page,
    page * items_per_page
  );

  return {
    categories: paginatedCategories,
    total: filteredCategories.length,
    page,
    items_per_page,
    sort_by,
    sort_order,
  };
};

export const getCategory = async (id: string): Promise<Category | null> => {
  return prisma.category.findUnique({
    where: { id },
  });
};

export const updateCategory = async (
  id: string,
  data: Partial<Category>
): Promise<Category> => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: string): Promise<void> => {
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
