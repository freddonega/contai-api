import { Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  createEntry,
  listEntries,
  getEntry,
  updateEntry,
  deleteEntry,
} from "../repositories/entryRepository";

const entrySchema = z.object({
  amount: z.number(),
  description: z.string().nullable().optional(),
  category_id: z.number(),
  period: z
    .string()
    .regex(
      /^\d{4}-(0[1-9]|1[0-2])$/,
      "Formato de período inválido, deve ser YYYY-MM"
    ),
  payment_type_id: z.number().optional(),
});

const listEntriesSchema = z.object({
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val || 1), z.number().min(1).default(1)),
  items_per_page: z.preprocess(
    (val) => Number(val || 10),
    z.number().min(1).max(100).default(10)
  ),
  sort_by: z.array(z.string()).optional(),
  sort_order: z.array(z.enum(["asc", "desc"])).optional(),
});

export const createEntryController = async (req: Request, res: Response) => {
  try {
    const entryData = entrySchema.parse(req.body);
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }

    const entry = await createEntry({
      ...entryData,
      user_id,
      description: entryData.description ?? null,
      payment_type_id: entryData.payment_type_id ?? null,
    });
    res.json(entry);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const listEntriesController = async (req: Request, res: Response) => {
  try {
    let queryData = listEntriesSchema.parse(req.query);
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

    const entries = await listEntries({
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

export const getEntryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const entry = await getEntry(parseInt(id));

    if (!entry || entry.user_id !== user_id) {
      res.status(404).json({ error: "Entrada não encontrada" });
      return;
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};

export const updateEntryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const entryData = entrySchema.parse(req.body);
    const entry = await getEntry(parseInt(id));

    if (!entry || entry.user_id !== user_id) {
      res.status(404).json({ error: "Entrada não encontrada" });
      return;
    }

    const updatedEntry = await updateEntry(parseInt(id), entryData);
    res.json(updatedEntry);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Erro Interno do Servidor" });
    }
  }
};

export const deleteEntryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const entry = await getEntry(parseInt(id));

    if (!entry || entry.user_id !== user_id) {
      res.status(404).json({ error: "Entrada não encontrada" });
      return;
    }

    await deleteEntry(parseInt(id));
    res.json({ message: "Entrada deletada" });
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
  }
};
