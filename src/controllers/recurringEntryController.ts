import { Request, Response } from "express";
import { z, ZodError } from "zod";
import {
  createRecurringEntry,
  listRecurringEntries,
  getRecurringEntry,
  updateRecurringEntry,
  deleteRecurringEntry,
} from "../repositories/recurringEntryRepository";

const recurringEntrySchema = z.object({
  user_id: z.number(),
  amount: z.number(),
  description: z.string(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  category_id: z.number(),
  next_run: z.string().transform((str) => new Date(str)),
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
    const user_id = req.user?.id;
    if (!user_id) {
      res.status(401).json({ error: "ID do usuário não encontrado no token" });
      return;
    }
    const entries = await listRecurringEntries(user_id);

    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Erro Interno do Servidor" });
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
