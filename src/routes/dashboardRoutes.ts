import { Router } from "express";
import {
  getDashboard,
  getTotalsByCategory,
  getCurrentMonthBalance,
  getCategoryComparisonController,
  getIncomeExpenseRatio,
  getSurvivalTimeController, // Add this import
} from "../controllers/dashboardController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /dashboard/{year}:
 *   get:
 *     summary: Retrieve the dashboard data for a specific year
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: The year for which to retrieve the dashboard data
 *     responses:
 *       200:
 *         description: The dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month:
 *                     type: string
 *                   income:
 *                     type: number
 *                   expense:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */

router.get("/dashboard/:year", authenticateToken, getDashboard);

/**
 * @swagger
 * /dashboard/{year}/{month}/totals:
 *   get:
 *     summary: Retrieve the totals by category for a specific month
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: The year for which to retrieve the totals
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: The month for which to retrieve the totals
 *     responses:
 *       200:
 *         description: The totals by category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: number
 *                   category_name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   total:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not Found
 */

router.get(
  "/dashboard/:year/:month/totals",
  authenticateToken,
  getTotalsByCategory
);

/**
 * @swagger
 * /dashboard/month/current:
 *   get:
 *     summary: Retrieve the balance for the current month and the percentage change compared to the previous month
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: The balance for the current month and the percentage change
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentMonthBalance:
 *                   type: number
 *                 previousMonthBalance:
 *                   type: number
 *                 percentageChange:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.get(
  "/dashboard/month/current",
  authenticateToken,
  getCurrentMonthBalance
);

/**
 * @swagger
 * /dashboard/category/comparison:
 *   get:
 *     summary: Obtém a categoria com maior movimentação em income e expense do mês atual e compara com o mês anterior
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Comparação de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 highestIncome:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     percentageChange:
 *                       type: number
 *                 highestExpense:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     percentageChange:
 *                       type: number
 *       401:
 *         description: ID do usuário não encontrado no token
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get(
  "/dashboard/category/comparison",
  authenticateToken,
  getCategoryComparisonController
);

/**
 * @swagger
 * /dashboard/month/current/ratio:
 *   get:
 *     summary: Retrieve the income/expense ratio for the current month
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: The income/expense ratio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ratio:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/dashboard/month/current/ratio",
  authenticateToken,
  getIncomeExpenseRatio
);

/**
 * @swagger
 * /dashboard/balance/survival:
 *   get:
 *     summary: Retrieve the survival time for the user
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: The survival time in months
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 survivalTime:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  "/dashboard/balance/survival",
  authenticateToken,
  getSurvivalTimeController
);

export default router;
