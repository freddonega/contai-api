import express from "express";
import {
  createRecurringEntryController,
  listRecurringEntriesController,
  getRecurringEntryController,
  updateRecurringEntryController,
  deleteRecurringEntryController,
} from "../controllers/recurringEntryController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RecurringEntries
 *   description: API para gerenciar lançamentos recorrentes
 */

/**
 * @swagger
 * /recurring_entry:
 *   post:
 *     summary: Cria um novo lançamento recorrente
 *     tags: [RecurringEntries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *               category_id:
 *                 type: integer
 *               next_run:
 *                 type: string
 *             required:
 *               - amount
 *               - description
 *               - frequency
 *               - category_id
 *               - next_run
 *     responses:
 *       200:
 *         description: Lançamento recorrente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 amount:
 *                   type: number
 *                 description:
 *                   type: string
 *                 frequency:
 *                   type: string
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 next_run:
 *                   type: string
 *       500:
 *         description: Erro ao criar lançamento recorrente
 */
router.post(
  "/recurring_entry",
  authenticateToken,
  createRecurringEntryController
);

/**
 * @swagger
 * /recurring_entry:
 *   get:
 *     summary: Lista lançamentos recorrentes de um usuário
 *     tags: [RecurringEntries]
 *     responses:
 *       200:
 *         description: Lista de lançamentos recorrentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   amount:
 *                     type: number
 *                   description:
 *                     type: string
 *                   frequency:
 *                     type: string
 *                   category:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                   next_run:
 *                     type: string
 *       500:
 *         description: Erro ao listar lançamentos recorrentes
 */
router.get(
  "/recurring_entry",
  authenticateToken,
  listRecurringEntriesController
);

/**
 * @swagger
 * /recurring_entry/{id}:
 *   get:
 *     summary: Obtém um lançamento recorrente pelo ID
 *     tags: [RecurringEntries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do lançamento recorrente
 *     responses:
 *       200:
 *         description: Lançamento recorrente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 amount:
 *                   type: number
 *                 description:
 *                   type: string
 *                 frequency:
 *                   type: string
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 next_run:
 *                   type: string
 *       500:
 *         description: Erro ao buscar lançamento recorrente
 */
router.get(
  "/recurring_entry/:id",
  authenticateToken,
  getRecurringEntryController
);

/**
 * @swagger
 * /recurring_entry/{id}:
 *   put:
 *     summary: Atualiza um lançamento recorrente pelo ID
 *     tags: [RecurringEntries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do lançamento recorrente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *               category:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *               next_run:
 *                 type: string
 *             required:
 *               - amount
 *               - description
 *               - frequency
 *               - category
 *               - next_run
 *     responses:
 *       200:
 *         description: Lançamento recorrente atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 user_id:
 *                   type: integer
 *                 amount:
 *                   type: number
 *                 description:
 *                   type: string
 *                 frequency:
 *                   type: string
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                 next_run:
 *                   type: string
 *       500:
 *         description: Erro ao atualizar lançamento recorrente
 */
router.put(
  "/recurring_entry/:id",
  authenticateToken,
  updateRecurringEntryController
);

/**
 * @swagger
 * /recurring_entry/{id}:
 *   delete:
 *     summary: Exclui um lançamento recorrente pelo ID
 *     tags: [RecurringEntries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do lançamento recorrente
 *     responses:
 *       204:
 *         description: Lançamento recorrente excluído com sucesso
 *       500:
 *         description: Erro ao excluir lançamento recorrente
 */
router.delete(
  "/recurring_entry/:id",
  authenticateToken,
  deleteRecurringEntryController
);

export default router;
