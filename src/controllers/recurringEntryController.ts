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
  user_id: z.number(),
  amount: z.number(),
  description: z.string(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  category_id: z.number(),
  payment_type_id: z.number().nullable().default(null),
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
    const user_id = req.user?.id;
    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const entryData = recurringEntrySchema.parse({
      ...req.body,
      user_id,
    });

    // Verificar se a categoria é do tipo "expense" e se payment_type_id está presente
    const category = await getCategory(
      entryData.category_id ? entryData.category_id : 0
    );

    if (category?.type === "expense" && !entryData.payment_type_id) {
      res
        .status(400)
        .json({
          error:
            "payment_type_id é obrigatório para categorias do tipo expense",
        });
      return;
    }

    const entry = await createRecurringEntry(entryData);
    res.json(entry);
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
    let queryData = listRecurringEntriesSchema.parse(req.query);
    if (queryData.sort_by && !Array.isArray(queryData.sort_by)) {
      queryData = { ...queryData, sort_by: [queryData.sort_by] };
    }
    if (queryData.sort_order && !Array.isArray(queryData.sort_order)) {
      queryData = { ...queryData, sort_order: [queryData.sort_order] };
    }
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }
    const entries = await listRecurringEntries({
      ...queryData,
      sort_by: queryData.sort_by?.filter((item): item is string => !!item),
      sort_order: queryData.sort_order?.filter(
        (item): item is "asc" | "desc" => !!item
      ),
      user_id,
    });

    res.json(entries);
  } catch (error) {
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
    const id = Number(req.params.id);
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
    const user_id = req.user?.id;
    const id = Number(req.params.id);

    const entry = await getRecurringEntry(id);
    if (!entry || entry.user.id !== user_id) {
      res.status(404).json({ error: "Entrada recorrente não encontrada" });
      return;
    }

    const entryData = recurringEntrySchema.partial().parse(req.body);

    // Verificar se a categoria é do tipo "expense" e se payment_type_id está presente
    const category = await getCategory(
      entryData.category_id ? entryData.category_id : 0
    );

    if (
      category?.type === "expense" &&
      !entryData.payment_type_id &&
      !entry?.payment_type.id
    ) {
      res
        .status(400)
        .json({
          error:
            "payment_type_id é obrigatório para categorias do tipo expense",
        });
      return;
    }

    const updateEntry = await updateRecurringEntry(id, entryData);
    res.json(updateEntry);
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
    const id = Number(req.params.id);
    const user_id = req.user?.id;
    const entry = await getRecurringEntry(id);

    if (!entry || entry.user.id !== user_id) {
      res.status(404).json({ error: "Entrada recorrente não encontrada" });
      return;
    }

    await deleteRecurringEntry(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};
