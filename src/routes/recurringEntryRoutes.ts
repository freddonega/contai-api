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
 *                 type: string
 *               payment_type_id:
 *                 type: string
 *               next_run:
 *                 type: string
 *                 format: date-time
 *               last_run:
 *                 type: string
 *                 format: date-time
 *                 description: Data da última execução (opcional)
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
 *                   type: string
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
 *                       type: string
 *                     name:
 *                       type: string
 *                 payment_type:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 next_run:
 *                   type: string
 *                   format: date-time
 *                 last_run:
 *                   type: string
 *                   format: date-time
 *                   description: Data da última execução
 *       400:
 *         description: Erro de validação
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
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: items_per_page
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Campos para ordenar os lançamentos recorrentes
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [asc, desc]
 *         description: Ordem de classificação dos lançamentos recorrentes
 *     responses:
 *       200:
 *         description: Lista de lançamentos recorrentes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recurring_entries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       description:
 *                         type: string
 *                       frequency:
 *                         type: string
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       payment_type:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       next_run:
 *                         type: string
 *                         format: date-time
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 items_per_page:
 *                   type: integer
 *                 sort_by:
 *                   type: array
 *                   items:
 *                     type: string
 *                 sort_order:
 *                   type: array
 *                   items:
 *                     type: string
 *                     enum: [asc, desc]
 *       400:
 *         description: Erro de validação
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
 *           type: string
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
 *                   type: string
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
 *                       type: string
 *                     name:
 *                       type: string
 *                 payment_type:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 next_run:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Lançamento recorrente não encontrado
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
 *           type: string
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
 *               category_id:
 *                 type: string
 *               payment_type_id:
 *                 type: string
 *               next_run:
 *                 type: string
 *                 format: date-time
 *               last_run:
 *                 type: string
 *                 format: date-time
 *                 description: Data da última execução (opcional)
 *             required:
 *               - amount
 *               - description
 *               - frequency
 *               - category_id
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
 *                   type: string
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
 *                       type: string
 *                     name:
 *                       type: string
 *                 payment_type:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                 next_run:
 *                   type: string
 *                   format: date-time
 *                 last_run:
 *                   type: string
 *                   format: date-time
 *                   description: Data da última execução
 *       404:
 *         description: Lançamento recorrente não encontrado
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
 *           type: string
 *         required: true
 *         description: ID do lançamento recorrente
 *     responses:
 *       204:
 *         description: Lançamento recorrente excluído com sucesso
 *       404:
 *         description: Lançamento recorrente não encontrado
 *       500:
 *         description: Erro ao excluir lançamento recorrente
 */
router.delete(
  "/recurring_entry/:id",
  authenticateToken,
  deleteRecurringEntryController
);

export default router;
