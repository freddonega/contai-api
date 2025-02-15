import { Router } from "express";
import {
  getDashboard,
  getTotalsByCategory,
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

export default router;
