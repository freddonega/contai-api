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
});

const listEntriesSchema = z.object({
  search: z.string().optional(),
  page: z.preprocess((val) => Number(val || 1), z.number().min(1).default(1)),
  items_per_page: z.preprocess(
    (val) => Number(val || 10),
    z.number().min(1).max(100).default(10)
  ),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
});

export const createEntryController = async (req: Request, res: Response) => {
  try {
    const entryData = entrySchema.parse(req.body);
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "User ID not found in token" });
      return;
    }

    const entry = await createEntry({
      ...entryData,
      user_id,
      description: entryData.description ?? null,
    });
    res.json(entry);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const listEntriesController = async (req: Request, res: Response) => {
  try {
    const queryData = listEntriesSchema.parse(req.query);
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: "User ID not found in token" });
      return;
    }

    const entries = await listEntries({
      ...queryData,
      user_id,
    });
    res.json(entries);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const getEntryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const entry = await getEntry(parseInt(id));

    if (!entry || entry.user_id !== user_id) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateEntryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const entryData = entrySchema.parse(req.body);
    const entry = await getEntry(parseInt(id));

    if (!entry || entry.user_id !== user_id) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    const updatedEntry = await updateEntry(parseInt(id), entryData);
    res.json(updatedEntry);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

export const deleteEntryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const entry = await getEntry(parseInt(id));

    if (!entry || entry.user_id !== user_id) {
      res.status(404).json({ error: "Entry not found" });
      return;
    }

    await deleteEntry(parseInt(id));
    res.json({ message: "Entry deleted" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
