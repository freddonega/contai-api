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
 * /categories:
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
 *             required:
 *               - name
 *               - type
 *     responses:
 *       200:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *       400:
 *         description: Erro de validação
 */
router.post("/categories", authenticateToken, createCategoryController);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lista categorias com busca, paginação e itens por página
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca para o nome da categoria
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: itemsPerPage
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de itens por página
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 itemsPerPage:
 *                   type: integer
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/categories", authenticateToken, listCategoriesController);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Obtém uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
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
 *                   type: integer
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro Interno do Servidor
 */
router.get("/categories/:id", authenticateToken, getCategoryController);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
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
 *             required:
 *               - name
 *               - type
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 type:
 *                   type: string
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Categoria não encontrada
 *       500:
 *         description: Erro Interno do Servidor
 */
router.put("/categories/:id", authenticateToken, updateCategoryController);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Exclui uma categoria pelo ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
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
router.delete("/categories/:id", authenticateToken, deleteCategoryController);

export default router;
