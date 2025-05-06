import { PrismaClient, Category, Prisma } from "@prisma/client";
import { CategoryException } from "../exceptions/CategoryException";
import { removeAccents } from "../utils/stringUtils";

const prisma = new PrismaClient();

type CategoryResponse = Omit<Category, "cost_center_id"> & {
  cost_center: {
    id: string;
    name: string;
  };
};

export const createCategory = async ({
  name,
  type,
  cost_center_id,
  user_id,
}: {
  name: string;
  type: string;
  cost_center_id?: string | null | undefined;
  user_id: string;
}) => {
  try {
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        type,
        user_id,
      },
    });

    if (existingCategory) {
      throw new CategoryException("Categoria já existe");
    }

    if (type === "expense" && !cost_center_id) {
      throw new CategoryException("Centro de custo é obrigatório para categorias de despesa");
    }

    if (type === "income" && cost_center_id) {
      throw new CategoryException("Centro de custo deve ser nulo para categorias de receita");
    }

    if (cost_center_id) {
      const costCenter = await prisma.costCenter.findFirst({
        where: {
          id: cost_center_id,
          user_id,
        },
      });

      if (!costCenter) {
        throw new CategoryException("Centro de custo não encontrado");
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        cost_center_id: cost_center_id || null,
        user_id,
      },
    });

    return category;
  } catch (error) {
    if (error instanceof CategoryException) {
      throw error;
    }
    throw new CategoryException("Erro ao criar categoria");
  }
};

interface ListCategoriesParams {
  user_id: string;
  search?: string;
  type?: string | string[];
  cost_center_id?: string | string[];
  page?: number;
  items_per_page?: number;
  sort_by?: string[];
  sort_order?: Array<"asc" | "desc">;
}

interface ListCategoriesResponse {
  categories: CategoryResponse[];
  total: number;
  page: number;
  items_per_page: number;
  sort_by?: string[] | undefined;
  sort_order?: Array<"asc" | "desc"> | undefined;
}

export const listCategories = async ({
  user_id,
  search,
  type,
  cost_center_id,
  page = 1,
  items_per_page = 10,
  sort_by,
  sort_order,
}: ListCategoriesParams): Promise<ListCategoriesResponse> => {
  const where = {
    user_id,
    ...(type && { type: Array.isArray(type) ? { in: type } : type }),
    ...(cost_center_id && { cost_center_id: Array.isArray(cost_center_id) ? { in: cost_center_id } : cost_center_id }),
  };

  const orderBy = sort_by?.map((field, index) => ({
    [field]: sort_order?.[index] || "asc",
  })) || [];

  const [categories, total] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      orderBy,
      include: {
        cost_center: {
          select: {
            id: true,
            name: true,
          },
        },
      },
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

  // Remove cost_center_id de cada categoria
  const categoriesWithoutCostCenterId = paginatedCategories.map(({ cost_center_id, ...category }) => category as CategoryResponse);

  return {
    categories: categoriesWithoutCostCenterId,
    total: filteredCategories.length,
    page,
    items_per_page,
    sort_by,
    sort_order,
  };
};

export const getCategory = async (id: string): Promise<CategoryResponse | null> => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      cost_center: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!category) return null;

  const { cost_center_id, ...categoryWithoutCostCenterId } = category;
  return categoryWithoutCostCenterId as CategoryResponse;
};

export const updateCategory = async (
  id: string,
  {
    name,
    type,
    cost_center_id,
  }: {
    name?: string;
    type?: string;
    cost_center_id?: string | null | undefined;
  }
) => {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new CategoryException("Categoria não encontrada");
    }

    if (type === "expense" && !cost_center_id) {
      throw new CategoryException("Centro de custo é obrigatório para categorias de despesa");
    }

    if (type === "income" && cost_center_id) {
      throw new CategoryException("Centro de custo deve ser nulo para categorias de receita");
    }

    if (cost_center_id) {
      const costCenter = await prisma.costCenter.findFirst({
        where: {
          id: cost_center_id,
          user_id: category.user_id,
        },
      });

      if (!costCenter) {
        throw new CategoryException("Centro de custo não encontrado");
      }
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        type,
        cost_center_id: cost_center_id || null,
      },
    });

    return updatedCategory;
  } catch (error) {
    if (error instanceof CategoryException) {
      throw error;
    }
    throw new CategoryException("Erro ao atualizar categoria");
  }
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
