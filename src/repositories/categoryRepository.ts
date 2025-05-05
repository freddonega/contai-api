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

export const createCategory = async (
  data: Omit<Category, "id" | "created_at" | "updated_at">
): Promise<CategoryResponse> => {
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

  // Verifica se o centro de custo existe e pertence ao usuário
  const costCenter = await prisma.costCenter.findFirst({
    where: {
      id: data.cost_center_id,
      user_id: data.user_id,
    },
  });

  if (!costCenter) {
    throw new CategoryException("Centro de custo não encontrado ou não pertence ao usuário");
  }

  const category = await prisma.category.create({
    data,
    include: {
      cost_center: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const { cost_center_id, ...categoryWithoutCostCenterId } = category;
  return categoryWithoutCostCenterId as CategoryResponse;
};

interface ListCategoriesParams {
  user_id: string;
  search?: string;
  type?: string;
  cost_center_id?: string;
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
    ...(type && { type }),
    ...(cost_center_id && { cost_center_id }),
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
  data: Partial<Category>
): Promise<CategoryResponse> => {
  // Se estiver atualizando o centro de custo, verifica se ele existe e pertence ao usuário
  if (data.cost_center_id) {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new CategoryException("Categoria não encontrada");
    }

    const costCenter = await prisma.costCenter.findFirst({
      where: {
        id: data.cost_center_id,
        user_id: category.user_id,
      },
    });

    if (!costCenter) {
      throw new CategoryException("Centro de custo não encontrado ou não pertence ao usuário");
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data,
    include: {
      cost_center: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const { cost_center_id, ...categoryWithoutCostCenterId } = category;
  return categoryWithoutCostCenterId as CategoryResponse;
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
