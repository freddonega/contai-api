import { Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  createRecurringEntry,
  listRecurringEntries,
  getRecurringEntry,
  updateRecurringEntry,
  deleteRecurringEntry,
} from "../repositories/recurringEntryRepository";

import { getCategory } from "../repositories/categoryRepository";

const recurringEntrySchema = z.object({
  amount: z.number(),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  category_id: z.string(),
  payment_type_id: z.string().optional(),
  next_run: z.string().transform((str) => new Date(str)),
});

const listRecurringEntriesSchema = z.object({
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val || 1), z.number().min(1).default(1)),
  items_per_page: z.preprocess(
    (val) => Number(val || 10),
    z.number().min(1).max(100).default(10)
  ),
  sort_by: z.array(z.string()).optional(),
  sort_order: z.array(z.enum(["asc", "desc"])).optional(),
});

export const createRecurringEntryController = async (
  req: Request,
  res: Response
) => {
  try {
    const recurringEntryData = recurringEntrySchema.parse(req.body);
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const recurringEntry = await createRecurringEntry({
      ...recurringEntryData,
      description: recurringEntryData.description ?? null,
      payment_type_id: recurringEntryData.payment_type_id ?? null,
      user_id,
    });
    res.json(recurringEntry);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const listRecurringEntriesController = async (
  req: Request,
  res: Response
) => {
  try {
    const user_id = req.user?.id;
    const queryData = listRecurringEntriesSchema.parse(req.query);

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const result = await listRecurringEntries({
      user_id,
      page: queryData.page,
      items_per_page: queryData.items_per_page,
      sort_by: Array.isArray(queryData.sort_by) ? queryData.sort_by : queryData.sort_by ? [queryData.sort_by] : undefined,
      sort_order: Array.isArray(queryData.sort_order) ? queryData.sort_order : queryData.sort_order ? [queryData.sort_order] : undefined,
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

export const getRecurringEntryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const entry = await getRecurringEntry(id);
    if (!entry) {
      res.status(404).json({ error: "Entrada recorrente não encontrada" });
      return;
    }

    if (!entry || entry.user.id !== user_id) {
      res.status(404).json({ error: "Entrada recorrente não encontrada" });
      return;
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};

export const updateRecurringEntryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const recurringEntryData = recurringEntrySchema.parse(req.body);
    const user_id = req.user?.id;
    const entry = await getRecurringEntry(id);

    if (!entry || entry.user.id !== user_id) {
      res.status(404).json({ error: "Entrada recorrente não encontrada" });
      return;
    }

    const updatedEntry = await updateRecurringEntry(id, recurringEntryData);
    res.json(updatedEntry);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const deleteRecurringEntryController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const entry = await getRecurringEntry(id);

    if (!entry || entry.user.id !== user_id) {
      res.status(404).json({ error: "Entrada recorrente não encontrada" });
      return;
    }

    await deleteRecurringEntry(id);
    res.json({ message: "Entrada recorrente deletada" });
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};
