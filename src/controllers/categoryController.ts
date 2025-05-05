import { Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../repositories/categoryRepository";
import { CategoryException } from "../exceptions/CategoryException";

const categorySchema = z.object({
  name: z.string(),
  type: z.enum(["income", "expense"]),
  cost_center_id: z.string(),
});

const listCategoriesSchema = z.object({
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val || 1), z.number().min(1).default(1)),
  items_per_page: z.preprocess(
    (val) => Number(val || 10),
    z.number().min(1).default(10)
  ),
  sort_by: z.union([z.string(), z.array(z.string())]).optional(),
  sort_order: z.union([z.enum(["asc", "desc"]), z.array(z.enum(["asc", "desc"]))]).optional(),
  cost_center_id: z.string().optional(),
});

export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const categoryData = categorySchema.parse(req.body);
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const category = await createCategory({
      ...categoryData,
      user_id,
    });
    res.json(category);
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else if (error instanceof CategoryException) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const listCategoriesController = async (req: Request, res: Response) => {
  try {
    const user_id = req.user?.id;
    const type = req.query.type as string | undefined;
    const queryData = listCategoriesSchema.parse(req.query);

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const result = await listCategories({
      user_id,
      search: queryData.search,
      type,
      page: queryData.page,
      items_per_page: queryData.items_per_page,
      sort_by: Array.isArray(queryData.sort_by) ? queryData.sort_by : queryData.sort_by ? [queryData.sort_by] : undefined,
      sort_order: Array.isArray(queryData.sort_order) ? queryData.sort_order : queryData.sort_order ? [queryData.sort_order] : undefined,
      cost_center_id: queryData.cost_center_id,
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const getCategoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const category = await getCategory(id);

    if (!category || category.user_id !== user_id) {
      res.status(404).json({ error: "Categoria não encontrada" });
      return;
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};

export const updateCategoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categoryData = categorySchema.parse(req.body);
    const user_id = req.user?.id;
    const category = await getCategory(id);

    if (!category || category.user_id !== user_id) {
      res.status(404).json({ error: "Categoria não encontrada" });
      return;
    }

    const updatedCategory = await updateCategory(id, categoryData);
    res.json(updatedCategory);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const deleteCategoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const category = await getCategory(id);

    if (!category || category.user_id !== user_id) {
      res.status(404).json({ error: "Categoria não encontrada" });
      return;
    }

    await deleteCategory(id);
    res.json({ message: "Categoria deletada" });
  } catch (error) {
    if (error instanceof CategoryException) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};
