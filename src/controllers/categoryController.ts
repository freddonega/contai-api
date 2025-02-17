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
  type: z.string().refine((val) => val === "income" || val === "expense", {
    message: "O tipo deve ser 'income' ou 'expense'",
  }),
});

const listCategoriesSchema = z.object({
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val || 1), z.number().min(1).default(1)),
  items_per_page: z.preprocess(
    (val) => Number(val || 10),
    z.number().min(1).default(10)
  ),
});

export const createCategoryController = async (req: Request, res: Response) => {
  try {
    const categoryData = categorySchema.parse(req.body);
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const category = await createCategory({ ...categoryData, user_id });
    res.json(category);
  } catch (error) {
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
    const queryData = listCategoriesSchema.parse(req.query);
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const categories = await listCategories({ ...queryData, user_id });
    res.json(categories);
  } catch (error) {
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
    const category = await getCategory(Number(id));

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
    const user_id = req.user?.id;
    const categoryData = categorySchema.parse(req.body);
    const category = await getCategory(Number(id));

    if (!category || category.user_id !== user_id) {
      res.status(404).json({ error: "Categoria não encontrada" });
      return;
    }

    const updatedCategory = await updateCategory(Number(id), categoryData);
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
    const category = await getCategory(Number(id));

    if (!category || category.user_id !== user_id) {
      res.status(404).json({ error: "Categoria não encontrada" });
      return;
    }

    await deleteCategory(Number(id));
    res.json({ message: "Categoria deletada" });
  } catch (error) {
    if (error instanceof CategoryException) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};
