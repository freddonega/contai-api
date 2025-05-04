import { Router } from "express";
import {
  createEntryController,
  listEntriesController,
  getEntryController,
  updateEntryController,
  deleteEntryController,
} from "../controllers/entryController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Entries
 *   description: API para gerenciar entradas
 */

/**
 * @swagger
 * /entries:
 *   post:
 *     summary: Cria uma nova entrada
 *     tags: [Entries]
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
 *               category_id:
 *                 type: string
 *               period:
 *                 type: string
 *                 description: Formato YYYY-MM
 *               payment_type_id:
 *                 type: string
 *             required:
 *               - amount
 *               - category_id
 *               - period
 *     responses:
 *       200:
 *         description: Entrada criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 description:
 *                   type: string
 *                 period:
 *                   type: string
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                 payment_type:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro Interno do Servidor
 */
router.post("/entries", authenticateToken, createEntryController);

/**
 * @swagger
 * /entries:
 *   get:
 *     summary: Lista entradas com busca, paginação e itens por página
 *     tags: [Entries]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para a descrição da entrada
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
 *         description: Campos para ordenar as entradas
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [asc, desc]
 *         description: Ordem de classificação das entradas
 *     responses:
 *       200:
 *         description: Lista de entradas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 entries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       description:
 *                         type: string
 *                       category_id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       period:
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
 *         description: Erro Interno do Servidor
 */
router.get("/entries", authenticateToken, listEntriesController);

/**
 * @swagger
 * /entries/{id}:
 *   get:
 *     summary: Obtém uma entrada pelo ID
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da entrada
 *     responses:
 *       200:
 *         description: Entrada encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 description:
 *                   type: string
 *                 period:
 *                   type: string
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                 payment_type:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Entrada não encontrada
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/entries/:id", authenticateToken, getEntryController);

/**
 * @swagger
 * /entries/{id}:
 *   put:
 *     summary: Atualiza uma entrada pelo ID
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da entrada
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
 *               category_id:
 *                 type: string
 *               period:
 *                 type: string
 *                 description: Formato YYYY-MM
 *               payment_type_id:
 *                 type: string
 *             required:
 *               - amount
 *               - category_id
 *               - period
 *     responses:
 *       200:
 *         description: Entrada atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 description:
 *                   type: string
 *                 period:
 *                   type: string
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     type:
 *                       type: string
 *                 payment_type:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       404:
 *         description: Entrada não encontrada
 *       500:
 *         description: Erro Interno do Servidor
 */
router.put("/entries/:id", authenticateToken, updateEntryController);

/**
 * @swagger
 * /entries/{id}:
 *   delete:
 *     summary: Exclui uma entrada pelo ID
 *     tags: [Entries]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da entrada
 *     responses:
 *       200:
 *         description: Entrada excluída com sucesso
 *       404:
 *         description: Entrada não encontrada
 *       500:
 *         description: Erro Interno do Servidor
 */
router.delete("/entries/:id", authenticateToken, deleteEntryController);

export default router;
