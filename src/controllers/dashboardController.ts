import { Request, Response } from "express";
import {
  getBalanceByYear,
  getTotalsByCategoryForMonth,
} from "../repositories/entryRepository";

export const getDashboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  const year = parseInt(req.params.year);

  if (isNaN(year)) {
    res.status(400).json({ error: "Invalid year parameter" });
    return;
  }

  try {
    const user_id = req?.user?.id;
    if (typeof user_id !== "number") {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    const balance = await getBalanceByYear(year, user_id);
    res.json(balance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTotalsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    res.status(400).json({ error: "Invalid year or month parameter" });
    return;
  }

  try {
    const user_id = req?.user?.id;
    if (typeof user_id !== "number") {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }
    const totals = await getTotalsByCategoryForMonth(year, month, user_id);
    res.json({
      year,
      month,
      totals,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
