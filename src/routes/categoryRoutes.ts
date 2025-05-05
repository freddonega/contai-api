import { Router } from "express";
import {
  createCategoryController,
  listCategoriesController,
  getCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from "../controllers/categoryController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API para gerenciar categorias
 */

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               cost_center_id:
 *                 type: string
 *             required:
 *               - name
 *               - type
 *               - cost_center_id
 *     responses:
 *       200:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 cost_center_id:
 *                   type: string
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro Interno do Servidor
 */
router.post("/category", authenticateToken, createCategoryController);

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Lista todas as categorias do usuário
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *         description: Filtrar por tipo de categoria
 *       - in: query
 *         name: cost_center_id
 *         schema:
 *           type: string
 *         description: Filtrar por centro de custo
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   cost_center_id:
 *                     type: string
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/category", authenticateToken, listCategoriesController);

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Obtém uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/category/:id", authenticateToken, getCategoryController);

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Atualiza uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               cost_center_id:
 *                 type: string
 *             required:
 *               - name
 *               - type
 *               - cost_center_id
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *                 cost_center_id:
 *                   type: string
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro Interno do Servidor
 */
router.put("/category/:id", authenticateToken, updateCategoryController);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Exclui uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria excluída com sucesso
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro Interno do Servidor
 */
router.delete("/category/:id", authenticateToken, deleteCategoryController);

export default router;
