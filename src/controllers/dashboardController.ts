import { Request, Response } from "express";
import {
  getBalanceByYear,
  getTotalsByCategoryForMonth,
  getMonthlyBalance,
  getCategoryComparison,
  getIncomeExpenseRatioForMonth,
  getSurvivalTime, // Add this import
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

export const getCurrentMonthBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user_id = req?.user?.id;
    if (typeof user_id !== "number") {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const { currentMonthBalance, previousMonthBalance, percentageChange } =
      await getMonthlyBalance(currentYear, currentMonth, user_id);

    res.json({
      currentMonthBalance,
      previousMonthBalance,
      percentageChange,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getCategoryComparisonController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user_id = req?.user?.id;
    if (typeof user_id !== "number") {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const comparison = await getCategoryComparison(
      currentYear,
      currentMonth,
      user_id
    );

    res.json(comparison);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getIncomeExpenseRatio = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user_id = req?.user?.id;
    if (typeof user_id !== "number") {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const ratio = await getIncomeExpenseRatioForMonth(
      currentYear,
      currentMonth,
      user_id
    );

    res.json({ ratio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSurvivalTimeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user_id = req?.user?.id;
    if (typeof user_id !== "number") {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const survivalTime = await getSurvivalTime(user_id);
    res.json({ survivalTime });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
